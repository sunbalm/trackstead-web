"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "../../../components/PageLoader";
import { useAuth } from "../../../components/AuthProvider";
import { authFetch } from "../../../lib/api";
import { getTrackerDisplay } from "../../../lib/trackerDisplay";
import {
  formatElapsed,
  getNextMilestone,
  getTrackerSummaryStats,
  getUnlockedMilestones
} from "../../../lib/trackerStats";

export default function ArchivedTrackersPage() {
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();

  const [trackers, setTrackers] = useState([]);
  const [loadingTrackers, setLoadingTrackers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadArchivedTrackers() {
      if (!firebaseUser) return;

      try {
        const data = await authFetch(
          firebaseUser,
          "/api/trackers?archived=true"
        );

        setTrackers(data.trackers || []);
      } catch (error) {
        setError(error.message || "Could not load archived trackers.");
      } finally {
        setLoadingTrackers(false);
      }
    }

    loadArchivedTrackers();
  }, [firebaseUser]);

  async function restoreTracker(trackerId) {
    setError("");

    try {
      await authFetch(firebaseUser, `/api/trackers/${trackerId}/restore`, {
        method: "PUT"
      });

      setTrackers(current =>
        current.filter(tracker => tracker._id !== trackerId)
      );
    } catch (error) {
      setError(error.message || "Could not restore tracker.");
    }
  }

  if (authLoading || !firebaseUser) {
    return <PageLoader message="Loading archived trackers..." />;
  }

  if (loadingTrackers) {
    return <PageLoader message="Loading archived trackers..." />;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <div className="dashboardTopRow">
          <div>
            <h1>Archived trackers</h1>
            <p>Restore trackers you previously removed from your dashboard.</p>
          </div>

          <Link href="/dashboard" className="button secondary">
            Back to Dashboard
          </Link>
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      {trackers.length === 0 ? (
        <section className="card emptyState">
          <div className="emptyIcon">🗂️</div>
          <h2>No archived trackers</h2>
          <p>Your archived trackers will appear here.</p>
        </section>
      ) : (
        <section className="trackerGrid">
          {trackers.map(tracker => (
            <ArchivedTrackerCard
              key={tracker._id}
              tracker={tracker}
              onRestore={restoreTracker}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function ArchivedTrackerCard({ tracker, onRestore }) {
  const unlocked = getUnlockedMilestones(tracker);
  const nextMilestone = getNextMilestone(tracker);
  const summaryStats = getTrackerSummaryStats(tracker);
  const display = getTrackerDisplay(tracker.type);

  return (
    <article className="card trackerCard">
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

      <div className="actionsRow" style={{ marginTop: 18 }}>
        <button
          type="button"
          className="button"
          onClick={() => onRestore(tracker._id)}
        >
          Restore
        </button>
      </div>
    </article>
  );
}