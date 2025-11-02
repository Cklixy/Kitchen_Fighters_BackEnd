const { Router } = require('express');
const {
  createTournament,
  getTournaments,
  getTournamentById,
  registerChef,
  submitScore,
  getRanking,
} = require('../controllers/tournament.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.post('/', createTournament);
router.get('/', getTournaments);

router.post('/:id/register', authMiddleware, registerChef);
router.post('/:id/submit', authMiddleware, submitScore);

router.get('/:id/ranking', getRanking);
router.get('/:id', getTournamentById);

module.exports = router;
