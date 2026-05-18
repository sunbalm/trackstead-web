"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/api";
import { getTrackerDisplay } from "../../lib/trackerDisplay";
import {
  getAccountInsights,
  getTopTrackersByMilestones,
  getTopTrackersByMoney
} from "../../lib/insights";

export default function InsightsPage() {
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();

  const [trackers, setTrackers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [resets, setResets] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadInsights() {
      if (!firebaseUser) return;

      try {
        const data = await authFetch(
          firebaseUser,
          "/api/trackers/summary/insights"
        );

        setTrackers(data.trackers || []);
        setEntries(data.entries || []);
        setResets(data.resets || []);
      } catch (error) {
        setError(error.message || "Could not load insights.");
      } finally {
        setLoadingInsights(false);
      }
    }

    loadInsights();
  }, [firebaseUser]);

  const insights = useMemo(
    () => getAccountInsights(trackers, entries, resets),
    [trackers, entries, resets]
  );

  const topMoney = useMemo(() => getTopTrackersByMoney(trackers), [trackers]);
  const topMilestones = useMemo(
    () => getTopTrackersByMilestones(trackers),
    [trackers]
  );

  if (authLoading || !firebaseUser) {
    return <PageLoader message="Loading insights..." />;
  }

  if (loadingInsights) {
    return <PageLoader message="Loading insights..." />;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <div className="dashboardTopRow">
          <div>
            <h1>Your insights</h1>
            <p>
              A calm overview of your trackers, logs, milestones, achievements,
              resets, and estimated progress.
            </p>
          </div>

          <Link href="/dashboard" className="button secondary">
            Dashboard
          </Link>
        </div>
      </section>

      {error ? <p className="error">{error}</p> : null}

      {trackers.length === 0 ? (
        <section className="card emptyState">
          <div className="emptyIcon">📈</div>
          <h2>No insights yet</h2>
          <p>Create your first tracker to start building insights.</p>

          <Link href="/trackers/new" className="button">
            Add Tracker
          </Link>
        </section>
      ) : (
        <>
          <section className="insightsGrid">
            <article className="card insightCard">
              <strong>{insights.trackerCount}</strong>
              <span>active trackers</span>
            </article>

            <article className="card insightCard">
              <strong>{insights.entryCount}</strong>
              <span>entries logged</span>
            </article>

            <article className="card insightCard">
              <strong>{insights.milestoneCount}</strong>
              <span>milestones unlocked</span>
            </article>

            <article className="card insightCard">
              <strong>{insights.achievementCount}</strong>
              <span>achievements earned</span>
            </article>

            <article className="card insightCard">
              <strong>${insights.moneyValue.toFixed(0)}</strong>
              <span>estimated saved / net</span>
            </article>

            <article className="card insightCard">
              <strong>{insights.resetCount}</strong>
              <span>resets logged</span>
            </article>
          </section>

          <section className="insightsTwoColumn">
            <div className="card detailPanel">
              <h2>Top money / net trackers</h2>

              {topMoney.length ? (
                <div className="rankList">
                  {topMoney.map(item => (
                    <RankItem
                      key={item.tracker._id}
                      tracker={item.tracker}
                      value={`$${item.value.toFixed(0)}`}
                    />
                  ))}
                </div>
              ) : (
                <p className="mutedText">
                  No money-based tracker progress yet.
                </p>
              )}
            </div>

            <div className="card detailPanel">
              <h2>Top milestone trackers</h2>

              {topMilestones.length ? (
                <div className="rankList">
                  {topMilestones.map(item => (
                    <RankItem
                      key={item.tracker._id}
                      tracker={item.tracker}
                      value={`${item.value} milestones`}
                    />
                  ))}
                </div>
              ) : (
                <p className="mutedText">
                  No milestones unlocked yet.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function RankItem({ tracker, value }) {
  const display = getTrackerDisplay(tracker.type);

  return (
    <Link href={`/trackers/${tracker._id}`} className="rankItem">
      <div className="rankItemTitle">
        <span>{display.icon}</span>
        <span>{tracker.title}</span>
      </div>

      <span className="rankValue">{value}</span>
    </Link>
  );
}