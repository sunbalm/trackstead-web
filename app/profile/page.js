"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  signOut
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "../../lib/firebase";
import { authFetch } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";
import PageLoader from "../../components/PageLoader";

export default function ProfilePage() {
  const router = useRouter();
  const { firebaseUser, dbUser, authLoading } = useAuth();

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete your Clearwell account? This permanently deletes your trackers, entries, and profile data."
    );

    if (!confirmed || !firebaseUser) return;

    setDeleteError("");
    setDeleteSubmitting(true);

    try {
      await reauthenticateUser(firebaseUser, deletePassword);

      await authFetch(firebaseUser, "/api/auth/me", {
        method: "DELETE"
      });

      await deleteUser(firebaseUser);

      router.push("/");
    } catch (error) {
      setDeleteError(getDeleteAccountErrorMessage(error));
    } finally {
      setDeleteSubmitting(false);
    }
  }

if (authLoading || !firebaseUser) {

  return <PageLoader message="Loading profile..." />;

}

  const email = firebaseUser.email || dbUser?.email || "";
  const initial = email ? email[0].toUpperCase() : "C";
  const usesPasswordProvider = firebaseUser.providerData.some(
    provider => provider.providerId === "password"
  );

  return (
    <main>
      <section className="dashboardHeader">
        <h1>Your profile</h1>
        <p>Manage your Clearwell account and app settings.</p>
      </section>

      <section className="profileGrid">
        <div className="card detailPanel">
          <div className="profileAvatar">{initial}</div>

          <h2>Account</h2>
          <p className="mutedText">
            This account is connected with Firebase Authentication and linked to
            your Clearwell profile in MongoDB.
          </p>

          <div className="actionsRow" style={{ marginTop: 20 }}>
            <Link href="/dashboard" className="button">
              Dashboard
            </Link>

            <Link href="/forgot-password" className="button secondary">
              Reset Password
            </Link>

            <button
              type="button"
              className="button secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="card detailPanel">
          <h2>Profile Details</h2>

          <div className="profileInfoList">
            <div className="profileInfoItem">
              <span>Email</span>
              <strong>{email || "Not available"}</strong>
            </div>

            <div className="profileInfoItem">
              <span>Firebase UID</span>
              <strong>{firebaseUser.uid}</strong>
            </div>

            <div className="profileInfoItem">
              <span>Clearwell User ID</span>
              <strong>{dbUser?._id || "Loading..."}</strong>
            </div>

            <div className="profileInfoItem">
              <span>Account Created</span>
              <strong>
                {dbUser?.createdAt ? formatDate(dbUser.createdAt) : "Loading..."}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card detailPanel dangerZone" style={{ marginBottom: 72 }}>
        <h2>Danger Zone</h2>
        <p className="warningText">
          Deleting your account permanently removes your Clearwell profile,
          trackers, and tracker entries. This cannot be undone.
        </p>

        {usesPasswordProvider ? (
          <div className="field" style={{ maxWidth: 420 }}>
            <label htmlFor="deletePassword">Confirm Password</label>
            <input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={event => setDeletePassword(event.target.value)}
              placeholder="Enter your password"
            />
          </div>
        ) : (
          <p className="mutedText">
            You will be asked to confirm with your Google account.
          </p>
        )}

        {deleteError ? <p className="error">{deleteError}</p> : null}

        <button
          type="button"
          className="dangerButton"
          onClick={handleDeleteAccount}
          disabled={deleteSubmitting}
          style={{ marginTop: 16 }}
        >
          {deleteSubmitting ? "Deleting..." : "Delete Account"}
        </button>
      </section>
    </main>
  );
}

async function reauthenticateUser(firebaseUser, password) {
  const passwordProvider = firebaseUser.providerData.find(
    provider => provider.providerId === "password"
  );

  const googleProviderData = firebaseUser.providerData.find(
    provider => provider.providerId === "google.com"
  );

  if (passwordProvider) {
    if (!password) {
      throw new Error("Please enter your password to delete your account.");
    }

    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      password
    );

    await reauthenticateWithCredential(firebaseUser, credential);
    return;
  }

  if (googleProviderData) {
    await reauthenticateWithPopup(firebaseUser, googleProvider);
    return;
  }

  throw new Error("Could not determine how to reauthenticate this account.");
}

function getDeleteAccountErrorMessage(error) {
  if (error.code === "auth/wrong-password") {
    return "That password is incorrect.";
  }

  if (error.code === "auth/requires-recent-login") {
    return "Please log out, log back in, and try deleting your account again.";
  }

  if (error.code === "auth/popup-closed-by-user") {
    return "Google confirmation was closed before account deletion.";
  }

  return error.message || "Could not delete account.";
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(dateValue));
}