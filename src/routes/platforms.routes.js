const express = require('express');
const router = express.Router();
const { Upload } = require('../../config');
const checkAuth = require('../../checkAuth');

const platformController = require('../controllers/platform.controller');

router.get('/', checkAuth, platformController.getPlatformProfiles);
router.post('/', checkAuth, Upload.single('image'), platformController.addPlatform);
router.put('/:id', Upload.single('image'), platformController.updatePlatform);
router.delete('/:id', platformController.deletePlatform);

module.exports = router;