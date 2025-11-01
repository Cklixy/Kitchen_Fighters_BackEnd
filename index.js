const express = require('express');
const cors = require('cors');
const { logger } = require('./src/middleware/logger');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
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

// --- Middleware de Manejo de Errores ---
// (Este es el bloque nuevo que atrapa los errores)
app.use((err, req, res, next) => {
  console.error('ERROR DETECTADO:', err); // Muestra el error en la terminal del servidor

  // Envía una respuesta JSON al cliente (curl, Postman, etc.)
  res.status(err.status || 500).json({
    message: err.message || 'Algo salió mal en el servidor',
    // Opcional: solo muestra el stack de error en desarrollo
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});
// --- Fin del Middleware de Manejo de Errores ---

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});