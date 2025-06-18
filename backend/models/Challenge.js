// backend/models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    // --- Update Enum ---
    enum: ['LEVEL', 'STREAK', 'COUNT', 'MILESTONE', 'XP', 'SOCIAL']
    // -------------------
  },
  criteria: {
    // ... existing criteria ...
    // For COUNT type (can reuse habitId and streakLength as count)
    count: { type: Number }, // Renamed from streakLength for clarity if preferred
    // For XP type
    totalXp: { type: Number },
    // For MILESTONE/SOCIAL type
    action: { type: String }, // e.g., 'createHabit', 'inviteFriend'
    // count: { type: Number }, // Can reuse count for milestones/social too (e.g., invite 3 friends)
  },
  criteria: {
    // Common fields (some might be null depending on type)
    targetLevel: { type: Number },
    streakLength: { type: Number },
    habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', default: null },
    count: { type: Number },
    totalXp: { type: Number },
    action: { type: String },
    // Add any other specific criteria fields you might need
    // noSkips: { type: Boolean } // Example if you add noSkips logic
  },
  xpReward: { type: Number, default: 50 },
  badgeReward: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  // --- Add Time Limit Fields ---
  startDate: { type: Date }, // Optional: When the challenge becomes active
  endDate: { type: Date },   // Optional: When the challenge expires
  // --------------------------
}, { timestamps: true });

ChallengeSchema.index({ isActive: 1, startDate: 1, endDate: 1 }); // Update index

module.exports = mongoose.model('Challenge', ChallengeSchema);