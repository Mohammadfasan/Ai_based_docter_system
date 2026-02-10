import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeSettings, setThemeSettings] = useState({
    mode: 'auto',
    contrast: 'normal',
    fontSize: 'medium',
    reduceMotion: false,
    accentColor: '#0d9486'
  });

  useEffect(() => {
    // Load settings from localStorage
    const loadSettings = () => {
      const settings = {
        mode: localStorage.getItem('themeMode') || 'auto',
        contrast: localStorage.getItem('contrast') || 'normal',
        fontSize: localStorage.getItem('fontSize') || 'medium',
        reduceMotion: localStorage.getItem('reduceMotion') === 'true',
        accentColor: localStorage.getItem('accentColor') || '#0d9486'
      };
      setThemeSettings(settings);
      
      // Apply settings
      applyTheme(settings.mode);
      applyContrast(settings.contrast);
      applyFontSize(settings.fontSize);
      applyReduceMotion(settings.reduceMotion);
      applyAccentColor(settings.accentColor);
    };
    
    loadSettings();
    
    // Listen for storage changes (for sync between tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'themeMode') {
        applyTheme(e.newValue || 'auto');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const applyTheme = (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      // Auto mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        setDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setDarkMode(false);
      }
    }
  };

  const applyContrast = (contrast) => {
    document.documentElement.setAttribute('data-contrast', contrast);
  };

  const applyFontSize = (size) => {
    const sizes = { small: '14px', medium: '16px', large: '18px' };
    document.documentElement.style.fontSize = sizes[size];
  };

  const applyReduceMotion = (reduce) => {
    document.documentElement.style.setProperty(
      '--animation-duration',
      reduce ? '0s' : '0.3s'
    );
  };

  const applyAccentColor = (color) => {
    document.documentElement.style.setProperty('--color-accent', color);
  };

  const updateThemeSettings = (newSettings) => {
    setThemeSettings(newSettings);
    
    // Save to localStorage
    Object.entries(newSettings).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Apply settings
    applyTheme(newSettings.mode);
    applyContrast(newSettings.contrast);
    applyFontSize(newSettings.fontSize);
    applyReduceMotion(newSettings.reduceMotion);
    applyAccentColor(newSettings.accentColor);
  };

  const toggleDarkMode = () => {
    const newMode = darkMode ? 'light' : 'dark';
    const newSettings = { ...themeSettings, mode: newMode };
    updateThemeSettings(newSettings);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        themeSettings,
        toggleDarkMode,
        updateThemeSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};