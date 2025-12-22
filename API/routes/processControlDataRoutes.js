const express = require('express');
const router = express.Router();
const controller = require('../controllers/processControlDataController');

router.get('/', controller.getAll);
router.get('/by-sn/:sn', controller.getBySN);
router.get('/by-wct/:workcenter', controller.getByWCT);
router.patch('/validate/:id', controller.validate);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
