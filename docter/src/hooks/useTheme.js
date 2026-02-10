import { useState, useEffect } from 'react';

const useTheme = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [themeMode, setThemeMode] = useState('auto');
  
  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('themeMode') || 'auto';
    setThemeMode(savedTheme);
    
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
    
    applyTheme(savedTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (themeMode === 'auto') {
        applyTheme('auto');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);
  
  const toggleDarkMode = () => {
    const newMode = darkMode ? 'light' : 'dark';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  
  const setTheme = (mode) => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
  };
  
  return { darkMode, themeMode, toggleDarkMode, setTheme };
};

export default useTheme;