<<<<<<< HEAD
def get_uptime_multiplier(uptime: float) -> float:
    """Return a cost multiplier based on required uptime SLA."""
    if uptime >= 99.9:
        return 1.5   # multi-AZ, full redundancy
    elif uptime >= 99.5:
        return 1.3   # active-active with standby
    elif uptime >= 99.0:
        return 1.15  # basic HA
    else:
        return 1.0   # single-zone baseline


def estimate_costs(cloud_provider: str, components: list, uptime: float = 99.0, runtime_months: int = 1) -> dict:
    """
    INR-based cost estimator using hardcoded pricing data for AWS and Azure.
    Applies an uptime multiplier for redundancy and multiplies by runtime duration.
    """

    # ---- AWS Pricing (INR/month) ----
    aws_pricing = {
        "compute": {
            "low":    {"service": "EC2 t3.micro",  "price": 700.0},
            "medium": {"service": "EC2 t3.small",  "price": 1500.0},
            "high":   {"service": "EC2 t3.medium", "price": 3000.0},
        },
        "database": {
            "low":    {"service": "RDS db.t3.micro",   "price": 1200.0},
            "medium": {"service": "RDS db.t3.small",   "price": 2500.0},
            "high":   {"service": "RDS db.t3.medium",  "price": 5000.0},
        },
        "storage": {
            "all":  {"service": "S3 Standard",   "price": 2.0},
        },
        "loadbalancer": {
            "all":  {"service": "Application Load Balancer", "price": 2000.0},
        },
        "network": {
            "all":  {"service": "Route 53 Hosted Zone", "price": 200.0},
        },
        "cdn": {
            "medium": {"service": "CloudFront Basic",    "price": 500.0},
            "high":   {"service": "CloudFront Advanced", "price": 1500.0},
        },
        "cache": {
            "all":  {"service": "ElastiCache Redis",  "price": 1200.0},
        },
        "serverless": {
            "all":  {"service": "Lambda (per 1M req)", "price": 0.20},
        },
    }

    # ---- Azure Pricing (INR/month) ----
    azure_pricing = {
        "compute": {
            "low":    {"service": "VM B1s",   "price": 650.0},
            "medium": {"service": "VM B2s",   "price": 1400.0},
            "high":   {"service": "VM B2ms",  "price": 2800.0},
        },
        "database": {
            "low":    {"service": "Azure SQL Basic",    "price": 1000.0},
            "medium": {"service": "Azure SQL Standard", "price": 2200.0},
            "high":   {"service": "Azure SQL Premium",  "price": 4500.0},
        },
        "storage": {
            "all":  {"service": "Blob Storage Hot",  "price": 1.8},
        },
        "loadbalancer": {
            "all":  {"service": "Standard Load Balancer", "price": 1800.0},
        },
        "network": {
            "all":  {"service": "Azure DNS Hosted Zone", "price": 150.0},
        },
        "cdn": {
            "medium": {"service": "Azure CDN Basic",    "price": 400.0},
            "high":   {"service": "Azure CDN Advanced", "price": 1200.0},
        },
        "cache": {
            "all":  {"service": "Azure Redis Cache", "price": 1100.0},
        },
        "serverless": {
            "all":  {"service": "Azure Functions (per 1M req)", "price": 0.18},
        },
    }

    provider_map = {"AWS": aws_pricing, "Azure": azure_pricing}
    pricing = provider_map.get(cloud_provider, aws_pricing)

    def get_tier(instance_size: str) -> str:
        if not instance_size:
            return "medium"
        s = instance_size.lower()
        if any(k in s for k in ["micro", "small", "basic", "b1s", "low"]):
            return "low"
        if any(k in s for k in ["medium", "standard", "b2s"]):
            return "medium"
        if any(k in s for k in ["large", "xlarge", "premium", "high", "b2ms"]):
            return "high"
        return "medium"

    markdown_table = (
        "| Component | Service | Count | Unit Cost (₹/mo) | Subtotal (₹/mo) |\n"
        "| :--- | :--- | :---: | ---: | ---: |\n"
    )

    base_cost = 0.0
    breakdown_rows = []

    for comp in components:
        ctype = comp.get("type", "compute").lower()
        count = comp.get("count", 1)
        instance_size = comp.get("instance_size", "")
        name = comp.get("service_name", "Unknown")

        type_prices = pricing.get(ctype, {})
        if not type_prices:
            unit_cost = 500.0
            service_label = name
        else:
            tier = get_tier(instance_size)
            entry = type_prices.get(tier) or type_prices.get("all") or list(type_prices.values())[0]
            unit_cost = entry["price"]
            service_label = entry["service"]

        line_total = unit_cost * count
        base_cost += line_total
        breakdown_rows.append({
            "name": name,
            "service": service_label,
            "count": count,
            "unit_cost": unit_cost,
            "subtotal": line_total
        })
        markdown_table += (
            f"| {name} | {service_label} | {count} | "
            f"₹{unit_cost:,.2f} | ₹{line_total:,.2f} |\n"
        )

    uptime_multiplier = get_uptime_multiplier(uptime)
    monthly_final_cost = round(base_cost * uptime_multiplier, 2)
    total_runtime_cost = round(monthly_final_cost * runtime_months, 2)

    return {
        "table_markdown": markdown_table.strip(),
        "total": {
            "currency": "INR",
            "amount": monthly_final_cost
        },
        "breakdown": {
            "base_cost": round(base_cost, 2),
            "uptime_multiplier": uptime_multiplier,
            "monthly_final_cost": monthly_final_cost,
            "runtime_months": runtime_months,
            "total_runtime_cost": total_runtime_cost,
            "rows": breakdown_rows
=======
def estimate_costs(cloud_provider: str, components: list) -> dict:
    """
    Very crude and simplified cost estimator.
    In a real system, this would query the AWS Pricing API or Azure Retail Rates API.
    We'll use a hardcoded lookup approach for demonstration.
    """
    
    # Rough monthly estimates in USD
    pricing_map = {
        "AWS": {
            "compute": 30.0,
            "database": 50.0,
            "storage": 5.0, # base + usage
            "network": 20.0, # NAT gateways, etc.
            "loadbalancer": 18.0
        },
        "Azure": {
            "compute": 32.0,
            "database": 55.0,
            "storage": 6.0,
            "network": 22.0,
            "loadbalancer": 20.0
        }
    }
    
    provider_prices = pricing_map.get(cloud_provider, pricing_map["AWS"])
    
    markdown_table = """
| Component | Type | Count | Est. Unit Cost | Est. Total |
| :--- | :--- | :--- | :--- | :--- |
"""
    
    total_cost = 0.0
    
    for comp in components:
        ctype = comp.get("type", "compute")
        count = comp.get("count", 1)
        name = comp.get("service_name", "Unknown")
        
        unit_cost = provider_prices.get(ctype, 10.0)
        line_total = unit_cost * count
        total_cost += line_total
        
        markdown_table += f"| {name} | {ctype.capitalize()} | {count} | ${unit_cost:.2f} | **${line_total:.2f}** |\n"
        
    return {
        "table_markdown": markdown_table.strip(),
        "total": {
            "currency": "USD",
            "amount": round(total_cost, 2)
>>>>>>> b13db740ab9061025a6c77321c115315824c3f25
        }
    }
