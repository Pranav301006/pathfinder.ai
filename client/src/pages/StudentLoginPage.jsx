import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  LogIn,
  Lock,
  Mail,
  Zap,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/assessment';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.data.user.role === 'student') {
        navigate(from === '/login' || from === '/login/student' ? '/assessment' : from);
      } else if (res.data.user.role === 'counselor') {
        navigate('/counselor');
      } else {
        navigate('/admin/logs');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (type) => {
    setError('');
    setSubmitting(true);
    try {
      await demoLogin(type);
      if (type === 'rahul') {
        navigate('/recommendations');
      } else {
        navigate('/assessment');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto 1rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)'
              }}
            >
              <GraduationCap size={30} />
            </div>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
              Student Portal Access
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student Sign In</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Access your skills assessment, career matches & 10-week roadmap
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.65rem' }}>
              <Zap size={15} color="#fbbf24" />
              <span>1-Click Student Demo Credentials:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', textAlign: 'left', padding: '0.6rem 0.75rem' }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Ananya Sharma</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fresh Assessment</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemo('rahul')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.8rem', textAlign: 'left', padding: '0.6rem 0.75rem', borderColor: 'rgba(79, 70, 229, 0.4)' }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>Rahul Verma</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Completed Report</div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Student Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@pathfinder.ai"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              <LogIn size={18} />
              <span>{submitting ? 'Signing in...' : 'Sign In as Student'}</span>
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-glass)', marginTop: '1.5rem', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              New Student? Register
            </Link>
            <Link to="/login/staff" style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>
              Counselor / Admin Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
