const db = require('../../db');
const { computeShortlist } = require('../scoring/groundedEngine');
const { enrichRecommendationsWithAI } = require('../ai/llmGateway');

function generateId(prefix = 'rec') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

exports.generateRecommendations = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // 1. Get latest assessment
    const assessment = db.prepare(`
      SELECT * FROM assessments
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(studentId);

    if (!assessment) {
      return res.status(400).json({
        success: false,
        error: 'Please complete the assessment before generating recommendations.'
      });
    }

    const riasecScores = JSON.parse(assessment.riasec_scores_json);
    const verifiedSkills = JSON.parse(assessment.verified_skills_json);
    const workValues = JSON.parse(assessment.work_values_json);
    const studentProfile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(studentId);

    // 2. Deterministic Grounded Scoring Engine
    const shortlist = computeShortlist(riasecScores, verifiedSkills, workValues);

    // 3. LLM Gateway enrichment (PII stripped, schema validated, retry & fallback)
    const aiResult = await enrichRecommendationsWithAI({
      studentId,
      studentProfile,
      riasecScores,
      verifiedSkills,
      workValues,
      shortlistCareers: shortlist
    });

    const recId = generateId('rec');

    db.prepare(`
      INSERT INTO recommendations (id, assessment_id, student_id, top_careers_json, prompt_version, status, counselor_badge)
      VALUES (?, ?, ?, ?, ?, 'pending_review', 0)
    `).run(
      recId,
      assessment.id,
      studentId,
      JSON.stringify(aiResult.recommendations),
      aiResult.promptVersion
    );

    // Log activity
    db.prepare(`
      INSERT INTO activity_events (id, user_id, event_type, metadata_json)
      VALUES (?, ?, 'RECOMMENDATIONS_GENERATED', ?)
    `).run(
      generateId('act'),
      studentId,
      JSON.stringify({ recId, isFallback: aiResult.isFallback, latencyMs: aiResult.latencyMs })
    );

    res.status(201).json({
      success: true,
      message: 'Personalized recommendations generated successfully',
      data: {
        id: recId,
        assessmentId: assessment.id,
        status: 'pending_review',
        counselorBadge: false,
        isFallback: aiResult.isFallback,
        topCareers: aiResult.recommendations
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getLatestRecommendation = (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.id;
    const rec = db.prepare(`
      SELECT * FROM recommendations
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(studentId);

    if (!rec) {
      return res.status(404).json({ success: false, error: 'No recommendation found yet.' });
    }

    res.json({
      success: true,
      data: {
        id: rec.id,
        assessmentId: rec.assessment_id,
        studentId: rec.student_id,
        status: rec.status,
        counselorBadge: Boolean(rec.counselor_badge),
        counselorNotes: rec.counselor_notes,
        createdAt: rec.created_at,
        topCareers: JSON.parse(rec.top_careers_json)
      }
    });
  } catch (err) {
    next(err);
  }
};
