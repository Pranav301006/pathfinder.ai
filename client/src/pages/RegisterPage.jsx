import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, UserPlus, Shield, Check, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [educationLevel, setEducationLevel] = useState('Class 12');
  const [stream, setStream] = useState('Science (PCM)');
  const [institution, setInstitution] = useState('');
  const [specialization, setSpecialization] = useState('STEM Careers');
  const [consentAi, setConsentAi] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentAi) {
      setError('Please provide privacy consent for AI guidance processing.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const res = await register({
        fullName,
        email,
        password,
        role,
        educationLevel,
        stream,
        institution,
        specialization,
        consentAi
      });

      if (role === 'counselor') navigate('/counselor');
      else navigate('/assessment');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="brand-icon" style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem' }}>
              <Compass size={28} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Create Your Account</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Get personalized AI-powered career roadmaps & counseling
            </p>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`btn btn-sm ${role === 'student' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, border: 'none' }}
            >
              I am a Student
            </button>
            <button
              type="button"
              onClick={() => setRole('counselor')}
              className={`btn btn-sm ${role === 'counselor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1, border: 'none' }}
            >
              I am a Counselor
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="form-input"
              />
            </div>

            {role === 'student' ? (
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Education Level</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="form-select"
                  >
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Undergraduate (1st/2nd Year)">Undergraduate (1st/2nd Year)</option>
                    <option value="Undergraduate (Final Year)">Undergraduate (Final Year)</option>
                    <option value="Graduate / Professional">Graduate / Professional</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stream / Domain</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="form-select"
                  >
                    <option value="Science (PCM)">Science (PCM)</option>
                    <option value="Science (PCB)">Science (PCB)</option>
                    <option value="Commerce with Maths">Commerce with Maths</option>
                    <option value="Commerce without Maths">Commerce</option>
                    <option value="Arts / Humanities">Arts / Humanities</option>
                    <option value="Vocational / Polytechnic">Vocational / Polytechnic</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Institution / Organization</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Apex Career Center"
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Specialization</label>
                  <input
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. STEM & Engineering"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Privacy Consent Checkbox (Privacy-First AI requirement) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={consentAi}
                  onChange={(e) => setConsentAi(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  <strong>Privacy-First AI Consent:</strong> I agree that my profile will be analyzed to generate career roadmaps. PathFinder AI strips all personal identifiers (names, emails) before calling third-party AI models.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              <UserPlus size={18} />
              <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
