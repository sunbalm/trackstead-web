"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../components/AuthProvider";
import { authFetch } from "../../../../lib/api";

export default function EditTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();

  const [tracker, setTracker] = useState(null);
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    goal: "",
    notes: "",
    fields: [],
    milestones: []
  });

  const [loadingTracker, setLoadingTracker] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadTracker() {
      if (!firebaseUser || !params.trackerId) return;

      try {
        const data = await authFetch(
          firebaseUser,
          `/api/trackers/${params.trackerId}`
        );

        const loadedTracker = data.tracker;
        setTracker(loadedTracker);

        setForm({
          title: loadedTracker.title || "",
          startDate: toDateTimeLocalValue(loadedTracker.startDate),
          goal: loadedTracker.goal || "",
          notes: loadedTracker.notes || "",
          fields: addClientIdsToFields(loadedTracker.fields || []),
          milestones: addClientIdsToMilestones(loadedTracker.milestones || [])
        });
      } catch (error) {
        setError(error.message || "Could not load tracker.");
      } finally {
        setLoadingTracker(false);
      }
    }

    loadTracker();
  }, [firebaseUser, params.trackerId]);

  function updateFormField(event) {
    setForm(current => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function updateTrackerField(index, key, value) {
    setForm(current => {
      const nextFields = [...current.fields];

      nextFields[index] = {
        ...nextFields[index],
        [key]: value
      };

      return {
        ...current,
        fields: nextFields
      };
    });
  }

  function addTrackerField() {
    setForm(current => ({
      ...current,
      fields: [...current.fields, createBlankField()]
    }));
  }

  function removeTrackerField(index) {
    setForm(current => ({
      ...current,
      fields:
        current.fields.length === 1
          ? [createBlankField()]
          : current.fields.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function updateMilestone(index, key, value) {
    setForm(current => {
      const nextMilestones = [...current.milestones];

      nextMilestones[index] = {
        ...nextMilestones[index],
        [key]: value
      };

      return {
        ...current,
        milestones: nextMilestones
      };
    });
  }

  function addMilestone() {
    setForm(current => ({
      ...current,
      milestones: [...current.milestones, createBlankMilestone()]
    }));
  }

  function removeMilestone(index) {
    setForm(current => ({
      ...current,
      milestones:
        current.milestones.length === 1
          ? [createBlankMilestone()]
          : current.milestones.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function buildFieldsForSave() {
    return form.fields
      .filter(field => field.label.trim())
      .map((field, index) => ({
        key: field.key || slugify(field.label) || `field_${index + 1}`,
        label: field.label.trim(),
        type: field.type || "text",
        value: field.value,
        unit: field.unit || ""
      }));
  }

  function buildMilestonesForSave() {
    return form.milestones
      .filter(milestone => milestone.label.trim())
      .map(milestone => ({
        label: milestone.label.trim(),
        description: milestone.description || "",
        unlockAfterMinutes: Number(milestone.unlockAfterMinutes) || 0
      }))
      .filter(milestone => milestone.unlockAfterMinutes > 0)
      .sort((a, b) => a.unlockAfterMinutes - b.unlockAfterMinutes);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await authFetch(firebaseUser, `/api/trackers/${tracker._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          startDate: new Date(form.startDate).toISOString(),
          goal: form.goal,
          notes: form.notes,
          fields: buildFieldsForSave(),
          milestones: buildMilestonesForSave()
        })
      });

      router.push(`/trackers/${tracker._id}`);
    } catch (error) {
      setError(error.message || "Could not save tracker.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !firebaseUser) {
    return null;
  }

  if (loadingTracker) {
    return (
      <main>
        <section className="card emptyState">
          <h2>Loading tracker...</h2>
        </section>
      </main>
    );
  }

  if (error && !tracker) {
    return (
      <main>
        <section className="card emptyState">
          <h2>Tracker not found</h2>
          <p>{error}</p>
          <Link href="/dashboard" className="button">
            Back to Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="dashboardHeader">
        <h1>Edit tracker</h1>
        <p>Update your start date, goals, notes, details, and milestones.</p>
      </section>

      <form className="card authCard formGrid" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Tracker Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={updateFormField}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="startDate">Start Date & Time</label>
          <input
            id="startDate"
            name="startDate"
            type="datetime-local"
            value={form.startDate}
            onChange={updateFormField}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="goal">Goal</label>
          <input
            id="goal"
            name="goal"
            value={form.goal}
            onChange={updateFormField}
          />
        </div>

        <div className="field">
          <label>Fields</label>

          <div className="customFieldEditor">
            {form.fields.map((field, index) => (
              <div className="customFieldRow" key={field.clientId}>
                <div className="field">
                  <label>Label</label>
                  <input
                    value={field.label}
                    onChange={event =>
                      updateTrackerField(index, "label", event.target.value)
                    }
                    placeholder="Example: Cups per day"
                  />
                </div>

                <div className="field">
                  <label>Type</label>
                  <select
                    value={field.type}
                    onChange={event =>
                      updateTrackerField(index, "type", event.target.value)
                    }
                  >
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                    <option value="boolean">Yes / No</option>
                  </select>
                </div>

                <div className="field">
                  <label>Value</label>
                  <input
                    value={field.value ?? ""}
                    onChange={event =>
                      updateTrackerField(index, "value", event.target.value)
                    }
                    placeholder="Example: 3"
                  />
                </div>

                <button
                  type="button"
                  className="removeButton"
                  onClick={() => removeTrackerField(index)}
                >
                  Remove
                </button>

                <div className="field">
                  <label>Unit</label>
                  <input
                    value={field.unit || ""}
                    onChange={event =>
                      updateTrackerField(index, "unit", event.target.value)
                    }
                    placeholder="Example: cups"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              className="smallButton"
              onClick={addTrackerField}
            >
              Add Another Field
            </button>
          </div>
        </div>

        <div className="field">
          <label>Milestones</label>

          <div className="milestoneEditor">
            {form.milestones.map((milestone, index) => (
              <div className="milestoneEditorRow" key={milestone.clientId}>
                <div className="field">
                  <label>Label</label>
                  <input
                    value={milestone.label}
                    onChange={event =>
                      updateMilestone(index, "label", event.target.value)
                    }
                    placeholder="Example: 1 Week"
                  />
                </div>

                <div className="field">
                  <label>Unlock After Minutes</label>
                  <input
                    type="number"
                    min="1"
                    value={milestone.unlockAfterMinutes}
                    onChange={event =>
                      updateMilestone(
                        index,
                        "unlockAfterMinutes",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>Description</label>
                  <input
                    value={milestone.description || ""}
                    onChange={event =>
                      updateMilestone(index, "description", event.target.value)
                    }
                    placeholder="Example: One week of progress."
                  />
                </div>

                <button
                  type="button"
                  className="removeButton"
                  onClick={() => removeMilestone(index)}
                >
                  Remove
                </button>
              </div>
            ))}

            <button type="button" className="smallButton" onClick={addMilestone}>
              Add Another Milestone
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="5"
            value={form.notes}
            onChange={updateFormField}
          />
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="actionsRow">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>

          <Link href={`/trackers/${tracker._id}`} className="button secondary">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}

function toDateTimeLocalValue(dateValue) {
  const date = new Date(dateValue);
  const offsetMs = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}

function addClientIdsToFields(fields) {
  const normalizedFields = fields.length ? fields : [createBlankField()];

  return normalizedFields.map(field => ({
    ...field,
    clientId: crypto.randomUUID()
  }));
}

function addClientIdsToMilestones(milestones) {
  const normalizedMilestones = milestones.length
    ? milestones
    : [createBlankMilestone()];

  return normalizedMilestones.map(milestone => ({
    ...milestone,
    clientId: crypto.randomUUID()
  }));
}

function createBlankField() {
  return {
    clientId: crypto.randomUUID(),
    key: "",
    label: "",
    type: "number",
    value: "",
    unit: ""
  };
}

function createBlankMilestone() {
  return {
    clientId: crypto.randomUUID(),
    label: "",
    description: "",
    unlockAfterMinutes: ""
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}