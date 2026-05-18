"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const { firebaseUser, authLoading } = useAuth();

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <nav className="nav">
      <Link href="/" className="logo">
        <div className="logoMark" />
        <span>Clearwell</span>
      </Link>

      <div className="navLinks">
        <Link href="/" className="navLink">
          Home
        </Link>

        {authLoading ? null : firebaseUser ? (
          <>
            <Link href="/dashboard" className="navLink">
              Dashboard
            </Link>
            <Link href="/insights" className="navLink">
              Insights
            </Link>
            <Link href="/settings" className="navLink">
              Settings
            </Link>
            <Link href="/profile" className="navLink">
              Profile
            </Link>
            <button className="navLink" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="navLink">
              Login
            </Link>
            <Link href="/signup" className="navLink">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}