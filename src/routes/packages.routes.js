const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');
const { Upload } = require('../../config');

const packagesController = require('../controllers/packages.controller');

router.get('/:activity_id', checkAuth, packagesController.get);
router.post('/', checkAuth, packagesController.create);
router.put('/:id', Upload.fields([{ name: 'featuredimage' }, { name: 'gallery', maxCount: 5 }]), packagesController.update);
router.delete('/:id', packagesController.deletePackage);

module.exports = router;