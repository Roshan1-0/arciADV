from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.request_models import ArchitectureRequest, ArchitectureResponse
from services.ai_generator import generate_architecture_plan
from services.cost_estimator import estimate_costs
from services.tf_generator import generate_terraform_code
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI-Powered Infrastructure Design Generator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict this to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Infrastructure Design Generator API is running."}

@app.post("/generate", response_model=ArchitectureResponse)
async def generate_architecture(req: ArchitectureRequest):
    try:
        # 1. Generate Architecture Plan & Diagram via AI
        ai_result = await generate_architecture_plan(req)

        # 2. Estimate Costs (with uptime multiplier and runtime)
        cost_estimation = estimate_costs(
            req.cloud_provider,
            ai_result["components"],
            uptime=req.uptime,
            runtime_months=req.runtime_months
        )

        # 3. Generate Terraform
        terraform_files = generate_terraform_code(req.cloud_provider, ai_result["components"], req.region)

        return ArchitectureResponse(
            explanation=ai_result["explanation"],
            diagram_mermaid=ai_result["mermaid_diagram"],
            cost_estimation_table=cost_estimation["table_markdown"],
            total_monthly_cost=cost_estimation["total"],
            cost_breakdown=cost_estimation["breakdown"],
            terraform_files=terraform_files
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
