import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StaffLoginPage from './pages/StaffLoginPage';
import RegisterPage from './pages/RegisterPage';
import AssessmentPage from './pages/AssessmentPage';
import RecommendationReportPage from './pages/RecommendationReportPage';
import RoadmapPage from './pages/RoadmapPage';
import CounselorDashboard from './pages/CounselorDashboard';
import KioskModePage from './pages/KioskModePage';
import AuditLogPage from './pages/AuditLogPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

function AppLayout() {
  const location = useLocation();
  const isKiosk = location.pathname === '/kiosk';

  return (
    <>
      {!isKiosk && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/student" element={<StudentLoginPage />} />
        <Route path="/student-login" element={<StudentLoginPage />} />
        <Route path="/login/staff" element={<StaffLoginPage />} />
        <Route path="/login/counselor" element={<StaffLoginPage />} />
        <Route path="/login/admin" element={<StaffLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/kiosk" element={<KioskModePage />} />

        {/* Student Protected Routes */}
        <Route
          path="/assessment"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <AssessmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute allowedRoles={['student', 'counselor', 'admin']}>
              <RecommendationReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute allowedRoles={['student', 'counselor', 'admin']}>
              <RoadmapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student', 'counselor', 'admin']}>
              <ProfileSetupPage />
            </ProtectedRoute>
          }
        />

        {/* Counselor Hub */}
        <Route
          path="/counselor"
          element={
            <ProtectedRoute allowedRoles={['counselor', 'admin']}>
              <CounselorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin AI Transparency */}
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
      {!isKiosk && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeLanguageProvider>
          <AppLayout />
        </ThemeLanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
