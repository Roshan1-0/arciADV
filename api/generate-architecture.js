/**
 * Vercel Serverless Function — POST /api/generate-architecture
 * Orchestrates: AI architecture plan + INR cost estimation + Terraform code
 */

const aiService = require('../server/src/services/aiService');
const costService = require('../server/src/services/costService');
const terraformService = require('../server/src/services/terraformService');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
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

    // Basic validation
    if (!cloud_provider || !['AWS', 'Azure'].includes(cloud_provider)) {
      return res.status(400).json({ error: 'cloud_provider must be AWS or Azure' });
    }
    if (!app_type || !region) {
      return res.status(400).json({ error: 'app_type and region are required' });
    }

    const reqData = {
      cloud_provider,
      app_type,
      users_daily: users_daily || 'Less than 1,000',
      db_type: db_type || 'SQL',
      storage_gb: storage_gb || '10-50GB',
      region,
      high_availability: high_availability || 'No',
      security_level: security_level || 'Basic',
      uptime: parseFloat(uptime),
      runtime_months: parseInt(runtime_months),
      monthly_budget: monthly_budget ? parseFloat(monthly_budget) : null,
    };

    // 1. Generate architecture (GPT-4o with fallback)
    const aiResult = await aiService.generateArchitecturePlan(reqData);

    // 2. Estimate INR cost
    const costResult = costService.estimateCosts(
      cloud_provider,
      aiResult.components,
      reqData.uptime,
      reqData.runtime_months
    );

    // 3. Generate Terraform HCL
    const terraformFiles = terraformService.generateTerraformCode(
      cloud_provider,
      aiResult.components,
      region
    );

    return res.status(200).json({
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
    console.error('generate-architecture error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate architecture. Please try again.',
    });
  }
};
