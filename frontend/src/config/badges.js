// export const badgeMappings = {
//     // --- Level Badges ---
//     'badge_level_10': {
//       name: "Level 10 Achiever",
//       icon: "⭐", // Star
//       description: "Reached Level 10! Keep climbing!",
//     },
  
//     // --- Streak Badges ---
//     'badge_streak_7_day': {
//       name: "Consistency Cadet",
//       icon: "🥉", // Bronze medal
//       description: "Achieved a 7-day streak on a habit!",
//     },
//     'badge_streak_30_day': {
//       name: "Streak Titan",
//       icon: "🥈", // Silver medal
//       description: "Mastered consistency with a 30-day streak!",
//     },
//     'badge_sleep_streak_5': { // Specific habit streak badge
//       name: "Sleep Champ",
//       icon: "💤", // Sleepy face
//       description: "Maintained a 5-day sleep schedule streak!",
//     },
  
//     // --- Completion Count Badges ---
//     'badge_complete_30': {
//       name: "Monthly Warrior",
//       icon: "📅", // Calendar
//       description: "Logged 30 habit completions!",
//     },
//     'badge_complete_100': {
//       name: "Habit Centurion",
//       icon: "💯", // 100 points symbol
//       description: "Completed 100 habit entries!",
//     },
//     'badge_workout_10': { // Specific habit count badge
//       name: "Fitness Beginner",
//       icon: "🏋️", // Weightlifter
//       description: "Completed 10 workout sessions!",
//     },
  
//     // --- Milestone Badges ---
//     'badge_first_habit': {
//       name: "Habit Initiator",
//       icon: "🌱", // Seedling
//       description: "Started your habit journey by creating your first habit!",
//     },
  
//     // --- XP Badges ---
//     'badge_xp_500': {
//       name: "XP Hunter",
//       icon: "💎", // Gem stone
//       description: "Earned a total of 500 XP!",
//     },
  
//     // --- Social Badges ---
//     'badge_social_invite': {
//       name: "Connector",
//       icon: "🤝", // Handshake
//       description: "Invited your first friend!",
//     },
  
//   };
  
//   // --- Helper Function ---
//   /**
//    * Safely retrieves badge details from the mapping.
//    * If the identifier isn't found, it returns a default object.
//    * @param {string} badgeIdentifier - The badge ID string (e.g., 'badge_level_10')
//    * @returns {{name: string, icon: string, description: string}}
//    */
//   export const getBadgeDetails = (badgeIdentifier) => {
//     // Return the mapped object or a default fallback
//     return badgeMappings[badgeIdentifier] || {
//       name: badgeIdentifier, // Show the identifier as name if mapping is missing
//       icon: '❔',             // Default question mark icon
//       description: 'An unknown or unmapped achievement.' // Default description
//     };
//   };
  


// src/config/badges.js

// src/config/badges.js

export const badgeMappings = {
  // --- Level Badges ---
  'badge_level_10': {
    name: "Level 10 Achiever",
    icon: "⭐", // Star
    description: "Reached Level 10! Keep climbing!",
    imageUrl: '/images/badges/level-10-achievement.png', // e.g., A shiny star
    message: "Level 10 unlocked! You're making fantastic progress!"
  },

  // --- Streak Badges ---
  'badge_streak_7_day': {
    name: "Consistency Cadet",
    icon: "🥉", // Bronze medal
    description: "Achieved a 7-day streak on a habit!",
    imageUrl: '/images/badges/streak_7d1-512.png', // e.g., A bronze medal
    message: "One week straight! That's the power of consistency building."
  },
  'badge_streak_30_day': {
    name: "Streak Titan",
    icon: "🥈", // Silver medal
    description: "Mastered consistency with a 30-day streak!",
    imageUrl: '/images/badges/streak_30d-512.png', // e.g., A silver medal
    message: "An entire month of dedication! Truly impressive focus."
  },
  'badge_sleep_streak_5': { // Specific habit streak badge
    name: "Sleep Champ",
    icon: "💤", // Sleepy face
    description: "Maintained a 5-day sleep schedule streak!",
    imageUrl: '/images/badges/moon.png', // e.g., A moon/stars image
    message: "Consistent sleep is a superpower. You're mastering it!"
  },

  // --- Completion Count Badges ---
  'badge_complete_30': {
    name: "Monthly Warrior",
    icon: "📅", // Calendar
    description: "Logged 30 habit completions!",
    imageUrl: '/images/badges/30thday.png', // e.g., A calendar with checkmarks
    message: "Thirty completions shows real commitment to your goals!"
  },
  'badge_complete_100': {
    name: "Habit Centurion",
    icon: "💯", // 100 points symbol
    description: "Completed 100 habit entries!",
    imageUrl: '/images/badges/100a.png', // e.g., A trophy or banner with 100
    message: "Wow, 100 completions! You're building amazing momentum."
  },
  'badge_workout_10': { // Specific habit count badge
    name: "Fitness Beginner",
    icon: "🏋️", // Weightlifter
    description: "Completed 10 workout sessions!",
    imageUrl: '/images/badges/workout-icon-clipart-original.png', // e.g., A dumbbell or running shoe
    message: "10 workouts logged! Keep building that strength and endurance."
  },

  // --- Milestone Badges ---
  'badge_first_habit': {
    name: "Habit Initiator",
    icon: "🌱", // Seedling
    description: "Started your habit journey by creating your first habit!",
    imageUrl: '/images/badges/3256231.png', // e.g., A small plant sprout
    message: "The first step is often the most important. Welcome aboard!"
  },

  // --- XP Badges ---
  'badge_xp_500': {
    name: "XP Hunter",
    icon: "💎", // Gem stone
    description: "Earned a total of 500 XP!",
    imageUrl: '/images/badges/gems-pile.jpg', // e.g., A sparkling gem or pile
    message: "500 XP collected! Your efforts are adding up significantly."
  },

  // --- Social Badges ---
  'badge_social_invite': {
    name: "Connector",
    icon: "🤝", // Handshake
    description: "Invited your first friend!",
    imageUrl: '/images/badges/friend.png', // e.g., Network lines or people icons
    message: "Growing the community! Habits are often better together."
  },
  // ... add imageUrl and message for ALL your other badges
};

// --- Helper Function (No changes needed) ---
export const getBadgeDetails = (badgeIdentifier) => {
  const details = badgeMappings[badgeIdentifier];
  // Provide fallback image/message if mapping or properties are missing
  return details ? {
    name: details.name || badgeIdentifier,
    icon: details.icon || '❔',
    description: details.description || 'An unknown achievement.',
    imageUrl: details.imageUrl || '/images/badges/default_badge.png', // Default image
    message: details.message || 'Congratulations on your achievement!' // Default message
  } : {
    name: badgeIdentifier,
    icon: '❔',
    description: 'An unknown achievement.',
    imageUrl: '/images/badges/default_badge.png',
    message: 'Congratulations on your achievement!'
  };
};