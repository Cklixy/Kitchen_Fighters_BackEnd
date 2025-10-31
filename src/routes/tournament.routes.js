const { Router } = require('express');
const controller = require('../controllers/tournament.controller');

const router = Router();

router.post('/', controller.createTournament);
router.get('/', controller.listTournaments);

router.post('/:id/enroll', controller.enrollChef);
router.post('/:id/remove', controller.removeChef);
router.post('/:id/start', controller.startTournament);
router.post('/:id/finish', controller.finishTournament);

module.exports = router;
