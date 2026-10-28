const db = require('../../db');

function generateId(prefix = 'rdm') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function generate10WeekPlan(career) {
  const title = career.title;
  return [
    {
      weekNumber: 1,
      title: 'Foundational Landscape & Toolchain Setup',
      description: `Install required compilers, IDEs, or modeling environments for ${title}. Map core industry vocabulary.`,
      resources: ['Official Documentation & Quickstarts', 'FreeCodeCamp / NPTEL Overview Lecture', 'Industry Glossary Guide'],
      estimatedHours: 6
    },
    {
      weekNumber: 2,
      title: 'Core Fundamentals & Mathematical/Logical Basis',
      description: 'Strengthen prerequisite theory (calculus, discrete logic, or financial statement structures).',
      resources: ['3Blue1Brown Mathematical Series', 'Khan Academy / MIT OCW', 'Target Textbook Chapters 1-3'],
      estimatedHours: 8
    },
    {
      weekNumber: 3,
      title: 'First Hands-On Prototype or Case Study',
      description: 'Build your first standalone small project (e.g., CLI utility, clean dashboard, or structured brief).',
      resources: ['GitHub Starter Repository', 'Kaggle / Figma community template', 'Step-by-step tutorial lab'],
      estimatedHours: 10
    },
    {
      weekNumber: 4,
      title: 'Data Ingestion & Intermediate Systems',
      description: 'Learn to manipulate structured inputs, clean noisy real-world data, and manage edge-case workflows.',
      resources: ['Pandas / SQL cheat sheet or Financial Modeling templates', 'SWAYAM Course Module 2'],
      estimatedHours: 8
    },
    {
      weekNumber: 5,
      title: 'Mid-Point Skill Reality Check & Peer Review',
      description: 'Assess comprehension against standard interview questions or case analysis problems.',
      resources: ['LeetCode Easy / Case Study Prompt Archive', 'Discussion with Mentor or Peer'],
      estimatedHours: 6
    },
    {
      weekNumber: 6,
      title: 'Advanced Methodologies & Optimization',
      description: 'Deep dive into performance tuning, security considerations, or valuation nuances.',
      resources: ['Advanced NPTEL Course Video by IIT faculty', 'System Design or High-Level Architecture docs'],
      estimatedHours: 10
    },
    {
      weekNumber: 7,
      title: 'Capstone Project: Architecture & Inception',
      description: 'Define the scope for your comprehensive capstone project that addresses a real-world problem.',
      resources: ['Project Specification Sheet', 'Open Data Portal (data.gov.in / Kaggle)'],
      estimatedHours: 12
    },
    {
      weekNumber: 8,
      title: 'Capstone Project: Core Implementation',
      description: 'Implement full-stack pipeline, analysis suite, or client-ready presentation deck.',
      resources: ['Git commit tracking', 'Linting & testing best practice docs'],
      estimatedHours: 14
    },
    {
      weekNumber: 9,
      title: 'Packaging, Documentation & Public Proof of Work',
      description: 'Write an executive README, record a 2-minute video walkthrough, and publish live.',
      resources: ['Vercel / GitHub Pages deployment guide', 'Loom screen recorder'],
      estimatedHours: 6
    },
    {
      weekNumber: 10,
      title: 'Indian Entrance Exam / Internship Readiness Dossier',
      description: `Target exams (${career.indian_pathway_json ? JSON.parse(career.indian_pathway_json).entranceExams?.join(', ') : 'National Tests'}) and polish resume.`,
      resources: ['Previous Year Question Papers (PYQ)', 'Resume & LinkedIn Optimization Checklist'],
      estimatedHours: 8
    }
  ];
}

