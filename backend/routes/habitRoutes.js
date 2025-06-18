// backend/routes/habitRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Habit = require('../models/Habit');
const HabitEntry = require('../models/HabitEntry');
const User = require('../models/User');
const Challenge = require('../models/Challenge'); // Import Challenge
const UserChallenge = require('../models/UserChallenge'); // Import UserChallenge
const { getYesterdayDateString, getTodayDateString, getDateString } = require('../utils/dateUtils'); // Ensure getDateString is exported if used

const router = express.Router();

// --- Define SPECIFIC routes FIRST ---

// @route   GET /api/habits/today
// @desc    Get habits relevant for today + their completion status
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
      // --- Date Setup (using UTC methods for consistency in calculations) ---
      const nowUTC = new Date();
      const todayUTCStart = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));
      const todayStr = todayUTCStart.toISOString().split('T')[0]; // YYYY-MM-DD (UTC date)

      // Get local day for specific_days check (adjusts for timezone offset)
      const todayLocal = new Date(Date.now() - nowUTC.getTimezoneOffset() * 60000);
      const currentDayOfWeek = todayLocal.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

      // Calculate start of the week (assuming Sunday is start, day 0) based on UTC start of today
      const startOfWeek = new Date(todayUTCStart);
      startOfWeek.setUTCDate(todayUTCStart.getUTCDate() - currentDayOfWeek); // Go back to Sunday
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

      console.log(`Backend: /today - Checking for UTC Date: ${todayStr}, Local DayOfWeek: ${currentDayOfWeek}, StartOfWeek UTC: ${startOfWeekStr}`);
      // --- End Date Setup ---

      // Find user's active habits
      const userHabits = await Habit.find({ userId: req.user.id, archived: false }).lean();

      // Filter habits to find those due today
      const habitsDueToday = userHabits.filter(habit => {
        // Log habit details at the start of each iteration
        console.log(` -> Checking Habit: ${habit.name} (ID: ${habit._id}), Type: ${habit.frequencyType}`);

        let isDue = false; // Determine if due within the switch
        switch (habit.frequencyType) {
            case 'daily':
                isDue = true; // SHOULD ALWAYS BE TRUE
                console.log(`    Type Daily: isDue=true`);
                break;
            case 'specific_days':
                // currentDayOfWeek is 5 (Friday)
                const includesToday = habit.frequencyDays && habit.frequencyDays.includes(currentDayOfWeek);
                isDue = !!includesToday;
                console.log(`    Type Specific Days: frequencyDays=${JSON.stringify(habit.frequencyDays)}, currentDay=${currentDayOfWeek}, includesToday=${includesToday}, isDue=${isDue}`);
                break; // Ensure break is here
            case 'every_n_days':
                if (!habit.frequencyStartDate || !habit.frequencyInterval || habit.frequencyInterval < 1) {
                     console.log(`    Type Every N Days: Invalid config.`);
                     isDue = false;
                } else {
                    // --- Double-check Date Normalization ---
                    const startDateUTC = new Date(habit.frequencyStartDate); // Get the stored date
                    startDateUTC.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight

                    // todayUTCStart is already normalized to UTC midnight earlier in the route
                    // const todayUTCStart = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate()));

                    const diffTime = todayUTCStart.getTime() - startDateUTC.getTime();
                    if (diffTime < 0) { // Start date is in the future
                        isDue = false;
                         console.log(`    Type Every N Days: StartDate ${startDateUTC.toISOString()} is in the future. isDue=false`);
                    } else {
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const remainder = diffDays % habit.frequencyInterval;
                        isDue = (remainder === 0);
                        console.log(`    Type Every N Days: StartDate=${startDateUTC.toISOString()}, Interval=${habit.frequencyInterval}, DiffDays=${diffDays}, Remainder=${remainder}, isDue=${isDue}`);
                    }
                    // --- End Date Check ---
                }
                break; // Ensure break is here
            case 'times_per_week':
                 isDue = true; // Always included initially
                 console.log(`    Type Times Per Week: isDue=true (initially)`);
                 break; // Ensure break is here
            default:
                 console.log(`    Type Unknown or Missing: '${habit.frequencyType}'. isDue=false`);
                 isDue = false;
        }
        console.log(` -> Habit ${habit.name} ${isDue ? 'IS' : 'IS NOT'} due today.`); // Log final decision
        return isDue; // Return the calculated boolean
    });
      console.log(`Backend: /today - Found ${habitsDueToday.length} habits potentially due today out of ${userHabits.length}`);

      if (habitsDueToday.length === 0) {
          return res.json([]);
      }

      // Get completion status for habits due today
      const habitIdsDueToday = habitsDueToday.map(h => h._id);
      // Fetch entries for THIS WEEK for 'times_per_week' calculation (using UTC week start/today)
      const entriesThisWeek = await HabitEntry.find({
          userId: req.user.id,
          habitId: { $in: habitIdsDueToday },
          date: { $gte: startOfWeekStr, $lte: todayStr } // Compare against UTC dates stored as YYYY-MM-DD
      }).lean();

      // Map entries for easy lookup
      const todaysEntriesMap = new Map(); // Map<habitId, entryObject> for today
      const weekCountsMap = new Map(); // Map<habitId, count> for this week

      entriesThisWeek.forEach(entry => {
           if (entry.date === todayStr) {
              todaysEntriesMap.set(entry.habitId.toString(), entry);
           }
           const count = (weekCountsMap.get(entry.habitId.toString()) || 0) + 1;
           weekCountsMap.set(entry.habitId.toString(), count);
      });
      console.log(`Backend: /today - Found ${todaysEntriesMap.size} entries for today. Weekly counts calculated.`);


      // Prepare final response
      const habitsWithStatus = habitsDueToday.map(habit => {
          const entryToday = todaysEntriesMap.get(habit._id.toString());
          let isCompletedToday = !!entryToday;
          let weekCompletions = weekCountsMap.get(habit._id.toString()) || 0;

          return {
              ...habit,
              isCompletedToday: isCompletedToday,
              todaysEntry: entryToday || null, // Pass entry for notes feature
              weekCompletions: weekCompletions // Pass week count for display/logic
          };
      });

      res.json(habitsWithStatus);
  } catch (err) {
      console.error("Backend: Get Today's Habits Error:", err.message, err.stack);
      res.status(500).json({ message: 'Server error getting today\'s habits.' });
  }
});

