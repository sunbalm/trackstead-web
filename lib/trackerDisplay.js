export const trackerDisplayMap = {
  smoking: {
    icon: "🌿",
    label: "Smoking"
  },
  alcohol: {
    icon: "💧",
    label: "Alcohol"
  },
  marijuana: {
    icon: "🍃",
    label: "Marijuana"
  },
  pornography: {
    icon: "🧠",
    label: "Pornography"
  },
  social_media: {
    icon: "☁️",
    label: "Social Media"
  },
  video_games: {
    icon: "🎮",
    label: "Gaming"
  },
  fast_food: {
    icon: "🥗",
    label: "Fast Food"
  },
  television: {
    icon: "📺",
    label: "Television"
  },
  weight: {
    icon: "⚖️",
    label: "Weight"
  },
  calories: {
    icon: "🍽️",
    label: "Calories"
  },
  workout: {
    icon: "🏃",
    label: "Workout"
  },
  finance: {
    icon: "💵",
    label: "Finance"
  },
  custom: {
    icon: "✨",
    label: "Custom"
  }
};

export function getTrackerDisplay(type) {
  return (
    trackerDisplayMap[type] || {
      icon: "✨",
      label: "Tracker"
    }
  );
}