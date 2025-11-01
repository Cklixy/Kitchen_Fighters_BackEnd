const { Router } = require('express');
const {
  createTournament,
  getTournaments,
  getTournamentById,
  registerChef,
  submitScore,
  getRanking,
} = require('../controllers/tournament.controller');

// 1. Importamos el middleware de autenticación que creamos
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// --- Rutas Públicas ---
router.post('/', createTournament);
router.get('/', getTournaments);

// --- Rutas Protegidas (Requieren Token) ---

// 2. Añadimos el 'authMiddleware' a la ruta de registro.
// Ahora, solo chefs con sesión iniciada pueden usar esta ruta.
router.post('/:id/register', authMiddleware, registerChef);

router.post('/:id/submit', authMiddleware, submitScore);

// --- Rutas Públicas (con ID) ---
router.get('/:id/ranking', getRanking);
router.get('/:id', getTournamentById);

module.exports = router;