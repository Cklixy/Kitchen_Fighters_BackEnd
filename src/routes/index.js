// src/routes/index.js

const { Router } = require('express');
const chefRoutes = require('./chef.routes');
const tournamentRoutes = require('./tournament.routes');

const router = Router();

// Asignamos las rutas
// Todas las rutas de chefs estarán bajo /api/chefs
router.use('/chefs', chefRoutes);

// Todas las rutas de torneos estarán bajo /api/tournaments
router.use('/tournaments', tournamentRoutes);

module.exports = router;