const express = require('express');
const router = express.Router();
const assessmentController = require('./assessmentController');
const { requireAuth } = require('../../middleware/auth');

router.get('/questions', assessmentController.getQuestions);
router.post('/', requireAuth, assessmentController.submitAssessment);
router.get('/latest', requireAuth, assessmentController.getLatestAssessment);
router.get('/student/:studentId', requireAuth, assessmentController.getLatestAssessment);

module.exports = router;
