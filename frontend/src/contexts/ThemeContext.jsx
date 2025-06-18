// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Helper to get initial theme
const getInitialTheme = () => {
  // 1. Check localStorage
  const storedTheme = localStorage.getItem('appTheme');
  if (storedTheme) {
    return storedTheme;
  }
  // 2. Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  // 3. Default to light
  return 'light';
};

// Create context
export const ThemeContext = createContext({
  theme: 'light', // Default value
  toggleTheme: () => { console.warn('ThemeProvider not used!'); }, // Placeholder
});

// Create provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Effect to apply theme class to body and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Get the <html> element
    const isDark = theme === 'dark';

    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(theme); // Add 'light' or 'dark' class

    // Optionally, set data-theme attribute if preferred over class
    // document.body.setAttribute('data-theme', theme);

    localStorage.setItem('appTheme', theme); // Save preference
    console.log(`Theme changed to: ${theme}`);
  }, [theme]); // Run only when theme state changes

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy consumption
export const useTheme = () => useContext(ThemeContext);