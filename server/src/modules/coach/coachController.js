const db = require('../../db');
const { askAICareerCoach } = require('../ai/llmGateway');

exports.chat = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { question } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question text is required' });
    }

    const studentProfile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(studentId);
    const assessment = db.prepare('SELECT * FROM assessments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1').get(studentId);
    const roadmap = db.prepare('SELECT * FROM roadmaps WHERE student_id = ? ORDER BY created_at DESC LIMIT 1').get(studentId);

    const parsedAssessment = assessment ? {
      riasecScores: JSON.parse(assessment.riasec_scores_json),
      verifiedSkills: JSON.parse(assessment.verified_skills_json)
    } : null;

    const response = await askAICareerCoach({
      studentProfile,
      assessment: parsedAssessment,
      roadmap,
      question
    });

    res.json({
      success: true,
      data: response
    });
  } catch (err) {
    next(err);
  }
};
