const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { v4: uuidv4 } = require('crypto');
const db = require('../../db');
const config = require('../../config');

function generateId(prefix = 'usr') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'counselor', 'admin']).default('student'),
  fullName: z.string().min(2, 'Full name is required'),
  educationLevel: z.string().optional().default('Class 12'),
  stream: z.string().optional().default('Science'),
  institution: z.string().optional().default('School/College'),
  specialization: z.string().optional().default('General Career Guidance'),
  targetLanguage: z.enum(['en', 'hi']).optional().default('en'),
  consentAi: z.boolean().optional().default(true)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

function signTokens(user) {
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, config.REFRESH_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
}

function getUserProfile(user) {
  let profile = null;
  if (user.role === 'student') {
    profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id);
  } else if (user.role === 'counselor') {
    profile = db.prepare('SELECT * FROM counselor_profiles WHERE user_id = ?').get(user.id);
  }
  return profile;
}

exports.register = (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);
    const userId = generateId('usr');

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);

    db.transaction(() => {
      insertUser.run(userId, data.email.toLowerCase(), passwordHash, data.role);

      if (data.role === 'student') {
        db.prepare(`
          INSERT INTO student_profiles (user_id, full_name, education_level, stream, target_language, consent_ai)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, data.fullName, data.educationLevel, data.stream, data.targetLanguage, data.consentAi ? 1 : 0);
      } else if (data.role === 'counselor') {
        db.prepare(`
          INSERT INTO counselor_profiles (user_id, full_name, institution, specialization)
          VALUES (?, ?, ?, ?)
        `).run(userId, data.fullName, data.institution, data.specialization);
      }

      // Log event
      db.prepare(`
        INSERT INTO activity_events (id, user_id, event_type, metadata_json)
        VALUES (?, ?, 'USER_REGISTERED', ?)
      `).run(generateId('act'), userId, JSON.stringify({ role: data.role }));
    })();

    const user = { id: userId, email: data.email.toLowerCase(), role: data.role };
    const tokens = signTokens(user);
    const profile = getUserProfile(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        profile,
        tokens
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    next(err);
  }
};

exports.login = (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email.toLowerCase());
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const passwordMatch = bcrypt.compareSync(data.password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Update last_login
    db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

    const tokens = signTokens(user);
    const profile = getUserProfile(user);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        profile,
        tokens
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    next(err);
  }
};

exports.refresh = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, config.REFRESH_SECRET);
    const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ?').get(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Invalid refresh session' });
    }

    const tokens = signTokens(user);
    res.json({ success: true, data: { tokens } });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Expired or invalid refresh token' });
  }
};

exports.me = (req, res, next) => {
  try {
    const profile = getUserProfile(req.user);
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

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
