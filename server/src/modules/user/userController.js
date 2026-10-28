const db = require('../../db');

exports.getProfile = (req, res, next) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user.id);
    } else if (req.user.role === 'counselor') {
      profile = db.prepare('SELECT * FROM counselor_profiles WHERE user_id = ?').get(req.user.id);
    }

    res.json({
      success: true,
      data: {
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = (req, res, next) => {
  try {
    const { fullName, educationLevel, stream, grade, targetLanguage, careerInterests, institution, specialization } = req.body;

    if (req.user.role === 'student') {
      db.prepare(`
        UPDATE student_profiles
        SET full_name = COALESCE(?, full_name),
            education_level = COALESCE(?, education_level),
            stream = COALESCE(?, stream),
            grade = COALESCE(?, grade),
            target_language = COALESCE(?, target_language),
            career_interests = COALESCE(?, career_interests),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(fullName, educationLevel, stream, grade, targetLanguage, careerInterests, req.user.id);

      const updated = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user.id);
      return res.json({ success: true, message: 'Profile updated successfully', data: updated });
    }

    if (req.user.role === 'counselor') {
      db.prepare(`
        UPDATE counselor_profiles
        SET full_name = COALESCE(?, full_name),
            institution = COALESCE(?, institution),
            specialization = COALESCE(?, specialization)
        WHERE user_id = ?
      `).run(fullName, institution, specialization, req.user.id);

      const updated = db.prepare('SELECT * FROM counselor_profiles WHERE user_id = ?').get(req.user.id);
      return res.json({ success: true, message: 'Counselor profile updated successfully', data: updated });
    }

    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};

// GDPR / Data Protection: Right to be forgotten
exports.deleteMyData = (req, res, next) => {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    res.json({ success: true, message: 'All your personal data, assessments, and AI recommendations have been permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

// Data Portability: Export full student profile dossier
exports.exportMyData = (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(userId);
    const assessments = db.prepare('SELECT * FROM assessments WHERE student_id = ? ORDER BY created_at DESC').all(userId);
    const recommendations = db.prepare('SELECT * FROM recommendations WHERE student_id = ? ORDER BY created_at DESC').all(userId);
    const roadmaps = db.prepare('SELECT * FROM roadmaps WHERE student_id = ? ORDER BY created_at DESC').all(userId);

    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        profile,
        assessments: assessments.map(a => ({
          ...a,
          riasecScores: a.riasec_scores_json ? JSON.parse(a.riasec_scores_json) : null,
          verifiedSkills: a.verified_skills_json ? JSON.parse(a.verified_skills_json) : null,
          workValues: a.work_values_json ? JSON.parse(a.work_values_json) : null
        })),
        recommendations: recommendations.map(r => ({
          ...r,
          topCareers: JSON.parse(r.top_careers_json)
        })),
        roadmaps: roadmaps.map(rm => ({
          ...rm,
          weeks: JSON.parse(rm.weeks_json)
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};
