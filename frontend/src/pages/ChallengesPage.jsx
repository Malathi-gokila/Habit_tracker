// src/pages/ChallengesPage.jsx
import React, { useState, useEffect } from 'react';
import { getChallenges } from '../services/api';
import useRequireAuth from '../hooks/useRequireAuth.jsx';
import ProgressBar from '../components/UI/ProgressBar.jsx'; // Assuming you might want this later
import './ChallengesPage.css'; // Ensure CSS file exists and is imported
import { Link } from 'react-router-dom';
// Optional: Ensure date-fns is installed: npm install date-fns
import { format, formatDistanceToNowStrict, isFuture } from 'date-fns';

// Helper function to format dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
       return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
       console.error("Error formatting date:", e);
       return "Invalid Date";
    }
};

// Helper to get remaining time
const formatRemainingTime = (endDateString) => {
     if (!endDateString) return '';
     try {
        // Check if the date is actually in the future before calculating distance
        const endDate = new Date(endDateString);
        if (!isFuture(endDate)) return '';
        return formatDistanceToNowStrict(endDate, { addSuffix: true });
     } catch (e) {
         console.error("Error formatting remaining time:", e);
         return "";
     }
 };

// --- ChallengeItem Component ---
// Defined within the same file or imported if separated
const ChallengeItem = ({ challenge }) => {
    // Destructure challenge props
    const { title, description, xpReward, badgeReward, startDate, endDate, timeStatus, userProgress, type } = challenge; // Added 'type'

    // --- Destructure userProgress with defaults for safety ---
    const { current = 0, target = 0, status = 'not_started' } = userProgress || {};
    
    const isCompleted = status === 'completed';
    // Calculate progress percentage safely
    const progressPercent = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

    return (
        <li className={`challenge-item ${isCompleted ? 'completed' : 'in-progress'} status-${timeStatus}`}>
            <div className="challenge-info">
                <h3>{title} {isCompleted && '✓'}</h3>
                <p>{description}</p>

                 {/* Time Limit Display */}
                 <div className="challenge-time-info">
                    {timeStatus === 'upcoming' && startDate && (
                        <span className="time-upcoming">Starts: {formatDate(startDate)}</span>
                    )}
                    {timeStatus === 'valid' && endDate && (
                         <span className="time-ending">Ends: {formatDate(endDate)} ({formatRemainingTime(endDate)} left)</span>
                    )}
                     {timeStatus === 'expired' && endDate && (
                        <span className="time-expired">Ended: {formatDate(endDate)}</span>
                    )}
                    {timeStatus === 'not_time_limited' && (
                        <span className="time-ongoing">Ongoing</span>
                    )}
                </div>

                {/* Progress display (Show if valid, ongoing or completed) */}
                {(timeStatus === 'valid' || timeStatus === 'not_time_limited' || isCompleted) && (
                    <div className="challenge-progress-display">
                        {/* Optional: Conditionally hide bar for LEVEL type or if target is 0 */}
                        {(type !== 'LEVEL' && type !== 'XP' && type !== 'MILESTONE' && type !== 'SOCIAL' && target > 0) && (
                            <div className="challenge-progress-bar">
                                <div style={{ width: `${progressPercent}%` }}></div>
                            </div>
                        )}
                        <span className="progress-text">
                            {isCompleted ? "Completed!" : `${current} / ${target}`}
                            {/* Add specific units based on type */}
                            {type === 'STREAK' && ` Day Streak`}
                            {type === 'LEVEL' && ` Target Level`}
                            {type === 'COUNT' && ` Completions`}
                            {type === 'XP' && ` Total XP`}
                        </span>
                    </div>
                 )}
            </div>
            {/* Rewards Display */}
            <div className="challenge-rewards">
                {xpReward > 0 && <span className="reward xp-reward">+{xpReward} XP</span>}
                {badgeReward && <span className="reward badge-reward">🏅 {badgeReward}</span>}
            </div>
        </li>
    );
};


// --- ChallengesPage Component ---
const ChallengesPage = () => {
    useRequireAuth(); // Protect the route
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChallenges = async () => {
            console.log("ChallengesPage: Starting fetchChallenges..."); // Log start
            setLoading(true);
            setError('');
            try {
                console.log("ChallengesPage: Calling getChallenges API..."); // Log before API call
                const response = await getChallenges();
                console.log("ChallengesPage: API Response Received:", response); // Log response

                if (response && response.data && Array.isArray(response.data)) {
                   console.log(`ChallengesPage: Setting ${response.data.length} challenges.`);
                   setChallenges(response.data);
                } else {
                   console.error("ChallengesPage: Invalid response structure received:", response);
                   setError('Received invalid data from server.');
                   setChallenges([]);
                }
            } catch (err) {
                console.error("ChallengesPage: Error fetching challenges:", err);
                console.error("ChallengesPage: Error Response Data:", err.response?.data);
                setError(err.response?.data?.message || 'Failed to load challenges.');
                setChallenges([]);
            } finally {
                console.log("ChallengesPage: Setting loading to false.");
                setLoading(false);
            }
        };

        fetchChallenges();
    }, []); // Fetch on mount


    return (
        <div className="challenges-container">
            <h1>Challenges & Quests</h1>

            {/* Conditional Rendering */}
            {loading ? (
                <p className="loading-text">Loading challenges...</p>
            ) : error ? (
                 <div className="error-container" style={{ padding: '1rem', textAlign: 'center' }}>
                    <p className="error-message">{error}</p>
                 </div>
            ) : challenges.length === 0 ? (
                <p className="no-challenges">No active challenges available right now.</p>
            ) : (
                // Render the list
                <ul className="challenges-list">
                    {challenges.map(challenge => (
                        // --- Add unique key prop here ---
                        <ChallengeItem key={challenge._id} challenge={challenge} />
                    ))}
                </ul>
            )}

             {/* Page Actions */}
             <div className="page-actions">
                <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </div>
        </div>
    );
};

export default ChallengesPage;