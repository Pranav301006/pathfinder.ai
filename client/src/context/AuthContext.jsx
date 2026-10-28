import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pathfinder_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('pathfinder_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const token = localStorage.getItem('pathfinder_access_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('pathfinder_user', JSON.stringify(res.data.user));
            if (res.data.profile) {
              localStorage.setItem('pathfinder_profile', JSON.stringify(res.data.profile));
            }
          }
        } catch (e) {
          console.warn('Session verification failed:', e.message);
          logout();
        }
      }
      setLoading(false);
    }

    verifyAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setProfile(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      const { user: userData, profile: profileData, tokens } = res.data;
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('pathfinder_access_token', tokens.accessToken);
      localStorage.setItem('pathfinder_refresh_token', tokens.refreshToken);
      localStorage.setItem('pathfinder_user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('pathfinder_profile', JSON.stringify(profileData));
      }
      return res;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success) {
      const { user: userData, profile: profileData, tokens } = res.data;
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('pathfinder_access_token', tokens.accessToken);
      localStorage.setItem('pathfinder_refresh_token', tokens.refreshToken);
      localStorage.setItem('pathfinder_user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('pathfinder_profile', JSON.stringify(profileData));
      }
      return res;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const demoLogin = async (roleType = 'student') => {
    let email = 'student@pathfinder.ai';
    if (roleType === 'rahul') email = 'rahul@pathfinder.ai';
    else if (roleType === 'counselor') email = 'counselor@pathfinder.ai';
    else if (roleType === 'admin') email = 'admin@pathfinder.ai';

    return await login(email, 'password123');
  };

  const logout = () => {
    try {
      api.logout();
    } catch {}
    localStorage.removeItem('pathfinder_access_token');
    localStorage.removeItem('pathfinder_refresh_token');
    localStorage.removeItem('pathfinder_user');
    localStorage.removeItem('pathfinder_profile');
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('pathfinder_profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        demoLogin,
        logout,
        updateProfileState,
        isAuthenticated: Boolean(user),
        isStudent: user?.role === 'student',
        isCounselor: user?.role === 'counselor',
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
