const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const resourcesController = require('../controllers/resources.controller');

router.get('/', checkAuth, resourcesController.getResources);
router.post('/', checkAuth, resourcesController.addResources);
router.put('/:id', resourcesController.updateResources);

module.exports = router;