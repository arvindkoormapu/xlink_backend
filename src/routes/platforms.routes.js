const express = require('express');
const router = express.Router();
const { Upload } = require('../../config');
const checkAuth = require('../../checkAuth');

const platformController = require('../controllers/platform.controller');

router.get('/', checkAuth, platformController.getPlatformProfiles);
router.get('/:platformId', checkAuth, platformController.getPlatformProfile);
router.post('/', checkAuth, Upload.single('image'), platformController.addPlatform);
router.put('/:id', Upload.single('image'), platformController.updatePlatform);
router.delete('/:id', platformController.deletePlatform);
router.post('/whitelist_vendor', platformController.whitelistVendor);
router.get('/whitelist_vendor/:platformId', platformController.getWhitelistVendor);

module.exports = router;