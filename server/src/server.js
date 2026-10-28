const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/user/userRoutes');
const assessmentRoutes = require('./modules/assessment/assessmentRoutes');
const recommendationRoutes = require('./modules/recommendation/recommendationRoutes');
const roadmapRoutes = require('./modules/roadmap/roadmapRoutes');
const coachRoutes = require('./modules/coach/coachRoutes');
const counselorRoutes = require('./modules/counselor/counselorRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general API rate limiter
app.use('/api/', apiLimiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    system: 'PathFinder AI REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/roadmaps', roadmapRoutes);
app.use('/api/v1/coach', coachRoutes);
app.use('/api/v1/counselor', counselorRoutes);
app.use('/api/v1/admin', adminRoutes);

// Fallback 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
