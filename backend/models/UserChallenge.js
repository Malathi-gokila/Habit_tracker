// backend/models/UserChallenge.js
const mongoose = require('mongoose');

const UserChallengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
  status: {
    type: String,
    required: true,
    enum: ['in_progress', 'completed'], // Add 'failed' later if needed
    default: 'in_progress'
  },
  // Progress field can be flexible, but often not needed if checking live data
  // progress: {
  //   // e.g., for completions: currentCompletions: { type: Number, default: 0 }
  // },
  completedAt: { type: Date },
  lastProgressUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure a user has only one entry per challenge
UserChallengeSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
// Index for finding user's active challenges
UserChallengeSchema.index({ userId: 1, status: 1 });


module.exports = mongoose.model('UserChallenge', UserChallengeSchema);