/**
 * Rule-based architecture generator.
 * Used when OpenAI API is unavailable or fails.
 * Produces realistic, input-aware architecture plans.
 */
function getRuleBasedArchitecture(req) {
  const provider = (req.cloud_provider || 'AWS').toUpperCase();
  const isAWS = provider === 'AWS';
  const isHA = (req.high_availability || '').toLowerCase() === 'yes' || parseFloat(req.uptime) >= 99.5;
  const isML = (req.app_type || '').toLowerCase().includes('ml');
  const isMobile = (req.app_type || '').toLowerCase().includes('mobile');
  const isAPI = (req.app_type || '').toLowerCase().includes('api');
  const highTraffic = ['10K - 100K', '100K+'].includes(req.users_daily);
  const needsStorage = !['< 10GB', 'None', ''].includes(req.storage_gb);
  const needsDB = (req.db_type || '').toLowerCase() !== 'none';
  const isNoSQL = (req.db_type || '').toLowerCase() === 'nosql';
  const highSecurity = ['high', 'compliance-focused (e.g. hipaa)'].includes((req.security_level || '').toLowerCase());
  const veryHighUptime = parseFloat(req.uptime) >= 99.9;

  // Service name mappings
  const services = {
    vpc: isAWS ? 'VPC' : 'Virtual Network',
    lb: isAWS ? 'Application Load Balancer' : 'Azure Application Gateway',
    cdn: isAWS ? 'CloudFront CDN' : 'Azure CDN',
    waf: isAWS ? 'AWS WAF' : 'Azure Front Door WAF',
    compute: isAWS ? 'EC2 Auto Scaling Group' : 'VM Scale Set',
    serverless: isAWS ? 'AWS Lambda' : 'Azure Functions',
    dbSQL: isAWS ? 'RDS PostgreSQL' : 'Azure SQL Database',
    dbNoSQL: isAWS ? 'DynamoDB' : 'Azure Cosmos DB',
    dbReplica: isAWS ? 'RDS Read Replica' : 'Azure SQL Geo-Replica',
    dbCache: isAWS ? 'ElastiCache Redis' : 'Azure Cache for Redis',
    storage: isAWS ? 'S3 Bucket' : 'Azure Blob Storage',
    mlService: isAWS ? 'SageMaker' : 'Azure Machine Learning',
    queue: isAWS ? 'Amazon SQS' : 'Azure Service Bus',
    monitoring: isAWS ? 'CloudWatch' : 'Azure Monitor',
    iam: isAWS ? 'AWS IAM & KMS' : 'Azure Active Directory',
    route53: isAWS ? 'Route 53' : 'Azure DNS',
  };

  const dbName = isNoSQL ? services.dbNoSQL : services.dbSQL;

  // Build Mermaid diagram
  const lines = ['graph TD'];
  lines.push('    User(["🌐 Internet User"])');

  if (!isAPI && (highTraffic || isMobile) && needsStorage) {
    lines.push(`    User --> CDN["${services.cdn}"]`);
    lines.push(`    CDN --> LB["${services.lb}"]`);
  } else {
    lines.push(`    User --> LB["${services.lb}"]`);
  }

  if (highSecurity) {
    lines.push(`    LB --> WAF{"${services.waf}"}`);
    lines.push(`    WAF --> Compute["${services.compute}"]`);
  } else {
    lines.push(`    LB --> Compute["${services.compute}"]`);
  }

  lines.push(`    subgraph ${services.vpc}["${services.vpc} - Private Network"]`);

  if (needsDB) {
    lines.push(`        Compute --> DB[("${dbName}")]`);
    if (highTraffic || veryHighUptime) {
      lines.push(`        Compute --> Cache[("${services.dbCache}")]`);
    }
    if (isHA || veryHighUptime) {
      lines.push(`        DB --> Replica[("${services.dbReplica}")]`);
    }
  }

  if (isML || (highTraffic && !isMobile)) {
    lines.push(`        Compute --> Queue["${services.queue}"]`);
    lines.push(`        Queue --> Worker["${services.serverless}"]`);
    if (isML) {
      lines.push(`        Worker --> ML["${services.mlService}"]`);
    }
  }

  lines.push('    end');

  if (needsStorage) {
    lines.push(`    Compute --> Storage[("${services.storage}")]`);
  }

  if (highSecurity) {
    lines.push(`    Compute --> IAM["${services.iam}"]`);
  }

  lines.push(`    Compute --> Monitor["${services.monitoring}"]`);
  if (needsDB) {
    lines.push(`    DB --> Monitor`);
  }

  const mermaidDiagram = lines.join('\n');

  // Build explanation
  const haNote = veryHighUptime
    ? `multi-AZ deployment with read replicas for ${req.uptime}% SLA`
    : isHA
    ? 'high availability across multiple zones'
    : 'single-zone standard deployment';

  const explanation = [
    `This production-ready ${req.cloud_provider} architecture is designed for a ${req.app_type} application`,
    `supporting ${req.users_daily} daily users over ${req.runtime_months} month(s).`,
    `The infrastructure uses ${haNote}.`,
    needsStorage && !isAPI ? `A CDN layer ensures fast static asset delivery globally.` : '',
    highSecurity ? `WAF and IAM controls enforce ${req.security_level} security compliance.` : '',
    (isML || highTraffic) ? `Async processing via message queue and serverless workers handles background tasks efficiently.` : '',
    needsDB ? `The ${dbName} database powers the data layer${highTraffic ? ' with Redis caching to minimize latency' : ''}.` : '',
    `All components are monitored via ${services.monitoring}.`,
  ].filter(Boolean).join(' ');

  // Build components list
  const computeSize = isAWS ? 't3.medium' : 'Standard_B2ms';
  const dbSize = isAWS ? 'db.t3.medium' : 'Standard_v2';
  const computeCount = veryHighUptime ? 3 : isHA || highTraffic ? 2 : 1;

  const components = [
    { type: 'network', service_name: services.vpc, instance_size: 'Standard', count: 1, notes: 'Isolated private network' },
    { type: 'network', service_name: services.route53, instance_size: 'Standard', count: 1, notes: 'DNS routing' },
    { type: 'loadbalancer', service_name: services.lb, instance_size: 'Standard', count: 1, notes: 'Traffic distribution' },
    { type: 'compute', service_name: services.compute, instance_size: computeSize, count: computeCount, notes: `${computeCount} instance(s) for ${req.users_daily} daily users` },
  ];

  if (needsDB) {
    components.push({ type: 'database', service_name: dbName, instance_size: dbSize, count: 1, notes: `${req.db_type} database` });
  }
  if (needsStorage) {
    components.push({ type: 'storage', service_name: services.storage, instance_size: 'Standard', count: 1, notes: 'Object/blob storage' });
  }
  if (highTraffic || veryHighUptime) {
    components.push({ type: 'cache', service_name: services.dbCache, instance_size: 'cache.t3.micro', count: 1, notes: 'In-memory cache layer' });
  }
  if (!isAPI && (highTraffic || isMobile) && needsStorage) {
    components.push({ type: 'cdn', service_name: services.cdn, instance_size: 'medium', count: 1, notes: 'Global CDN for static assets' });
  }
  if (isML || (highTraffic && !isMobile)) {
    components.push({ type: 'network', service_name: services.queue, instance_size: 'Standard', count: 1, notes: 'Async message queue' });
    components.push({ type: 'compute', service_name: services.serverless, instance_size: 'Standard', count: 1, notes: 'Serverless worker functions' });
  }
  if (highSecurity) {
    components.push({ type: 'security', service_name: services.waf, instance_size: 'Standard', count: 1, notes: 'Web application firewall' });
    components.push({ type: 'security', service_name: services.iam, instance_size: 'Standard', count: 1, notes: 'Identity & access management' });
  }
  components.push({ type: 'monitoring', service_name: services.monitoring, instance_size: 'Standard', count: 1, notes: 'Infrastructure monitoring & alerts' });

  return { explanation, mermaid_diagram: mermaidDiagram, components };
}

module.exports = { getRuleBasedArchitecture };
