import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  IndianRupee,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MapPin,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function CareerCard({ career, isTopMatch = false, counselorBadge = false, counselorNotes = '' }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleStartRoadmap = () => {
    navigate(`/roadmap?careerId=${career.careerId}`);
  };

  const getMatchColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#6366f1';
    if (score >= 70) return '#06b6d4';
    return '#f59e0b';
  };

  return (
    <div
      className={`glass-card glass-card-hover ${isTopMatch ? 'pulse-glow' : ''}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: isTopMatch ? '1px solid rgba(79, 70, 229, 0.4)' : undefined
      }}
    >
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>
              {career.category}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {career.title}
            </h3>
          </div>

          {/* Match Score Badge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px',
              height: '60px',
              borderRadius: '50%',
              background: `conic-gradient(${getMatchColor(career.matchScore)} ${career.matchScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              padding: '3px'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: getMatchColor(career.matchScore) }}>
                {career.matchScore}%
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>MATCH</span>
            </div>
          </div>
        </div>

        {/* Human-in-the-Loop Counselor Verified Badge */}
        {counselorBadge && (
          <div
            className="badge badge-verified"
            style={{ marginBottom: '1rem', padding: '0.35rem 0.75rem', width: 'fit-content' }}
          >
            <CheckCircle2 size={14} />
            <span>Counselor Verified Advice</span>
          </div>
        )}

        {counselorNotes && (
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#6ee7b7' }}>
            <strong>Counselor Note:</strong> {counselorNotes}
          </div>
        )}

        {/* Key Metrics */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <TrendingUp size={15} color="var(--accent-teal)" />
            <span>{career.growthOutlook}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
            <IndianRupee size={15} color="#34d399" />
            <span>{career.salaryRange}</span>
          </div>
        </div>

        {/* Explainability: "Why this career?" */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Sparkles size={16} color="#818cf8" />
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              Why This Career? (AI & RIASEC Explainability)
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {career.whyThisCareer}
          </p>

          {/* Score Breakdown Bars */}
          {career.scoreBreakdown && (
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>Interest Alignment: {career.scoreBreakdown.interests}%</span>
                <span>Verified Skills Fit: {career.scoreBreakdown.skills}%</span>
                <span>Work Values: {career.scoreBreakdown.values}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${career.scoreBreakdown.interests * 0.5}%`, background: '#818cf8' }} title="Interests" />
                <div style={{ width: `${career.scoreBreakdown.skills * 0.35}%`, background: '#06b6d4' }} title="Skills" />
                <div style={{ width: `${career.scoreBreakdown.values * 0.15}%`, background: '#f59e0b' }} title="Values" />
              </div>
            </div>
          )}
        </div>

        {/* Toggle Indian Educational Pathway Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', marginBottom: '1rem', justifyContent: 'space-between' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GraduationCap size={15} />
            Indian Pathway & Entrance Exams
          </span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && career.indianPathway && (
          <div className="animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div style={{ marginBottom: '0.65rem' }}>
              <strong style={{ color: 'var(--primary-light)' }}>Recommended Stream: </strong>
              <span>{career.indianPathway.stream}</span>
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <strong style={{ color: 'var(--accent-teal)' }}>Key Entrance Exams: </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.3rem' }}>
                {career.indianPathway.entranceExams?.map((exam, i) => (
                  <span key={i} className="badge badge-primary">{exam}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.65rem' }}>
              <strong style={{ color: '#fbbf24' }}>Premier Institutes: </strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {career.indianPathway.topInstitutes?.join(' • ')}
              </div>
            </div>

            <div>
              <strong style={{ color: '#34d399' }}>Free Online Courses (NPTEL/SWAYAM): </strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {career.indianPathway.freeCourses?.join(' • ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={handleStartRoadmap}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <span>Launch 10-Week Roadmap</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
