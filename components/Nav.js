"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const { firebaseUser, authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className="nav">
      <Link href="/" className="logo" onClick={closeMenu}>
        <img src="/icons/icon-512.png" alt="Trackstead logo" />
        <span>Trackstead</span>
      </Link>

      <button
        type="button"
        className="mobileMenuButton"
        onClick={() => setMenuOpen(current => !current)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={menuOpen ? "navLinks open" : "navLinks"}>
        {authLoading ? null : firebaseUser ? (
          <>
            <Link href="/dashboard" className="navLink" onClick={closeMenu}>
              Dashboard
            </Link>

            <Link href="/insights" className="navLink" onClick={closeMenu}>
              Insights
            </Link>

            <Link href="/settings" className="navLink" onClick={closeMenu}>
              Settings
            </Link>

            <Link href="/profile" className="navLink" onClick={closeMenu}>
              Profile
            </Link>

            <button className="navLink" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="navLink" onClick={closeMenu}>
              Login
            </Link>

            <Link href="/signup" className="navLink" onClick={closeMenu}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}