// src/routes/tournament.routes.js

const { Router } = require('express');
const {
  createTournament,
  getTournaments,
  registerChef,
  submitScore,
  getRanking,
} = require('../controllers/tournament.controller');

const router = Router();

// POST /api/tournaments - Crear un nuevo torneo
router.post('/', createTournament);

// GET /api/tournaments - Listar todos los torneos
router.get('/', getTournaments);

// POST /api/tournaments/:id/register - Registrar un chef en un torneo
router.post('/:id/register', registerChef);

// POST /api/tournaments/:id/submit - Enviar puntaje de un chef
router.post('/:id/submit', submitScore);

// GET /api/tournaments/:id/ranking - Obtener el ranking de un torneo
router.get('/:id/ranking', getRanking);

module.exports = router;
