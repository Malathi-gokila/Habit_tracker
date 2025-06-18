// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import './Navbar.css'; // Create this CSS file

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login'); // Redirect to login after logout
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-brand">
//         <Link to={user ? "/dashboard" : "/"}>🚀 Habit Quest</Link>
//       </div>
//       <div className="navbar-links">
//         {user ? (
//           <>
//             <span>Welcome, {user.username}! (Level {user.level})</span>
//             <Link to="/dashboard">Dashboard</Link>
//             {/* <Link to="/habits">Manage Habits</Link> */}
//             {/* <Link to="/profile">Profile</Link> */}
//             <button onClick={handleLogout} className="logout-button">Logout</button>
//           </>
//         ) : (
//           <>
//             <Link to="/login">Login</Link>
//             <Link to="/register">Register</Link>
//           </>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

// src/components/Layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import ThemeToggle from '../UI/ThemeToggle.jsx'; // <-- Import ThemeToggle
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Brand always links to Home page */}
        <Link to="/">🚀 Habit Quest</Link>
      </div>
      <div className="navbar-links">
         {/* Home link is always visible */}
         <Link to="/">Home</Link>

        {user ? (
          // Links shown when LOGGED IN
          <>
            <span className="welcome-message">Hi, {user.username}! <br/>(Lv. {user.level})</span>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/challenges">Challenges</Link>
            {/* Add links to Manage Habits, Profile etc. here later */}
            {/* <Link to="/habits">Manage Habits</Link> */}
            {/* <Link to="/profile">Profile</Link> */}
            <ThemeToggle /> {/* <-- Add the toggle button */}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          // Links shown when LOGGED OUT
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;