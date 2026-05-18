"use client";

import { useState } from "react";

export default function TrackerEntryForm({ tracker, onSubmit, submitting }) {
  const [entryDate, setEntryDate] = useState(getNowForInput());
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState(() => {
    const initialValues = {};

    tracker.fields?.forEach(field => {
      initialValues[field.key] = "";
    });

    return initialValues;
  });

  function updateValue(key, value) {
    setValues(current => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formattedValues = (tracker.fields || [])
      .filter(field => values[field.key] !== "")
      .map(field => ({
        key: field.key,
        label: field.label,
        value: values[field.key],
        unit: field.unit || ""
      }));

    await onSubmit({
      entryDate: new Date(entryDate).toISOString(),
      values: formattedValues,
      notes
    });

    setEntryDate(getNowForInput());
    setNotes("");

    const resetValues = {};

    tracker.fields?.forEach(field => {
      resetValues[field.key] = "";
    });

    setValues(resetValues);
  }

  return (
    <form className="entryForm" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="entryDate">Entry Date & Time</label>
        <input
          id="entryDate"
          type="datetime-local"
          value={entryDate}
          onChange={event => setEntryDate(event.target.value)}
          required
        />
      </div>

      {tracker.fields?.length ? (
        <div className="fieldGrid">
          {tracker.fields.map(field => (
            <div className="field" key={field.key}>
              <label htmlFor={`entry-${field.key}`}>
                {field.label}
                {field.unit ? ` (${field.unit})` : ""}
              </label>

              <input
                id={`entry-${field.key}`}
                type={field.type === "number" ? "number" : "text"}
                value={values[field.key] ?? ""}
                onChange={event => updateValue(field.key, event.target.value)}
                placeholder={`Current ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="entryNotes">Entry Notes</label>
        <textarea
          id="entryNotes"
          rows="3"
          value={notes}
          onChange={event => setNotes(event.target.value)}
        />
      </div>

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Add Entry"}
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