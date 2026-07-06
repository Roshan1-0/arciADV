/**
 * Vercel Serverless Function — POST /api/estimate-cost
 * Estimates INR cost for a given provider and component list.
 */

const costService = require('../server/src/services/costService');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { cloud_provider, components = [], uptime = 99.0, runtime_months = 1 } = req.body;

    if (!cloud_provider || !['AWS', 'Azure'].includes(cloud_provider)) {
      return res.status(400).json({ error: 'cloud_provider must be AWS or Azure' });
    }

    const costResult = costService.estimateCosts(
      cloud_provider,
      components,
      parseFloat(uptime),
      parseInt(runtime_months)
    );

    return res.status(200).json({ success: true, cost_estimation: costResult });
  } catch (error) {
    console.error('estimate-cost error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to estimate cost.' });
  }
};
