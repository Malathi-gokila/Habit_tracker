// src/components/UI/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import './ThemeToggle.css'; // Create this CSS file

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle-button theme-${theme}`}
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
      aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      <span className="icon sun">☀️</span>
      <span className="icon moon">🌙</span>
    </button>
  );
};

export default ThemeToggle;