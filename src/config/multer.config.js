// src/config/multer.config.js

const multer = require('multer');
const path = require('path');

/**
 * Configuración de almacenamiento de Multer
 */
const storage = multer.diskStorage({
  // 1. Dónde guardar los archivos (la carpeta que creamos)
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  // 2. Cómo nombrar el archivo (para evitar nombres duplicados)
  filename: function (req, file, cb) {
    // Genera un nombre único: "chef-123456789.jpg"
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chef-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * Filtro para aceptar solo imágenes
 */
const fileFilter = (req, file, cb) => {
  // Expresión regular para tipos de imagen comunes
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter: fileFilter
});

module.exports = upload;