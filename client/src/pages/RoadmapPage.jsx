import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import RoadmapTimeline from '../components/RoadmapTimeline';
import AICoachModal from '../components/AICoachModal';
import { Map, Sparkles, ArrowLeft, Trophy, BookOpen } from 'lucide-react';

export default function RoadmapPage() {
  const [searchParams] = useSearchParams();
  const careerIdFromUrl = searchParams.get('careerId');

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoadmap() {
      try {
        if (careerIdFromUrl) {
          // Initialize or fetch roadmap for this career
          const res = await api.generateRoadmap(careerIdFromUrl);
          if (res.success) {
            setRoadmap(res.data);
          }
        } else {
          // Fetch current student roadmap
          const res = await api.getRoadmap();
          if (res.success) {
            setRoadmap(res.data);
          }
        }
      } catch (err) {
        // If no roadmap exists yet, fetch top career from latest recommendation and auto-initialize!
        try {
          const recRes = await api.getLatestRecommendation();
          if (recRes.success && recRes.data.topCareers?.length > 0) {
            const firstCareerId = recRes.data.topCareers[0].careerId;
            const initRes = await api.generateRoadmap(firstCareerId);
            if (initRes.success) {
              setRoadmap(initRes.data);
            }
          } else {
            setError('Please complete the career assessment first to generate your roadmap.');
          }
        } catch (e) {
          setError('No active roadmap found. Please complete the assessment.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, [careerIdFromUrl]);

  const handleMilestoneUpdate = (milestoneId, isCompleted, progressPercent) => {
    setRoadmap(prev => {
      if (!prev) return prev;
      const updatedMilestones = prev.milestones.map(m =>
        m.id === milestoneId ? { ...m, isCompleted } : m
      );
      return {
        ...prev,
        progressPercent,
        milestones: updatedMilestones
      };
    });
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79, 70, 229, 0.2)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Structuring your 10-week actionable curriculum & free course links...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="main-content">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 1rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <Map size={48} color="var(--accent-teal)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>No Active Roadmap Yet</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Complete the assessment to unlock your tailored 10-week roadmap with curated NPTEL and free courseware.
            </p>
            <Link to="/assessment" className="btn btn-primary">
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/recommendations" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Career Recommendations</span>
          </Link>
        </div>

        <RoadmapTimeline
          roadmap={roadmap}
          onMilestoneUpdate={handleMilestoneUpdate}
        />
      </div>

      <AICoachModal />
    </div>
  );
}
