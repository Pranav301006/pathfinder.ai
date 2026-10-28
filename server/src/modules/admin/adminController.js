const db = require('../../db');

exports.getAILogs = (req, res, next) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.email as user_email
      FROM ai_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all();

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_calls,
        SUM(is_fallback) as total_fallbacks,
        AVG(latency_ms) as avg_latency_ms,
        SUM(tokens_count) as total_tokens
      FROM ai_logs
    `).get();

    res.json({
      success: true,
      data: {
        stats: {
          totalCalls: stats.total_calls || 0,
          totalFallbacks: stats.total_fallbacks || 0,
          avgLatencyMs: Math.round(stats.avg_latency_ms || 0),
          totalTokens: stats.total_tokens || 0,
          fallbackRate: stats.total_calls > 0 ? Math.round((stats.total_fallbacks / stats.total_calls) * 100) : 0
        },
        logs
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = (req, res, next) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.role, u.is_active, u.created_at, u.last_login,
             sp.full_name as student_name, cp.full_name as counselor_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN counselor_profiles cp ON u.id = cp.user_id
      ORDER BY u.created_at DESC
    `).all();

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    next(err);
  }
};
