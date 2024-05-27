const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user-profile.routes');
const vendorRoutes = require('./vendors.routes');
const platformRoutes = require('./platforms.routes');
const platformApiKeysRoutes = require('./platform-api-keys.routes');
const taxesRoutes = require('./taxes.routes');
const addonsRoutes = require('./addons.routes');
const resourcesRoutes = require('./resources.routes');
const categoriesRoutes = require('./categories.routes');
const activitiesRoutes = require('./activities.routes');
const packagesRoutes = require('./packages.routes');
const sessionRoutes = require('./session.routes');
const ticketsRoutes = require('./tickets.routes');

router.use('/auth', authRoutes);
router.use('/user-profile', userRoutes);
router.use('/vendor', vendorRoutes);
router.use('/platform', platformRoutes);
router.use('/platform-api-keys', platformApiKeysRoutes);
router.use('/taxes', taxesRoutes);
router.use('/addons', addonsRoutes);
router.use('/resources', resourcesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/activities', activitiesRoutes);
router.use('/packages', packagesRoutes);
router.use('/session', sessionRoutes);
router.use('/tickets', ticketsRoutes);

module.exports = router;
