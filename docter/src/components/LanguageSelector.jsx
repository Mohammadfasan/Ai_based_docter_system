import React, { useState } from 'react';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

const LanguageSelector = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'hi', name: 'Sinhala', flag: 'Sl' },
   
  ];
  
  const currentLanguage = languages.find(lang => lang.code === currentLang);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
          darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          <FaGlobe className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
          <span className={darkMode ? 'text-gray-100' : 'text-gray-800'}>
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </div>
        <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
                alert(`Language changed to ${lang.name}`);
              }}
              className={`w-full text-left px-4 py-3 flex items-center space-x-3 hover:opacity-90 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              } ${currentLang === lang.code ? (darkMode ? 'bg-teal-900/30' : 'bg-teal-50') : ''}`}
            >
              <span>{lang.flag}</span>
              <span className={darkMode ? 'text-gray-100' : 'text-gray-800'}>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;