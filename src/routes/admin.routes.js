// src/routes/admin.routes.js
const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware.js');
const checkAdmin = require('../middleware/checkAdmin.middleware.js');
const adminController = require('../controllers/admin.controller');

const router = Router();

// ... (tu ruta de dashboard si la tienes) ...

// --- Rutas para gestión de CHEFS (usuarios) ---
router.get('/chefs', authMiddleware, checkAdmin, adminController.getChefs);
router.put('/chefs/:id', authMiddleware, checkAdmin, adminController.setChefRole);
router.delete('/chefs/:id', authMiddleware, checkAdmin, adminController.deleteChef);


// --- Rutas para gestión de TORNEOS ---
router.get('/tournaments', authMiddleware, checkAdmin, adminController.getTournaments);
router.post('/tournaments', authMiddleware, checkAdmin, adminController.createTournament);
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