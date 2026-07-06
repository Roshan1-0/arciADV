const express = require('express');
const router = express.Router();
const {
  generateArchitecture,
  generateTerraform,
  estimateCost,
} = require('../controllers/architectureController');
const { validateArchitectureInput } = require('../middleware/validateInput');

// POST /api/generate-architecture — main combined endpoint
router.post('/generate-architecture', validateArchitectureInput, generateArchitecture);

// POST /api/generate-terraform — standalone terraform generation
router.post('/generate-terraform', validateArchitectureInput, generateTerraform);

// POST /api/estimate-cost — standalone cost estimation
router.post('/estimate-cost', validateArchitectureInput, estimateCost);

module.exports = router;
