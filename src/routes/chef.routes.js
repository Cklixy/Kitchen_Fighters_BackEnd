// src/routes/chef.routes.js

const { Router } = require('express');
const controller = require('../controllers/chef.controller');

// 1. Importamos nuestros middlewares
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

const router = Router();

// --- RUTAS PÚBLICAS (No requieren token) ---

// POST /api/chefs (Registrar un chef)
// (Tu código original tenía / aquí, pero /register es más claro si createChef es para registro)
// Mantendré la ruta que tenías:
router.post('/', controller.createChef);
// Si prefieres /register, usa: router.post('/register', controller.createChef);


// POST /api/chefs/login (Iniciar sesión)
router.post('/login', controller.loginChef);

// --- ¡¡NUEVAS RUTAS AÑADIDAS!! ---
// POST /api/chefs/forgot-password
router.post('/forgot-password', controller.forgotPassword);

// POST /api/chefs/reset-password/:token
router.post('/reset-password/:token', controller.resetPassword);
// --- FIN DE RUTAS AÑADIDAS ---


// GET /api/chefs (Listar todos los chefs)
router.get('/', controller.listChefs);


// --- RUTAS PROTEGIDAS (Requieren token) ---

// GET /api/chefs/me (Obtener MI perfil actual)
router.get('/me', authMiddleware, controller.getMyProfile);

// PUT /api/chefs/profile (Actualizar MI perfil)
router.put(
  '/profile', 
  authMiddleware, 
  upload.single('profileImage'), // 'profileImage' es el nombre del campo en el formulario
  controller.updateMyProfile
);


// --- RUTAS DINÁMICAS (Públicas, pero al final) ---
// GET /api/chefs/:id (Ver un chef público)
router.get('/:id', controller.getChef);

// NOTA: Estas rutas de Admin deberían estar en admin.routes.js y protegidas.
// Las dejo aquí para respetar tu archivo original.
// PUT /api/chefs/:id (Actualizar un chef - rol de Admin)
router.put('/:id', controller.updateChef);

// DELETE /api/chefs/:id (Eliminar un chef - rol de Admin)
router.delete('/:id', controller.deleteChef);


module.exports = router;