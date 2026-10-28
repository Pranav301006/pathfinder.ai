import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Clock,
  Sparkles,
  Trophy
} from 'lucide-react';

export default function RoadmapTimeline({ roadmap, onMilestoneUpdate }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleToggle = async (milestone) => {
    setUpdatingId(milestone.id);
    try {
      const res = await api.toggleMilestone(milestone.id);
      if (res.success) {
        if (res.data.isCompleted && res.data.progressPercent === 100) {
          // Trigger victory celebratory confetti!
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        if (onMilestoneUpdate) {
          onMilestoneUpdate(milestone.id, res.data.isCompleted, res.data.progressPercent);
        }
      }
    } catch (err) {
      console.error('Failed to toggle milestone', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = roadmap.milestones.filter(m => m.isCompleted).length;
  const progressPercent = roadmap.progressPercent !== undefined
    ? roadmap.progressPercent
    : Math.round((completedCount / roadmap.milestones.length) * 100);

  return (
    <div>
      {/* Progress Header */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.3rem' }}>Actionable Learning Track</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{roadmap.careerTitle}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: progressPercent === 100 ? '#10b981' : 'var(--primary-light)' }}>
              {progressPercent}%
            </span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedCount} of {roadmap.milestones.length} milestones checked
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: progressPercent === 100
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'linear-gradient(90deg, var(--primary), var(--accent-teal))',
              transition: 'width 0.4s ease'
            }}
          />
        </div>

        {progressPercent === 100 && (
          <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#6ee7b7' }}>
            <Trophy size={20} color="#34d399" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Congratulations! You have completed all 10 weeks of preparation. Share your proof-of-work with your counselor!
            </span>
          </div>
        )}
      </div>

      {/* 10-Week Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        {roadmap.milestones.map((m, index) => {
          const isDone = m.isCompleted;
          return (
            <div
              key={m.id || index}
              className={`glass-card ${isDone ? 'milestone-done' : ''}`}
              style={{
                display: 'flex',
                gap: '1.25rem',
                borderLeft: isDone ? '4px solid #10b981' : '4px solid var(--primary)',
                opacity: isDone ? 0.9 : 1
              }}
            >
              {/* Checkbox Button */}
              <button
                onClick={() => handleToggle(m)}
                disabled={updatingId === m.id}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  marginTop: '0.2rem'
                }}
                title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isDone ? (
                  <CheckCircle2 size={26} color="#10b981" />
                ) : (
                  <Circle size={26} color="var(--text-dim)" />
                )}
              </button>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                      WEEK {m.weekNumber}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, textDecoration: isDone ? 'line-through' : 'none', color: isDone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {m.milestoneTitle}
                    </h3>
                  </div>

                  {m.estimatedHours && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      <Clock size={13} />
                      <span>~{m.estimatedHours} hrs</span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                  {m.description}
                </p>

                {/* Resources */}
                {m.resources && m.resources.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                      Recommended Resources:
                    </span>
                    {m.resources.map((resItem, ri) => (
                      <span
                        key={ri}
                        className="badge badge-secondary"
                        style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <BookOpen size={12} color="var(--primary-light)" />
                        {resItem}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
