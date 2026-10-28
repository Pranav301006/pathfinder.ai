const db = require('../../db');

function generateId(prefix = 'rev') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

exports.getKPIs = (req, res, next) => {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const completedAssessments = db.prepare("SELECT COUNT(*) as count FROM assessments WHERE status = 'completed'").get().count;
    const pendingReviews = db.prepare("SELECT COUNT(*) as count FROM recommendations WHERE status = 'pending_review'").get().count;
    const approvedReviews = db.prepare("SELECT COUNT(*) as count FROM recommendations WHERE status IN ('approved', 'edited')").get().count;

    res.json({
      success: true,
      data: {
        totalStudents,
        completedAssessments,
        pendingReviews,
        approvedReviews,
        avgReviewMinutes: 12.5,
        counselorCoveragePercent: totalStudents > 0 ? Math.round((approvedReviews / totalStudents) * 100) : 0
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = (req, res, next) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const profiled = db.prepare("SELECT COUNT(*) as count FROM student_profiles WHERE career_interests IS NOT NULL OR stream IS NOT NULL").get().count;
    const assessed = db.prepare("SELECT COUNT(DISTINCT student_id) as count FROM assessments WHERE status = 'completed'").get().count;
    const roadmaps = db.prepare("SELECT COUNT(DISTINCT student_id) as count FROM roadmaps").get().count;

    const funnel = [
      { stage: 'Registered', count: totalUsers, dropoff: 0 },
      { stage: 'Profiled', count: profiled, dropoff: Math.max(0, totalUsers - profiled) },
      { stage: 'Assessed', count: assessed, dropoff: Math.max(0, profiled - assessed) },
      { stage: 'Roadmap Started', count: roadmaps, dropoff: Math.max(0, assessed - roadmaps) },
      { stage: 'Active & Engaged', count: Math.max(1, Math.round(roadmaps * 0.75)), dropoff: 0 }
    ];

    res.json({
      success: true,
      data: {
        funnel
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getStudents = (req, res, next) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.email, u.last_login, u.created_at,
             sp.full_name, sp.education_level, sp.stream, sp.grade, sp.career_interests
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `).all();

    const formatted = students.map(s => {
      const assessment = db.prepare(`
        SELECT id, riasec_scores_json, reality_check_gap_json, completed_at
        FROM assessments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(s.id);

      const recommendation = db.prepare(`
        SELECT id, status, counselor_badge, created_at
        FROM recommendations WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(s.id);

      const roadmap = db.prepare(`
        SELECT progress_percent FROM roadmaps WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
      `).get(s.id);

      // Early Warning System Flags
      const flags = [];

      // Check inactive
      if (!s.last_login) {
        flags.push({ type: 'INACTIVE', level: 'warning', message: 'Never logged in after registration' });
      }

      // Check skill reality gap mismatch
      if (assessment && assessment.reality_check_gap_json) {
        const gapData = JSON.parse(assessment.reality_check_gap_json);
        if (gapData.hasMajorMismatch) {
          flags.push({
            type: 'SKILL_MISMATCH',
            level: 'danger',
            message: `Reality check gap detected in ${gapData.mismatches?.map(m => m.skill).join(', ') || 'skills'}`
          });
        }
      }

      return {
        id: s.id,
        email: s.email,
        fullName: s.full_name || 'Anonymous Student',
        educationLevel: s.education_level || 'Class 12',
        stream: s.stream || 'Science',
        grade: s.grade || 'N/A',
        lastLogin: s.last_login,
        hasAssessment: Boolean(assessment),
        hollandCode: assessment?.riasec_scores_json ? JSON.parse(assessment.riasec_scores_json).hollandCode : null,
        recommendationStatus: recommendation?.status || 'none',
        counselorBadge: Boolean(recommendation?.counselor_badge),
        roadmapProgress: roadmap ? roadmap.progress_percent : 0,
        flags
      };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
};

// AI Counselor Copilot: Generates 1-on-1 briefing dossier, discussion prompts & risk alerts
exports.getStudentBrief = (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    const student = db.prepare(`
      SELECT u.id, u.email, sp.full_name, sp.education_level, sp.stream, sp.grade, sp.career_interests
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `).get(studentId);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const assessment = db.prepare(`
      SELECT * FROM assessments WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(studentId);

    const recommendation = db.prepare(`
      SELECT * FROM recommendations WHERE student_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(studentId);

    const riasec = assessment ? JSON.parse(assessment.riasec_scores_json) : null;
    const skills = assessment ? JSON.parse(assessment.verified_skills_json) : {};
    const realityGap = assessment ? JSON.parse(assessment.reality_check_gap_json) : null;
    const topCareers = recommendation ? JSON.parse(recommendation.top_careers_json) : [];

    const summary = `${student.full_name || 'The student'} is in ${student.education_level} (${student.stream}). Holland code is ${riasec?.hollandCode || 'N/A'}. Strongest verified competencies are in ${Object.entries(skills).sort((a,b)=>b[1]-a[1]).map(e=>e[0]).slice(0,2).join(' and ') || 'analytical problem solving'}.`;

    const suggestedDiscussionQuestions = [
      `"How do you feel about the match with ${topCareers[0]?.title || 'your recommended career'}? Does it fit your day-to-day picture?"`,
      `"I noticed you are strong in ${riasec?.hollandCode?.[0] || 'Investigation'}; how do you plan to leverage that in your entrance exam prep?"`,
      realityGap?.hasMajorMismatch
        ? `"We noticed a gap during the micro-quiz on ${realityGap.mismatches?.[0]?.skill || 'core skills'}. Where do you feel you need extra tutoring or structured coursework?"`
        : `"What are your primary reservations regarding preparing for competitive exams like ${topCareers[0]?.indianPathway?.entranceExams?.[0] || 'national entrance tests'}?"`,
      `"Would you like to start tracking the 10-week roadmap together, starting with week 1 toolchain setup?"`
    ];

    const riskFlags = [];
    if (realityGap?.hasMajorMismatch) {
      riskFlags.push({
        severity: 'HIGH',
        text: 'Self-rating vs Verified Micro-quiz gap detected. Student may be overestimating baseline skill.'
      });
    }
    if (!recommendation) {
      riskFlags.push({
        severity: 'MEDIUM',
        text: 'Student has not generated career recommendations yet.'
      });
    }

    res.json({
      success: true,
      data: {
        student,
        summary,
        suggestedDiscussionQuestions,
        riskFlags,
        topCareers,
        riasec,
        verifiedSkills: skills,
        realityGap
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.reviewRecommendation = (req, res, next) => {
  try {
    const counselorId = req.user.id;
    const { recommendationId, action, comment, editedPayload } = req.body;

    if (!['approved', 'edited', 'commented'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Must be approved, edited, or commented' });
    }

    const rec = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(recommendationId);
    if (!rec) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }

    db.transaction(() => {
      // Record review
      db.prepare(`
        INSERT INTO counselor_reviews (id, recommendation_id, counselor_id, action, comment, edited_payload_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        generateId('rev'),
        recommendationId,
        counselorId,
        action,
        comment || null,
        editedPayload ? JSON.stringify(editedPayload) : null
      );

      // Update recommendation status and badge
      const newStatus = action === 'commented' ? rec.status : action;
      const isVerified = action === 'approved' || action === 'edited' ? 1 : rec.counselor_badge;

      db.prepare(`
        UPDATE recommendations
        SET status = ?,
            counselor_badge = ?,
            counselor_notes = COALESCE(?, counselor_notes),
            top_careers_json = COALESCE(?, top_careers_json),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        newStatus,
        isVerified,
        comment || null,
        editedPayload ? JSON.stringify(editedPayload) : null,
        recommendationId
      );

      // Log event
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, metadata_json)
        VALUES (?, ?, 'COUNSELOR_REVIEWED', ?)
      `).run(
        generateId('act'),
        counselorId,
        JSON.stringify({ recommendationId, action, studentId: rec.student_id })
      );
    })();

    res.json({
      success: true,
      message: `Recommendation ${action} successfully. Counselor Verified badge updated.`
    });
  } catch (err) {
    next(err);
  }
};
