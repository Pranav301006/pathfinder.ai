import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  Compass,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Target,
  Brain,
  ShieldAlert
} from 'lucide-react';

export default function AssessmentPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPart, setCurrentPart] = useState('interest'); // 'interest' | 'skill' | 'value'
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOptionIndex, realityQuizAnswers: [int, int, int] } }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { language } = useThemeLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await api.getQuestions();
        if (res.success) {
          setQuestions(res.data.questions);

          // Restore answers from localStorage if available
          const saved = localStorage.getItem('pathfinder_temp_answers');
          if (saved) {
            setAnswers(JSON.parse(saved));
          }
        }
      } catch (err) {
        setError('Failed to load assessment question bank');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleOptionSelect = (qId, optIndex) => {
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        selectedOptionIndex: optIndex
      }
    };
    setAnswers(updated);
    localStorage.setItem('pathfinder_temp_answers', JSON.stringify(updated));
  };

  const handleQuizAnswerSelect = (qId, quizQuestionIndex, chosenOptionIndex) => {
    const existing = answers[qId] || {};
    const existingQuiz = existing.realityQuizAnswers || [null, null, null];
    const newQuiz = [...existingQuiz];
    newQuiz[quizQuestionIndex] = chosenOptionIndex;

    const updated = {
      ...answers,
      [qId]: {
        ...existing,
        realityQuizAnswers: newQuiz
      }
    };
    setAnswers(updated);
    localStorage.setItem('pathfinder_temp_answers', JSON.stringify(updated));
  };

  const currentQuestions = questions.filter(q => q.part === currentPart);

  // Calculate progress
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    const formattedAnswers = Object.entries(answers).map(([questionId, ansObj]) => ({
      questionId,
      selectedOptionIndex: ansObj.selectedOptionIndex,
      realityQuizAnswers: ansObj.realityQuizAnswers || []
    }));

    try {
      // 1. Submit Assessment
      const submitRes = await api.submitAssessment({ answers: formattedAnswers });
      if (!submitRes.success) throw new Error(submitRes.error || 'Failed to submit assessment');

      // 2. Generate personalized recommendations
      await api.generateRecommendations();

      // Clear temp storage
      localStorage.removeItem('pathfinder_temp_answers');

      // Navigate to recommendation report
      navigate('/recommendations');
    } catch (err) {
      setError(err.message || 'Error generating career report. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(79, 70, 229, 0.2)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p>Loading assessment questions and reality check benchmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header Ribbon */}
        <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.4rem' }}>
                Three-Part Assessment Engine
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                {language === 'hi' ? 'करियर कौशल और रुचि मूल्यांकन' : 'Career Skills & Interests Assessment'}
              </h1>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                {progressPercent}% Complete
              </span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Autosaving every response
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary), var(--accent-teal))',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Step Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
            <button
              onClick={() => setCurrentPart('interest')}
              className={`btn btn-sm ${currentPart === 'interest' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              <Brain size={15} />
              <span>Part 1: Holland RIASEC Interests</span>
            </button>
            <button
              onClick={() => setCurrentPart('skill')}
              className={`btn btn-sm ${currentPart === 'skill' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              <Target size={15} />
              <span>Part 2: Skill Reality Check</span>
            </button>
            <button
              onClick={() => setCurrentPart('value')}
              className={`btn btn-sm ${currentPart === 'value' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              <Zap size={15} />
              <span>Part 3: Work Values</span>
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Questions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {currentPart === 'skill' && (
            <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Zap size={20} color="var(--accent-teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--accent-teal)' }}>Skill Reality Check Innovation:</strong> Rate your self-confidence, then answer the 3 objective verification micro-questions. This validates verified proficiency vs inflated estimates!
              </div>
            </div>
          )}

          {currentQuestions.map((q, idx) => {
            const currentAnswer = answers[q.id] || {};
            const selectedOpt = currentAnswer.selectedOptionIndex;
            const quizAnswers = currentAnswer.realityQuizAnswers || [];

            return (
              <div key={q.id} className="glass-card animate-fade-in" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                    {q.dimension}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Item {idx + 1} of {currentQuestions.length}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                  {language === 'hi' && q.text_hi ? q.text_hi : q.text_en}
                </h3>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleOptionSelect(q.id, optIdx)}
                        style={{
                          textAlign: 'left',
                          padding: '0.85rem 1.2rem',
                          borderRadius: '10px',
                          border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-glass)',
                          background: isSelected ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.92rem', fontWeight: isSelected ? 600 : 400 }}>
                          {opt}
                        </span>
                        {isSelected && <CheckCircle2 size={18} color="var(--primary-light)" />}
                      </button>
                    );
                  })}
                </div>

                {/* If skill question: Render the 3-question Reality Check micro-quiz */}
                {q.part === 'skill' && q.reality_quiz && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                      <Target size={16} />
                      <span>Skill Reality Check: 3 Quick Verification Questions</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {q.reality_quiz.map((quizItem, qIdx) => {
                        const chosenQuizAnswer = quizAnswers[qIdx];
                        return (
                          <div key={qIdx} style={{ background: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                              Q{qIdx + 1}: {quizItem.question}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                              {quizItem.options.map((quizOpt, oIdx) => {
                                const isQuizSelected = chosenQuizAnswer === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleQuizAnswerSelect(q.id, qIdx, oIdx)}
                                    style={{
                                      padding: '0.6rem 0.8rem',
                                      fontSize: '0.82rem',
                                      borderRadius: '6px',
                                      textAlign: 'left',
                                      border: isQuizSelected ? '1px solid var(--accent-teal)' : '1px solid var(--border-glass)',
                                      background: isQuizSelected ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                                      color: isQuizSelected ? '#ffffff' : 'var(--text-muted)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {quizOpt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Bottom Footer */}
        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentPart !== 'interest' ? (
            <button
              onClick={() => setCurrentPart(currentPart === 'value' ? 'skill' : 'interest')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Previous Section</span>
            </button>
          ) : <div />}

          {currentPart !== 'value' ? (
            <button
              onClick={() => setCurrentPart(currentPart === 'interest' ? 'skill' : 'value')}
              className="btn btn-primary"
            >
              <span>Next: {currentPart === 'interest' ? 'Skill Reality Check' : 'Work Values'}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-lg pulse-glow"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' }}
            >
              <Sparkles size={20} />
              <span>{submitting ? 'Synthesizing AI Report...' : 'Submit & Generate Career Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
