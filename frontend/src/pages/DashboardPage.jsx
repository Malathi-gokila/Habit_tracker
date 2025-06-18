import React, { useState, useEffect, useCallback } from 'react';
import useRequireAuth from '../hooks/useRequireAuth';
import { getTodaysHabits } from '../services/api';
import HabitItem from '../components/Habits/HabitItem';
import ProgressBar from '../components/UI/ProgressBar';
import { useAuth } from '../hooks/useAuth.jsx'; 
import { Link } from 'react-router-dom';
import { getBadgeDetails } from '../config/badges';
import './DashboardPage.css'; // Create this CSS file

 // Function to calculate XP needed for next level (example)
const calculateXpForNextLevel = (level) => {
    return level * 100; // Matches the backend/habitItem logic
};


const DashboardPage = () => {
  console.log('%cDashboardPage: Component rendering START', 'color: blue; font-weight: bold;'); // <-- Add log

  const { user, loading: authLoading } = useRequireAuth();
  const { user: contextUser, updateUserState } = useAuth(); // Get user from context too if needed
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [error, setError] = useState('');

  const fetchHabits = useCallback(async () => {
    // Use contextUser or the user from useRequireAuth, ensure one is available
     const currentUser = contextUser || user;
     if (!currentUser) {
        console.log('DashboardPage: Fetch blocked, no user yet.');
        return;
     };

    console.log('DashboardPage: useEffect - Attempting to fetch habits...'); // <-- Add log
    setLoadingHabits(true);
    setError('');
    try {
      const { data } = await getTodaysHabits();
      console.log('DashboardPage: useEffect - Habits fetched successfully:', data); // <-- Add log
      setHabits(data);
    } catch (err) {
      console.error("DashboardPage: useEffect - Failed to fetch habits:", err); // <-- Add log
      setError('Could not load your habits for today.');
    } finally {
      setLoadingHabits(false);
      console.log('DashboardPage: useEffect - Finished fetching, loadingHabits set to false.'); // <-- Add log
    }
  }, [contextUser, user]); // Ensure dependencies are correct

   useEffect(() => {
      // Only fetch when auth is settled and user exists
      if (!authLoading && (user || contextUser)) {
          fetchHabits();
      } else {
          console.log('DashboardPage: useEffect skipped fetch (authLoading:', authLoading, 'user:', user || contextUser, ')');
      }
   }, [authLoading, user, contextUser, fetchHabits]);


  // Handler to update a single habit in the list after completion
  const handleHabitUpdate = (updatedHabit) => {
    console.log('DashboardPage: handleHabitUpdate called with:', updatedHabit);
      setHabits(prevHabits =>
          prevHabits.map(h =>
              h._id === updatedHabit._id
                  ? { ...h, ...updatedHabit, isCompletedToday: true } // Merge updates, ensure completion status is set
                  : h
          )
      );
  };

  const handleHabitDeleted = (deletedHabitId) => {
    console.log('DashboardPage: Deleting habit with ID:', deletedHabitId);
    setHabits(prevHabits => prevHabits.filter(habit => habit._id !== deletedHabitId));
  };

  console.log('%cDashboardPage: Before return statement', 'color: blue; font-weight: bold;');

  if (authLoading || !user) {
    return <div className="loading">Loading your dashboard...</div>; // Or a spinner component
  }

// --- Filter Achievements for Preview (Show only Badges) ---
  const badgesToShow = user.achievements
      ? user.achievements.filter(ach => ach.startsWith('badge_')) // Only keep strings starting with "badge_"
      : [];
  const totalBadgesToShow = badgesToShow.length;
  // ---------------------------------------------------------

   // Calculate XP progress for the current level
   const xpForNextLevel = calculateXpForNextLevel(user.level);
   // XP accumulated since the beginning of the current level
   const xpBaseForCurrentLevel = (user.level - 1) * 100;
   const xpInCurrentLevel = user.xp - xpBaseForCurrentLevel;

  return (
    <div className="dashboard-container">
      <h1>Today's Quest</h1>
      <Link to="/add-habit" className="btn btn-add-habit"> {/* Style this button */}
          + Add New Habit
        </Link>

      <div className="user-stats">
          <div className="level-badge">Level {user.level}</div>
          <ProgressBar
              value={xpInCurrentLevel}
              max={xpForNextLevel - xpBaseForCurrentLevel} // Max is the amount needed for this level (100)
              label={`XP Progress (Level ${user.level})`}
          />
           {/* --- Modified Achievements Preview (Showing Badges) --- */}
           {badgesToShow && totalBadgesToShow > 0 && (
               <div className="achievements-preview">
                   <h3>🏆 Recent Badges:</h3> {/* Updated Title */}
                   {/* Use the specific class for styling if needed */}
                   <ul className="achievements-list badge-preview-list">
                       {badgesToShow.slice(0, 5).map((badgeId) => {
                           // Get display details using the helper function
                           const details = getBadgeDetails(badgeId);
                           return (
                               // Use badgeId for the key, add title tooltip
                               <li key={badgeId} title={details.description}>
                                   {/* Display the ICON (symbol) and NAME */}
                                   <span className="preview-badge-icon">{details.icon}</span> {details.name}
                               </li>
                           );
                       })}
                       {/* Show "...and more!" based on the filtered list length */}
                       {totalBadgesToShow > 5 && <li className='more-badges'>...and {totalBadgesToShow - 5} more!</li>}
                   </ul>
               </div>
           )}
           {/* --- End Modified Achievements Preview --- */}
      </div>


      {loadingHabits ? (
        <p>Loading habits...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : habits.length === 0 ? (
        <p>No habits scheduled for today. Add some!</p> // Link to add habit page later
      ) : (
        <div className="habit-list">
          {habits.map((habit) => (
        <HabitItem
          key={habit._id}
          habit={habit} // habit now contains weekCompletions from API
          onHabitCompleted={handleHabitUpdate}
          onHabitDeleted={handleHabitDeleted}
        />
      ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;