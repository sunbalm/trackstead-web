"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { authFetch } from "../../lib/api";

const suggestedTrackers = [
  {
    type: "smoking",
    icon: "🌿",
    title: "Quit Smoking",
    description: "Track smoke-free time, money saved, cigarettes avoided, and health milestones."
  },
  {
    type: "alcohol",
    icon: "💧",
    title: "Quit Alcohol",
    description: "Track sober time, drinks avoided, money saved, and personal milestones."
  },
  {
    type: "weight",
    icon: "⚖️",
    title: "Weight Tracker",
    description: "Track weight, BMI, goal progress, and body-health entries over time."
  },
  {
    type: "workout",
    icon: "🏃",
    title: "Workout Tracker",
    description: "Log workouts, training time, steps, miles, and progress."
  },
  {
    type: "social_media",
    icon: "☁️",
    title: "Social Media Detox",
    description: "Track hours reclaimed from social media and digital distractions."
  },
  {
    type: "custom",
    icon: "✨",
    title: "Custom Tracker",
    description: "Create a flexible tracker for anything you want to measure."
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { firebaseUser, dbUser, authLoading } = useAuth();

  const [error, setError] = useState("");
  const [submittingType, setSubmittingType] = useState("");

  useEffect(() => {
  if (!authLoading && firebaseUser && dbUser?.onboardingComplete) {
    router.push("/dashboard");
  }
}, [authLoading, firebaseUser, dbUser, router]);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  async function markOnboardingComplete() {
    await authFetch(firebaseUser, "/api/auth/me/onboarding", {
      method: "PUT",
      body: JSON.stringify({
        onboardingComplete: true
      })
    });
  }

  async function chooseTracker(type) {
    setError("");
    setSubmittingType(type);

    try {
      await markOnboardingComplete();
      router.push(`/trackers/new?type=${type}`);
    } catch (error) {
      setError(error.message || "Could not continue.");
    } finally {
      setSubmittingType("");
    }
  }

  async function skipOnboarding() {
    setError("");
    setSubmittingType("skip");

    try {
      await markOnboardingComplete();
      router.push("/dashboard");
    } catch (error) {
      setError(error.message || "Could not skip onboarding.");
    } finally {
      setSubmittingType("");
    }
  }

  if (authLoading || !firebaseUser) {
    return null;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <h1>What do you want to track first?</h1>
        <p>
          Choose a starter tracker. You can add more trackers anytime from your
          dashboard.
        </p>
      </section>

      <div className="skipBox">
        <button
          type="button"
          className="button secondary"
          onClick={skipOnboarding}
          disabled={Boolean(submittingType)}
        >
          {submittingType === "skip" ? "Skipping..." : "Skip For Now"}
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <section className="onboardingGrid">
        {suggestedTrackers.map(tracker => (
          <button
            key={tracker.type}
            type="button"
            className="onboardingCard"
            onClick={() => chooseTracker(tracker.type)}
            disabled={Boolean(submittingType)}
          >
            <div className="onboardingIcon">{tracker.icon}</div>
            <h3>
              {submittingType === tracker.type
                ? "Opening..."
                : tracker.title}
            </h3>
            <p>{tracker.description}</p>
          </button>
        ))}
      </section>
    </main>
  );
}