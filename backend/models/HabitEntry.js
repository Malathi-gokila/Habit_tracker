const mongoose = require('mongoose');

const HabitEntrySchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Store date as YYYY-MM-DD string for easy querying by day
  date: { type: String, required: true, index: true }, // e.g., "2023-10-27"
  pointsEarned: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now } // Timestamp of completion
});

// Ensure a user can only complete a specific habit once per day
HabitEntrySchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitEntry', HabitEntrySchema);