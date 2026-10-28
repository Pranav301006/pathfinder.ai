import React, { useState } from 'react';
import { api } from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function AICoachModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your PathFinder AI Career Coach. I have your Holland assessment and roadmap loaded in context. Ask me anything about Indian entrance exams, study tips, or course recommendations!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'Which Indian entrance exam should I prioritize first?',
    'How do I bridge the gap in my Programming skill?',
    'What free courses are available on NPTEL for my pathway?',
    'Can you break down Week 1 of my roadmap?'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askCoach(query);
      if (res.success) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.answer,
            isFallback: res.data.isFallback
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a connection glitch. Please try asking again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary pulse-glow"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            borderRadius: 'var(--radius-full)',
            padding: '0.85rem 1.4rem',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 8px 25px rgba(79, 70, 229, 0.45)'
          }}
        >
          <Bot size={20} />
          <span>Ask AI Coach</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '400px',
            maxWidth: 'calc(100vw - 2rem)',
            height: '540px',
            maxHeight: 'calc(100vh - 4rem)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 95,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(79, 70, 229, 0.4)',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(6, 182, 212, 0.15))',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>AI Career Coach</h4>
                <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Grounded in your assessment
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}
          >
            {messages.map((m, idx) => {
              const isBot = m.role === 'assistant';
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: isBot ? 'row' : 'row-reverse',
                    gap: '0.5rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isBot ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      flexShrink: 0
                    }}
                  >
                    {isBot ? <Sparkles size={13} color="#fff" /> : <User size={13} />}
                  </div>

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: isBot ? 'rgba(30, 41, 65, 0.85)' : 'linear-gradient(135deg, var(--primary), #6366f1)',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      border: '1px solid var(--border-glass)'
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <Bot size={16} className="pulse-glow" />
                <span>Coach is analyzing your profile...</span>
              </div>
            )}
          </div>

          {/* Prompt chips */}
          <div
            style={{
              padding: '0.5rem 0.85rem',
              background: 'rgba(15, 23, 42, 0.4)',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto'
            }}
          >
            {suggestedPrompts.slice(0, 2).map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="badge badge-secondary"
                style={{
                  fontSize: '0.7rem',
                  padding: '0.3rem 0.5rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-glass)',
              display: 'flex',
              gap: '0.5rem',
              background: 'var(--bg-surface)'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, exams, roadmaps..."
              className="form-input"
              style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '0 0.85rem' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
