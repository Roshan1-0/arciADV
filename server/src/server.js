require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 InfraGen AI Server running on http://localhost:${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   POST /api/generate-architecture`);
  console.log(`   POST /api/generate-terraform`);
  console.log(`   POST /api/estimate-cost\n`);
});
