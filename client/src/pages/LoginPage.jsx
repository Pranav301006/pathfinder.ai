import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogIn, Lock, Mail, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.data.user.role === 'counselor') navigate('/counselor');
      else if (res.data.user.role === 'admin') navigate('/admin/logs');
      else navigate(from === '/login' ? '/assessment' : from);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async (role) => {
    setError('');
    setSubmitting(true);
    try {
      const res = await demoLogin(role);
      if (role === 'counselor') navigate('/counselor');
      else if (role === 'admin') navigate('/admin/logs');
      else if (role === 'rahul') navigate('/recommendations');
      else navigate('/assessment');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="brand-icon" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}>
              <Compass size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Welcome Back</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Access your personalized AI career dashboard
            </p>
          </div>

          {/* Quick Demo Launchpad */}
          <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.25)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '0.65rem' }}>
              <Zap size={15} color="#fbbf24" />
              <span>One-Click Evaluator Demo Access</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'center' }}
              >
                Student (Fresh)
              </button>
              <button
                type="button"
                onClick={() => handleDemo('rahul')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: 'var(--primary-light)' }}
              >
                Student (Ready)
              </button>
              <button
                type="button"
                onClick={() => handleDemo('counselor')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: 'var(--accent-teal)' }}
              >
                Counselor
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', justifyContent: 'center', color: '#fbbf24' }}
              >
                Admin
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
              <label className="form-label">Email Address</label>
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
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
