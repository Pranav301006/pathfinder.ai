const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { requireAuth, requireRole } = require('../../middleware/auth');

router.get('/ai-logs', requireAuth, requireRole('admin'), adminController.getAILogs);
router.get('/users', requireAuth, requireRole('admin'), adminController.getUsers);

module.exports = router;
