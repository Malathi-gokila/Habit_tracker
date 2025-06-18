// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

// Export the context itself
export const AuthContext = createContext(null); // <-- Make sure this is exported

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('habitToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      console.log('AuthContext: Running initial auth check...'); // Keep logs for debugging
      const storedToken = localStorage.getItem('habitToken');
      if (storedToken) {
        console.log('AuthContext: Found token in storage.');
        setToken(storedToken);
         try {
            const { data } = await getMe();
            console.log('AuthContext: Fetched user data via getMe:', data);
            setUser(data);
        } catch (error) {
            console.error("Auth check API call failed:", error);
            localStorage.removeItem('habitToken');
            setToken(null);
            setUser(null);
        }
      } else {
          console.log('AuthContext: No token found in storage.');
      }
      setLoading(false);
      console.log('AuthContext: Initial auth check finished. Loading set to false.');
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
      setLoading(true);
      try {
          const { data } = await loginUser({ email, password });
          localStorage.setItem('habitToken', data.token);
          setToken(data.token);
          setUser(data.user);
          console.log('AuthContext: User state SET after login:', data.user);
          setLoading(false);
          return true;
      } catch (error) {
          console.error("Login error context:", error.response ? error.response.data : error.message);
          localStorage.removeItem('habitToken');
          setToken(null);
          setUser(null);
          setLoading(false);
          return false;
      }
  };


   const register = async (username, email, password) => {
       setLoading(true);
       try {
           const { data } = await registerUser({ username, email, password });
           localStorage.setItem('habitToken', data.token);
           setToken(data.token);
           setUser(data.user);
           setLoading(false);
           return true;
       } catch (error) {
           console.error("Registration error:", error.response ? error.response.data : error.message);
           // Consider clearing state/token on registration error too
           localStorage.removeItem('habitToken');
           setToken(null);
           setUser(null);
           setLoading(false);
           return false;
       }
   };


  const logout = () => {
    console.log('AuthContext: Logging out.'); // Add log
    localStorage.removeItem('habitToken');
    setToken(null);
    setUser(null);
  };

  const updateUserState = (updatedUserData) => {
      console.log('AuthContext: Updating user state locally:', updatedUserData); // Add log
      setUser(prevUser => {
          if (!prevUser) return updatedUserData; // Handle case where prevUser might be null
          return { ...prevUser, ...updatedUserData };
      });
  };

  // The value provided by the context
  const contextValue = { user, token, loading, login, logout, register, updateUserState };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// REMOVE the useAuth hook export from this file
// export const useAuth = () => useContext(AuthContext); // <-- DELETE THIS LINE