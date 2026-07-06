/**
 * INR-based cloud cost estimator.
 * Supports AWS and Azure with tiered pricing.
 */

const AWS_PRICING = {
  compute:     { low: { service: 'EC2 t3.micro',      price: 700  }, medium: { service: 'EC2 t3.medium',    price: 3000  }, high: { service: 'EC2 t3.large',    price: 6000  } },
  database:    { low: { service: 'RDS db.t3.micro',  price: 1200 }, medium: { service: 'RDS db.t3.medium', price: 5000  }, high: { service: 'RDS db.t3.large', price: 10000 } },
  storage:     { all: { service: 'S3 Standard',                   price: 2    } },
  loadbalancer:{ all: { service: 'Application Load Balancer',     price: 2000 } },
  network:     { all: { service: 'Route 53 + VPC',                price: 250  } },
  cdn:         { medium: { service: 'CloudFront Basic',           price: 500  }, high: { service: 'CloudFront Advanced', price: 1500 } },
  cache:       { all: { service: 'ElastiCache Redis',             price: 1200 } },
  security:    { all: { service: 'AWS WAF + IAM',                 price: 800  } },
  monitoring:  { all: { service: 'CloudWatch',                    price: 400  } },
};

const AZURE_PRICING = {
  compute:     { low: { service: 'VM B1s',                        price: 650  }, medium: { service: 'VM B2ms',              price: 2800  }, high: { service: 'VM D2s v3',           price: 5500  } },
  database:    { low: { service: 'Azure SQL Basic',               price: 1000 }, medium: { service: 'Azure SQL Standard',   price: 4500  }, high: { service: 'Azure SQL Premium',   price: 9000  } },
  storage:     { all: { service: 'Blob Storage Hot',              price: 1.8  } },
  loadbalancer:{ all: { service: 'Azure Application Gateway',     price: 1800 } },
  network:     { all: { service: 'VNet + Azure DNS',              price: 200  } },
  cdn:         { medium: { service: 'Azure CDN Basic',            price: 400  }, high: { service: 'Azure CDN Advanced',   price: 1200 } },
  cache:       { all: { service: 'Azure Cache for Redis',         price: 1100 } },
  security:    { all: { service: 'Azure Front Door WAF + AAD',    price: 750  } },
  monitoring:  { all: { service: 'Azure Monitor',                 price: 350  } },
};

function getUptimeMultiplier(uptime) {
  const u = parseFloat(uptime);
  if (u >= 99.9) return 1.5;
  if (u >= 99.5) return 1.3;
  if (u >= 99.0) return 1.15;
  return 1.0;
}

function getTier(instanceSize) {
  if (!instanceSize) return 'medium';
  const s = instanceSize.toLowerCase();
  if (s.match(/micro|small|basic|b1s|low|cache\.t3\.micro/)) return 'low';
  if (s.match(/medium|standard|b2s|b2ms/)) return 'medium';
  if (s.match(/large|xlarge|premium|high|d2s/)) return 'high';
  return 'medium';
}

function estimateCosts(cloudProvider, components, uptime = 99.0, runtimeMonths = 1) {
  const pricing = cloudProvider.toUpperCase() === 'AZURE' ? AZURE_PRICING : AWS_PRICING;

  let baseCost = 0;
  const categoryTotals = {
    compute: 0,
    database: 0,
    storage: 0,
    networking: 0,
    monitoring: 0,
    security: 0,
  };
  const breakdown = [];

  for (const comp of components) {
    const ctype = (comp.type || 'compute').toLowerCase();
    const count = comp.count || 1;
    const instanceSize = comp.instance_size || '';
    const name = comp.service_name || 'Unknown Service';

    const typePricing = pricing[ctype];
    let unitCost = 500;
    let serviceLabel = name;

    if (typePricing) {
      const tier = getTier(instanceSize);
      const entry = typePricing[tier] || typePricing['all'] || Object.values(typePricing)[0];
      unitCost = entry.price;
      serviceLabel = entry.service;
    }

    const subtotal = unitCost * count;
    baseCost += subtotal;

    // Map to category
    const categoryMap = {
      compute: 'compute',
      database: 'database',
      storage: 'storage',
      network: 'networking',
      loadbalancer: 'networking',
      cdn: 'networking',
      cache: 'database',
      security: 'security',
      monitoring: 'monitoring',
    };
    const category = categoryMap[ctype] || 'compute';
    categoryTotals[category] = (categoryTotals[category] || 0) + subtotal;

    breakdown.push({
      name,
      service: serviceLabel,
      type: ctype,
      category,
      count,
      unit_cost_inr: unitCost,
      subtotal_inr: subtotal,
      notes: comp.notes || '',
    });
  }

  const uptimeMultiplier = getUptimeMultiplier(uptime);
  const monthlyFinalCost = Math.round(baseCost * uptimeMultiplier);
  const totalRuntimeCost = Math.round(monthlyFinalCost * runtimeMonths);

  return {
    breakdown,
    category_totals: {
      compute: Math.round((categoryTotals.compute || 0) * uptimeMultiplier),
      database: Math.round((categoryTotals.database || 0) * uptimeMultiplier),
      storage: Math.round((categoryTotals.storage || 0) * uptimeMultiplier),
      networking: Math.round((categoryTotals.networking || 0) * uptimeMultiplier),
      monitoring: Math.round((categoryTotals.monitoring || 0) * uptimeMultiplier),
      security: Math.round((categoryTotals.security || 0) * uptimeMultiplier),
    },
    summary: {
      currency: 'INR',
      base_cost: Math.round(baseCost),
      uptime_multiplier: uptimeMultiplier,
      monthly_cost: monthlyFinalCost,
      runtime_months: runtimeMonths,
      total_runtime_cost: totalRuntimeCost,
      uptime_sla: uptime,
    },
  };
}

module.exports = { estimateCosts, getUptimeMultiplier };
