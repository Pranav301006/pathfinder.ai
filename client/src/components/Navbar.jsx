import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Map,
  ShieldCheck,
  Moon,
  Sun,
  Languages,
  LogOut,
  User,
  Monitor
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout, isAuthenticated, isCounselor, isAdmin } = useAuth();
  const { theme, toggleTheme, language, toggleLanguage } = useThemeLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <Compass size={22} />
          </div>
          <div>
            <span style={{ fontWeight: 800 }}>PathFinder</span>
            <span className="text-gradient" style={{ fontWeight: 800, marginLeft: '4px' }}>AI</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-item ${isCurrent('/') ? 'active' : ''}`}>
                {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
              </Link>
            </li>

            {isAuthenticated && !isCounselor && !isAdmin && (
              <>
                <li>
                  <Link to="/assessment" className={`nav-item ${isCurrent('/assessment') ? 'active' : ''}`}>
                    {language === 'hi' ? 'कौशल मूल्यांकन' : 'Assessment'}
                  </Link>
                </li>
                <li>
                  <Link to="/recommendations" className={`nav-item ${isCurrent('/recommendations') ? 'active' : ''}`}>
                    {language === 'hi' ? 'करियर रिपोर्ट' : 'Recommendations'}
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className={`nav-item ${isCurrent('/roadmap') ? 'active' : ''}`}>
                    {language === 'hi' ? '10-सप्ताह रोडमैप' : 'Roadmap'}
                  </Link>
                </li>
              </>
            )}

            {isCounselor && (
              <li>
                <Link to="/counselor" className={`nav-item ${isCurrent('/counselor') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={16} color="var(--accent-teal)" />
                  {language === 'hi' ? 'परामर्शदाता डैशबोर्ड' : 'Counselor Hub'}
                </Link>
              </li>
            )}

            {isAdmin && (
              <li>
                <Link to="/admin/logs" className={`nav-item ${isCurrent('/admin/logs') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <BarChart3 size={16} color="var(--primary-light)" />
                  AI Transparency
                </Link>
              </li>
            )}

            {/* Kiosk Mode Entry */}
            <li>
              <Link to="/kiosk" className="badge badge-info" title="Launch Public Kiosk Mode" style={{ textDecoration: 'none', padding: '0.35rem 0.65rem' }}>
                <Monitor size={14} />
                <span>Kiosk</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            title="Toggle English / Hindi"
            style={{ padding: '0.4rem 0.7rem' }}
          >
            <Languages size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              {language === 'en' ? 'हिन्दी' : 'ENG'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            title="Toggle Dark / Light Theme"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
          </button>

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to={isCounselor ? '/counselor' : '/profile'}
                className="badge badge-primary"
                style={{ textDecoration: 'none', padding: '0.35rem 0.75rem', cursor: 'pointer' }}
              >
                <User size={13} />
                <span>{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
                <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>({user.role})</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-outline btn-sm"
                title="Logout"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Link to="/login/student" className="btn btn-secondary btn-sm" title="Student Portal Login">
                Student Login
              </Link>
              <Link to="/login/staff" className="btn btn-outline btn-sm" title="Counselor & Admin Portal" style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent-teal)' }}>
                Counselor/Admin
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
