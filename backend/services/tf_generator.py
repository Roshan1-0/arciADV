import os
from jinja2 import Environment, FileSystemLoader

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")

def generate_terraform_code(cloud_provider: str, components: list, region: str) -> dict:
    """
    Generates Terraform HCL strings combining static structural templates and dynamic variables.
    """
    env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
    
    # Simple logic mapping: AWS vs Azure
    provider_lower = cloud_provider.lower()
    if provider_lower not in ["aws", "azure"]:
        provider_lower = "aws"
        
    try:
        main_template = env.get_template(f"{provider_lower}_main.tf.j2")
        vars_template = env.get_template("variables.tf.j2")
        outputs_template = env.get_template(f"{provider_lower}_outputs.tf.j2")
        
        # We classify components for the template
        context = {
            "region": region,
            "cloud_provider": cloud_provider,
            "has_db": any(c['type'] == 'database' for c in components),
            "has_storage": any(c['type'] == 'storage' for c in components),
            "compute_count": max([c['count'] for c in components if c['type'] == 'compute'] + [2]),
            "db_instance": next((c['service_name'] for c in components if c['type'] == 'database'), ""),
            "components": components
        }
        
        return {
            "main.tf": main_template.render(context),
            "variables.tf": vars_template.render(context),
            "outputs.tf": outputs_template.render(context)
        }
        
    except Exception as e:
        print(f"Jinja2 Error: {e}. Templates might be missing. Using fallback.")
        return generate_mock_terraform(cloud_provider, region)

def generate_mock_terraform(provider: str, region: str) -> dict:
    if provider.lower() == "azure":
        main_tf = f"""terraform {{
  required_providers {{
    azurerm = {{
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }}
  }}
}}

provider "azurerm" {{
  features {{}}
}}

resource "azurerm_resource_group" "rg" {{
  name     = "ai-infra-rg"
  location = "{region}"
}}"""
    else:
        main_tf = f"""terraform {{
  required_providers {{
    aws = {{
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }}
  }}
}}

provider "aws" {{
  region = "{region}"
}}

resource "aws_vpc" "main" {{
  cidr_block = var.vpc_cidr
  tags = {{
    Name = "ai-infra-vpc"
  }}
}}"""

    vars_tf = """variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}
"""
    out_tf = """output "region" {
  value = var.vpc_cidr
}
"""
    
    return {
        "main.tf": main_tf,
        "variables.tf": vars_tf,
        "outputs.tf": out_tf
    }
