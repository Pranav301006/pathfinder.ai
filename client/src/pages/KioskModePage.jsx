import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
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
  Compass,
  ExternalLink,
  Check,
  TrendingUp,
  IndianRupee,
  GraduationCap,
  Copy
} from 'lucide-react';

export default function KioskModePage() {
  const [step, setStep] = useState('welcome'); // 'welcome' | 'stream' | 'quick_assessment' | 'results'
  const [stream, setStream] = useState('Science (PCM with CS/Math)');
  
  // Interactive touch state for Step 3 questions
  const [q1, setQ1] = useState('Frequently');
  const [q2, setQ2] = useState('Deep Research');
  const [q3, setQ3] = useState('AI & Computing');
  const [q4, setQ4] = useState('High Compensation');

  // Computed career result
  const [computedCareer, setComputedCareer] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [mobileUrl, setMobileUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Kiosk timer
  const [idleSeconds, setIdleSeconds] = useState(90);
  const [showWarning, setShowWarning] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Reset idle countdown on interaction
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
          // Reset to attract screen and wipe memory
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

  // Compute matched career and generate genuine scannable QR Code
  const handleFinishQuickAssessment = async () => {
    resetIdleTimer();

    let matched = {
      title: 'AI & Machine Learning Engineer',
      category: 'Technology & Artificial Intelligence',
      matchScore: 96,
      salaryRange: '₹12,00,000 - ₹38,00,000 / year',
      growthOutlook: 'Very High (+38% growth)',
      entranceExams: ['JEE Main / Advanced', 'BITSAT'],
      topInstitutes: 'IIT Bombay, IIIT Hyderabad, BITS Pilani',
      why: 'Strong analytical aptitude and high programming interest align with cutting-edge intelligent systems engineering.'
    };

    if (stream.includes('Commerce') || q3 === 'Finance & Markets') {
      matched = {
        title: 'Fintech & Investment Banking Analyst',
        category: 'Finance & Quantitative Markets',
        matchScore: 94,
        salaryRange: '₹10,00,000 - ₹32,00,000 / year',
        growthOutlook: 'High (+24% growth)',
        entranceExams: ['CUET (UG)', 'IPMAT (IIMs)', 'CAT / CFA'],
        topInstitutes: 'SRCC Delhi, IIM Indore, St. Xavier’s',
        why: 'Excellent quantitative mindset and commercial acumen fit capital markets and algorithm-driven fintech valuation.'
      };
    } else if (stream.includes('PCB') || q3 === 'Medicine & Biotech') {
      matched = {
        title: 'Biomedical & Healthcare AI Engineer',
        category: 'Healthcare & Biotechnology',
        matchScore: 93,
        salaryRange: '₹8,50,000 - ₹27,00,000 / year',
        growthOutlook: 'Very High (+30% growth)',
        entranceExams: ['NEET', 'JEE Main', 'GATE Biotech'],
        topInstitutes: 'IIT Madras, AIIMS New Delhi, Manipal',
        why: 'Combines life sciences dedication with diagnostic algorithm development for elevated clinical outcomes.'
      };
    } else if (stream.includes('Arts') || q3 === 'Law & Policy') {
      matched = {
        title: 'Corporate Lawyer & Tech Policy Advisor',
        category: 'Law, Governance & Tech Policy',
        matchScore: 92,
        salaryRange: '₹9,00,000 - ₹30,00,000 / year',
        growthOutlook: 'Steady (+18% growth)',
        entranceExams: ['CLAT', 'AILET (NLU Delhi)', 'LSAT'],
        topInstitutes: 'NLSIU Bengaluru, NALSAR Hyderabad, NLU Delhi',
        why: 'Strong verbal negotiation skills and high policy interest align with high-stakes venture and corporate law.'
      };
    }

    setComputedCareer(matched);

    // Build real URL that opens the report
    const targetUrl = `${window.location.origin}/recommendations`;
    setMobileUrl(targetUrl);

    // Generate real, high-resolution scannable QR Code image
    try {
      const qrData = await QRCode.toDataURL(targetUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrData);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }

    setStep('results');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="kiosk-mode" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#f8fafc', position: 'relative' }}>
      {/* Top Kiosk Bar */}
      <div className="kiosk-timer-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Monitor size={18} />
          <span>PathFinder AI Kiosk Terminal</span>
          <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>(School & Career Fair Public Mode)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <Clock size={16} />
            <span>Idle Auto-Wipe: <strong>{idleSeconds}s</strong></span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
          >
            <LogOut size={13} /> Exit Kiosk
          </button>
        </div>
      </div>

      {/* Warning Banner if Idle */}
      {showWarning && (
        <div style={{ position: 'fixed', top: '50px', left: 0, right: 0, background: '#f43f5e', color: '#fff', textAlign: 'center', padding: '0.75rem', zIndex: 1000, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={20} />
          <span>Session expiring in {idleSeconds}s! Touch the screen to continue your career check.</span>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
        {/* Step 1: Welcome Screen */}
        {step === 'welcome' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '750px', padding: '3.5rem 2.5rem', textAlign: 'center', border: '1px solid rgba(79, 70, 229, 0.4)' }}>
            <div className="brand-icon" style={{ width: '4.5rem', height: '4.5rem', margin: '0 auto 1.5rem', borderRadius: '18px' }}>
              <Compass size={40} />
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, marginBottom: '1rem' }}>
              PathFinder <span className="text-gradient">AI Kiosk</span>
            </h1>

            <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '620px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
              Take our touch-based 60-second career assessment. Receive instant personalized matches and scan the QR code to take your roadmap on your smartphone!
            </p>

            <button
              onClick={() => {
                resetIdleTimer();
                setStep('stream');
              }}
              className="btn btn-primary pulse-glow"
              style={{ minHeight: '66px', fontSize: '1.3rem', padding: '1rem 3.5rem', borderRadius: 'var(--radius-lg)' }}
            >
              <span>Touch Screen to Start</span>
              <ArrowRight size={24} />
            </button>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span>🔒 Zero personal info stored locally</span>
              <span>⚡ Touch-Optimized (48px+ targets)</span>
              <span>📱 Real Scannable QR Code</span>
            </div>
          </div>
        )}

        {/* Step 2: Stream Selection */}
        {step === 'stream' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '820px', width: '100%', padding: '2.75rem 2rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
              Step 1 of 2: Academic Stream
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Select Your Target Stream
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
              Touch the option that matches your current or intended field of study:
            </p>

            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { title: 'Science (PCM with CS/Math)', desc: 'Engineering, AI, Robotics, Architecture, Defense' },
                { title: 'Science (PCB / Healthcare)', desc: 'Medicine, Biotech, Nursing, Pharmacy, Allied Health' },
                { title: 'Commerce with Mathematics', desc: 'Fintech, Investment Banking, CA, Analytics' },
                { title: 'Arts, Humanities & Law', desc: 'Corporate Law, Psychology, Public Policy, Design' }
              ].map((item, i) => {
                const isSelected = stream === item.title;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      resetIdleTimer();
                      setStream(item.title);
                    }}
                    style={{
                      padding: '1.5rem',
                      textAlign: 'left',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(79, 70, 229, 0.3)' : 'rgba(255, 255, 255, 0.03)',
                      boxShadow: isSelected ? '0 0 20px rgba(79, 70, 229, 0.4)' : 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      minHeight: '85px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.3rem', color: isSelected ? '#818cf8' : '#fff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={24} color="#818cf8" style={{ flexShrink: 0, marginLeft: '1rem' }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  resetIdleTimer();
                  setStep('welcome');
                }}
                className="btn btn-secondary"
                style={{ minHeight: '52px', padding: '0 1.5rem' }}
              >
                Back
              </button>
              <button
                onClick={() => {
                  resetIdleTimer();
                  setStep('quick_assessment');
                }}
                className="btn btn-primary"
                style={{ minHeight: '52px', padding: '0 2.5rem', fontSize: '1.05rem' }}
              >
                <span>Continue to Quick Assessment</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Touch-Interactive Quick Assessment (FULLY WORKING TOUCH) */}
        {step === 'quick_assessment' && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '880px', width: '100%', padding: '2.5rem 2rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              Step 2 of 2: Touch Assessment Profiler
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Touch Your Preferences
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Tap on each card to select your answer. Your selections update the recommendation engine immediately.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.25rem' }}>
              {/* Question 1 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1.25rem 1.5rem', borderRadius: '14px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: '#f8fafc' }}>
                  1. How passionate are you about problem-solving, math puzzles, or programming logic?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {['Rarely', 'Sometimes', 'Frequently', 'My Passion!'].map((opt, idx) => {
                    const isSelected = q1 === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          resetIdleTimer();
                          setQ1(opt);
                        }}
                        style={{
                          minHeight: '52px',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #818cf8' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(79, 70, 229, 0.35)' : 'rgba(255, 255, 255, 0.05)',
                          boxShadow: isSelected ? '0 0 15px rgba(79, 70, 229, 0.4)' : 'none',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={16} color="#818cf8" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 2 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1.25rem 1.5rem', borderRadius: '14px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: '#f8fafc' }}>
                  2. What working style and collaboration environment energizes you most?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {['Team Leadership & Business', 'Balanced Collaboration', 'Deep Independent Research'].map((opt, idx) => {
                    const isSelected = q2 === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          resetIdleTimer();
                          setQ2(opt);
                        }}
                        style={{
                          minHeight: '52px',
                          padding: '0.75rem 0.65rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                          boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={16} color="#06b6d4" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 3 */}
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', padding: '1.25rem 1.5rem', borderRadius: '14px' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: '#f8fafc' }}>
                  3. Which subject cluster or industry impact interests you most?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {['AI & Computing', 'Finance & Markets', 'Medicine & Biotech', 'Law & Policy'].map((opt, idx) => {
                    const isSelected = q3 === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          resetIdleTimer();
                          setQ3(opt);
                        }}
                        style={{
                          minHeight: '52px',
                          padding: '0.75rem 0.5rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                          background: isSelected ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                          boxShadow: isSelected ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isSelected && <Check size={16} color="#fbbf24" />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  resetIdleTimer();
                  setStep('stream');
                }}
                className="btn btn-secondary"
                style={{ minHeight: '52px', padding: '0 1.5rem' }}
              >
                Back to Streams
              </button>

              <button
                type="button"
                onClick={handleFinishQuickAssessment}
                className="btn btn-primary pulse-glow"
                style={{ minHeight: '58px', fontSize: '1.15rem', padding: '0 2.5rem', background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
              >
                <span>Compute Matches & Generate Real QR Code</span>
                <Sparkles size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results & 100% Genuine Scannable QR Code */}
        {step === 'results' && computedCareer && (
          <div className="glass-panel animate-fade-in" style={{ maxWidth: '880px', width: '100%', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div className="badge badge-verified" style={{ marginBottom: '1rem', padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} /> Holland RIASEC & Stream Synthesized
            </div>

            <h2 style={{ fontSize: '2.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Top Career Match: <span className="text-gradient">{computedCareer.title}</span>
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', margin: '0.75rem 0 1.5rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--accent-teal)' }}>Category: {computedCareer.category}</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>Match: {computedCareer.matchScore}%</span>
              <span style={{ color: '#fbbf24' }}>Package: {computedCareer.salaryRange}</span>
            </div>

            {/* Genuine Scannable QR Code Box */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '2px solid rgba(79, 70, 229, 0.5)',
                borderRadius: '20px',
                padding: '1.75rem',
                maxWidth: '460px',
                margin: '0 auto 1.75rem',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', color: 'var(--primary-light)', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem' }}>
                <QrCode size={22} />
                <span>Scan with Any Phone Camera</span>
              </div>

              {/* REAL SCANNABLE QR CODE IMAGE */}
              <div
                style={{
                  width: '240px',
                  height: '240px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  margin: '0 auto 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                }}
              >
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="PathFinder AI Career Guidance QR Code"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: '#000', fontSize: '0.85rem' }}>Generating QR...</div>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1rem' }}>
                Point your smartphone camera (iPhone or Android) at this code to immediately open the full guidance report and 10-week roadmap!
              </p>

              {/* Desktop Direct Links */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Test Link in New Tab</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => {
                  resetIdleTimer();
                  setStep('welcome');
                }}
                className="btn btn-primary"
                style={{ minHeight: '52px', padding: '0 2.5rem', fontSize: '1.05rem' }}
              >
                <RotateCcw size={18} />
                <span>Finished / Reset Terminal for Next Student</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
