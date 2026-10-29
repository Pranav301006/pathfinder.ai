import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CareerCard from '../components/CareerCard';
import RadarChartComponent from '../components/RadarChartComponent';
import AICoachModal from '../components/AICoachModal';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ShieldCheck,
  Target,
  Brain,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function RecommendationReportPage() {
  const [recommendation, setRecommendation] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [recResult, assResult] = await Promise.allSettled([
          api.getLatestRecommendation(),
          api.getLatestAssessment()
        ]);

        const hasRec = recResult.status === 'fulfilled' && recResult.value?.success;
        const hasAss = assResult.status === 'fulfilled' && assResult.value?.success;

        if (hasRec) {
          setRecommendation(recResult.value.data);
        }
        if (hasAss) {
          setAssessment(assResult.value.data);
        }

        // Auto-generate recommendations if assessment exists but recommendations don't
        if (hasAss && !hasRec) {
          try {
            const genRes = await api.generateRecommendations();
            if (genRes.success) {
              setRecommendation(genRes.data);
            }
          } catch (genErr) {
            console.warn('Auto-generation of recommendations failed:', genErr.message);
            setError('Assessment found but could not generate recommendations. Please try again.');
          }
        }

        // Only set error if BOTH failed (no data at all)
        if (!hasRec && !hasAss) {
          setError('No assessment data found. Please complete the assessment first.');
        }
      } catch (err) {
        setError(err.message || 'No recommendation report found. Please complete the assessment.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79, 70, 229, 0.2)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Compiling your grounded career guidance report and skill radar...</p>
        </div>
      </div>
    );
  }

  if (error || !recommendation) {
    return (
      <div className="main-content">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <Compass size={48} color="var(--primary-light)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>No Assessment Completed Yet</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Complete the 3-part assessment to generate your personalized AI career report, radar chart, and roadmap.
            </p>
            <Link to="/assessment" className="btn btn-primary">
              <span>Start Assessment</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const topCareers = recommendation.topCareers || [];
  const primaryCareer = topCareers[0] || {};
  const riasec = assessment?.riasecScores || {};
  const verifiedSkills = assessment?.verifiedSkills || {};
  const realityGap = assessment?.realityCheckGap || {};

  return (
    <div className="main-content">
      <div className="container">
        {/* Top Header Card */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">
                  Holland Code: {riasec.hollandCode || 'ICE'}
                </span>
                {recommendation.counselorBadge ? (
                  <span className="badge badge-verified">
                    <CheckCircle2 size={13} /> Counselor Verified
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    <Clock size={13} /> Pending Counselor Review
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800 }}>
                Career Guidance Dossier for {profile?.full_name || 'Student'}
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.95rem' }}>
                Education: {profile?.education_level || 'Class 12'} ({profile?.stream || 'Science'}) • Report Generated: {new Date(recommendation.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print / Save PDF Report">
                <Printer size={15} />
                <span>Export PDF</span>
              </button>
              <Link to={`/roadmap?careerId=${primaryCareer.careerId}`} className="btn btn-primary btn-sm">
                <span>View 10-Week Roadmap</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Top Insights & Radar Chart Section */}
        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          {/* Radar Chart Component */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Target size={16} />
                  <span>Visual Skill-Gap Radar Analysis</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Target: {primaryCareer.title}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Blue polygon represents your verified skill level. Amber outline illustrates target industry standards.
              </p>
            </div>

            <RadarChartComponent
              verifiedSkills={verifiedSkills}
              requiredSkills={primaryCareer.requiredSkills || {}}
            />
          </div>

          {/* Skill Reality Check Summary Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <Sparkles size={16} />
                <span>Holland RIASEC & Skill Reality Check</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Your scores are grounded in standardized interest profiling and verification micro-quizzes.
              </p>

              {/* RIASEC Mini Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'].map(dim => {
                  const key = dim[0];
                  const score = riasec[key] || 50;
                  return (
                    <div key={key} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{dim.substring(0, 4)} ({key})</span>
                        <span style={{ color: 'var(--primary-light)' }}>{score}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${score}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reality Check Alert or Verified Box */}
              {realityGap.hasMajorMismatch ? (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <strong>Coaching Opportunity:</strong> Micro-quiz accuracy indicated a gap in {realityGap.mismatches?.map(m => m.skill).join(', ') || 'skills'}. Focus on foundational modules in your 10-week roadmap to bridge this gap.
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={18} color="#34d399" />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <strong>Verified Aptitude:</strong> Your self-rated skills closely aligned with the objective verification micro-quiz benchmarks.
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Deterministic scoring formula: 0.50 * RIASEC + 0.35 * Verified Skills + 0.15 * Values
            </div>
          </div>
        </div>

        {/* Personalized Career Cards */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>
              Top Recommended Career Paths
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Personalized Recommendations</h2>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem' }}>
            {topCareers.map((c, index) => (
              <CareerCard
                key={c.careerId || index}
                career={c}
                isTopMatch={index === 0}
                counselorBadge={recommendation.counselorBadge}
                counselorNotes={recommendation.counselorNotes}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Career Coach */}
      <AICoachModal />
    </div>
  );
}
