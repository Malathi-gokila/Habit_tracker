// src/components/Habits/HabitItem.jsx
import React, { useState } from 'react';
import { trackHabit, deleteHabit } from '../../services/api'; // Import deleteHabit
import { useAuth } from '../../hooks/useAuth.jsx';
import { Link, useNavigate } from 'react-router-dom'; // Import Link/useNavigate for Edit
import { toast } from 'react-toastify';
import { getBadgeDetails } from '../../config/badges'; // Adjust path as needed
import './HabitItem.css';

// Function to calculate XP needed for next level (example)
const calculateXpForNextLevel = (level) => {
    return level * 100; // Matches the backend logic
};

const levelUpSound = new Audio(`${import.meta.env.BASE_URL}sounds/level-up.mp3`);
levelUpSound.volume = 1; // Adjust volume if needed

const HabitItem = ({ habit, onHabitCompleted, onHabitDeleted }) => {
  const [isCompleted, setIsCompleted] = useState(habit.isCompletedToday);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false); // Specific loading state for completing
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);   // Specific loading state for deleting
  const [error, setError] = useState('');
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate(); // For programmatic navigation (optional)

  // --- Handler for Marking Habit Complete ---
  const handleComplete = async () => {
    // Prevent action if already completed or another action is loading
    if (isCompleted || isLoadingComplete || isLoadingDelete) return;

    // Set the correct loading state
    setIsLoadingComplete(true); // <-- CORRECTED
    setError('');
    try {
      const { data } = await trackHabit(habit._id);
      console.log('Track response:', data);
      setIsCompleted(true); // Optimistic update


      // --- Level Up Check & Notification ---
      if (data.leveledUp && data.user) { // Check if leveledUp is true in response
        // Play sound
        levelUpSound.play().catch(e => console.error("Error playing sound:", e)); // Play and catch potential errors

        // Show toast notification
        toast.success(
           <div>
              🎉 **LEVEL UP!** 🎉<br />
              You reached **Level {data.user.level}!** Keep crushing it!
           </div>,
           {
              icon: "🥳", // Add a fun icon
              // You can add more custom options here
           }
        );

        // Optional: Trigger a brief visual effect on the item itself
        // Could add a temporary class here
      }

      // --- !! NEW: Challenge Completion Check !! ---
      if (data.completedChallenges && data.completedChallenges.length > 0) {
        data.completedChallenges.forEach(challengeInfo => {
             // Get badge details for the toast
             const badgeDetails = challengeInfo.badge ? getBadgeDetails(challengeInfo.badge) : null;
    
             toast.info( // Or toast.success
                <div>
                    🏆 **CHALLENGE COMPLETE!** 🏆<br />
                    You conquered: **{challengeInfo.title}**!
                    {/* Display badge prominently if earned */}
                    {badgeDetails && <div>Earned Badge: {badgeDetails.icon} {badgeDetails.name}!</div>}
                    {/* Display XP reward */}
                    {challengeInfo.xp > 0 && <div>+{challengeInfo.xp} XP</div>}
                </div>,
                { icon: badgeDetails ? badgeDetails.icon : "🏅" } // Use badge icon or default
             );
             // Optionally play a different sound for challenges/badges
        });
    }
    // --- End Challenge Check ---

      // Update global user state with new XP/Level/Achievements from response
      if (data.user) {
         updateUserState({
             xp: data.user.xp,
             level: data.user.level,
             achievements: data.user.achievements
         });
      }

      // Update local habit state for streak (optional, better if dashboard re-fetches)
       if (data.habit && onHabitCompleted) {
           onHabitCompleted(data.habit); // Pass updated habit data up
       }

      // Show feedback (e.g., "+10 XP!" notification - implement separately)
      console.log(`Completed ${habit.name}! Points: ${data.pointsEarned}, Leveled Up: ${data.leveledUp}`);

      if (data.completedChallenges?.length > 0) {
        console.log('Completed Challenges:', data.completedChallenges);
    }

    } catch (err) {
      console.error("Error tracking habit:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to track habit.');
      // Revert optimistic update if needed, though API should prevent double completion
      // setIsCompleted(false); // Consider if needed based on error type
    } finally {
      // Set the correct loading state
      setIsLoadingComplete(false); // <-- CORRECTED
    }
  };

  // --- Handler for Deleting (Archiving) Habit ---
  const handleDelete = async () => {
    if (isLoadingComplete || isLoadingDelete) return; // Prevent clicks during any loading

    // Simple browser confirmation
    if (window.confirm(`Are you sure you want to archive the habit "${habit.name}"?`)) { // Changed wording slightly
      setIsLoadingDelete(true);
      setError('');
      try {
        await deleteHabit(habit._id);
        console.log(`Habit ${habit._id} deleted (archived).`);
        // Call the callback passed from DashboardPage to update the UI state
        if (onHabitDeleted) {
          onHabitDeleted(habit._id);
        }
        // No need to navigate away, item will disappear from list
      } catch (err) {
        console.error("Error deleting habit:", err.response ? err.response.data : err.message);
        setError(err.response?.data?.message || 'Failed to delete.');
        setIsLoadingDelete(false); // Only set false on error
      }
      // Don't set loading false on success, component will unmount or be removed by parent
    }
  };

  // --- Determine if completion should be disabled ---
  let disableCompletion = isCompleted || isLoadingComplete || isLoadingDelete;
  let completionTitle = isCompleted ? 'Completed Today!' : `Complete (+${habit.pointsPerCompletion || 10} XP)`;

  if (!disableCompletion && habit.frequencyType === 'times_per_week') {
      const target = habit.frequencyTarget || 1;
      const currentWeekCompletions = habit.weekCompletions || 0; // Get from prop passed by DashboardPage
      if (currentWeekCompletions >= target) {
          disableCompletion = true; // Disable if weekly target met
          completionTitle = `Weekly target (${target}) met!`;
      } else {
          completionTitle = `Complete (${currentWeekCompletions + 1}/${target} this week)`;
      }
  }
  // --- End Disable Check ---

  // --- Edit Button Component (using Link) ---
  const editButton = (
    <Link
       to={`/edit-habit/${habit._id}`}
       className={`edit-button ${(isLoadingComplete || isLoadingDelete) ? 'disabled-link-style' : ''}`} // Add styling class if needed for disabled look
       onClick={(e) => { if (isLoadingComplete || isLoadingDelete) e.preventDefault(); }} // Prevent navigation while loading
       title="Edit Habit"
     >
       ✏️
     </Link>
   );

  // --- Calculate XP display values (optional) ---
  const xpForNextLevel = user ? calculateXpForNextLevel(user.level) : 100;
  const xpBaseForCurrentLevel = user ? (user.level - 1) * 100 : 0;
  const xpInCurrentLevel = user ? user.xp - xpBaseForCurrentLevel : 0;


  // --- Render the Component ---
  return (
    // Add deleting class for potential visual feedback
    <div className={`habit-item ${isCompleted ? 'completed' : ''} ${disableCompletion && !isCompleted ? 'target-met' : ''} ${isLoadingDelete ? 'deleting' : ''}`} style={{ borderLeftColor: habit.color || '#7f9cf5' }}>
      <div className="habit-main-content">
      {/* Habit Information */}
      <div className="habit-info">
        <span className="habit-icon">{habit.icon || '🎯'}</span>
        <span className="habit-name">{habit.name}</span>
        <span className="habit-frequency-display">({formatFrequency(habit)})</span>
        {habit.currentStreak > 0 && (
          <span className="habit-streak">🔥 {habit.currentStreak}</span>
        )}
      </div>

      {/* Action Buttons Area */}
      <div className="habit-actions">
        {error && <span className="error-text">{error}</span>}

        {/* Edit Button (only shown if not loading) */}
        {!isLoadingComplete && !isLoadingDelete && editButton}

        {/* Delete Button */}
        <button
           onClick={handleDelete}
           disabled={isLoadingComplete || isLoadingDelete} // Disable during either operation
           className="delete-button"
           title="Archive Habit" // Changed title slightly
         >
           {isLoadingDelete ? '...' : '🗑️'} {/* Show loading indicator */}
        </button>

        {/* Complete Button */}
        {/* <button
          onClick={handleComplete}
          // Disable if completed OR if complete OR delete is loading
          disabled={isCompleted || isLoadingComplete || isLoadingDelete} // <-- CORRECTED check
          className={`complete-button ${isCompleted ? 'is-completed-button' : ''}`}
          title={isCompleted ? 'Completed Today!' : `Complete (+${habit.pointsPerCompletion || 10} XP)`}
        >
          {isLoadingComplete ? '...' : (isCompleted ? '✓' : '+')}
        </button> */}

        <button
          onClick={handleComplete}
          disabled={disableCompletion} // Use calculated disable state
          className={`complete-button ${isCompleted ? 'is-completed-button' : ''}`}
          title={completionTitle} // Use dynamic title
        >
        {isLoadingComplete ? '...' : (isCompleted ? '✓' : '+')}
        </button>
      </div>
      </div>
      {/* Gamification Preview (Optional) */}
      {/* Consider hiding this or adjusting if space is tight with action buttons */}
      <div className="habit-gamification-preview">
        +{habit.pointsPerCompletion || 10} XP
        { user && ` (${xpInCurrentLevel + (habit.pointsPerCompletion || 10)} / ${xpForNextLevel - xpBaseForCurrentLevel})`}
      </div>
    </div>
  );
};
const formatFrequency = (habit) => {
  switch (habit.frequencyType) {
      case 'daily': return 'Daily';
      case 'specific_days':
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return habit.frequencyDays?.map(d => days[d]).join(', ') || 'Specific Days';
      case 'times_per_week': return `${habit.frequencyTarget || '?'}x / week`;
      case 'every_n_days': return `Every ${habit.frequencyInterval || '?'} days`;
      default: return habit.frequencyType;
  }
};
export default HabitItem;