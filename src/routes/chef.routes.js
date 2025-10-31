const { Router } = require('express');
const controller = require('../controllers/chef.controller');

const router = Router();

router.post('/', controller.createChef);
router.get('/', controller.listChefs);
router.get('/:id', controller.getChef);
router.put('/:id', controller.updateChef);
router.delete('/:id', controller.deleteChef);

module.exports = router;
