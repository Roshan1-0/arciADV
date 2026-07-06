const express = require('express');
const cors = require('cors');
const architectureRoutes = require('./routes/architecture');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'InfraGen AI API is running',
    version: '2.0.0',
    endpoints: [
      'POST /api/generate-architecture',
      'POST /api/generate-terraform',
      'POST /api/estimate-cost',
    ],
  });
});

// Routes
app.use('/api', architectureRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
