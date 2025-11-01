// index.js

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path'); // <-- Necesario para servir archivos

const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const adminRoutes = require('./src/routes/admin.routes');

// 1. Conexión a la Base de Datos
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Middlewares
app.use(cors()); // Permite peticiones de otros dominios (tu frontend)
app.use(morgan('dev')); // Muestra logs de peticiones en la consola
app.use(express.json()); // Permite a Express entender JSON

// 3. --- ¡NUEVA LÍNEA! ---
// Servir archivos estáticos (nuestras imágenes)
// Cualquier petición a /uploads/... buscará en la carpeta /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Rutas de la API
app.use('/api', routes);
app.use('/api/admin', adminRoutes);
// 5. Manejador de Errores (básico)
// (Este debe ir DESPUÉS de las rutas)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: '¡Algo salió mal!', error: err.message });
});

// 6. Iniciar el Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});