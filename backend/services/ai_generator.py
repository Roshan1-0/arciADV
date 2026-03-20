import os
import json
from openai import AsyncOpenAI
from models.request_models import ArchitectureRequest

# We'll use the environment variable OPENAI_API_KEY
api_key = os.environ.get("OPENAI_API_KEY")

# Initialize client only if key is present to prevent startup crash
client = AsyncOpenAI(api_key=api_key) if api_key else None

async def generate_architecture_plan(req: ArchitectureRequest) -> dict:
    """
    Calls OpenAI to generate an architecture plan based on user requirements.
    Returns a dict with 'explanation', 'mermaid_diagram', and structured 'components'.
    """
    
    system_prompt = f"""
    You are an expert Cloud Infrastructure Architect.
    Based on the following user requirements, design a production-ready cloud architecture for {req.cloud_provider}.
    
    Requirements:
    - Application Type: {req.app_type}
    - Daily Users: {req.users_daily}
    - Database Type: {req.db_type}
    - Storage: {req.storage_gb} GB
    - Region: {req.region}
    - High Availability: {req.high_availability}
    - Security Level: {req.security_level}
<<<<<<< HEAD
    - Expected Uptime SLA: {req.uptime}%
    - Project Runtime: {req.runtime_months} month(s)
=======
    - Budget: {req.budget}
>>>>>>> b13db740ab9061025a6c77321c115315824c3f25
    
    Return your response strictly as a JSON object with the following schema:
    {{
        "explanation": "A concise paragraph explaining the architectural choices.",
        "mermaid_diagram": "A valid Mermaid.js graph TD string representing the architecture. Include VPC, Load Balancer, Compute, DB, Storage (if applicable). Use appropriate node shapes.",
        "components": [
            {{
                "type": "compute|database|storage|network|loadbalancer",
                "service_name": "e.g., EC2, RDS, S3 / VM, SQL Database, Blob Storage",
                "instance_size": "e.g., t3.medium, db.t3.large",
                "count": 2,
                "notes": "brief reason"
            }}
        ]
    }}
    
    Ensure the JSON is valid and the mermaid diagram syntax is correct. Do not wrap the JSON in markdown blocks like ```json. Just output the raw JSON object.
    """

    # For safety/testing if no API key is present:
    if not os.environ.get("OPENAI_API_KEY"):
        return get_mock_ai_response(req)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o", # Or "gpt-3.5-turbo" depending on access
            messages=[{"role": "system", "content": system_prompt}],
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        # Basic cleanup if the LLM hallucinated markdown ticks
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"OpenAI API Error: {e}. Falling back to mock data.")
        return get_mock_ai_response(req)

<<<<<<< HEAD

