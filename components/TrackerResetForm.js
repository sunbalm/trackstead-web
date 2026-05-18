"use client";

import { useState } from "react";

export default function TrackerResetForm({ onSubmit, submitting }) {
  const [resetDate, setResetDate] = useState(getNowForInput());
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      resetDate: new Date(resetDate).toISOString(),
      reason,
      notes
    });

    setResetDate(getNowForInput());
    setReason("");
    setNotes("");
  }

  return (
    <form className="resetForm" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="resetDate">Reset Date & Time</label>
        <input
          id="resetDate"
          type="datetime-local"
          value={resetDate}
          onChange={event => setResetDate(event.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="reason">Reason</label>
        <input
          id="reason"
          value={reason}
          onChange={event => setReason(event.target.value)}
          placeholder="Example: Stress, craving, social event"
        />
      </div>

      <div className="field">
        <label htmlFor="resetNotes">Notes</label>
        <textarea
          id="resetNotes"
          rows="3"
          value={notes}
          onChange={event => setNotes(event.target.value)}
        />
      </div>

      <button className="dangerButton" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Log Reset"}
      </button>
    </form>
  );
}

function getNowForInput() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}