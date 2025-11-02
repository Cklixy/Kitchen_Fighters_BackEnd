const { Router } = require('express');
const controller = require('../controllers/chef.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../config/multer.config');

const router = Router();

router.post('/', controller.createChef);
router.post('/login', controller.loginChef);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);
router.get('/', controller.listChefs);

router.get('/me', authMiddleware, controller.getMyProfile);
router.put(
  '/profile', 
  authMiddleware, 
  upload.single('profileImage'),
  controller.updateMyProfile
);

router.get('/:id', controller.getChef);
router.put('/:id', controller.updateChef);
router.delete('/:id', controller.deleteChef);

module.exports = router;
