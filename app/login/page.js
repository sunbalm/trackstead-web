"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { useState } from "react";
import { auth, googleProvider } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  function updateField(event) {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not login.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleSubmitting(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not continue with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <main className="authShell">
      <section className="card authCard">
        <h1>Welcome back</h1>
        <p>Login to view your Clearwell dashboard.</p>

        <button
          type="button"
          className="googleButton"
          onClick={handleGoogleLogin}
          disabled={googleSubmitting || submitting}
        >
          <span className="googleMark">G</span>
          {googleSubmitting ? "Connecting..." : "Continue with Google"}
        </button>

        <div className="authDivider">or</div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </div>

<div className="field">
  <label htmlFor="password">Password</label>
  <input
    id="password"
    name="password"
    type="password"
    value={form.password}
    onChange={updateField}
    required
  />
  <Link href="/forgot-password" style={{ color: "var(--accent-dark)", fontWeight: 800 }}>
    Forgot password?
  </Link>
</div>

          {error ? <div className="error">{error}</div> : null}

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ marginTop: 18 }}>
          Need an account? <Link href="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}