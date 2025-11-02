// src/routes/admin.routes.js
// Rutas solo para administradores

const { Router } = require('express');
const authMiddleware = require('../middleware/auth.middleware.js');
const checkAdmin = require('../middleware/checkAdmin.middleware.js');
const adminController = require('../controllers/admin.controller');

const router = Router();

// Un controlador de ejemplo para el dashboard
const getAdminDashboardData = async (req, res, next) => {
  try {
    // Como pasamos por checkAdmin, aquí estamos seguros de que req.chef.role es 'admin'
    res.json({
      message: `¡Bienvenido al dashboard de admin, ${req.chef.name}!`,
      secretData: {
        totalUsuarios: 150, // (Obviamente, aquí harías una consulta a la BD)
        torneosPendientes: 5 
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Ruta de ejemplo para el Admin Dashboard ---
router.get(
  '/dashboard', 
  authMiddleware,
  checkAdmin,
  getAdminDashboardData
);

// --- Rutas para gestión de CHEFS (usuarios) ---
// GET /api/admin/chefs - Listar todos los chefs
router.get('/chefs', authMiddleware, checkAdmin, adminController.getChefs);

// PUT /api/admin/chefs/:id - Actualizar rol de un chef
router.put('/chefs/:id', authMiddleware, checkAdmin, adminController.setChefRole);

// --- Rutas para gestión de TORNEOS ---
// GET /api/admin/tournaments - Listar todos los torneos
router.get('/tournaments', authMiddleware, checkAdmin, adminController.getTournaments);

// --- ¡¡NUEVA RUTA AÑADIDA!! ---
// POST /api/admin/tournaments - Crear un nuevo torneo
router.post('/tournaments', authMiddleware, checkAdmin, adminController.createTournament);
// --- FIN DE RUTA AÑADIDA ---

// DELETE /api/admin/tournaments/:id - Eliminar un torneo
router.delete('/tournaments/:id', authMiddleware, checkAdmin, adminController.deleteTournament);

// --- Rutas adicionales para gestión de usuarios (alias para compatibilidad) ---
// Listar todos los usuarios (alias de /chefs)
router.get('/users', authMiddleware, checkAdmin, adminController.getAllUsers);

// Obtener un usuario específico
router.get('/users/:id', authMiddleware, checkAdmin, adminController.getUserById);

// Cambiar el rol de un usuario
router.put('/users/:id/role', authMiddleware, checkAdmin, adminController.changeUserRole);

module.exports = router;