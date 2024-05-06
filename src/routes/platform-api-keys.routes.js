const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');

const platformApiKeysController = require('../controllers/platform-api-keys.controller');

router.get('/', checkAuth, platformApiKeysController.getPlatformApiKeys);
router.post('/', checkAuth, platformApiKeysController.addPlatformApiKey);
router.put('/updateActiveState/:id/:active', platformApiKeysController.updateActiveState);
router.put('/updateSeenState/:id', platformApiKeysController.updateSeenState);

module.exports = router;