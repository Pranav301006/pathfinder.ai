const express = require('express');
const router = express.Router();
const counselorController = require('./counselorController');
const { requireAuth, requireRole } = require('../../middleware/auth');

// All counselor routes require counselor or admin role
router.get('/kpis', requireAuth, requireRole('counselor', 'admin'), counselorController.getKPIs);
router.get('/analytics', requireAuth, requireRole('counselor', 'admin'), counselorController.getAnalytics);
router.get('/students', requireAuth, requireRole('counselor', 'admin'), counselorController.getStudents);
router.get('/students/:studentId/brief', requireAuth, requireRole('counselor', 'admin'), counselorController.getStudentBrief);
router.post('/reviews', requireAuth, requireRole('counselor', 'admin'), counselorController.reviewRecommendation);

module.exports = router;
