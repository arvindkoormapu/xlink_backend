const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');
const { Upload } = require('../../config');

const activitiesController = require('../controllers/activities.controller');

router.get('/:vendorId', checkAuth, activitiesController.get);
router.post('/', checkAuth, activitiesController.create);
router.put('/:id', Upload.fields([{ name: 'featuredimage' }, { name: 'gallery', maxCount: 5 }]), activitiesController.update);
router.delete('/:id', activitiesController.deleteActivity);

module.exports = router;