"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/api";
import {
  formatElapsed,
  getNextMilestone,
  getTrackerSummaryStats,
  getUnlockedMilestones
} from "../../lib/trackerStats";
import { getTrackerDisplay } from "../../lib/trackerDisplay";
import { getUnlockedAchievements } from "../../lib/achievements";

const trackerGroups = {
  all: "All Trackers",
  recovery: "Recovery",
  wellness: "Wellness",
  fitness: "Fitness",
  finance: "Finance",
  custom: "Custom"
};

const trackerTypeGroups = {
  smoking: "recovery",
  alcohol: "recovery",
  marijuana: "recovery",
  pornography: "recovery",
  social_media: "recovery",
  video_games: "recovery",
  fast_food: "recovery",
  television: "recovery",
  weight: "wellness",
  calories: "wellness",
  workout: "fitness",
  finance: "finance",
  custom: "custom"
};

const sortOptions = {
  newest: "Newest",
  oldest: "Oldest",
  alphabetical: "A-Z",
  milestones: "Most Milestones",
  money: "Most Saved / Net"
};

export default function DashboardPage() {
  const router = useRouter();
  const { firebaseUser, dbUser, authLoading } = useAuth();

  const [trackers, setTrackers] = useState([]);
  const [loadingTrackers, setLoadingTrackers] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadTrackers() {
      if (!firebaseUser) return;

      try {
        const data = await authFetch(firebaseUser, "/api/trackers");
        setTrackers(data.trackers || []);
      } catch (error) {
        console.error("Could not load trackers:", error.message);
      } finally {
        setLoadingTrackers(false);
      }
    }

    loadTrackers();
  }, [firebaseUser]);

  const filteredTrackers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matched = trackers.filter(tracker => {
      const group = trackerTypeGroups[tracker.type] || "custom";
      const matchesGroup = groupFilter === "all" || group === groupFilter;

      const searchable = [
        tracker.title,
        tracker.goal,
        tracker.type,
        ...(tracker.fields || []).map(field => field.label)
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      return matchesGroup && matchesSearch;
    });

    return sortTrackers(matched, sortBy);
  }, [trackers, search, groupFilter, sortBy]);

  const dashboardSummary = useMemo(() => {
    let milestoneCount = 0;
    let moneySaved = 0;
    let achievementCount = 0;

    trackers.forEach(tracker => {
      milestoneCount += getUnlockedMilestones(tracker).length;
      moneySaved += getMoneyLikeValue(tracker);
      achievementCount += getUnlockedAchievements(tracker).length;
    });

return {
  trackerCount: trackers.length,
  milestoneCount,
  achievementCount,
  moneySaved,
  activeCount: trackers.filter(tracker => !tracker.archived).length
};
  }, [trackers]);

  if (authLoading || !firebaseUser) {
    return <PageLoader message="Loading Clearwell..." />;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <div className="dashboardTopRow">
          <div>
            <h1>Your Clearwell dashboard</h1>
            <p>
              Welcome{dbUser?.email ? `, ${dbUser.email}` : ""}. Track habits,
              health, money, and progress from one calm place.
            </p>
          </div>

<div className="actionsRow">
  <Link href="/trackers/new" className="button">
    Add Tracker
  </Link>

  <Link href="/trackers/archived" className="button secondary">
    Archived
  </Link>
</div>
        </div>
      </section>

      {loadingTrackers ? (
        <section className="card emptyState">
          <div className="loadingPulse" />
          <h2>Loading trackers...</h2>
        </section>
      ) : trackers.length === 0 ? (
        <section className="card emptyState">
          <div className="emptyIcon">🌱</div>
          <h2>No trackers yet</h2>
          <p>
            Create your first tracker to start measuring time, money saved,
            milestones, and progress.
          </p>

          <Link href="/trackers/new" className="button">
            Add Your First Tracker
          </Link>
        </section>
      ) : (
        <>
          <section className="dashboardSummary">
            <article className="card summaryCard">
              <strong>{dashboardSummary.trackerCount}</strong>
              <span>total trackers</span>
            </article>

            <article className="card summaryCard">
              <strong>{dashboardSummary.activeCount}</strong>
              <span>active goals</span>
            </article>

            <article className="card summaryCard">
              <strong>{dashboardSummary.milestoneCount}</strong>
              <span>milestones unlocked</span>
            </article>

            <article className="card summaryCard">
              <strong>${dashboardSummary.moneySaved.toFixed(0)}</strong>
              <span>estimated saved / net</span>
            </article>

            <article className="card summaryCard">
  <strong>{dashboardSummary.achievementCount}</strong>
  <span>achievements</span>
</article>
          </section>

          <section className="dashboardControls">
            <input
              className="searchInput"
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search trackers..."
            />

            <select
              value={groupFilter}
              onChange={event => setGroupFilter(event.target.value)}
            >
              {Object.entries(trackerGroups).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={event => setSortBy(event.target.value)}
            >
              {Object.entries(sortOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  Sort: {label}
                </option>
              ))}
            </select>
          </section>

          {filteredTrackers.length === 0 ? (
            <section className="card emptyState">
              <div className="emptyIcon">🔎</div>
              <h2>No trackers match</h2>
              <p>Try a different search, filter, or sort option.</p>
            </section>
          ) : (
            <section className="trackerGrid">
              {filteredTrackers.map(tracker => (
                <TrackerCard key={tracker._id} tracker={tracker} />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}

function TrackerCard({ tracker }) {
  const unlocked = getUnlockedMilestones(tracker);
  const nextMilestone = getNextMilestone(tracker);
  const summaryStats = getTrackerSummaryStats(tracker);
  const display = getTrackerDisplay(tracker.type);

  return (
    <Link href={`/trackers/${tracker._id}`} className="card trackerCard">
      <div className="trackerTitleRow">
        <h3>{tracker.title}</h3>

        <span className="trackerTypeBadge">
          <span>{display.icon}</span>
          {display.label}
        </span>
      </div>

      <p>{tracker.goal || "Track your progress one day at a time."}</p>

      <div className="statGrid">
        <div className="statBox">
          <strong>{formatElapsed(tracker.startDate)}</strong>
          <span>time tracked</span>
        </div>

        <div className="statBox">
          <strong>{unlocked.length}</strong>
          <span>milestones</span>
        </div>

        {summaryStats.slice(0, 2).map(stat => (
          <div className="statBox" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="trackerMeta" style={{ marginTop: 16 }}>
        <span className="pill">
          Next: {nextMilestone ? nextMilestone.label : "Complete"}
        </span>
      </div>
    </Link>
  );
}

function sortTrackers(trackers, sortBy) {
  const next = [...trackers];

  if (sortBy === "oldest") {
    return next.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (sortBy === "alphabetical") {
    return next.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === "milestones") {
    return next.sort(
      (a, b) => getUnlockedMilestones(b).length - getUnlockedMilestones(a).length
    );
  }

  if (sortBy === "money") {
    return next.sort((a, b) => getMoneyLikeValue(b) - getMoneyLikeValue(a));
  }

  return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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