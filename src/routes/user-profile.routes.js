const express = require('express');
const router = express.Router();
const checkAuth = require('../../checkAuth');
const userProfilesController = require('../controllers/user-profile.controller');

router.get('/', checkAuth, userProfilesController.getUserProfiles);
router.post('/', userProfilesController.addUserProfile);
router.put('/:id', userProfilesController.updateUserProfile);
router.delete('/:id/:role', userProfilesController.deleteUserProfile);

module.exports = router;