def get_mock_ai_response(req: ArchitectureRequest):
    """
    Generates a detailed, input-aware architecture plan and Mermaid diagram.
    Adapts based on: cloud provider, app type, DB type, storage, security,
    high availability, uptime SLA, users, and runtime.
    """
    provider = req.cloud_provider.upper()
    is_aws = provider == "AWS"
    is_ha = req.high_availability.lower() == "yes" or req.uptime >= 99.5
    is_ml = "ml" in req.app_type.lower()
    is_mobile = "mobile" in req.app_type.lower()
    is_api = "api" in req.app_type.lower()
    high_traffic = req.users_daily in ["10K - 100K", "100K+"]
    needs_storage = req.storage_gb not in ["< 10GB", "None", ""]
    needs_db = req.db_type.lower() != "none"
    is_nosql = req.db_type.lower() == "nosql"
    high_security = req.security_level.lower() in ["high", "compliance-focused (e.g. hipaa)"]
    very_high_uptime = req.uptime >= 99.9

    # ---- Provider-specific service names ----
    vpc        = "VPC" if is_aws else "VNet"
    lb         = "Application Load Balancer" if is_aws else "Azure App Gateway"
    cdn        = "CloudFront CDN" if is_aws else "Azure CDN"
    waf        = "AWS WAF" if is_aws else "Azure Front Door WAF"
    compute    = "EC2 Auto Scaling" if is_aws else "VM Scale Set"
    serverless = "AWS Lambda" if is_aws else "Azure Functions"
    db_sql     = "RDS PostgreSQL" if is_aws else "Azure SQL Database"
    db_nosql   = "DynamoDB" if is_aws else "Azure Cosmos DB"
    db_replica = "RDS Read Replica" if is_aws else "SQL Geo-Replica"
    db_cache   = "ElastiCache Redis" if is_aws else "Azure Cache for Redis"
    storage    = "S3 Bucket" if is_aws else "Azure Blob Storage"
    ml_service = "SageMaker" if is_aws else "Azure ML"
    queue      = "SQS" if is_aws else "Azure Service Bus"
    monitoring = "CloudWatch" if is_aws else "Azure Monitor"

    db_name = db_nosql if is_nosql else db_sql

    # ---- Build Mermaid diagram ----
    lines = ["graph TD"]

    # User entry point
    lines.append("    User([🌐 Internet User])")

    # CDN for web apps or mobile backends with storage
    if not is_api and (high_traffic or is_mobile) and needs_storage:
        lines.append(f"    User --> CDN[{cdn}]")
        lines.append(f"    CDN --> LB[{lb}]")
    else:
        lines.append(f"    User --> LB[{lb}]")

    # WAF for high security
    if high_security:
        lines.insert(len(lines) - 1, f"    LB --> WAF{{{waf}}}")
        lines.append(f"    WAF --> Compute[{compute}]")
    else:
        lines.append(f"    LB --> Compute[{compute}]")

    # Core compute inside VPC/VNet
    lines.append(f"    subgraph {vpc}[{vpc} — Private Network]")

    # DB layer
    if needs_db:
        lines.append(f"        Compute --> DB[({db_name})]")
        if high_traffic or very_high_uptime:
            lines.append(f"        DB --> Cache[({db_cache})]")
            lines.append(f"        Compute --> Cache")
        if is_ha or very_high_uptime:
            lines.append(f"        DB --> Replica[({db_replica})]")

    # Queue for ML or high-traffic async processing
    if is_ml or (high_traffic and not is_mobile):
        lines.append(f"        Compute --> Queue[{queue}]")
        lines.append(f"        Queue --> Worker[{serverless}]")
        if is_ml:
            lines.append(f"        Worker --> ML[{ml_service}]")

    lines.append("    end")  # close subgraph

    # Object Storage outside VPC
    if needs_storage:
        lines.append(f"    Compute --> Storage[({storage})]")
        if not is_api and (high_traffic or is_mobile):
            lines.append(f"    Storage --> CDN")

    # Monitoring always
    lines.append(f"    Compute --> Monitor[{monitoring}]")
    if needs_db:
        lines.append(f"    DB --> Monitor")

    mermaid = "\n".join(lines)

    # ---- Build explanation ----
    ha_note = f"The architecture is configured for {req.uptime}% uptime SLA with {'multi-AZ deployment and read replicas' if very_high_uptime else 'high availability' if is_ha else 'single-zone deployment'}."
    explanation = (
        f"This is a production-ready {req.cloud_provider} architecture for a {req.app_type} "
        f"supporting {req.users_daily} daily users over {req.runtime_months} month(s). "
        f"{ha_note} "
        f"{'A CDN is included for fast static asset delivery. ' if not is_api and needs_storage else ''}"
        f"{'A WAF layer enforces security compliance. ' if high_security else ''}"
        f"{'Async processing via message queue and serverless workers handles background tasks. ' if is_ml or high_traffic else ''}"
        f"The {db_name} database powers the data layer"
        f"{' with Redis caching to reduce latency under high load' if high_traffic or very_high_uptime else ''}."
    )

    # ---- Build components list ----
    compute_size = "t3.medium" if is_aws else "Standard_B2ms"
    db_size = "db.t3.medium" if is_aws else "Standard_v2"
    compute_count = 3 if very_high_uptime else 2 if is_ha or high_traffic else 1

    components = [
        {"type": "network",      "service_name": vpc,     "instance_size": "Standard",      "count": 1,             "notes": "Isolated private network"},
        {"type": "loadbalancer", "service_name": lb,      "instance_size": "Standard",      "count": 1,             "notes": "Traffic distribution across compute"},
        {"type": "compute",      "service_name": compute, "instance_size": compute_size,    "count": compute_count, "notes": f"App/API compute — {compute_count} instance(s) for {'multi-AZ' if very_high_uptime else 'HA' if is_ha else 'baseline'}"},
    ]
    if needs_db:
        components.append({"type": "database", "service_name": db_name, "instance_size": db_size, "count": 1, "notes": f"{req.db_type} database"})
    if needs_storage:
        components.append({"type": "storage", "service_name": storage, "instance_size": "Standard", "count": 1, "notes": "Object storage for assets/files"})
    if high_traffic or very_high_uptime:
        components.append({"type": "cache", "service_name": db_cache, "instance_size": "basic", "count": 1, "notes": "In-memory cache to reduce DB load"})
    if not is_api and (high_traffic or is_mobile) and needs_storage:
        components.append({"type": "cdn", "service_name": cdn, "instance_size": "medium", "count": 1, "notes": "CDN for global low-latency delivery"})
    if is_ml or (high_traffic and not is_mobile):
        components.append({"type": "network", "service_name": queue, "instance_size": "Standard", "count": 1, "notes": "Async message queue"})
    if high_security:
        components.append({"type": "network", "service_name": waf, "instance_size": "Standard", "count": 1, "notes": "Web application firewall"})

    return {
        "explanation": explanation,
        "mermaid_diagram": mermaid,
        "components": components
=======
def get_mock_ai_response(req: ArchitectureRequest):
    """Fallback if API key is missing or call fails."""
    provider = req.cloud_provider.upper()
    vpc = "VPC" if provider == "AWS" else "VNet"
    lb = "ALB" if provider == "AWS" else "App Gateway"
    compute = "EC2 AutoScaling" if provider == "AWS" else "VM Scale Set"
    db = "RDS PostgreSQL" if provider == "AWS" else "Azure Database for PostgreSQL"
    storage = "S3 Bucket" if provider == "AWS" else "Blob Storage"
    
    mermaid = f"""
graph TD
    User --> LB[{lb}]
    subgraph {vpc}
        LB --> Compute[{compute}]
        Compute --> DB[({db})]
    end
    Compute --> Storage[({storage})]
"""
    return {
        "explanation": "This is a highly available mock architecture tailored for your requirements using standard cloud components.",
        "mermaid_diagram": mermaid.strip(),
        "components": [
            {"type": "network", "service_name": vpc, "instance_size": "Standard", "count": 1, "notes": "Isolated network"},
            {"type": "loadbalancer", "service_name": lb, "instance_size": "Standard", "count": 1, "notes": "Traffic distribution"},
            {"type": "compute", "service_name": compute, "instance_size": "t3.medium" if provider=="AWS" else "Standard_B2s", "count": 2, "notes": "Web/API layer"},
            {"type": "database", "service_name": db, "instance_size": "db.t3.medium" if provider=="AWS" else "Standard_v2", "count": 1, "notes": "Relational data"},
            {"type": "storage", "service_name": storage, "instance_size": "Standard", "count": 1, "notes": "Object storage"}
        ]
>>>>>>> b13db740ab9061025a6c77321c115315824c3f25
    }
