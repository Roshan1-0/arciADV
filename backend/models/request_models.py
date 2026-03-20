from pydantic import BaseModel, Field
from typing import Optional

class ArchitectureRequest(BaseModel):
    app_type: str = Field(..., description="Application Type (Web app / API / ML system / Mobile backend)")
    users_daily: str = Field(..., description="Expected daily users (e.g., '1000', '1M+')")
    db_type: str = Field(..., description="Database type (SQL / NoSQL)")
    storage_gb: str = Field(..., description="Storage requirement (GB)")
    region: str = Field(..., description="Cloud Region (e.g., 'us-east-1', 'West Europe')")
    high_availability: str = Field(..., description="High availability requirement (Yes/No)")
    security_level: str = Field(..., description="Security level (Basic / High / Compliance-focused)")
<<<<<<< HEAD
    cloud_provider: str = Field(..., description="Target cloud provider ('AWS' or 'Azure')")
    uptime: float = Field(default=99.0, ge=90.0, le=100.0, description="Expected uptime SLA (90–100%)")
    runtime_months: int = Field(default=1, ge=1, description="Project runtime in months")
=======
    budget: str = Field(..., description="Budget range (e.g., '$100-$500/month')")
    cloud_provider: str = Field(..., description="Target cloud provider ('AWS' or 'Azure')")
>>>>>>> b13db740ab9061025a6c77321c115315824c3f25

class ArchitectureResponse(BaseModel):
    explanation: str
    diagram_mermaid: str
    cost_estimation_table: str
    total_monthly_cost: dict
<<<<<<< HEAD
    cost_breakdown: dict
=======
>>>>>>> b13db740ab9061025a6c77321c115315824c3f25
    terraform_files: dict
