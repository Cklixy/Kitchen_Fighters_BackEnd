// src/config/db.js

const mongoose = require('mongoose');
require('dotenv').config(); // Asegura que las variables de .env estén disponibles

const connectDB = async () => {
  try {
    // Lee la URI de la variable de entorno
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error(
        'MONGO_URI no está definida. Revisa tu archivo .env'
      );
    }

    // Opciones de conexión (buenas prácticas)
    const connOptions = {
      // Mongoose 6+ ya no requiere estas opciones, 
      // pero es bueno saber que existen.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };

    // Intenta conectar a la base de datos
    const conn = await mongoose.connect(mongoURI, connOptions);

    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error de conexión: ${error.message}`);
    // Salir del proceso con falla si no se puede conectar
    process.exit(1);
  }
};

module.exports = connectDB; // Exportamos la función

