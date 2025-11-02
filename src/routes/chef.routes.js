const { Router } = require('express');
const controller = require('../controllers/chef.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

const router = Router();

// --- RUTAS PÚBLICAS ---

// ¡MODIFICADO!
// Se añade el middleware 'upload' para que Multer procese el formulario
// (multipart/form-data) y popule 'req.body' y 'req.file'.
router.post(
  '/register',
  upload.single('profileImage'), // <-- ¡ESTA ES LA LÍNEA AÑADIDA!
  controller.createChef
);

router.post('/login', controller.loginChef);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);
router.get('/', controller.listChefs);

// --- RUTAS PROTEGIDAS ---

router.get('/me', authMiddleware, controller.getMyProfile);
router.put(
  '/profile', 
  authMiddleware, 
  upload.single('profileImage'),
  controller.updateMyProfile
);

// --- RUTAS DINÁMICAS ---

router.get('/:id', controller.getChef);
router.put('/:id', controller.updateChef);
router.delete('/:id', controller.deleteChef);

module.exports = router;