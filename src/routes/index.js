const { Router } = require('express');
const chefRoutes = require('./chef.routes');
const tournamentRoutes = require('./tournament.routes');

const router = Router();

router.use('/chefs', chefRoutes);
router.use('/tournaments', tournamentRoutes);

module.exports = router;
