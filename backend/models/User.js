const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: [{ type: String }], // Array for badge identifiers etc.
  // --- Corrected Profile Picture Field Name ---
  profilePictureUrl: { // <-- Changed to camelCase 'Url'
    type: String,
    trim: true,
    default: '/images/avatars/default_avatar.png' // Path relative to frontend public folder
  },
  // --- Removed explicit createdAt - handled by timestamps: true ---
  // createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});
// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Simple Leveling Logic (Example)
UserSchema.methods.calculateLevel = function() {
    // Example: Level up every 100 XP
    const xpRequiredForNextLevel = this.level * 100;
    return Math.floor(this.xp / 100) + 1; // Base level 1
};

UserSchema.methods.checkForLevelUp = function() {
    const newLevel = this.calculateLevel();
    if (newLevel > this.level) {
        console.log(`Level Up! User ${this.username} reached level ${newLevel}`);
        this.level = newLevel;
        // // Potentially add a 'Level X Reached' achievement
        // if (!this.achievements.includes(`Level ${newLevel}`)) {
        //     this.achievements.push(`Level ${newLevel}`);
        // }
        return true; // Indicates level up occurred
    }
    return false;
};


module.exports = mongoose.model('User', UserSchema);