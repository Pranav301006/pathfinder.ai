require('dotenv').config();
const path = require('path');

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'pathfinder_super_secure_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '2h',
  REFRESH_SECRET: process.env.REFRESH_SECRET || 'pathfinder_super_refresh_secret_key_2026',
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../data/pathfinder.db')
};
