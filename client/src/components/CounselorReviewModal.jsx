import React, { useState } from 'react';
import { api } from '../services/api';
import {
  CheckCircle2,
  Edit3,
  MessageSquare,
  X,
  ShieldCheck,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function CounselorReviewModal({ studentBrief, onClose, onSuccess }) {
  const [action, setAction] = useState('approved');
  const [comment, setComment] = useState('Reviewed by career cell. Recommended pathway aligns well with your investigative aptitude and engineering ambitions.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { student, topCareers, riasec, verifiedSkills, realityGap } = studentBrief;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find recommendation ID from brief or student id
      const recRes = await api.getLatestRecommendation(student.id);
      if (!recRes.success) {
        throw new Error('Student has not generated recommendations yet to review.');
      }

      const res = await api.submitCounselorReview({
        recommendationId: recRes.data.id,
        action,
        comment
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit counselor review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '850px',
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={22} color="var(--accent-teal)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              Human-in-the-Loop Review: {student.full_name || 'Student'}
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.5rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* AI Copilot Brief Box */}
          <div style={{ background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-light)', marginBottom: '0.35rem', fontWeight: 700, fontSize: '0.85rem' }}>
              <Sparkles size={16} />
              <span>AI Counselor Copilot Summary</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {studentBrief.summary}
            </p>
            {realityGap?.hasMajorMismatch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '0.8rem' }}>
                <AlertTriangle size={15} />
                <span>Skill Reality Check Alert: Self-rating is significantly higher than verified quiz accuracy.</span>
              </div>
            )}
          </div>

          {/* AI Recommendations List to Review */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              AI Recommendations to Verify:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topCareers.map((c, i) => (
                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                      #{i + 1} {c.title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginLeft: '0.75rem' }}>
                      ({c.category})
                    </span>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {c.whyThisCareer}
                    </p>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.85rem' }}>
                    {c.matchScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action selection */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Counselor Review Decision:
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="action"
                    value="approved"
                    checked={action === 'approved'}
                    onChange={() => setAction('approved')}
                  />
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Approve & Attach "Counselor Verified" Badge</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="action"
                    value="commented"
                    checked={action === 'commented'}
                    onChange={() => setAction('commented')}
                  />
                  <span>Add Advisory Comments Only</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Counselor Advisory Notes for the Student:</label>
              <textarea
                rows={3}
                className="form-textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write personalized advice or entrance exam priorities..."
              />
            </div>

            {error && (
              <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Submitting Review...' : 'Commit Counselor Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