exports.generateRoadmap = (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { careerId } = req.body;

    const career = db.prepare('SELECT * FROM careers WHERE id = ?').get(careerId);
    if (!career) {
      return res.status(404).json({ success: false, error: 'Career not found' });
    }

    const weeks = generate10WeekPlan(career);
    const roadmapId = generateId('rdm');

    db.transaction(() => {
      // Remove any existing roadmap for this student & career
      db.prepare('DELETE FROM roadmaps WHERE student_id = ? AND career_id = ?').run(studentId, careerId);

      db.prepare(`
        INSERT INTO roadmaps (id, student_id, career_id, career_title, weeks_json, progress_percent)
        VALUES (?, ?, ?, ?, ?, 0)
      `).run(roadmapId, studentId, careerId, career.title, JSON.stringify(weeks));

      const insertMilestone = db.prepare(`
        INSERT INTO roadmap_milestones (id, roadmap_id, week_number, milestone_title, description, resources_json, is_completed)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `);

      for (const w of weeks) {
        insertMilestone.run(
          generateId('mls'),
          roadmapId,
          w.weekNumber,
          w.title,
          w.description,
          JSON.stringify(w.resources)
        );
      }

      // Log activity
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, metadata_json)
        VALUES (?, ?, 'ROADMAP_STARTED', ?)
      `).run(generateId('act'), studentId, JSON.stringify({ roadmapId, careerTitle: career.title }));
    })();

    const milestones = db.prepare('SELECT * FROM roadmap_milestones WHERE roadmap_id = ? ORDER BY week_number').all(roadmapId);

    res.status(201).json({
      success: true,
      message: '10-week roadmap initialized',
      data: {
        id: roadmapId,
        careerId,
        careerTitle: career.title,
        progressPercent: 0,
        milestones: milestones.map(m => ({
          ...m,
          isCompleted: Boolean(m.is_completed),
          resources: JSON.parse(m.resources_json)
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoadmap = (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.id;
    const careerId = req.query.careerId;

    let query = 'SELECT * FROM roadmaps WHERE student_id = ?';
    let params = [studentId];

    if (careerId) {
      query += ' AND career_id = ?';
      params.push(careerId);
    }
    query += ' ORDER BY created_at DESC LIMIT 1';

    const roadmap = db.prepare(query).get(...params);
    if (!roadmap) {
      return res.status(404).json({ success: false, error: 'No active roadmap found' });
    }

    const milestones = db.prepare('SELECT * FROM roadmap_milestones WHERE roadmap_id = ? ORDER BY week_number').all(roadmap.id);

    res.json({
      success: true,
      data: {
        id: roadmap.id,
        careerId: roadmap.career_id,
        careerTitle: roadmap.career_title,
        progressPercent: roadmap.progress_percent,
        milestones: milestones.map(m => ({
          id: m.id,
          weekNumber: m.week_number,
          milestoneTitle: m.milestone_title,
          description: m.description,
          resources: JSON.parse(m.resources_json),
          isCompleted: Boolean(m.is_completed),
          completedAt: m.completed_at
        }))
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleMilestone = (req, res, next) => {
  try {
    const milestoneId = req.params.id;

    const milestone = db.prepare('SELECT * FROM roadmap_milestones WHERE id = ?').get(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, error: 'Milestone not found' });
    }

    const newCompleted = milestone.is_completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE roadmap_milestones
      SET is_completed = ?, completed_at = ?
      WHERE id = ?
    `).run(newCompleted, completedAt, milestoneId);

    // Calculate new total percentage
    const allMilestones = db.prepare('SELECT is_completed FROM roadmap_milestones WHERE roadmap_id = ?').all(milestone.roadmap_id);
    const completedCount = allMilestones.filter(m => m.is_completed === 1).length;
    const newPercent = Math.round((completedCount / allMilestones.length) * 100);

    db.prepare('UPDATE roadmaps SET progress_percent = ? WHERE id = ?').run(newPercent, milestone.roadmap_id);

    res.json({
      success: true,
      data: {
        milestoneId,
        isCompleted: Boolean(newCompleted),
        progressPercent: newPercent
      }
    });
  } catch (err) {
    next(err);
  }
};
