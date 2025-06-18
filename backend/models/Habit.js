const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  frequencyType: {
    type: String,
    required: true,
    enum: [
        'daily',          // Every day
        'specific_days',  // e.g., Mon, Wed, Fri
        'times_per_week', // e.g., 3 times per week
        'every_n_days'    // e.g., Every 3 days
        // Future: 'monthly', 'specific_dates'
    ],
    default: 'daily'
  }, // Keep it simple for now
  frequencyDays: [{ // Array of numbers 0 (Sun) to 6 (Sat)
    type: Number,
    min: 0,
    max: 6
  }],
  // For 'times_per_week'
  frequencyTarget: { // How many times per week
      type: Number,
      min: 1,
      max: 7
  },
  // For 'every_n_days'
  frequencyInterval: { // The 'N' value
      type: Number,
      min: 1
  },
  frequencyStartDate: {
    type: Date // The date the 'every N days' cycle started or a reference point
  },
  pointsPerCompletion: { type: Number, default: 10 },
  color: { type: String, default: '#7f9cf5' }, // Default Tailwind indigo-400
  icon: { type: String, default: '🎯' }, // Default emoji icon
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date }, // Store the date part only ideally
  createdAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
}, { timestamps: true });
// Add index on frequencyType if querying by it often
HabitSchema.index({ userId: 1, frequencyType: 1, archived: 1 });
module.exports = mongoose.model('Habit', HabitSchema);