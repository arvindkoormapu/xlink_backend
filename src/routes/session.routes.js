const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const sessionController = require('../controllers/session.controller');

router.post('/', checkAuth, sessionController.create);
router.get('/:package_id', checkAuth, sessionController.get);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;