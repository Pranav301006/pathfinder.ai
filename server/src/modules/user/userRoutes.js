const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { requireAuth } = require('../../middleware/auth');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.delete('/me', requireAuth, userController.deleteMyData);
router.get('/me/export', requireAuth, userController.exportMyData);

module.exports = router;
