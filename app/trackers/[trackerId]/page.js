"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "../../../components/PageLoader";
import TrackerEntryForm from "../../../components/TrackerEntryForm";
import TrackerEntryList from "../../../components/TrackerEntryList";
import SimpleEntryChart from "../../../components/SimpleEntryChart";
import TrackerResetForm from "../../../components/TrackerResetForm";
import TrackerResetList from "../../../components/TrackerResetList";
import TrackerAchievements from "../../../components/TrackerAchievements";
import { useAuth } from "../../../components/AuthProvider";
import { authFetch } from "../../../lib/api";
import { getEntryBasedSummary } from "../../../lib/entryStats";
import { getTrackerDisplay } from "../../../lib/trackerDisplay";
import {
  formatCurrentStreak,
  formatElapsed,
  getElapsedParts,
  getNextMilestone,
  getTrackerSummaryStats,
  getUnlockedMilestones
} from "../../../lib/trackerStats";

export default function TrackerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [entries, setEntries] = useState([]);
  const [resets, setResets] = useState([]);
  const [loadingTracker, setLoadingTracker] = useState(true);
  const [entrySubmitting, setEntrySubmitting] = useState(false);
  const [entryUpdateSubmitting, setEntryUpdateSubmitting] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [, setNowTick] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadTrackerData() {
      if (!firebaseUser || !params.trackerId) return;

      try {
        const [trackerData, entryData, resetData] = await Promise.all([
          authFetch(firebaseUser, `/api/trackers/${params.trackerId}`),
          authFetch(firebaseUser, `/api/tracker-entries/${params.trackerId}`),
          authFetch(firebaseUser, `/api/tracker-resets/${params.trackerId}`)
        ]);

        setTracker(trackerData.tracker);
        setEntries(entryData.entries || []);
        setResets(resetData.resets || []);
      } catch (error) {
        setError(error.message || "Could not load tracker.");
      } finally {
        setLoadingTracker(false);
      }
    }

    loadTrackerData();
  }, [firebaseUser, params.trackerId]);

  async function archiveTracker() {
    const confirmed = window.confirm(
      "Archive this tracker? It will be removed from your dashboard."
    );

    if (!confirmed) return;

    try {
      await authFetch(firebaseUser, `/api/trackers/${tracker._id}`, {
        method: "DELETE"
      });

      router.push("/dashboard");
    } catch (error) {
      setError(error.message || "Could not archive tracker.");
    }
  }

  async function duplicateTracker() {
    try {
      const data = await authFetch(
        firebaseUser,
        `/api/trackers/${tracker._id}/duplicate`,
        {
          method: "POST"
        }
      );

      router.push(`/trackers/${data.tracker._id}/edit`);
    } catch (error) {
      setError(error.message || "Could not duplicate tracker.");
    }
  }

  async function addEntry(entryPayload) {
    setEntrySubmitting(true);
    setError("");

    try {
      const data = await authFetch(
        firebaseUser,
        `/api/tracker-entries/${tracker._id}`,
        {
          method: "POST",
          body: JSON.stringify(entryPayload)
        }
      );

      setEntries(current => [data.entry, ...current]);
    } catch (error) {
      setError(error.message || "Could not add entry.");
    } finally {
      setEntrySubmitting(false);
    }
  }

  async function updateEntry(entryId, entryPayload) {
    setEntryUpdateSubmitting(true);
    setError("");

    try {
      const data = await authFetch(
        firebaseUser,
        `/api/tracker-entries/${tracker._id}/${entryId}`,
        {
          method: "PUT",
          body: JSON.stringify(entryPayload)
        }
      );

      setEntries(current =>
        current.map(entry => (entry._id === entryId ? data.entry : entry))
      );
    } catch (error) {
      setError(error.message || "Could not update entry.");
    } finally {
      setEntryUpdateSubmitting(false);
    }
  }

  async function deleteEntry(entryId) {
    const confirmed = window.confirm("Delete this entry?");

    if (!confirmed) return;

    try {
      await authFetch(
        firebaseUser,
        `/api/tracker-entries/${tracker._id}/${entryId}`,
        {
          method: "DELETE"
        }
      );

      setEntries(current => current.filter(entry => entry._id !== entryId));
    } catch (error) {
      setError(error.message || "Could not delete entry.");
    }
  }

  async function addReset(resetPayload) {
    const confirmed = window.confirm(
      "Log a reset for this tracker? Your history stays saved, but your current streak will restart from this reset."
    );

    if (!confirmed) return;

    setResetSubmitting(true);
    setError("");

    try {
      const data = await authFetch(
        firebaseUser,
        `/api/tracker-resets/${tracker._id}`,
        {
          method: "POST",
          body: JSON.stringify(resetPayload)
        }
      );

      setResets(current => [data.reset, ...current]);
    } catch (error) {
      setError(error.message || "Could not log reset.");
    } finally {
      setResetSubmitting(false);
    }
  }

  async function quickResetTracker() {
    const confirmed = window.confirm(
      "Reset this tracker now? Your history will stay saved, but your current streak will restart from this moment."
    );

    if (!confirmed) return;

    setResetSubmitting(true);
    setError("");

    try {
      const data = await authFetch(
        firebaseUser,
        `/api/tracker-resets/${tracker._id}`,
        {
          method: "POST",
          body: JSON.stringify({
            resetDate: new Date().toISOString(),
            reason: "Quick reset",
            notes: "Tracker was reset from the quick reset button."
          })
        }
      );

      setResets(current => [data.reset, ...current]);
    } catch (error) {
      setError(error.message || "Could not reset tracker.");
    } finally {
      setResetSubmitting(false);
    }
  }

  async function deleteReset(resetId) {
    const confirmed = window.confirm("Delete this reset?");

    if (!confirmed) return;

    try {
      await authFetch(
        firebaseUser,
        `/api/tracker-resets/${tracker._id}/${resetId}`,
        {
          method: "DELETE"
        }
      );

      setResets(current => current.filter(reset => reset._id !== resetId));
    } catch (error) {
      setError(error.message || "Could not delete reset.");
    }
  }

  if (authLoading || !firebaseUser) {
    return <PageLoader message="Loading tracker..." />;
  }

  if (loadingTracker) {
    return <PageLoader message="Loading tracker..." />;
  }

  if (error || !tracker) {
    return (
      <main>
        <section className="card emptyState">
          <h2>Tracker not found</h2>
          <p>{error || "Could not load this tracker."}</p>
          <Link href="/dashboard" className="button">
            Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  const elapsed = getElapsedParts(tracker.startDate);
  const unlocked = getUnlockedMilestones(tracker);
  const nextMilestone = getNextMilestone(tracker);
  const summaryStats = getTrackerSummaryStats(tracker);
  const entrySummaryStats = getEntryBasedSummary(tracker, entries);
  const chartFieldKey = getChartFieldKey(tracker);
  const display = getTrackerDisplay(tracker.type);

  return (
    <main>
      <section className="dashboardHeader">
        <div className="trackerHeroIcon">{display.icon}</div>

        <div className="trackerMeta" style={{ marginBottom: 12 }}>
          <span className="trackerTypeBadge">{display.label}</span>
        </div>

        <h1>{tracker.title}</h1>
        <p>{tracker.goal || "Track your progress one day at a time."}</p>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="detailGrid">
        <div className="card detailPanel">
          <h2>Progress</h2>

          <div className="statGrid">
            <div className="statBox">
              <strong>{formatElapsed(tracker.startDate)}</strong>
              <span>total time tracked</span>
            </div>

            <div className="statBox">
              <strong>{formatCurrentStreak(tracker, resets)}</strong>
              <span>current streak</span>
            </div>

            <div className="statBox">
              <strong>{elapsed.days}</strong>
              <span>total days</span>
            </div>

            <div className="statBox">
              <strong>{unlocked.length}</strong>
              <span>milestones unlocked</span>
            </div>

            <div className="statBox">
              <strong>{nextMilestone ? nextMilestone.label : "Complete"}</strong>
              <span>next milestone</span>
            </div>

            {summaryStats.map(stat => (
              <div className="statBox" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}

            {entrySummaryStats.map(stat => (
              <div className="statBox" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          {chartFieldKey ? (
            <>
              <h3 style={{ marginTop: 24 }}>Entry Chart</h3>
              <SimpleEntryChart
                entries={entries}
                fieldKey={chartFieldKey}
                title={getChartTitle(tracker)}
              />
            </>
          ) : null}

          {tracker.fields?.length ? (
            <>
              <h3 style={{ marginTop: 24 }}>Details</h3>

              <div className="fieldGrid">
                {tracker.fields.map(field => (
                  <div className="statBox" key={field.key}>
                    <strong>
                      {field.value}
                      {field.unit && field.unit !== "USD"
                        ? ` ${field.unit}`
                        : ""}
                      {field.unit === "USD" ? " USD" : ""}
                    </strong>
                    <span>{field.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {tracker.notes ? (
            <>
              <h3 style={{ marginTop: 24 }}>Notes</h3>
              <p className="mutedText">{tracker.notes}</p>
            </>
          ) : null}

          <div className="actionsRow" style={{ marginTop: 24 }}>
            <Link href={`/trackers/${tracker._id}/edit`} className="button">
              Edit Tracker
            </Link>

            <button
              type="button"
              className="button secondary"
              onClick={duplicateTracker}
            >
              Duplicate
            </button>

            <button
              type="button"
              className="dangerButton"
              onClick={quickResetTracker}
              disabled={resetSubmitting}
            >
              {resetSubmitting ? "Resetting..." : "Reset Streak"}
            </button>

            <button
              type="button"
              className="dangerButton"
              onClick={archiveTracker}
            >
              Archive
            </button>
          </div>
        </div>

        <div className="card detailPanel">
          <h2>Milestones</h2>

          {tracker.milestones?.length ? (
            <div className="milestoneList">
              {tracker.milestones.map(milestone => {
                const isUnlocked =
                  elapsed.totalMinutes >= milestone.unlockAfterMinutes;

                return (
                  <article
                    key={milestone.label}
                    className={
                      isUnlocked ? "milestoneItem unlocked" : "milestoneItem"
                    }
                  >
                    <strong>
                      {isUnlocked ? "Unlocked: " : "Locked: "}
                      {milestone.label}
                    </strong>
                    <p>{milestone.description}</p>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mutedText">
              This tracker does not have milestones yet.
            </p>
          )}
        </div>
      </section>

      <section className="card detailPanel" style={{ marginBottom: 18 }}>
        <h2>Achievements</h2>
        <TrackerAchievements tracker={tracker} entries={entries} resets={resets} />
      </section>

      <section className="detailGrid">
        <div className="card detailPanel">
          <h2>Add Entry</h2>
          <p className="mutedText">
            Log a new update for this tracker. These entries create your history
            over time.
          </p>

          <TrackerEntryForm
            tracker={tracker}
            onSubmit={addEntry}
            submitting={entrySubmitting}
          />
        </div>

        <div className="card detailPanel">
          <h2>Entry History</h2>

          <TrackerEntryList
            tracker={tracker}
            entries={entries}
            onDelete={deleteEntry}
            onUpdate={updateEntry}
            updateSubmitting={entryUpdateSubmitting}
          />
        </div>
      </section>

      <section className="detailGrid">
        <div className="card detailPanel dangerZone">
          <h2>Log Reset</h2>
          <p className="mutedText">
            A reset records a slip without deleting your tracker history. Your
            current streak will restart from the reset date.
          </p>

          <TrackerResetForm onSubmit={addReset} submitting={resetSubmitting} />
        </div>

        <div className="card detailPanel">
          <h2>Reset History</h2>
          <TrackerResetList resets={resets} onDelete={deleteReset} />
        </div>
      </section>
    </main>
  );
}

function getChartFieldKey(tracker) {
  if (tracker.type === "weight") return "currentWeight";
  if (tracker.type === "workout") return "durationMinutes";
  if (tracker.type === "calories") return "estimatedDailyCalories";
  if (tracker.type === "finance") return "amount";

  const firstNumberField = tracker.fields?.find(field => field.type === "number");

  return firstNumberField?.key || null;
}

function getChartTitle(tracker) {
  if (tracker.type === "weight") return "Weight over time";
  if (tracker.type === "workout") return "Workout minutes over time";
  if (tracker.type === "calories") return "Calories over time";
  if (tracker.type === "finance") return "Transaction amount over time";

  return "Progress over time";
}