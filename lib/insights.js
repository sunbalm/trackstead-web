import { getUnlockedAchievements } from "./achievements";
import {
  getElapsedParts,
  getTrackerSummaryStats,
  getUnlockedMilestones
} from "./trackerStats";

export function getAccountInsights(trackers = [], entries = [], resets = []) {
  let milestoneCount = 0;
  let achievementCount = 0;
  let moneyValue = 0;
  let totalDaysTracked = 0;

  const trackerTypeCounts = {};

  trackers.forEach(tracker => {
    milestoneCount += getUnlockedMilestones(tracker).length;

    const trackerEntries = entries.filter(
      entry => String(entry.trackerId) === String(tracker._id)
    );

    const trackerResets = resets.filter(
      reset => String(reset.trackerId) === String(tracker._id)
    );

    achievementCount += getUnlockedAchievements(
      tracker,
      trackerEntries,
      trackerResets
    ).length;

    moneyValue += getMoneyLikeValue(tracker);

    totalDaysTracked += getElapsedParts(tracker.startDate).days;

    trackerTypeCounts[tracker.type] = (trackerTypeCounts[tracker.type] || 0) + 1;
  });

  const resetRate = trackers.length ? resets.length / trackers.length : 0;

  return {
    trackerCount: trackers.length,
    entryCount: entries.length,
    resetCount: resets.length,
    milestoneCount,
    achievementCount,
    moneyValue,
    totalDaysTracked,
    resetRate,
    trackerTypeCounts
  };
}

export function getTopTrackersByMoney(trackers = []) {
  return [...trackers]
    .map(tracker => ({
      tracker,
      value: getMoneyLikeValue(tracker)
    }))
    .filter(item => item.value !== 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function getTopTrackersByMilestones(trackers = []) {
  return [...trackers]
    .map(tracker => ({
      tracker,
      value: getUnlockedMilestones(tracker).length
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
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