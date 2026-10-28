import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeLanguageContext = createContext();

export function ThemeLanguageProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('pathfinder_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('pathfinder_lang') || 'en');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    localStorage.setItem('pathfinder_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('pathfinder_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, setTheme, toggleTheme, language, setLanguage, toggleLanguage }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export const useThemeLanguage = () => useContext(ThemeLanguageContext);
