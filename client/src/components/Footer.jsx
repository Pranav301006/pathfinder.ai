import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Cpu, Lock, FileText, Monitor } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(10, 15, 26, 0.95)', padding: '3.5rem 0 2rem' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div className="brand-icon" style={{ width: '1.8rem', height: '1.8rem' }}>
                <Compass size={16} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                PathFinder <span className="text-gradient">AI</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Full-Stack AI-Integrated Career Guidance & Counseling Portal. Grounded deterministic scoring, LLM synthesis, and counselor-in-the-loop review.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Unique Innovations</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li style={{ color: 'var(--text-muted)' }}>• Grounded Hybrid AI Engine</li>
              <li style={{ color: 'var(--text-muted)' }}>• Skill Reality Check Micro-Quizzes</li>
              <li style={{ color: 'var(--text-muted)' }}>• Human-in-the-Loop Counselor Verified Badge</li>
              <li style={{ color: 'var(--text-muted)' }}>• Visual Radar Chart & Trackable Roadmap</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Indian Context & Access</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li style={{ color: 'var(--text-muted)' }}>• Stream Choice: Science, Commerce, Arts</li>
              <li style={{ color: 'var(--text-muted)' }}>• National Exams: JEE, NEET, CUET, CLAT</li>
              <li style={{ color: 'var(--text-muted)' }}>• Free Platforms: NPTEL & SWAYAM</li>
              <li style={{ color: 'var(--text-muted)' }}>• Multilingual: English & हिन्दी</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Governance & Deployments</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li>
                <Link to="/kiosk" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-teal)' }}>
                  <Monitor size={14} /> Full-Screen Kiosk Mode
                </Link>
              </li>
              <li>
                <Link to="/admin/logs" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-light)' }}>
                  <Cpu size={14} /> AI Transparency & Audit Logs
                </Link>
              </li>
              <li style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Privacy-First: Zero PII sent to LLM, GDPR right-to-be-forgotten supported.
              </li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          <div>
            © {new Date().getFullYear()} PathFinder AI — Problem Statement PS-2 Full-Stack Submission
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>REST API v1.0</span>
            <span>SQLite WAL Persistence</span>
            <span>Google Gemini + Fallback Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
