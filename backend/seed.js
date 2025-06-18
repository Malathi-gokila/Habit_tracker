// D:\sem6\fullstack\project\gamified-habit-tracker\backend\seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Challenge = require('./models/Challenge');
const Habit = require('./models/Habit');
const UserChallenge = require('./models/UserChallenge');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Seeding...');

    // --- Clear Data (Optional) ---
    // ... (Keep commented out unless needed) ...

    // --- Seed Prerequisites FIRST ---
    console.log('Ensuring prerequisite habits exist...');

    let testUser = await User.findOne({ username: 'Divya Maki' }); // Adjust username if needed
    let userId;
    if (!testUser) {
        console.warn('Test user "Divya Maki" not found. Cannot seed user-specific habits.');
    } else {
        userId = testUser._id;
    }

    if (userId) {
        // --- !! Remove createdAt and updatedAt from $setOnInsert !! ---
        await Habit.updateOne(
            { userId: userId, name: "Exercise" },
            { $setOnInsert: {
                userId: userId,
                name: "Exercise",
                description: "Get some exercise.",
                frequency: "daily",
                pointsPerCompletion: 20,
                color: "#f59e0b",
                icon: "💪",
                archived: false
                // createdAt: new Date(), // REMOVE
                // updatedAt: new Date()  // REMOVE
            }},
            { upsert: true }
        );
         await Habit.updateOne(
            { userId: userId, name: "Sleep by 10PM" },
            { $setOnInsert: {
                userId: userId,
                name: "Sleep by 10PM",
                description: "Go to bed on time.",
                frequency: "daily",
                pointsPerCompletion: 15,
                color: "#6366f1",
                icon: "🌙",
                archived: false
                // createdAt: new Date(), // REMOVE
                // updatedAt: new Date()  // REMOVE
            }},
            { upsert: true }
        );
        console.log('Prerequisite habits ensured for user:', userId);
    } else {
        console.log('Skipping prerequisite habit creation (no user ID found).');
    }
    // --- End Timestamp Removal ---

    // --- Now Find Habits Again ---
    const workoutHabit = await Habit.findOne({ name: 'Exercise', userId: userId });
    const sleepHabit = await Habit.findOne({ name: 'Sleep by 10PM', userId: userId });
    console.log('Found workoutHabit after ensuring:', !!workoutHabit);
    console.log('Found sleepHabit after ensuring:', !!sleepHabit);

    // --- Seed Challenges ---
    console.log('Seeding Challenges...');
    const challengesToSeed = [
        // 1. Reach Level 10
        {
          title: "Level Master", description: "Reach Level 10 by staying consistent!", type: "LEVEL",
          criteria: { targetLevel: 10 },
          xpReward: 200,
          badgeReward: "badge_level_10", // Badge ID
          isActive: true,
        },
        // 2. 30-Day Streak on ANY habit
        {
          title: "Streak Titan", description: "Maintain a 30-day streak on any single habit.", type: "STREAK",
          criteria: { habitId: null, streakLength: 30 },
          xpReward: 300,
          badgeReward: "badge_streak_30_day", // Badge ID
          isActive: true,
        },
        // 3. Complete 100 habits total
        {
          title: "Century Completer", description: "Complete any 100 habit entries.", type: "COUNT",
          criteria: { habitId: null, count: 100 },
          xpReward: 150,
          badgeReward: "badge_complete_100", // Badge ID
          isActive: true,
        },
        // 4. 5-Day Streak on a specific habit (Sleep) - Conditional
        ...(sleepHabit ? [{
          title: "Sleep Streak", description: `Maintain a 5-day streak on the '${sleepHabit.name}' habit.`, type: "STREAK",
          criteria: { habitId: sleepHabit._id, streakLength: 5 },
          xpReward: 50,
          badgeReward: "badge_sleep_streak_5", // Badge ID
          isActive: true,
        }] : []),
        // 5. Log 10 workouts - Conditional
        ...(workoutHabit ? [{
          title: "Fit Starter", description: `Complete 10 '${workoutHabit.name}' sessions.`, type: "COUNT",
          criteria: { habitId: workoutHabit._id, count: 10 },
          xpReward: 100,
          badgeReward: "badge_workout_10", // Badge ID
          isActive: true,
        }] : []),
        // 6. Create your first habit
        {
          title: "First Step", description: "Create your very first habit.", type: "MILESTONE",
          criteria: { action: "createHabit", count: 1 },
          xpReward: 25,
          badgeReward: "badge_first_habit", // Badge ID
          isActive: true,
        },
        // 7. Track a habit for 7 consecutive days
        {
          title: "No Skips!", description: "Track any habit for 7 days straight.", type: "STREAK", // Removed 'no skips' as logic isn't there
          criteria: { habitId: null, streakLength: 7 },
          xpReward: 80,
          badgeReward: "badge_streak_7_day", // Badge ID
          isActive: true,
        },
        // 8. Reach 500 XP total
        {
          title: "XP Collector", description: "Earn a total of 500 XP through habits.", type: "XP",
          criteria: { totalXp: 500 },
          xpReward: 125,
          badgeReward: "badge_xp_500", // Badge ID
          isActive: true,
        },
        // 9. Track a habit daily for an entire month (30 logs)
        {
          title: "Habit Hero", description: "Log any habit 30 times.", type: "COUNT",
          criteria: { habitId: null, count: 30 },
          xpReward: 200,
          badgeReward: "badge_complete_30", // Badge ID
          isActive: true,
        },
        // 10. Invite a friend
        {
          title: "Social Starter", description: "Invite your first friend to the app.", type: "SOCIAL",
          criteria: { action: "inviteFriend", count: 1 },
          xpReward: 50,
          badgeReward: "badge_social_invite", // Badge ID
          isActive: true,
        },
      ].filter(Boolean); // Filter out any null/false entries from conditional logic

    // Clear and Insert challenges
    if (challengesToSeed.length > 0) {
        console.log('Clearing existing challenges before re-seeding...');
        await Challenge.deleteMany({});
        console.log('Inserting new challenges...');
        const result = await Challenge.insertMany(challengesToSeed);
        console.log(`${result.length} Challenges Seeded Successfully!`);
    } else {
        console.log('No challenges were prepared for seeding (check prerequisites).');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
    process.exit(0);

  } catch (error) {
    console.error('Error Seeding Data:', error);
    try { await mongoose.disconnect(); } catch (e) { console.error('Error disconnecting:', e); }
    process.exit(1);
  }
};

seedData();