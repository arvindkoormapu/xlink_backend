const express = require('express');
const router = express.Router();
const { Upload } = require('../../config');
const checkAuth = require('../../checkAuth');

const vendorController = require('../controllers/vendor.controller');

router.get('/', checkAuth, vendorController.getVendorProfiles);
router.post('/', checkAuth, Upload.single('image'), vendorController.addVendor);
router.put('/:id', Upload.single('image'), vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;