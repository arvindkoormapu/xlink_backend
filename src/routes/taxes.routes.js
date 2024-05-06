const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const taxesController = require('../controllers/taxes.controller');

router.get('/', checkAuth, taxesController.getTaxes);
router.post('/', checkAuth, taxesController.addTaxes);
router.put('/:id', taxesController.updateTaxes);

module.exports = router;