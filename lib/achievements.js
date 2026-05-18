import {
  getElapsedParts,
  getEffectiveStartDate,
  getTrackerSummaryStats,
  getUnlockedMilestones
} from "./trackerStats";

export function getTrackerAchievements(tracker, entries = [], resets = []) {
  const effectiveStartDate = getEffectiveStartDate(tracker, resets);
  const streakElapsed = getElapsedParts(effectiveStartDate);
  const unlockedMilestones = getUnlockedMilestones(tracker);
  const moneyValue = getMoneyLikeValue(tracker);

  const achievements = [
    {
      key: "first_day",
      title: "First Day",
      description: "Completed one full day.",
      unlocked: streakElapsed.days >= 1
    },
    {
      key: "one_week",
      title: "One Week Clear",
      description: "Built a seven-day streak.",
      unlocked: streakElapsed.days >= 7
    },
    {
      key: "one_month",
      title: "One Month Strong",
      description: "Reached thirty days of progress.",
      unlocked: streakElapsed.days >= 30
    },
    {
      key: "three_months",
      title: "Season of Change",
      description: "Reached ninety days of progress.",
      unlocked: streakElapsed.days >= 90
    },
    {
      key: "first_entry",
      title: "First Log",
      description: "Added your first tracker entry.",
      unlocked: entries.length >= 1
    },
    {
      key: "ten_entries",
      title: "Consistent Logger",
      description: "Added ten tracker entries.",
      unlocked: entries.length >= 10
    },
    {
      key: "five_milestones",
      title: "Milestone Maker",
      description: "Unlocked five milestones.",
      unlocked: unlockedMilestones.length >= 5
    },
    {
      key: "hundred_saved",
      title: "$100 Reclaimed",
      description: "Reached $100 in estimated savings or net progress.",
      unlocked: moneyValue >= 100
    },
    {
      key: "reset_rebound",
      title: "Still Moving",
      description: "Logged a reset and kept tracking.",
      unlocked: resets.length >= 1 && streakElapsed.days >= 1
    },
    {
      key: "clean_slate",
      title: "Clean Slate",
      description: "No resets logged on this tracker.",
      unlocked: resets.length === 0 && streakElapsed.days >= 7
    }
  ];

  return achievements;
}

export function getUnlockedAchievements(tracker, entries = [], resets = []) {
  return getTrackerAchievements(tracker, entries, resets).filter(
    achievement => achievement.unlocked
  );
}

function getMoneyLikeValue(tracker) {
  let total = 0;

  getTrackerSummaryStats(tracker).forEach(stat => {
    if (stat.label.includes("money") || stat.label.includes("balance")) {
      const number = Number(String(stat.value).replace(/[^0-9.-]/g, ""));

      if (Number.isFinite(number)) {
        total += number;
      }
    }
  });

  return total;
}