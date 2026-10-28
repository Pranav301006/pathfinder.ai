const express = require('express');
const router = express.Router();
const recommendationController = require('./recommendationController');
const { requireAuth } = require('../../middleware/auth');

router.post('/generate', requireAuth, recommendationController.generateRecommendations);
router.get('/latest', requireAuth, recommendationController.getLatestRecommendation);
router.get('/student/:studentId', requireAuth, recommendationController.getLatestRecommendation);

module.exports = router;
