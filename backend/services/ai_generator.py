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
    - Budget: {req.budget}
    
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
    }
