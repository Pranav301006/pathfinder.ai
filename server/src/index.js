const app = require('./server');
const config = require('./config');

app.listen(config.PORT, () => {
  console.log(`
🚀 ============================================================
   PathFinder AI - Backend RESTful API & AI Gateway Active!
   ------------------------------------------------------------
   🌐 Port:       http://localhost:${config.PORT}
   🩺 Health:     http://localhost:${config.PORT}/api/v1/health
   🔒 Mode:       Secure Role-Based (Student, Counselor, Admin)
   🤖 AI Gateway: ${config.GEMINI_API_KEY ? 'Google Gemini 1.5 Flash' : 'Hybrid Deterministic Engine (Offline/Fallback Mode)'}
============================================================
  `);
});
