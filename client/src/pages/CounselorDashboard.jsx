import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CounselorReviewModal from '../components/CounselorReviewModal';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  Eye,
  ChevronRight,
  Bot
} from 'lucide-react';

export default function CounselorDashboard() {
  const [kpis, setKpis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'pending' | 'verified' | 'mismatch'

  // Review modal state
  const [activeReviewBrief, setActiveReviewBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [kpiRes, analyticsRes, studentsRes] = await Promise.all([
        api.getCounselorKPIs(),
        api.getCounselorAnalytics(),
        api.getCounselorStudents()
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (studentsRes.success) setStudents(studentsRes.data);
    } catch (err) {
      console.error('Failed to load counselor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenReview = async (student) => {
    setBriefLoading(true);
    try {
      const res = await api.getStudentBrief(student.id);
      if (res.success) {
        setActiveReviewBrief(res.data);
      }
    } catch (err) {
      alert(err.message || 'Could not load student brief');
    } finally {
      setBriefLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.stream.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterRole === 'pending') return s.recommendationStatus === 'pending_review';
    if (filterRole === 'verified') return s.counselorBadge;
    if (filterRole === 'mismatch') return s.flags.some(f => f.type === 'SKILL_MISMATCH');
    return true;
  });

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(6, 182, 212, 0.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading Counselor Advisory Cell & Engagement Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-info">Human-in-the-Loop Hub</span>
              <span className="badge badge-primary">AI Counselor Copilot Active</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Counselor Review & Engagement Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Supervise student career trajectories, audit AI recommendations, and resolve skill-reality gaps.
            </p>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        {kpis && (
          <div className="grid-4" style={{ marginBottom: '2rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Students</span>
                <Users size={18} color="var(--primary-light)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{kpis.totalStudents}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Active cohorts monitored
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Assessments Completed</span>
                <Sparkles size={18} color="var(--accent-teal)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
                {kpis.completedAssessments}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Holland RIASEC + Verified Skills
              </div>
            </div>

            <div className="glass-card" style={{ border: kpis.pendingReviews > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Pending AI Reviews</span>
                <Clock size={18} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
                {kpis.pendingReviews}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Waiting for counselor verification
              </div>
            </div>

            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Verified Coverage</span>
                <ShieldCheck size={18} color="#34d399" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                {kpis.counselorCoveragePercent}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Avg review time: {kpis.avgReviewMinutes}m
              </div>
            </div>
          </div>
        )}

        {/* Engagement Analytics Funnel */}
        {analytics && analytics.funnel && (
          <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <BarChart3 size={18} color="var(--primary-light)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Student Engagement Funnel</h3>
            </div>

            <div className="grid-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              {analytics.funnel.map((stage, idx) => (
                <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem', fontWeight: 600 }}>
                    STAGE 0{idx + 1}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {stage.count}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-light)', marginTop: '0.2rem' }}>
                    {stage.stage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Review Queue Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Student Caseload & Review Queue</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Click "Review & Verify" to inspect the AI Copilot brief and attach the Counselor Verified badge.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search input */}
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Filter by name, stream..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2rem', padding: '0.5rem 0.75rem 0.5rem 2rem', fontSize: '0.85rem', width: '220px' }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="form-select"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
              >
                <option value="all">All Students</option>
                <option value="pending">Pending AI Review</option>
                <option value="verified">Counselor Verified</option>
                <option value="mismatch">Skill Reality Mismatch</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-strong)', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>STUDENT</th>
                  <th style={{ padding: '0.75rem 1rem' }}>STREAM / CLASS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>HOLLAND CODE</th>
                  <th style={{ padding: '0.75rem 1rem' }}>ROADMAP</th>
                  <th style={{ padding: '0.75rem 1rem' }}>EARLY WARNING FLAGS</th>
                  <th style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border-glass)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      <div>{s.stream}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.educationLevel}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {s.hollandCode ? (
                        <span className="badge badge-primary">{s.hollandCode}</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Not assessed</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${s.roadmapProgress}%`, height: '100%', background: '#06b6d4' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.roadmapProgress}%</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {s.flags && s.flags.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {s.flags.map((f, fi) => (
                            <span key={fi} className={f.level === 'danger' ? 'badge badge-danger' : 'badge badge-warning'} style={{ fontSize: '0.7rem' }}>
                              <AlertTriangle size={11} /> {f.type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Normal</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      {s.counselorBadge ? (
                        <span className="badge badge-verified">
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      ) : s.hasAssessment ? (
                        <span className="badge badge-warning">
                          <Clock size={13} /> Pending Review
                        </span>
                      ) : (
                        <span className="badge badge-secondary">Incomplete</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenReview(s)}
                        disabled={briefLoading}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        <Bot size={14} color="var(--accent-teal)" />
                        <span>Review & Verify</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Counselor Review Modal with AI Copilot Brief */}
      {activeReviewBrief && (
        <CounselorReviewModal
          studentBrief={activeReviewBrief}
          onClose={() => setActiveReviewBrief(null)}
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
