"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Could not send message.");
      }

      setStatus("Your message was sent. Thank you.");
      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      setError(error.message || "Could not send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="dashboardHeader">
        <h1>Contact</h1>
        <p>
          Have a question, suggestion, bug report, or feedback about Trackstead?
          Send a message here.
        </p>
      </section>

      <section className="card authCard">
        <form className="formGrid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Your name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              value={form.subject}
              onChange={updateField}
              placeholder="What is this about?"
            />
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="7"
              value={form.message}
              onChange={updateField}
              placeholder="Write your message..."
              required
            />
          </div>

          {status ? <div className="successMessage">{status}</div> : null}
          {error ? <div className="error">{error}</div> : null}

          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>
    </main>
  );
}