const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config');

const dataDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(config.DB_PATH);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('student', 'counselor', 'admin')) NOT NULL DEFAULT 'student',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      education_level TEXT DEFAULT 'Class 12',
      stream TEXT DEFAULT 'Science',
      grade TEXT DEFAULT 'A',
      target_language TEXT DEFAULT 'en',
      career_interests TEXT,
      consent_ai INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS counselor_profiles (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      institution TEXT DEFAULT 'PathFinder Career Advisory Cell',
      specialization TEXT DEFAULT 'STEM & Humanities',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS counselor_assignments (
      id TEXT PRIMARY KEY,
      counselor_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(counselor_id) REFERENCES users(id),
      FOREIGN KEY(student_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      part TEXT CHECK(part IN ('interest', 'skill', 'value')) NOT NULL,
      dimension TEXT NOT NULL,
      text_en TEXT NOT NULL,
      text_hi TEXT,
      options_json TEXT NOT NULL,
      reality_quiz_json TEXT,
      version INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('started', 'completed')) DEFAULT 'started',
      riasec_scores_json TEXT,
      verified_skills_json TEXT,
      work_values_json TEXT,
      reality_check_gap_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_answers (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      answer_json TEXT NOT NULL,
      verified_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS careers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      riasec_vector_json TEXT NOT NULL,
      required_skills_json TEXT NOT NULL,
      education_paths_json TEXT NOT NULL,
      growth_outlook TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      description TEXT NOT NULL,
      indian_pathway_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      top_careers_json TEXT NOT NULL,
      prompt_version TEXT DEFAULT 'v1.0.0',
      status TEXT CHECK(status IN ('pending_review', 'approved', 'edited')) DEFAULT 'pending_review',
      counselor_badge INTEGER DEFAULT 0,
      counselor_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
      FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS counselor_reviews (
      id TEXT PRIMARY KEY,
      recommendation_id TEXT NOT NULL,
      counselor_id TEXT NOT NULL,
      action TEXT CHECK(action IN ('approved', 'edited', 'commented')) NOT NULL,
      comment TEXT,
      edited_payload_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
      FOREIGN KEY(counselor_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      recommendation_id TEXT,
      student_id TEXT NOT NULL,
      career_id TEXT NOT NULL,
      career_title TEXT NOT NULL,
      weeks_json TEXT NOT NULL,
      progress_percent INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roadmap_milestones (
      id TEXT PRIMARY KEY,
      roadmap_id TEXT NOT NULL,
      week_number INTEGER NOT NULL,
      milestone_title TEXT NOT NULL,
      description TEXT,
      resources_json TEXT,
      is_completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY(roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      endpoint TEXT NOT NULL,
      model TEXT NOT NULL,
      prompt_sanitized TEXT,
      tokens_count INTEGER DEFAULT 0,
      latency_ms INTEGER DEFAULT 0,
      status TEXT DEFAULT 'success',
      is_fallback INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      metadata_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

initSchema();

module.exports = db;
