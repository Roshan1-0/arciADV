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
        }
    }
