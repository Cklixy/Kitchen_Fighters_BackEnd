// src/routes/tournament.routes.js

const { Router } = require('express');
const {
  createTournament,
  listTournaments,
  addChefToTournament,
  getTournament,
  updateTournament,
  deleteTournament,
} = require('../controllers/tournament.controller');

const router = Router();

// POST /api/tournaments - Crear un nuevo torneo
router.post('/', createTournament);

// GET /api/tournaments - Listar todos los torneos
router.get('/', listTournaments);

// POST /api/tournaments/:id/add-chef - Añadir un chef a un torneo (debe ir antes de /:id)
router.post('/:id/add-chef', addChefToTournament);

// GET /api/tournaments/:id - Obtener un torneo por ID
router.get('/:id', getTournament);

// PUT /api/tournaments/:id - Actualizar un torneo
router.put('/:id', updateTournament);

// DELETE /api/tournaments/:id - Eliminar un torneo
router.delete('/:id', deleteTournament);

module.exports = router;
