const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const ticketsController = require('../controllers/tickets.controller');

router.get('/:packageId', checkAuth, ticketsController.get);
router.post('/', checkAuth, ticketsController.add);
router.put('/:id', ticketsController.update);

module.exports = router;