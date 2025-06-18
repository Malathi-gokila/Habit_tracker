import React from 'react';
// Add 'Link' to this import statement VVVV
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { AuthProvider } from './contexts/AuthContext.jsx'; // AuthProvider still comes from here
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { useAuth } from './hooks/useAuth.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AddHabitPage from './pages/AddHabitPage.jsx';
import EditHabitPage from './pages/EditHabitPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ChallengesPage from './pages/ChallengesPage.jsx';
import './App.css'; // Global styles

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log('ProtectedRoute Check - User:', user, 'Loading:', loading); // <-- ADD THIS

  if (loading) {
    console.log('ProtectedRoute: Still loading...'); // <-- Optional
    return <div className="loading-app">Loading...</div>;
  }

  if (!user) {
     console.log('ProtectedRoute: No user! Redirecting to /login'); // <-- ADD THIS
     return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User exists, rendering children.'); // <-- ADD THIS
  return children;
}

 // Wrapper to redirect authenticated users away from login/register (NO CHANGE)
function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return <div className="loading-app">Loading...</div>;
    }
    return user ? <Navigate to="/dashboard" replace /> : children;
}


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <Router>
      <ToastContainer
            position="top-right"
            autoClose={4000} // Close after 4 seconds
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored" // Use colored theme based on type (success, error, etc.)
         />
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Home page route at the root */}
              <Route path="/" element={<HomePage />} />

              {/* Public routes */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
              />
              <Route path="/add-habit" element={<ProtectedRoute><AddHabitPage /></ProtectedRoute>} />
              <Route path="/edit-habit/:id" element={<ProtectedRoute><EditHabitPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/challenges" element={<ProtectedRoute><ChallengesPage /></ProtectedRoute>} />

               {/* <Route path="/habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} /> */}

              {/* Optional: 404 Not Found Route */}
              <Route path="*" element={<div style={{ padding: '2rem', textAlign: 'center'}}><h2>404 Not Found</h2><p>Oops! This page doesn't exist.</p><Link to="/">Go Home</Link></div>} /> {/* Link is now defined */}

            </Routes>
          </main>
        </div>
      </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;