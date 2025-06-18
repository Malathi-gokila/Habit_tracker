// backend/updateHabitFrequency.js (New file)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Habit = require('./models/Habit');

dotenv.config();

const updateFrequencies = async () => {
  try {
    await connectDB();
    console.log('MongoDB Connected for Update...');

    // Find all habits where frequencyType doesn't exist or is null
    const habitsToUpdate = await Habit.find({
      $or: [
        { frequencyType: { $exists: false } },
        { frequencyType: null }
      ]
    });

    if (habitsToUpdate.length === 0) {
      console.log('No habits found needing frequencyType update.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${habitsToUpdate.length} habits to update with default frequency 'daily'.`);

    // Update operation - set frequencyType to 'daily' for all found habits
    const result = await Habit.updateMany(
      { _id: { $in: habitsToUpdate.map(h => h._id) } }, // Target the specific habits found
      { $set: { frequencyType: 'daily' } } // Set the default value
    );

    console.log('Update Result:', result);
    console.log(`Successfully updated ${result.modifiedCount} habits.`);

    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
    process.exit(0);

  } catch (error) {
    console.error('Error updating habit frequencies:', error);
    try { await mongoose.disconnect(); } catch (e) { }
    process.exit(1);
  }
};

updateFrequencies();