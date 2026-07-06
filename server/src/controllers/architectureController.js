const { validationResult } = require('express-validator');
const aiService = require('../services/aiService');
const costService = require('../services/costService');
const terraformService = require('../services/terraformService');

/**
 * POST /api/generate-architecture
 * Main endpoint: AI architecture + cost estimation + terraform
 */
exports.generateArchitecture = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const {
      cloud_provider,
      app_type,
      users_daily,
      db_type,
      storage_gb,
      region,
      high_availability,
      security_level,
      uptime = 99.0,
      runtime_months = 1,
      monthly_budget,
    } = req.body;

    const reqData = {
      cloud_provider,
      app_type,
      users_daily,
      db_type,
      storage_gb,
      region,
      high_availability,
      security_level,
      uptime: parseFloat(uptime),
      runtime_months: parseInt(runtime_months),
      monthly_budget: monthly_budget ? parseFloat(monthly_budget) : null,
    };

    // 1. Generate architecture via AI (with fallback)
    const aiResult = await aiService.generateArchitecturePlan(reqData);

    // 2. Estimate costs in INR
    const costResult = costService.estimateCosts(
      cloud_provider,
      aiResult.components,
      reqData.uptime,
      reqData.runtime_months
    );

    // 3. Generate Terraform code
    const terraformFiles = terraformService.generateTerraformCode(
      cloud_provider,
      aiResult.components,
      region
    );

    res.json({
      success: true,
      explanation: aiResult.explanation,
      diagram_mermaid: aiResult.mermaid_diagram,
      components: aiResult.components,
      cost_estimation: costResult,
      terraform_files: terraformFiles,
      meta: {
        provider: cloud_provider,
        region,
        generated_at: new Date().toISOString(),
        ai_powered: aiResult.ai_powered || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/generate-terraform
 * Standalone terraform generation
 */
exports.generateTerraform = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { cloud_provider, region, components = [] } = req.body;
    const terraformFiles = terraformService.generateTerraformCode(cloud_provider, components, region);

    res.json({ success: true, terraform_files: terraformFiles });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/estimate-cost
 * Standalone cost estimation
 */
exports.estimateCost = async (req, res, next) => {
  try {
    const { cloud_provider, components = [], uptime = 99.0, runtime_months = 1 } = req.body;
    const costResult = costService.estimateCosts(cloud_provider, components, parseFloat(uptime), parseInt(runtime_months));

    res.json({ success: true, cost_estimation: costResult });
  } catch (error) {
    next(error);
  }
};
