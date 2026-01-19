const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock service status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    services: {
      orchestrator: { port: 3006, url: 'http://localhost:3006' },
      soap: { port: 3001, url: 'http://localhost:3001' },
      salesforce: { port: 3002, url: 'http://localhost:3002' },
      stripe: { port: 3003, url: 'http://localhost:3003' },
      twilio: { port: 3004, url: 'http://localhost:3004' },
      aws: { port: 3005, url: 'http://localhost:3005' }
    }
  });
});

// Mock data summary endpoint
app.get('/api/data/summary', (req, res) => {
  res.json({
    users: 150,
    products: 45,
    orders: 89,
    revenue: 12500,
    lastUpdated: new Date().toISOString()
  });
});

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log('📊 Available endpoints:');
  console.log('  GET /api/status');
  console.log('  GET /api/data/summary');
});
