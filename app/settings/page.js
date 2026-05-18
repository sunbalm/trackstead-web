"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageLoader from "../../components/PageLoader";
import { useAuth } from "../../components/AuthProvider";
import { useTheme } from "../../components/ThemeProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  if (authLoading || !firebaseUser) {
    return <PageLoader message="Loading settings..." />;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <h1>Settings</h1>
        <p>Customize your Clearwell experience.</p>
      </section>

      <section className="settingsGrid">
        <article className="card detailPanel">
          <h2>Theme</h2>
          <p className="mutedText">
            Choose a calm color direction for your dashboard.
          </p>

          <div className="settingOption">
            <h3>Color Theme</h3>
            <p>Your theme is saved on this device.</p>

            <div className="toggleRow">
              <button
                type="button"
                className={theme === "themeSoft" ? "button" : "button secondary"}
                onClick={() => setTheme("themeSoft")}
              >
                Soft
              </button>

              <button
                type="button"
                className={theme === "themeMint" ? "button" : "button secondary"}
                onClick={() => setTheme("themeMint")}
              >
                Mint
              </button>

              <button
                type="button"
                className={theme === "themeBlue" ? "button" : "button secondary"}
                onClick={() => setTheme("themeBlue")}
              >
                Blue
              </button>
            </div>
          </div>
        </article>

        <article className="card detailPanel">
          <h2>Account</h2>
          <p className="mutedText">
            Manage your profile, password reset, logout, and account deletion
            from your profile page.
          </p>

          <div className="actionsRow">
            <Link href="/profile" className="button">
              Profile
            </Link>

            <Link href="/dashboard" className="button secondary">
              Dashboard
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}