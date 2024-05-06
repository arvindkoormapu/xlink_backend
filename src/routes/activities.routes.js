const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');
const { Upload } = require('../../config');

const activitiesController = require('../controllers/activities.controller');

router.get('/', checkAuth, activitiesController.get);
router.post('/', checkAuth, activitiesController.create);
router.put('/:id', Upload.fields([{ name: 'featuredimage' }, { name: 'gallery', maxCount: 5 }]), activitiesController.update);

module.exports = router;