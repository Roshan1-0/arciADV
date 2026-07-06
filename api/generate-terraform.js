/**
 * Vercel Serverless Function — POST /api/generate-terraform
 * Generates Terraform HCL for a given provider and component list.
 */

const terraformService = require('../server/src/services/terraformService');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { cloud_provider, region, components = [] } = req.body;

    if (!cloud_provider || !['AWS', 'Azure'].includes(cloud_provider)) {
      return res.status(400).json({ error: 'cloud_provider must be AWS or Azure' });
    }
    if (!region) {
      return res.status(400).json({ error: 'region is required' });
    }

    const terraformFiles = terraformService.generateTerraformCode(
      cloud_provider,
      components,
      region
    );

    return res.status(200).json({ success: true, terraform_files: terraformFiles });
  } catch (error) {
    console.error('generate-terraform error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to generate Terraform code.' });
  }
};
