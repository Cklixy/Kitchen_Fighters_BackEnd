// src/routes/admin.routes.js
const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware.js');
const checkAdmin = require('../middleware/checkAdmin.middleware.js');
const adminController = require('../controllers/admin.controller');

// --- ¡¡AÑADIDO!!: Configuración de Multer para imágenes de torneos ---
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Usa la carpeta 'uploads' que ya estás sirviendo estáticamente
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'tournament-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos (igual al de chefs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
  fileFilter: fileFilter
});
// --- FIN DE CONFIGURACIÓN DE MULTER ---


const router = Router();

// --- Rutas para gestión de CHEFS (usuarios) ---
router.get('/chefs', authMiddleware, checkAdmin, adminController.getChefs);
router.put('/chefs/:id', authMiddleware, checkAdmin, adminController.setChefRole);
router.delete('/chefs/:id', authMiddleware, checkAdmin, adminController.deleteChef);


// --- Rutas para gestión de TORNEOS ---
router.get('/tournaments', authMiddleware, checkAdmin, adminController.getTournaments);

// --- ¡¡RUTA MODIFICADA!!: Se añade el middleware de upload.single('image') ---
router.post(
  '/tournaments', 
  authMiddleware, 
  checkAdmin, 
  upload.single('image'), // 'image' debe coincidir con el nombre del campo en FormData
  adminController.createTournament
);
// --- FIN DE RUTA MODIFICADA ---

router.delete('/tournaments/:id', authMiddleware, checkAdmin, adminController.deleteTournament);
router.put('/tournaments/:id', authMiddleware, checkAdmin, adminController.updateTournament);

// --- ¡¡NUEVA RUTA AÑADIDA!! (Resultados del Torneo) ---
router.put('/tournaments/:id/results', authMiddleware, checkAdmin, adminController.updateTournamentResults);
// --- FIN DE RUTA AÑADIDA ---


// --- Rutas adicionales (alias) ---
router.get('/users', authMiddleware, checkAdmin, adminController.getAllUsers);
router.get('/users/:id', authMiddleware, checkAdmin, adminController.getUserById);
router.put('/users/:id/role', authMiddleware, checkAdmin, adminController.changeUserRole);

module.exports = router;