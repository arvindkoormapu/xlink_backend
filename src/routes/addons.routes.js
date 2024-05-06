const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const addonsController = require('../controllers/addons.controller');

router.get('/', checkAuth, addonsController.getAddons);
router.post('/', checkAuth, addonsController.addAddons);
router.put('/:id', addonsController.updateAddons);

module.exports = router;