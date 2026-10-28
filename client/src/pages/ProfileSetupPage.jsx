import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  User,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  Save,
  AlertTriangle
} from 'lucide-react';

export default function ProfileSetupPage() {
  const { user, profile, updateProfileState, logout } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [educationLevel, setEducationLevel] = useState(profile?.education_level || 'Class 12');
  const [stream, setStream] = useState(profile?.stream || 'Science (PCM)');
  const [careerInterests, setCareerInterests] = useState(profile?.career_interests || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEducationLevel(profile.education_level || 'Class 12');
      setStream(profile.stream || 'Science (PCM)');
      setCareerInterests(profile.career_interests || '');
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.updateProfile({
        fullName,
        educationLevel,
        stream,
        careerInterests
      });
      if (res.success) {
        updateProfileState(res.data);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.exportMyData();
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pathfinder_dossier_${user.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    try {
      await api.deleteMyData();
      logout();
      navigate('/login');
    } catch (err) {
      alert('Failed to delete data');
    }
  };

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '780px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="brand-icon" style={{ width: '2.5rem', height: '2.5rem' }}>
              <User size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student Profile & Privacy Settings</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Manage your education parameters, stream targets, and data sovereignty.
              </p>
            </div>
          </div>

          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSave} style={{ marginBottom: '2.5rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>

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

            <div className="form-group">
              <label className="form-label">Career Aspirations & Target Fields</label>
              <textarea
                rows={3}
                value={careerInterests}
                onChange={(e) => setCareerInterests(e.target.value)}
                placeholder="e.g. Artificial Intelligence, Robotics, Fintech, Aerospace..."
                className="form-textarea"
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>

          {/* Privacy & GDPR Right to be Forgotten Section */}
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--accent-teal)" />
              <span>Data Rights & Privacy Controls</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              PathFinder AI complies with modern data protection principles. You can export a full copy of your assessment answers and roadmap, or exercise your right to be forgotten.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleExportData}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={16} />
                <span>Export My Complete Data Dossier (.JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Trash2 size={16} />
                <span>Delete All My Data (Right to be Forgotten)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
          <div className="glass-panel" style={{ maxWidth: '480px', padding: '2rem', textAlign: 'center' }}>
            <AlertTriangle size={42} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Permanently Delete Your Data?
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              This action cannot be undone. All your assessment scores, skill reality checks, AI recommendations, and 10-week roadmap progress will be erased immediately.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteData} className="btn btn-danger">
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
