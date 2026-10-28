import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  QrCode,
  Sparkles,
  ArrowRight,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Compass
} from 'lucide-react';

export default function KioskModePage() {
  const [step, setStep] = useState('welcome'); // 'welcome' | 'stream' | 'quick_assessment' | 'results'
  const [stream, setStream] = useState('Science (PCM)');
  const [scores, setScores] = useState({ R: 80, I: 90, A: 60, S: 45, E: 70, C: 65 });
  const [idleSeconds, setIdleSeconds] = useState(90);
  const [showWarning, setShowWarning] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Kiosk Idle auto-reset timer
  const resetIdleTimer = () => {
    setIdleSeconds(90);
    setShowWarning(false);
  };

  useEffect(() => {
    const handleUserActivity = () => resetIdleTimer();
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);

    timerRef.current = setInterval(() => {
      setIdleSeconds(prev => {
        if (prev <= 1) {
          // Reset to welcome attract screen and wipe memory
          setStep('welcome');
          setShowWarning(false);
          return 90;
        }
        if (prev <= 15) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
      clearInterval(timerRef.current);
    };
  }, []);

  const handleFinishQuickAssessment = () => {
    setStep('results');
  };

  return (
    <div className="kiosk-mode" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#f8fafc', position: 'relative' }}>
      {/* Top Kiosk Bar */}
      <div className="kiosk-timer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Monitor size={18} />
          <span>PathFinder AI Kiosk Deployment</span>
          <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>(Public School / Expo Terminal)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Clock size={16} />
            <span>Idle Reset in: <strong>{idleSeconds}s</strong></span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
          >
            <LogOut size={13} /> Exit Kiosk
          </button>
        </div>
      </div>

      {/* Warning Banner if Idle */}
      {showWarning && (
        <div style={{ position: 'fixed', top: '50px', left: 0, right: 0, background: '#f43f5e', color: '#fff', textAlign: 'center', padding: '0.75rem', zIndex: 1000, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} />
          <span>Session expiring due to inactivity in {idleSeconds}s! Tap anywhere on screen to keep testing.</span>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
        {step === 'welcome' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '750px', padding: '3.5rem 2.5rem', textAlign: 'center', border: '1px solid rgba(79, 70, 229, 0.4)' }}>
            <div className="brand-icon" style={{ width: '4rem', height: '4rem', margin: '0 auto 1.5rem', borderRadius: '16px' }}>
              <Compass size={36} />
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '1rem' }}>
              PathFinder <span className="text-gradient">AI Kiosk</span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
              Discover your ideal career path, entrance exams, and 10-week roadmap in under 2 minutes. Tap below to begin!
            </p>

            <button
              onClick={() => setStep('stream')}
              className="btn btn-primary pulse-glow"
              style={{ minHeight: '64px', fontSize: '1.3rem', padding: '1rem 3rem', borderRadius: 'var(--radius-lg)' }}
            >
              <span>Touch Screen to Start</span>
              <ArrowRight size={24} />
            </button>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span>🔒 Zero personal data saved locally</span>
              <span>⚡ Offline question bank</span>
              <span>📱 QR Hand-off to Phone</span>
            </div>
          </div>
        )}

        {step === 'stream' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', width: '100%', padding: '3rem 2rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              Step 1 of 2: Indian Stream Selection
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Select Your Current or Target Stream
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              We tailor entrance exams (JEE, NEET, CUET, CLAT) to your stream.
            </p>

            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { title: 'Science (PCM with CS/Math)', desc: 'Engineering, AI, Architecture, Defense' },
                { title: 'Science (PCB / Healthcare)', desc: 'Medicine, Biotechnology, Nursing, Pharma' },
                { title: 'Commerce with Mathematics', desc: 'Investment Banking, CA, Fintech, Analytics' },
                { title: 'Arts, Humanities & Law', desc: 'Corporate Law, Psychology, Public Policy, Design' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setStream(item.title)}
                  style={{
                    padding: '1.5rem',
                    textAlign: 'left',
                    borderRadius: '14px',
                    border: stream === item.title ? '2px solid #4f46e5' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: stream === item.title ? 'rgba(79, 70, 229, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: '#fff',
                    cursor: 'pointer',
                    minHeight: '85px'
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.3rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep('welcome')} className="btn btn-secondary">
                Back
              </button>
              <button onClick={() => setStep('quick_assessment')} className="btn btn-primary" style={{ padding: '0.9rem 2rem' }}>
                <span>Continue to Quick Assessment</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'quick_assessment' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '850px', width: '100%', padding: '2.5rem 2rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              Step 2 of 2: Rapid RIASEC Holland & Skill Profiler
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Touch What Resonates With You Most
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '2rem 0' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  1. How much do you enjoy coding algorithms or solving abstract mathematical puzzles?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {['Rarely', 'Sometimes', 'Frequently', 'My Passion!'].map((lvl, idx) => (
                    <button key={idx} className="btn btn-secondary" style={{ padding: '0.85rem 0.5rem', fontSize: '0.95rem' }}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  2. Do you prefer leading teams & public speaking, or deep solitary research?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {['Team Leadership', 'Balanced', 'Deep Research'].map((lvl, idx) => (
                    <button key={idx} className="btn btn-secondary" style={{ padding: '0.85rem 0.5rem', fontSize: '0.95rem' }}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishQuickAssessment}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', minHeight: '60px', fontSize: '1.2rem' }}
            >
              <span>Compute Career Matches & QR Code</span>
              <Sparkles size={22} />
            </button>
          </div>
        )}

        {step === 'results' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '850px', width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}>
            <div className="badge badge-verified" style={{ marginBottom: '1rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> Matches Computed Successfully
            </div>

            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Top Match: <span className="text-gradient">AI & Data Systems Engineer</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              High alignment with your Investigative-Realistic profile. Estimated market compensation in India: ₹12 - ₹35 LPA.
            </p>

            {/* Mobile QR Hand-off Section */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(79, 70, 229, 0.4)', borderRadius: '16px', padding: '2rem', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
              <div style={{ width: '180px', height: '180px', background: '#ffffff', borderRadius: '12px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <path fill="#0f172a" d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M20,20 h10 v10 h-10 z" />
                  <path fill="#0f172a" d="M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M70,20 h10 v10 h-10 z" />
                  <path fill="#0f172a" d="M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M20,70 h10 v10 h-10 z" />
                  <path fill="#0f172a" d="M50,15 h5 v10 h-5 z M50,30 h5 v5 h-5 z M50,45 h10 v5 h-10 z M65,50 h15 v5 h-15 z M85,55 h5 v10 h-5 z M60,65 h10 v10 h-10 z M75,75 h15 v15 h-15 z M50,75 h5 v10 h-5 z M50,90 h15 v5 h-15 z" />
                </svg>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                <QrCode size={18} />
                <span>Scan to Take Report & 10-Week Roadmap to Phone</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                URL: https://pathfinder.ai/report/demo-kiosk
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => setStep('welcome')}
                className="btn btn-secondary"
                style={{ minHeight: '52px', padding: '0 2rem' }}
              >
                <RotateCcw size={18} />
                <span>Done / Reset Terminal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