// --- Define General and Parameterized Routes AFTER specific ones ---

// @route   POST /api/habits
// @desc    Create a new habit (& check for "First Step" challenge) // <-- Corrected description
// @access  Private
router.post('/', protect, async (req, res) => { // <-- KEEP THIS VERSION
  const {
    name, description, pointsPerCompletion, color, icon, // Existing
    frequencyType, frequencyDays, frequencyTarget, frequencyInterval, frequencyStartDate // New
  } = req.body;
  const userId = req.user.id;
  const habitData = { userId, name, description, pointsPerCompletion, color, icon, frequencyType };
  if (!name || !frequencyType) {
      return res.status(400).json({ message: 'Habit name and frequency type are required.' });
  }

  switch (frequencyType) {
      case 'specific_days':
          if (!frequencyDays || !Array.isArray(frequencyDays) || frequencyDays.length === 0) {
              return res.status(400).json({ message: 'Specific days must be provided for this frequency type.' });
          }
          // TODO: Validate days are 0-6
          habitData.frequencyDays = frequencyDays;
          break;
      case 'times_per_week':
           if (!frequencyTarget || frequencyTarget < 1 || frequencyTarget > 7) {
              return res.status(400).json({ message: 'Valid target completions (1-7) must be provided for times per week.' });
           }
           habitData.frequencyTarget = frequencyTarget;
           break;
      case 'every_n_days':
           if (!frequencyInterval || frequencyInterval < 1) {
               return res.status(400).json({ message: 'Valid interval (>= 1) must be provided for every N days.' });
           }
           habitData.frequencyInterval = frequencyInterval;
           // Use creation date as default start date if not provided
           habitData.frequencyStartDate = frequencyStartDate ? new Date(frequencyStartDate) : new Date();
           break;
      case 'daily':
           // No extra fields needed
           break;
      default:
           return res.status(400).json({ message: 'Invalid frequency type.' });
  }

try {
  // Check if this is the user's FIRST habit BEFORE saving
  const existingHabitCount = await Habit.countDocuments({ userId: userId });
  const isFirstHabit = existingHabitCount === 0;
  console.log(`Backend: POST /api/habits - User ${userId} has ${existingHabitCount} existing habits. Is first? ${isFirstHabit}`);

  // Create the new habit instance
  const newHabit = new Habit(habitData);
  const savedHabit = await newHabit.save();
  console.log(`Backend: POST /api/habits - Habit "${savedHabit.name}" saved successfully.`);

  // --- Check and Complete "First Step" Challenge AFTER saving ---
  let firstStepChallengeInfo = null;
  if (isFirstHabit) {
    console.log(`Backend: POST /api/habits - Attempting to complete 'First Step' challenge for user ${userId}`);
    const firstStepChallenge = await Challenge.findOne({
       isActive: true, type: 'MILESTONE', 'criteria.action': 'createHabit'
    }).lean();

    if (firstStepChallenge) {
      console.log(`Backend: Found 'First Step' challenge definition: ${firstStepChallenge._id}`);
      const existingUserChallenge = await UserChallenge.findOne({ userId: userId, challengeId: firstStepChallenge._id });

      if (!existingUserChallenge || existingUserChallenge.status !== 'completed') {
         console.log(`Backend: Completing 'First Step' challenge for user ${userId}.`);
        await UserChallenge.findOneAndUpdate(
          { userId: userId, challengeId: firstStepChallenge._id },
          { $set: { status: 'completed', completedAt: new Date() } },
          { upsert: true, new: true }
        );

        // Apply rewards
        const user = await User.findById(userId);
        if (user) {
           let challengeXpReward = firstStepChallenge.xpReward || 0;
           let newBadge = firstStepChallenge.badgeReward;
           let leveledUpByChallenge = false;
           if (challengeXpReward > 0) {
               user.xp += challengeXpReward;
               leveledUpByChallenge = user.checkForLevelUp();
           }
           if (newBadge && !user.achievements.includes(newBadge)) {
               user.achievements.push(newBadge);
           }
           await user.save();
           console.log(`Backend: Applied rewards for 'First Step' challenge. XP+${challengeXpReward}, Badge: ${newBadge}, Leveled Up: ${leveledUpByChallenge}`);
           firstStepChallengeInfo = { title: firstStepChallenge.title, xp: challengeXpReward, badge: newBadge };
        } else { console.error(`Backend: Could not find user ${userId} to apply 'First Step' challenge rewards.`); }
      } else { console.log(`Backend: User ${userId} already completed 'First Step' challenge.`); }
    } else { console.log("Backend: 'First Step' challenge definition not found or inactive."); }
  }
  // --- End "First Step" Challenge Check ---

  // Respond with created habit and challenge info
  res.status(201).json({
      habit: savedHabit,
      firstStepChallengeCompleted: firstStepChallengeInfo
  });

} catch (err) {
  console.error("Habit Creation Error (incl. Challenge Check):", err.message, err.stack);
  res.status(500).json({ message: 'Server error during habit creation' });
}
});


