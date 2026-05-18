"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { useState } from "react";
import { auth, googleProvider } from "../../lib/firebase";

export default function SignupPage() {
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
      await createUserWithEmailAndPassword(auth, form.email, form.password);
      router.push("/onboarding");
    } catch (err) {
      setError(err.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleSubmitting(true);

    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/onboarding");
    } catch (err) {
      setError(err.message || "Could not continue with Google.");
    } finally {
      setGoogleSubmitting(false);
    }
  }

  return (
    <main className="authShell">
      <section className="card authCard">
        <h1>Create account</h1>
        <p>Start building your Trackstead dashboard.</p>

        <button
          type="button"
          className="googleButton"
          onClick={handleGoogleSignup}
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
              minLength="6"
            />
          </div>

          {error ? <div className="error">{error}</div> : null}

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 18 }}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}