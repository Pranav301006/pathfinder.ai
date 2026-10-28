const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = db.prepare('SELECT id, email, role, is_active FROM users WHERE id = ?').get(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, error: 'Unauthorized: User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