// @route   GET /api/habits
// @desc    Get all active habits for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => { // <-- Keep this route
try {
  const habits = await Habit.find({ userId: req.user.id, archived: false }).sort({ createdAt: -1 });
  res.json(habits);
} catch (err) {
  console.error("Get Habits Error:", err.message);
  res.status(500).json({ message: 'Server error' });
}
});

// @route   GET /api/habits/:id
// @desc    Get a single habit by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        console.log(`Backend: /:id - Received request for ID: ${req.params.id}`);
        const habit = await Habit.findById(req.params.id);

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        if (habit.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(habit);
    } catch (err) {
        console.error("Get Single Habit Error:", err.message);
        if (err.kind === 'ObjectId') {
             console.error(`Backend: /:id - ERROR - Invalid ObjectId format received: ${req.params.id}`);
             return res.status(404).json({ message: 'Habit not found (Invalid ID Format)' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
// router.put('/:id', protect, async (req, res) => {
//     const { name, description, frequency, pointsPerCompletion, color, icon } = req.body;
//     const habitFields = {};
//     if (name !== undefined) habitFields.name = name;
//     if (description !== undefined) habitFields.description = description;
//     if (frequency !== undefined) habitFields.frequency = frequency;
//     if (pointsPerCompletion !== undefined) habitFields.pointsPerCompletion = pointsPerCompletion;
//     if (color !== undefined) habitFields.color = color;
//     if (icon !== undefined) habitFields.icon = icon;

//     try {
//         let habit = await Habit.findById(req.params.id);
//         if (!habit) return res.status(404).json({ message: 'Habit not found' });
//         if (habit.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

//         habit = await Habit.findByIdAndUpdate(
//             req.params.id,
//             { $set: habitFields },
//             { new: true }
//         );
//         res.json(habit);
//     } catch (err) {
//         console.error("Update Habit Error:", err.message);
//          if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Habit not found' });
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

router.put('/:id', protect, async (req, res) => {
  const {
      name, description, pointsPerCompletion, color, icon, // Existing
      frequencyType, frequencyDays, frequencyTarget, frequencyInterval, frequencyStartDate // New frequency fields
  } = req.body;
  const habitId = req.params.id;
  const userId = req.user.id;

  const habitFields = { $set: {}, $unset: {} }; // Use $set and $unset for flexibility

  // Basic fields
  if (name !== undefined) habitFields.$set.name = name;
  if (description !== undefined) habitFields.$set.description = description;
  if (pointsPerCompletion !== undefined) habitFields.$set.pointsPerCompletion = pointsPerCompletion;
  if (color !== undefined) habitFields.$set.color = color;
  if (icon !== undefined) habitFields.$set.icon = icon;

  // --- Handle Frequency Update ---
  if (frequencyType !== undefined) {
      habitFields.$set.frequencyType = frequencyType;
      // Reset potentially irrelevant fields based on the *new* type
      habitFields.$unset = { frequencyDays: "", frequencyTarget: "", frequencyInterval: "", frequencyStartDate: "" }; // Clear all frequency detail fields initially

      // Set new specific fields based on type
      switch (frequencyType) {
           case 'specific_days':
                if (!frequencyDays || !Array.isArray(frequencyDays) || frequencyDays.length === 0) {
                   return res.status(400).json({ message: 'Specific days required.' });
                }
                habitFields.$set.frequencyDays = frequencyDays;
                delete habitFields.$unset.frequencyDays; // Don't unset the one we're setting
                break;
           case 'times_per_week':
                if (!frequencyTarget || frequencyTarget < 1 || frequencyTarget > 7) {
                   return res.status(400).json({ message: 'Valid target completions required.' });
                }
                habitFields.$set.frequencyTarget = frequencyTarget;
                delete habitFields.$unset.frequencyTarget;
                break;
           case 'every_n_days':
                if (!frequencyInterval || frequencyInterval < 1) {
                   return res.status(400).json({ message: 'Valid interval required.' });
                }
                habitFields.$set.frequencyInterval = frequencyInterval;
                // Update start date only if provided, otherwise keep old or default? Decide strategy.
                // For simplicity, let's require it on update if changing TO this type.
                if (frequencyStartDate !== undefined) {
                     habitFields.$set.frequencyStartDate = new Date(frequencyStartDate);
                } else {
                    // Maybe fetch the existing habit to preserve old start date? Or default to today?
                     habitFields.$set.frequencyStartDate = new Date(); // Default to now if not provided on update
                }
                 delete habitFields.$unset.frequencyInterval;
                 delete habitFields.$unset.frequencyStartDate;
                break;
           case 'daily':
                // No extra fields needed, all unset is fine
                break;
           default:
                return res.status(400).json({ message: 'Invalid frequency type.' });
      }
  }
  // Clean up unset if no fields are left
  if (Object.keys(habitFields.$unset).length === 0) {
      delete habitFields.$unset;
  }
  // --- End Frequency Update ---


  try {
      let habit = await Habit.findById(habitId);
      if (!habit) return res.status(404).json({ message: 'Habit not found' });
      if (habit.userId.toString() !== userId) return res.status(401).json({ message: 'Not authorized' });

       // Construct update object, removing empty $set or $unset
       const updateOperation = {};
       if (Object.keys(habitFields.$set).length > 0) updateOperation.$set = habitFields.$set;
       if (habitFields.$unset && Object.keys(habitFields.$unset).length > 0) updateOperation.$unset = habitFields.$unset;

       if (Object.keys(updateOperation).length === 0) {
           return res.json(habit); // No changes submitted
       }


      habit = await Habit.findByIdAndUpdate(
          habitId,
          updateOperation,
          { new: true, runValidators: true } // Return updated, run schema validators
      );

      res.json(habit);
  } catch (err) {
      console.error("Update Habit Error:", err.message);
      if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Habit not found' });
       // Handle validation errors
       if (err.name === 'ValidationError') {
           return res.status(400).json({ message: err.message });
       }
      res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete (archive) a habit
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit) return res.status(404).json({ message: 'Habit not found' });
        if (habit.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        // Using Soft Delete (Archive)
        habit.archived = true;
        await habit.save();
        res.json({ message: 'Habit archived successfully', habit });

    } catch (err) {
        console.error("Delete Habit Error:", err.message);
         if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Habit not found' });
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   POST /api/habits/:habitId/track
// @desc    Mark habit as completed for today (Checks LEVEL, STREAK, COUNT, XP challenges)
// @access  Private
router.post('/:habitId/track', protect, async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user.id;
  const nowUTC = new Date(); // Use UTC for consistency
  const todayUTCStart = new Date(Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate())); // DEFINED HERE
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString(); // Ensure getYesterday is imported/available
  const completionTime = new Date();

  try {
    // 1. Check if already completed today
    const existingEntry = await HabitEntry.findOne({ habitId, userId, date: todayStr });
    if (existingEntry) return res.status(400).json({ message: 'Habit already completed today' });

    // 2. Find the Habit
    const habit = await Habit.findById(habitId);
    if (!habit || habit.userId.toString() !== userId) return res.status(404).json({ message: 'Habit not found or not authorized' });

    // 3. Find the User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // --- !! Add Check for 'times_per_week' limit !! ---
    if (habit.frequencyType === 'times_per_week') {
      const startOfWeek = new Date(); // Calculate start of week like in GET /today
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0,0,0,0);
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

      const weekCompletions = await HabitEntry.countDocuments({
           userId: userId,
           habitId: habitId,
           date: { $gte: startOfWeekStr, $lte: todayStr }
      });

      if (weekCompletions >= (habit.frequencyTarget || 1)) { // Default target 1 if missing
           console.log(`Backend Track: Weekly target (${habit.frequencyTarget}) already met for habit ${habitId}.`);
           return res.status(400).json({ message: `Weekly target of ${habit.frequencyTarget} already met for this habit.` });
      }
  }
   // --- End Check ---

    // 4. Create Habit Entry
    const pointsEarned = habit.pointsPerCompletion || 10;
    const newEntry = new HabitEntry({ habitId, userId, date: todayStr, pointsEarned });
    await newEntry.save();

    // 5. Update Streak
    let newStreak = habit.currentStreak || 0;
    const lastCompletionTime = habit.lastCompletedDate; // Get the Date object

    if (lastCompletionTime) {
        const lastCompletionUTCStart = new Date(Date.UTC(lastCompletionTime.getUTCFullYear(), lastCompletionTime.getUTCMonth(), lastCompletionTime.getUTCDate()));

        // Calculate time difference in milliseconds
        const timeDiff = todayUTCStart.getTime() - lastCompletionUTCStart.getTime();
        // Calculate difference in days (integer)
        const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24)); // Use Math.round for robustness

        console.log(`Track Streak - Habit: ${habit.name}, Type: ${habit.frequencyType}, Last Completion: ${lastCompletionTime.toISOString()}, Days Diff: ${daysDiff}`);

        let streakContinued = false;
        switch (habit.frequencyType) {
            case 'daily':
              const yesterdayUTCStart = new Date(todayUTCStart); // <--- Needs todayUTCStart
                yesterdayUTCStart.setUTCDate(todayUTCStart.getUTCDate() - 1);
                const yesterdayStr = yesterdayUTCStart.toISOString().split('T')[0];
                const lastCompletedStr = getDateString(lastCompletionTime);
                // Streak continues if completed exactly 1 day ago
                streakContinued = (daysDiff === 1);
                break;
            case 'specific_days':
            case 'times_per_week': // Treat same as specific days for simple streak continuity
                // Streak continues if last completion was within the last ~7 days?
                // This is approximate - doesn't guarantee *missed* scheduled days.
                // A simple check: if completed within the last 7 days, continue.
                streakContinued = (daysDiff <= 7);
                break;
            case 'every_n_days':
                // Streak continues if completed exactly N days ago (where N is the interval)
                // This requires interval to be defined
                const interval = habit.frequencyInterval || 1; // Default to 1 if missing
                streakContinued = (daysDiff === interval);
                break;
            default:
                streakContinued = false; // Unknown type, break streak
        }

        if (streakContinued) {
            newStreak++;
            console.log(` -> Streak CONTINUED. New streak: ${newStreak}`);
        } else {
            newStreak = 1; // Reset streak if continuity condition not met
            console.log(` -> Streak RESET. New streak: 1`);
        }

        if (streakContinued) {
          newStreak++;
        } else {
          // Check if last completion was NOT today before resetting.
          // Avoids resetting if user somehow tracks twice (though initial check should prevent this)
          const lastCompletedDayStr = getDateString(lastCompletionTime);
          if (lastCompletedDayStr !== todayStr) { // todayStr needs to be defined from todayUTCStart
               newStreak = 1;
               console.log(` -> Streak RESET (daysDiff=${daysDiff}). New streak: 1`);
          } else {
               console.log(` -> Streak NOT RESET (already completed today, daysDiff=${daysDiff}). Streak: ${newStreak}`);
          }
      }
    } else {
        // First completion ever for this habit
        newStreak = 1;
        console.log(` -> First completion. New streak: 1`);
    }

    // Update habit document
    habit.currentStreak = newStreak;
    if (newStreak > (habit.longestStreak || 0)) {
        habit.longestStreak = newStreak;
    }
    habit.lastCompletedDate = completionTime; // Always update last completed timestamp
    // --- END STREAK LOGIC UPDATE ---
    user.xp += pointsEarned;
    const leveledUp = user.checkForLevelUp();
    // --- Challenge Check Logic ---
    let completedChallengesInfo = [];
    let challengeXpReward = 0;
    let newBadges = [];

    const activeChallenges = await Challenge.find({ isActive: true });
    const userChallengeStatuses = await UserChallenge.find({
         userId: userId,
         challengeId: { $in: activeChallenges.map(c => c._id) },
         status: 'in_progress'
    }).populate('challengeId');

    const userChallengesToCheck = [];
    const existingUserChallengeMap = new Map(userChallengeStatuses.map(uc => [uc.challengeId._id.toString(), uc]));

    for (const challenge of activeChallenges) {
        if (!existingUserChallengeMap.has(challenge._id.toString())) {
            const alreadyCompleted = await UserChallenge.findOne({ userId: userId, challengeId: challenge._id, status: 'completed' });
            if (!alreadyCompleted) {
                const newUserChallenge = new UserChallenge({ userId, challengeId: challenge._id });
                newUserChallenge.challengeId = challenge; // Manually populate for immediate check
                userChallengesToCheck.push(newUserChallenge);
            }
        } else {
            userChallengesToCheck.push(existingUserChallengeMap.get(challenge._id.toString()));
        }
    }

    for (const userChallenge of userChallengesToCheck) {
      const challenge = userChallenge.challengeId;
      let challengeCompletedThisTime = false;

      // Time Validity Check
      let isChallengeTimeValid = true;
      if (challenge.startDate && completionTime < challenge.startDate) isChallengeTimeValid = false;
      if (challenge.endDate && completionTime > challenge.endDate) isChallengeTimeValid = false;

      if (isChallengeTimeValid && userChallenge.status === 'in_progress') {
        // Expanded Switch for checking criteria
        switch (challenge.type) {
          case 'LEVEL':
            if (user.level >= challenge.criteria.targetLevel) challengeCompletedThisTime = true;
            break;
          case 'STREAK':
            const isRelevantHabitForStreak = !challenge.criteria.habitId || challenge.criteria.habitId.toString() === habitId;
            if (isRelevantHabitForStreak && habit.currentStreak >= challenge.criteria.streakLength) challengeCompletedThisTime = true;
            break;
          case 'COUNT':
            const countQuery = { userId: userId };
            if (challenge.criteria.habitId) countQuery.habitId = challenge.criteria.habitId;
            const currentCount = await HabitEntry.countDocuments(countQuery);
            if (currentCount >= challenge.criteria.count) challengeCompletedThisTime = true;
            break;
          case 'XP':
            if (user.xp >= challenge.criteria.totalXp) challengeCompletedThisTime = true;
            break;
          case 'MILESTONE': /* Skipped here */ break;
          case 'SOCIAL': /* Skipped here */ break;
          default: console.warn(`Unknown challenge type: ${challenge.type}`);
        }
      } // End check criteria

      // Update UserChallenge status if completed this time
      if (challengeCompletedThisTime) {
        userChallenge.status = 'completed';
        userChallenge.completedAt = completionTime;
        await userChallenge.save();

        challengeXpReward += challenge.xpReward || 0;
        if (challenge.badgeReward && !user.achievements.includes(challenge.badgeReward)) {
           newBadges.push(challenge.badgeReward);
        }
        completedChallengesInfo.push({ title: challenge.title, xp: challenge.xpReward, badge: challenge.badgeReward });
        console.log(`Challenge Completed: "${challenge.title}" by user ${userId} at ${completionTime}`);
      } else { // Handle incomplete case (save if new or update timestamp)
         if (userChallenge.isNew) {
             await userChallenge.save();
         } else if (userChallenge.status !== 'completed') {
             userChallenge.lastProgressUpdate = completionTime;
             await userChallenge.save();
         }
      }
    } // End loop through userChallengesToCheck

    // Apply challenge rewards and re-check level up
    if (challengeXpReward > 0) {
        user.xp += challengeXpReward;
        user.checkForLevelUp(); // Check level up again after challenge XP
    }
    if (newBadges.length > 0) {
        user.achievements.push(...newBadges);
    }
    // --- End Challenge Check Logic ---

    // (Optional) Original simple achievement logic - You might remove/refactor this if badges cover it
    if (newStreak >= 7 && !user.achievements.includes('7-Day Streak')) {
        user.achievements.push('7-Day Streak');
        console.log(`Achievement Unlocked: User ${user.username} earned '7-Day Streak'`);
    }
    if (habit.longestStreak >= 30 && !user.achievements.includes('30-Day Master')) {
         user.achievements.push('30-Day Master');
         console.log(`Achievement Unlocked: User ${user.username} earned '30-Day Master'`);
    }


    // Save updated Habit and User
    await habit.save();
    await user.save();

    // Return success response
    res.json({
      message: 'Habit tracked successfully!',
      habit: habit,
      user: { 
        xp: user.xp, 
        level: user.level, 
        achievements: user.achievements },
      pointsEarned: pointsEarned,
      leveledUp: leveledUp,
      completedChallenges: completedChallengesInfo,
      entry: newEntry
    });

  } catch (err) {
    console.error("Track Habit Error:", err.message, err.stack);
    res.status(500).json({ message: 'Server error while tracking habit' });
  }
});


module.exports = router;