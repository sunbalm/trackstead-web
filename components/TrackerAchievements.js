"use client";

import { getTrackerAchievements } from "../lib/achievements";

export default function TrackerAchievements({ tracker, entries, resets }) {
  const achievements = getTrackerAchievements(tracker, entries, resets);

  return (
    <div className="achievementGrid">
      {achievements.map(achievement => (
        <article
          key={achievement.key}
          className={
            achievement.unlocked
              ? "achievementCard unlocked"
              : "achievementCard"
          }
        >
          <div className="achievementTop">
            <div className="achievementIcon">
              {achievement.unlocked ? "✓" : "○"}
            </div>

            <strong>{achievement.title}</strong>
          </div>

          <p>{achievement.description}</p>
        </article>
      ))}
    </div>
  );
}