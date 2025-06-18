// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx'; 
import './HomePage.css'; // We'll create this CSS file next

const HomePage = () => {
  const { user } = useAuth(); // Get user status to conditionally show buttons

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🚀 Welcome to Habit Quest!🚀</h1>
        <p className="tagline">Turn your goals into an epic adventure.</p>
      </header>
      <section className="home-content">
        <p>
          Track your habits, build streaks, earn XP, and level up as you conquer your daily quests.
          Gamify your self-improvement journey and make building positive habits fun and rewarding!
        </p>
        {!user ? (
          // Show Login/Register buttons if user is NOT logged in
          <div className="home-actions">
            <Link to="/login" className="btn btn-primary">Get Started (Login)</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        ) : (
          // Optionally, show a button to go to the dashboard if logged in
           <div className="home-actions">
              <Link to="/dashboard" className="btn btn-primary">View Your Dashboard</Link>
          </div>
        )}
      </section>
      {/* You could add more sections here later (features, testimonials, etc.) */}
    </div>
  );
};

export default HomePage;