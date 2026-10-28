const express = require('express');
const router = express.Router();
const roadmapController = require('./roadmapController');
const { requireAuth } = require('../../middleware/auth');

router.post('/generate', requireAuth, roadmapController.generateRoadmap);
router.get('/current', requireAuth, roadmapController.getRoadmap);
router.get('/student/:studentId', requireAuth, roadmapController.getRoadmap);
router.patch('/milestones/:id', requireAuth, roadmapController.toggleMilestone);

module.exports = router;
