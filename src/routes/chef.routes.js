// src/routes/chef.routes.js

const { Router } = require('express');
const controller = require('../controllers/chef.controller');

// 1. Importamos nuestros nuevos middlewares
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

const router = Router();

// --- RUTAS PÚBLICAS (No requieren token) ---
// POST /api/chefs (Registrar un chef)
router.post('/', controller.createChef);

// POST /api/chefs/login (Iniciar sesión)
router.post('/login', controller.loginChef);

// GET /api/chefs (Listar todos los chefs)
router.get('/', controller.listChefs);


// --- RUTAS PROTEGIDAS (Requieren token) ---

// PUT /api/chefs/profile (Actualizar MI perfil)
// 1. Pasa por 'authMiddleware' para verificar el token
// 2. Pasa por 'upload.single('profileImage')' para procesar la imagen
// 3. Si todo va bien, llega a 'controller.updateMyProfile'
router.put(
  '/profile', 
  authMiddleware, 
  upload.single('profileImage'), // 'profileImage' es el nombre del campo en el formulario
  controller.updateMyProfile
);


// --- RUTAS DINÁMICAS (Públicas, pero al final) ---
// GET /api/chefs/:id (Ver un chef público)
router.get('/:id', controller.getChef);

// PUT /api/chefs/:id (Actualizar un chef - rol de Admin)
router.put('/:id', controller.updateChef);

// DELETE /api/chefs/:id (Eliminar un chef - rol de Admin)
router.delete('/:id', controller.deleteChef);


module.exports = router;