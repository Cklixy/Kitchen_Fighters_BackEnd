const express = require('express');
const cors = require('cors');
const { logger } = require('./src/middleware/logger');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./src/config/db');
const apiRouter = require('./src/routes');

// Load env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api', apiRouter);

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
