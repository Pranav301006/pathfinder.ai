const db = require('../../db');

function generateId(prefix = 'ass') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

exports.getQuestions = (req, res, next) => {
  try {
    const rawQuestions = db.prepare('SELECT * FROM questions ORDER BY part, id').all();

    const formatted = rawQuestions.map(q => ({
      id: q.id,
      part: q.part,
      dimension: q.dimension,
      text_en: q.text_en,
      text_hi: q.text_hi,
      options: JSON.parse(q.options_json),
      reality_quiz: q.reality_quiz_json ? JSON.parse(q.reality_quiz_json).map(item => ({
        question: item.question,
        options: item.options
        // Do NOT expose correctIndex to client to prevent cheating
      })) : null
    }));

    res.json({
      success: true,
      data: {
        total: formatted.length,
        questions: formatted
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.submitAssessment = (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { answers } = req.body; // array of { questionId, selectedOptionIndex, realityQuizAnswers: [int, int, int] }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'Answers payload must be a non-empty array' });
    }

    const allQuestions = db.prepare('SELECT * FROM questions').all();
    const qMap = new Map(allQuestions.map(q => [q.id, q]));

    // 1. Calculate RIASEC Interest scores
    const riasecRaw = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    const riasecCounts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

    // 2. Calculate Verified Skills & Reality Check Mismatches
    const verifiedSkills = {};
    const realityCheckDetails = [];

    // 3. Collect Work Values
    const workValues = {};

    const assessmentId = generateId('ass');
    const insertAnswer = db.prepare(`
      INSERT INTO assessment_answers (id, assessment_id, question_id, answer_json, verified_score)
      VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const ans of answers) {
        const q = qMap.get(ans.questionId);
        if (!q) continue;

        let verifiedScore = null;

        if (q.part === 'interest') {
          // dimension is Realistic, Investigative, Artistic, Social, Enterprising, Conventional
          const char = q.dimension[0].toUpperCase();
          const ratingVal = (ans.selectedOptionIndex !== undefined ? ans.selectedOptionIndex + 1 : 3); // 1-5
          riasecRaw[char] += ratingVal;
          riasecCounts[char] += 1;
        } else if (q.part === 'skill') {
          const selfRating = (ans.selectedOptionIndex !== undefined ? ans.selectedOptionIndex + 1 : 3); // 1-5
          let quizAccuracy = 0.5; // default if no quiz answered
          let quizCorrectCount = 0;

          if (q.reality_quiz_json && Array.isArray(ans.realityQuizAnswers)) {
            const quiz = JSON.parse(q.reality_quiz_json);
            ans.realityQuizAnswers.forEach((userChoice, idx) => {
              if (quiz[idx] && quiz[idx].correctIndex === userChoice) {
                quizCorrectCount++;
              }
            });
            quizAccuracy = quizCorrectCount / quiz.length;
          }

          // Verified Skill Formula: 40% weight to self-rating + 60% weight to objective reality micro-quiz
          const rawVerified = (selfRating * 0.4) + ((quizAccuracy * 5) * 0.6);
          verifiedScore = Math.round(rawVerified * 10) / 10;
          verifiedSkills[q.dimension] = verifiedScore;

          const gap = Math.round((selfRating - verifiedScore) * 10) / 10;
          realityCheckDetails.push({
            skill: q.dimension,
            selfRating,
            quizScore: `${quizCorrectCount}/3`,
            verifiedScore,
            gap,
            isMismatch: gap >= 1.5
          });
        } else if (q.part === 'value') {
          const options = JSON.parse(q.options_json);
          const chosenText = options[ans.selectedOptionIndex] || 'Moderately important';
          workValues[q.dimension] = chosenText;
        }

        insertAnswer.run(
          generateId('ans'),
          assessmentId,
          q.id,
          JSON.stringify(ans),
          verifiedScore
        );
      }

      // Compute normalized RIASEC scores (0 - 100)
      const riasecScores = {};
      for (const key of ['R', 'I', 'A', 'S', 'E', 'C']) {
        const count = riasecCounts[key] || 1;
        const avg = riasecRaw[key] / count; // 1-5
        riasecScores[key] = Math.round(((avg - 1) / 4) * 100);
      }

      // Holland Code (top 3 traits, e.g., 'ICE' or 'RIA')
      const sortedTraits = Object.entries(riasecScores)
        .sort((a, b) => b[1] - a[1]);
      const hollandCode = sortedTraits.slice(0, 3).map(t => t[0]).join('');
      riasecScores.hollandCode = hollandCode;

      // Check if any major reality gap exists
      const majorMismatches = realityCheckDetails.filter(r => r.isMismatch);

      // Save assessment
      db.prepare(`
        INSERT INTO assessments (id, student_id, status, riasec_scores_json, verified_skills_json, work_values_json, reality_check_gap_json, completed_at)
        VALUES (?, ?, 'completed', ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(
        assessmentId,
        studentId,
        JSON.stringify(riasecScores),
        JSON.stringify(verifiedSkills),
        JSON.stringify(workValues),
        JSON.stringify({
          details: realityCheckDetails,
          hasMajorMismatch: majorMismatches.length > 0,
          mismatches: majorMismatches
        })
      );

      // Log activity event
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, metadata_json)
        VALUES (?, ?, 'ASSESSMENT_COMPLETED', ?)
      `).run(
        generateId('act'),
        studentId,
        JSON.stringify({ assessmentId, hollandCode, hasMajorMismatch: majorMismatches.length > 0 })
      );
    })();

    const saved = db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId);

    res.status(201).json({
      success: true,
      message: 'Assessment completed and verified successfully',
      data: {
        assessmentId,
        riasecScores: JSON.parse(saved.riasec_scores_json),
        verifiedSkills: JSON.parse(saved.verified_skills_json),
        workValues: JSON.parse(saved.work_values_json),
        realityCheckGap: JSON.parse(saved.reality_check_gap_json)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getLatestAssessment = (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.id;
    const assessment = db.prepare(`
      SELECT * FROM assessments
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(studentId);

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'No assessment found for this student' });
    }

    res.json({
      success: true,
      data: {
        id: assessment.id,
        status: assessment.status,
        completedAt: assessment.completed_at,
        riasecScores: JSON.parse(assessment.riasec_scores_json),
        verifiedSkills: JSON.parse(assessment.verified_skills_json),
        workValues: JSON.parse(assessment.work_values_json),
        realityCheckGap: JSON.parse(assessment.reality_check_gap_json)
      }
    });
  } catch (err) {
    next(err);
  }
};
