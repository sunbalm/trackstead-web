"use client";

import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { auth } from "../../lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSent(false);
    setSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="authShell">
      <section className="card authCard">
        <h1>Reset password</h1>
        <p>
          Enter your email and Clearwell will send you a password reset link.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>

          {error ? <div className="error">{error}</div> : null}

          {sent ? (
            <div className="profileInfoItem">
              <span>Email sent</span>
              <strong>Check your inbox for a reset link.</strong>
            </div>
          ) : null}

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{ marginTop: 18 }}>
          Remembered it? <Link href="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}