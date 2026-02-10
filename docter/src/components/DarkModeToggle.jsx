import React, { useState, useEffect } from 'react';
import { 
  FaMoon, 
  FaSun, 
  FaDesktop,
  FaPalette,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaHighlighter,
  FaAdjust,
  FaSyncAlt,
  FaTimes,
  FaTint, // Alternative for contrast
  FaCircle,
  FaSquare
} from 'react-icons/fa';

const DarkModeToggle = ({ darkMode, onToggle }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [themeMode, setThemeMode] = useState('auto'); // auto, light, dark
  const [contrast, setContrast] = useState('normal'); // normal, high, low
  const [fontSize, setFontSize] = useState('medium'); // small, medium, large
  const [reduceMotion, setReduceMotion] = useState(false);
  const [accentColor, setAcccentColor] = useState('#0d9486'); // teal default
  
  // Load user preferences from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('themeMode') || 'auto';
    const savedContrast = localStorage.getItem('contrast') || 'normal';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedReduceMotion = localStorage.getItem('reduceMotion') === 'true';
    const savedAccentColor = localStorage.getItem('accentColor') || '#0d9486';
    
    setThemeMode(savedTheme);
    setContrast(savedContrast);
    setFontSize(savedFontSize);
    setReduceMotion(savedReduceMotion);
    setAcccentColor(savedAccentColor);
    
    // Apply saved preferences
    applyTheme(savedTheme);
    applyContrast(savedContrast);
    applyFontSize(savedFontSize);
    applyReduceMotion(savedReduceMotion);
    applyAccentColor(savedAccentColor);
  }, []);
  
  const applyTheme = (mode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('themeMode', 'light');
    } else {
      // Auto mode - follow system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('themeMode', 'auto');
    }
  };
  
  const applyContrast = (contrastLevel) => {
    document.documentElement.setAttribute('data-contrast', contrastLevel);
    localStorage.setItem('contrast', contrastLevel);
  };
  
  const applyFontSize = (size) => {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.fontSize = sizes[size];
    localStorage.setItem('fontSize', size);
  };
  
  const applyReduceMotion = (reduce) => {
    if (reduce) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      localStorage.setItem('reduceMotion', 'true');
    } else {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      localStorage.setItem('reduceMotion', 'false');
    }
  };
  
  const applyAccentColor = (color) => {
    document.documentElement.style.setProperty('--color-accent', color);
    localStorage.setItem('accentColor', color);
  };
  
  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    applyTheme(mode);
    if (mode === 'dark' || mode === 'light') {
      onToggle?.(mode === 'dark');
    }
  };
  
  const handleContrastChange = (level) => {
    setContrast(level);
    applyContrast(level);
  };
  
  const handleFontSizeChange = (size) => {
    setFontSize(size);
    applyFontSize(size);
  };
  
  const handleReduceMotionChange = (reduce) => {
    setReduceMotion(reduce);
    applyReduceMotion(reduce);
  };
  
  const handleAccentColorChange = (color) => {
    setAcccentColor(color);
    applyAccentColor(color);
  };
  
  const resetToDefaults = () => {
    handleThemeChange('auto');
    handleContrastChange('normal');
    handleFontSizeChange('medium');
    handleReduceMotionChange(false);
    handleAccentColorChange('#0d9486');
  };
  
  const accentColors = [
    { name: 'Teal', value: '#0d9486' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' }
  ];
  
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        title="Theme Settings"
        aria-label="Theme Settings"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
      
      {/* Settings Panel */}
      {showSettings && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Panel */}
          <div className={`fixed right-4 top-20 w-80 rounded-2xl shadow-2xl z-50 transform transition-all duration-300 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <FaPalette className="text-xl text-teal-500" />
                  <h2 className="text-xl font-bold">Theme Settings</h2>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* Theme Selection */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaSun className="mr-2" />
                  Theme Mode
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg flex flex-col items-center justify-center ${themeMode === 'light' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <FaSun className="text-xl mb-2" />
                    <span className="text-sm">Light</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg flex flex-col items-center justify-center ${themeMode === 'dark' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <FaMoon className="text-xl mb-2" />
                    <span className="text-sm">Dark</span>
                  </button>
                  
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`p-4 rounded-lg flex flex-col items-center justify-center ${themeMode === 'auto' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    <FaDesktop className="text-xl mb-2" />
                    <span className="text-sm">Auto</span>
                    <span className="text-xs opacity-80 mt-1">
                      {getSystemTheme() === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Contrast Settings */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaTint className="mr-2" />
                  Contrast
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {['low', 'normal', 'high'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleContrastChange(level)}
                      className={`p-3 rounded-lg capitalize ${contrast === level ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Font Size */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaAdjust className="mr-2" />
                  Font Size
                </h3>
                <div className="flex items-center space-x-4">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`px-4 py-2 rounded-lg capitalize ${fontSize === size ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-2 border-teal-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Accent Color */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaHighlighter className="mr-2" />
                  Accent Color
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleAccentColorChange(color.value)}
                      className={`w-10 h-10 rounded-full border-2 ${accentColor === color.value ? 'border-white shadow-lg scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Additional Settings */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {reduceMotion ? <FaEyeSlash /> : <FaEye />}
                    <div>
                      <div className="font-medium">Reduce Motion</div>
                      <div className="text-sm opacity-80">Disable animations</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reduceMotion}
                      onChange={(e) => handleReduceMotionChange(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t dark:border-gray-700">
                <button
                  onClick={resetToDefaults}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center space-x-2"
                >
                  <FaSyncAlt />
                  <span>Reset All</span>
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Apply
                </button>
              </div>
              
              {/* Preview Section */}
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-sm font-medium mb-2">Preview</div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Active</span>
                  </div>
                  <button className="px-3 py-1 rounded bg-teal-600 text-white text-xs">
                    Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Keyboard Shortcut Indicator */}
      <div className="hidden md:block">
        <kbd className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Ctrl+Shift+T
        </kbd>
      </div>
    </div>
  );
};

// Add CSS for custom properties
const DarkModeCSS = () => (
  <style jsx global>{`
    :root {
      --color-accent: #0d9486;
      --animation-duration: 0.3s;
    }
    
    [data-contrast="high"] {
      --text-contrast: 8.5;
      --bg-contrast: 8.5;
    }
    
    [data-contrast="low"] {
      --text-contrast: 3.5;
      --bg-contrast: 3.5;
    }
    
    .transition-all {
      transition-duration: var(--animation-duration);
    }
    
    .bg-teal-600 {
      background-color: var(--color-accent) !important;
    }
    
    .text-teal-600 {
      color: var(--color-accent) !important;
    }
    
    .border-teal-500 {
      border-color: var(--color-accent) !important;
    }
    
    .hover\\:bg-teal-700:hover {
      background-color: color-mix(in srgb, var(--color-accent) 90%, black) !important;
    }
  `}</style>
);

// Export both component and CSS
export { DarkModeCSS };
export default DarkModeToggle;