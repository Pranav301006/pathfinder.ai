const express = require('express');
const router = express.Router();
const coachController = require('./coachController');
const { requireAuth } = require('../../middleware/auth');

router.post('/chat', requireAuth, coachController.chat);

module.exports = router;
