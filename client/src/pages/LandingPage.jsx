import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Target,
  BarChart2,
  Cpu,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Users,
  Monitor,
  Check,
  Zap,
  Globe2,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const { demoLogin, isAuthenticated, user } = useAuth();
  const { language } = useThemeLanguage();
  const navigate = useNavigate();

  const handleDemo = async (role) => {
    try {
      await demoLogin(role);
      if (role === 'counselor') navigate('/counselor');
      else if (role === 'admin') navigate('/admin/logs');
      else if (role === 'rahul') navigate('/recommendations');
      else navigate('/assessment');
    } catch (err) {
      console.error('Demo login error', err);
    }
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <section style={{ padding: '3rem 0 5rem', textAlign: 'center', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* Pill Badge */}
          <div
            className="badge badge-primary pulse-glow"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={16} />
            <span>Problem Statement PS-2 Full-Stack Solution</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: '1.15',
              fontWeight: 800,
              marginBottom: '1.5rem'
            }}
          >
            Data-Driven Career Guidance Powered by{' '}
            <span className="text-gradient">Grounded Hybrid AI</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: 'var(--text-muted)',
              marginBottom: '2.5rem',
              lineHeight: '1.6',
              maxWidth: '780px',
              margin: '0 auto 2.5rem'
            }}
          >
            {language === 'hi'
              ? 'पाथफाइंडर एआई छात्रों को हॉलैंड आरआईएएसईसी मूल्यांकन, वास्तविक कौशल परीक्षण और 10-सप्ताह के रोडमैप के माध्यम से प्रमाणित करियर दिशा प्रदान करता है।'
              : 'PathFinder AI eliminates career guesswork through structured Holland RIASEC assessment, objective Skill Reality Check micro-quizzes, explainable recommendations, and human counselor oversight.'}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            {isAuthenticated ? (
              <Link to={user.role === 'counselor' ? '/counselor' : '/assessment'} className="btn btn-primary btn-lg">
                <span>Continue to {user.role === 'counselor' ? 'Counselor Hub' : 'Assessment'}</span>
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <span>Start Assessment</span>
                  <ArrowRight size={20} />
                </Link>
                <Link to="/login/student" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={20} color="var(--primary-light)" />
                  <span>Student Login</span>
                </Link>
                <Link to="/login/staff" className="btn btn-secondary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} color="var(--accent-teal)" />
                  <span>Counselor / Admin</span>
                </Link>
                <Link to="/kiosk" className="btn btn-outline btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Monitor size={20} color="#fbbf24" />
                  <span>Kiosk Mode</span>
                </Link>
              </>
            )}
          </div>

          {/* One-Click Demo Access Cards */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              textAlign: 'left',
              border: '1px solid var(--border-glass-strong)',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} color="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>1-Click Evaluator Demo Logins:</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Instant role-based testing with zero setup
              </span>
            </div>

            <div className="grid-4" style={{ gap: '1rem' }}>
              <button
                onClick={() => handleDemo('student')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.85rem' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>Student (Fresh)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ananya Sharma • Class 12</div>
                </div>
              </button>

              <button
                onClick={() => handleDemo('rahul')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.85rem', borderColor: 'rgba(79, 70, 229, 0.4)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-light)' }}>Student (With Report)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rahul Verma • Ready in Queue</div>
                </div>
              </button>

              <button
                onClick={() => handleDemo('counselor')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.85rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-teal)' }}>Counselor Hub</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dr. Vikram Seth • Review Queue</div>
                </div>
              </button>

              <button
                onClick={() => handleDemo('admin')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '0.85rem' }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24' }}>System Admin</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Logs & Transparency</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Features Grid */}
      <section style={{ padding: '4rem 0', background: 'rgba(15, 23, 42, 0.4)', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Section 02 Innovation</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>What Sets PathFinder AI Apart</h2>
            <p style={{ maxWidth: '650px', margin: '0.5rem auto 0' }}>
              Unlike generic single-prompt chatbot wrappers, PathFinder AI combines mathematical rigor with human expertise.
            </p>
          </div>

          <div className="grid-3">
            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--primary-light)' }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Grounded Hybrid AI Engine</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Deterministic cosine vector scoring computes a shortlist from curated career pathways. The LLM enriches only that shortlist, dropping hallucinations sharply.
              </p>
            </div>

            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--accent-teal)' }}>
                <Target size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Skill Reality Check Micro-Quizzes</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Each self-rated skill is validated with a 3-question objective micro-quiz. Severe self-rating mismatches are flagged to the counselor as coaching opportunities.
              </p>
            </div>

            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#34d399' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Human-in-the-Loop Review</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Certified counselors review AI outputs. Approved recommendations carry an authentic "Counselor Verified" badge so students trust human-vetted guidance.
              </p>
            </div>

            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#fbbf24' }}>
                <BarChart2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>4. Visual Radar & 10-Week Roadmap</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Radar chart illustrates current verified skill vs career target level. Interactive 10-week milestones let students tick off progress and celebrate achievements.
              </p>
            </div>

            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#c084fc' }}>
                <BookOpen size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>5. Context-Aware AI Career Coach</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                An interactive assistant grounded in the student's personal RIASEC scores, answering follow-up questions about entrance tests, subjects, and study techniques.
              </p>
            </div>

            <div className="glass-card glass-card-hover">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', color: '#fb7185' }}>
                <Globe2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>6. India-Aware & Kiosk Deployment</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Native pathways for Class 10/12 stream choice, JEE, NEET, CUET, CLAT, NPTEL/SWAYAM, English & Hindi toggle, and touch-screen Kiosk deployment with phone QR hand-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Complete User Journey Flow */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>End-to-End Workflow</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>The Complete Student & Counselor Journey</h2>
          </div>

          <div className="grid-4" style={{ gap: '1.5rem' }}>
            <div className="glass-card" style={{ borderTop: '4px solid var(--primary)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>STEP 01</span>
              <h4 style={{ margin: '0.5rem 0' }}>Register & Profile</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Student registers, sets Class 10/12 stream (Science/Commerce/Arts), goals, and AI privacy consent.
              </p>
            </div>

            <div className="glass-card" style={{ borderTop: '4px solid var(--accent-teal)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-teal)' }}>STEP 02</span>
              <h4 style={{ margin: '0.5rem 0' }}>3-Part Assessment</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Holland RIASEC interest scoring, self-rated skills + objective reality micro-quizzes, and work preferences.
              </p>
            </div>

            <div className="glass-card" style={{ borderTop: '4px solid #fbbf24' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>STEP 03</span>
              <h4 style={{ margin: '0.5rem 0' }}>AI Report & Radar</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Top 5 matched careers, "Why this career?" explainability, skill-gap radar chart, and 10-week learning roadmap.
              </p>
            </div>

            <div className="glass-card" style={{ borderTop: '4px solid #10b981' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>STEP 04</span>
              <h4 style={{ margin: '0.5rem 0' }}>Counselor Verification</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Counselor reviews via Copilot brief, attaches verified badge, and tracks student milestone progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
