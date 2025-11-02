const { Router } = require('express');
const {
  createTournament,
  getTournaments,
  getTournamentById,
  registerChef,
  unregisterChef, // <-- 1. Importamos la nueva función
  submitScore,
  getRanking,
} = require('../controllers/tournament.controller');

const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// --- Rutas Públicas ---
router.post('/', createTournament);
router.get('/', getTournaments);

// --- Rutas Protegidas (Requieren Token) ---

router.post('/:id/register', authMiddleware, registerChef);

// --- 2. Añadimos la nueva ruta para anular inscripción ---
router.post('/:id/unregister', authMiddleware, unregisterChef);
// --- Fin de la nueva ruta ---

router.post('/:id/submit', authMiddleware, submitScore);

// --- Rutas Públicas (con ID) ---
router.get('/:id/ranking', getRanking);
router.get('/:id', getTournamentById);

module.exports = router;