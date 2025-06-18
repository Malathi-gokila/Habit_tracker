// src/hooks/useAuth.jsx
import { useContext } from 'react';
// Import the actual Context object from its definition file
import { AuthContext } from '../contexts/AuthContext.jsx'; // Adjust path if needed

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Optional but recommended: throw an error if used outside the provider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // If context is null initially before user logs in, that's okay.
  // Return the context value (which might be null or contain user info)
  return context;
};

// No default export needed here