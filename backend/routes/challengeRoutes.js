// backend/routes/challengeRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const Habit = require('../models/Habit');
const HabitEntry = require('../models/HabitEntry'); // Ensure this is imported

const router = express.Router();

// @route   GET /api/challenges
// @desc    Get active challenges and user's progress
// @access  Private
router.get('/', protect, async (req, res) => {
    console.log(`Backend: Received GET /api/challenges request from user ${req.user.id}`);
    try {
        const userId = req.user.id;
        const now = new Date();

        // --- Step 1: Get base data ---
        const activeChallenges = await Challenge.find({ isActive: true }).lean();
        const userChallengeStatuses = await UserChallenge.find({
            userId: userId,
            challengeId: { $in: activeChallenges.map(c => c._id) }
        }).lean();
        const userHabits = await Habit.find({ userId: userId, archived: false }).lean();

        // --- Step 2: Prepare lookup maps ---
        const userStatusMap = new Map(userChallengeStatuses.map(uc => [uc.challengeId.toString(), uc]));
        const habitMap = new Map(userHabits.map(h => [h._id.toString(), h]));

        // --- Step 3: Handle Async Counts for 'COUNT' challenges ---
        const countPromises = activeChallenges
            .filter(challenge => challenge.type === 'COUNT')
            .map(async (challenge) => {
                const countQuery = { userId: userId };
                if (challenge.criteria?.habitId) {
                    countQuery.habitId = challenge.criteria.habitId;
                }
                const count = await HabitEntry.countDocuments(countQuery);
                return { challengeId: challenge._id.toString(), currentCount: count };
            });

        const countResults = await Promise.all(countPromises);
        const countMap = new Map(countResults.map(res => [res.challengeId, res.currentCount]));
        console.log("Backend: Calculated counts:", Object.fromEntries(countMap));

        // --- Step 4: Final Mapping (Now Synchronous) ---
        const challengesWithProgress = activeChallenges.map(challenge => {
            try {
                const userStatus = userStatusMap.get(challenge._id.toString());
                // Initialize progressData with status from DB or default
                let progressData = {
                    current: 0,
                    target: 0,
                    status: userStatus?.status || 'not_started'
                };
                let timeStatus = 'valid'; // Default time status

                // Determine Time Status
                if (!challenge.startDate && !challenge.endDate) timeStatus = 'not_time_limited';
                else if (challenge.startDate && now < challenge.startDate) timeStatus = 'upcoming';
                else if (challenge.endDate && now > challenge.endDate) timeStatus = 'expired';

                // Check if progress calculation is allowed based on time and completion status
                const allowProgressCalc = (timeStatus === 'valid' || timeStatus === 'not_time_limited' || progressData.status === 'completed');

                // Calculate current progress value if allowed
                if (allowProgressCalc) {
                    switch (challenge.type) {
                        case 'LEVEL':
                            progressData.current = req.user?.level || 0;
                            // --- !! Potential Issue Here !! ---
                            progressData.target = challenge.criteria?.targetLevel || 0; // Is challenge.criteria or targetLevel missing?
                            // --- Check Logs ---
                            console.log(`Level Challenge ${challenge._id}: Criteria=`, challenge.criteria, `Target Set=`, progressData.target);
                            break;
                        case 'STREAK':
                             // --- !! Potential Issue Here !! ---
                            progressData.target = challenge.criteria?.streakLength || 0; // Is challenge.criteria or streakLength missing?
                            let currentMaxStreak = 0;
                            // ... (logic to calculate currentMaxStreak) ...
                            if (challenge.criteria?.habitId) {
                                const specificHabit = habitMap.get(challenge.criteria.habitId.toString());
                                currentMaxStreak = specificHabit?.currentStreak || 0;
                                console.log(` -> STREAK (Specific Habit ${challenge.criteria.habitId}): Target=${progressData.target}, Current=${currentMaxStreak}`);
                            }
                            else {
                                // --- Focus Here ---
                                console.log(" -> STREAK (Any Habit): Calculating Max Streak..."); // Add log
                                currentMaxStreak = userHabits.reduce((max, habit) => {
                                    const currentHabitStreak = habit.currentStreak || 0;
                                     console.log(` ---- Reduce check: Habit: ${habit.name}, Streak: ${currentHabitStreak}, Current Max: ${max}`); // DETAILED LOG
                                    return Math.max(max, currentHabitStreak);
                                 }, 0); // Initial max is 0
                                console.log(` -> STREAK (Any Habit): Target=${progressData.target}, Current Max Found=${currentMaxStreak}`); // CHECK THIS LOG
                            }
                            progressData.current = currentMaxStreak; // Assign result
                            break;
                        case 'COUNT':
                            // --- !! Potential Issue Here !! ---
                            progressData.target = challenge.criteria?.count || 0; // Is challenge.criteria or count missing?
                            progressData.current = countMap.get(challenge._id.toString()) ?? 0;
                             // --- Check Logs ---
                             console.log(`Count Challenge ${challenge._id}: Criteria=`, challenge.criteria, `Target Set=`, progressData.target);
                            break;
                        case 'XP':
                            // --- !! Potential Issue Here !! ---
                            progressData.target = challenge.criteria?.totalXp || 0; // Is challenge.criteria or totalXp missing?
                            progressData.current = req.user?.xp || 0;
                             // --- Check Logs ---
                             console.log(`XP Challenge ${challenge._id}: Criteria=`, challenge.criteria, `Target Set=`, progressData.target);
                            break;
                        // MILESTONE, SOCIAL types won't have progress calculated here unless stored in UserChallenge
                        case 'MILESTONE':
                        case 'SOCIAL':
                            progressData.target = challenge.criteria?.count || 1;
                            // progressData.current could be based on UserChallenge.progress if implemented
                            break;
                    }

                    // Clamp visual progress if not completed
                    // if (progressData.status !== 'completed') {
                    //     progressData.current = Math.min(progressData.current ?? 0, progressData.target ?? 0);
                    // }
                    if (progressData.status !== 'completed') {
                        const beforeClamp = progressData.current;
                        progressData.current = Math.min(progressData.current ?? 0, progressData.target ?? 0);
                        console.log(` -> Clamping Progress (Status: ${progressData.status}): Before=${beforeClamp}, Target=${progressData.target}, After=${progressData.current}`); // CHECK THIS LOG
                    } 
                    else {
                         // Ensure completed shows full progress visually
                         progressData.current = progressData.target;
                    }

                } else { // Reset visual progress if time invalid and not completed
                    if (progressData.status !== 'completed') {
                         progressData.current = 0;
                         // Still show current level even if LEVEL challenge is expired/upcoming
                         if (challenge.type === 'LEVEL') progressData.current = req.user?.level || 0;
                    }
                }

                // Return the combined object for this challenge
                return {
                    ...challenge, // Original challenge fields
                    userProgress: progressData, // Calculated progress
                    timeStatus: timeStatus // Calculated time status
                };
            } catch (mapError) {
                console.error(`Backend: Error processing challenge ${challenge?._id} in final map:`, mapError);
                return null; // Exclude challenge if error occurs during processing
            }
        }).filter(c => c !== null); // Filter out any nulls from errors


        console.log(`Backend: Preparing to send ${challengesWithProgress.length} challenges. Data sample:`, JSON.stringify(challengesWithProgress.slice(0, 1), null, 2));
        res.json(challengesWithProgress); // Send the final array

    } catch (err) {
        console.error("Backend: Get Challenges Error:", err.message, err.stack);
        res.status(500).json({ message: 'Server error' });
    }
});

// You might add other challenge-related routes here later (e.g., POST to manually join a challenge)

module.exports = router;