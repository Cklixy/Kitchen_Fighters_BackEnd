// src/routes/index.js

const { Router } = require('express');
const chefRoutes = require('./chef.routes'); //
const tournamentRoutes = require('./tournament.routes'); //

const router = Router();

// Ruta para chefs
router.use('/chefs', chefRoutes);

// Ruta para torneos
router.use('/tournaments', tournamentRoutes);

module.exports = router;