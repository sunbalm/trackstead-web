"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { authFetch } from "../../../lib/api";

export default function NewTrackerPage() {
  const router = useRouter();
  const { firebaseUser, authLoading } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [selectedType, setSelectedType] = useState("smoking");
  const [startDate, setStartDate] = useState(getNowForInput());
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldValues, setFieldValues] = useState({});
  const [customFields, setCustomFields] = useState([createBlankCustomField()]);
  const [customMilestones, setCustomMilestones] = useState([
    createBlankCustomMilestone()
  ]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplate = useMemo(() => {
    return templates.find(template => template.type === selectedType);
  }, [templates, selectedType]);

  const isCustom = selectedType === "custom";

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.push("/login");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    async function loadTemplates() {
      if (!firebaseUser) return;

      try {
        const data = await authFetch(firebaseUser, "/api/trackers/templates");
        setTemplates(data.templates || []);
      } catch (error) {
        setError(error.message || "Could not load templates.");
      }
    }

    loadTemplates();
  }, [firebaseUser]);

  useEffect(() => {
    if (!selectedTemplate) return;

    setTitle(selectedTemplate.title);
    setGoal(selectedTemplate.goal || "");

    const nextValues = {};

    selectedTemplate.fields.forEach(field => {
      nextValues[field.key] = field.value;
    });

    setFieldValues(nextValues);
  }, [selectedTemplate]);

  function updateFieldValue(key, value) {
    setFieldValues(current => ({
      ...current,
      [key]: value
    }));
  }

  function updateCustomField(index, key, value) {
    setCustomFields(current => {
      const next = [...current];

      next[index] = {
        ...next[index],
        [key]: value
      };

      return next;
    });
  }

  function addCustomField() {
    setCustomFields(current => [...current, createBlankCustomField()]);
  }

  function removeCustomField(index) {
    setCustomFields(current => {
      if (current.length === 1) {
        return [createBlankCustomField()];
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function updateCustomMilestone(index, key, value) {
    setCustomMilestones(current => {
      const next = [...current];

      next[index] = {
        ...next[index],
        [key]: value
      };

      return next;
    });
  }

  function addCustomMilestone() {
    setCustomMilestones(current => [...current, createBlankCustomMilestone()]);
  }

  function removeCustomMilestone(index) {
    setCustomMilestones(current => {
      if (current.length === 1) {
        return [createBlankCustomMilestone()];
      }

      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function buildCustomFields() {
    return customFields
      .filter(field => field.label.trim())
      .map((field, index) => ({
        key: slugify(field.label) || `field_${index + 1}`,
        label: field.label.trim(),
        type: field.type,
        value: field.value,
        unit: field.unit.trim()
      }));
  }

  function buildCustomMilestones() {
    return customMilestones
      .filter(milestone => milestone.label.trim() && milestone.amount)
      .map(milestone => ({
        label: milestone.label.trim(),
        description: milestone.description.trim(),
        unlockAfterMinutes: convertToMinutes(
          Number(milestone.amount),
          milestone.unit
        )
      }))
      .filter(milestone => milestone.unlockAfterMinutes > 0)
      .sort((a, b) => a.unlockAfterMinutes - b.unlockAfterMinutes);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isCustom) {
        const data = await authFetch(firebaseUser, "/api/trackers", {
          method: "POST",
          body: JSON.stringify({
            type: "custom",
            title,
            startDate: new Date(startDate).toISOString(),
            goal,
            notes,
            fields: buildCustomFields(),
            milestones: buildCustomMilestones()
          })
        });

        router.push(`/trackers/${data.tracker._id}`);
        return;
      }

      const data = await authFetch(firebaseUser, "/api/trackers/from-template", {
        method: "POST",
        body: JSON.stringify({
          type: selectedType,
          title,
          startDate: new Date(startDate).toISOString(),
          notes,
          fieldValues
        })
      });

      router.push(`/trackers/${data.tracker._id}`);
    } catch (error) {
      setError(error.message || "Could not create tracker.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || !firebaseUser) {
    return null;
  }

  return (
    <main>
      <section className="dashboardHeader">
        <h1>Add a tracker</h1>
        <p>Choose a template, customize the details, and start tracking.</p>
      </section>

      <form className="card authCard formGrid" onSubmit={handleSubmit}>
        <div className="field">
          <label>Tracker Type</label>

          <div className="templateGrid">
            {templates.map(template => (
              <button
                key={template.type}
                type="button"
                className={
                  selectedType === template.type
                    ? "templateOption active"
                    : "templateOption"
                }
                onClick={() => setSelectedType(template.type)}
              >
                <strong>{template.title}</strong>
                <span>{template.goal}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="title">Tracker Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={event => setTitle(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="goal">Goal</label>
          <input
            id="goal"
            type="text"
            value={goal}
            onChange={event => setGoal(event.target.value)}
            placeholder="Example: Save money and stay consistent."
          />
        </div>

        <div className="field">
          <label htmlFor="startDate">Start Date & Time</label>
          <input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={event => setStartDate(event.target.value)}
            required
          />
        </div>

        {isCustom ? (
          <>
            <div className="field">
              <label>Custom Fields</label>

              <div className="customFieldEditor">
                {customFields.map((field, index) => (
                  <div className="customFieldRow" key={field.id}>
                    <div className="field">
                      <label>Label</label>
                      <input
                        value={field.label}
                        onChange={event =>
                          updateCustomField(index, "label", event.target.value)
                        }
                        placeholder="Example: Cups per day"
                      />
                    </div>

                    <div className="field">
                      <label>Type</label>
                      <select
                        value={field.type}
                        onChange={event =>
                          updateCustomField(index, "type", event.target.value)
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
                        value={field.value}
                        onChange={event =>
                          updateCustomField(index, "value", event.target.value)
                        }
                        placeholder="Example: 3"
                      />
                    </div>

                    <button
                      type="button"
                      className="removeButton"
                      onClick={() => removeCustomField(index)}
                    >
                      Remove
                    </button>

                    <div className="field">
                      <label>Unit</label>
                      <input
                        value={field.unit}
                        onChange={event =>
                          updateCustomField(index, "unit", event.target.value)
                        }
                        placeholder="Example: cups"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="smallButton"
                  onClick={addCustomField}
                >
                  Add Another Field
                </button>
              </div>
            </div>

            <div className="field">
              <label>Custom Milestones</label>

              <div className="milestoneEditor">
                {customMilestones.map((milestone, index) => (
                  <div className="milestoneEditorRow" key={milestone.id}>
                    <div className="field">
                      <label>Label</label>
                      <input
                        value={milestone.label}
                        onChange={event =>
                          updateCustomMilestone(
                            index,
                            "label",
                            event.target.value
                          )
                        }
                        placeholder="Example: 1 Week"
                      />
                    </div>

                    <div className="field">
                      <label>After</label>
                      <input
                        type="number"
                        min="1"
                        value={milestone.amount}
                        onChange={event =>
                          updateCustomMilestone(
                            index,
                            "amount",
                            event.target.value
                          )
                        }
                        placeholder="7"
                      />
                    </div>

                    <div className="field">
                      <label>Unit</label>
                      <select
                        value={milestone.unit}
                        onChange={event =>
                          updateCustomMilestone(index, "unit", event.target.value)
                        }
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="removeButton"
                      onClick={() => removeCustomMilestone(index)}
                    >
                      Remove
                    </button>

                    <div className="field">
                      <label>Description</label>
                      <input
                        value={milestone.description}
                        onChange={event =>
                          updateCustomMilestone(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Example: One week of progress."
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="smallButton"
                  onClick={addCustomMilestone}
                >
                  Add Another Milestone
                </button>
              </div>
            </div>
          </>
        ) : selectedTemplate?.fields?.length ? (
          <div className="field">
            <label>Details</label>

            <div className="fieldGrid">
              {selectedTemplate.fields.map(field => (
                <div className="field" key={field.key}>
                  <label htmlFor={field.key}>
                    {field.label}
                    {field.unit ? ` (${field.unit})` : ""}
                  </label>
                  <input
                    id={field.key}
                    type={field.type === "number" ? "number" : "text"}
                    value={fieldValues[field.key] ?? ""}
                    onChange={event =>
                      updateFieldValue(field.key, event.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows="4"
            value={notes}
            onChange={event => setNotes(event.target.value)}
          />
        </div>

        {error ? <div className="error">{error}</div> : null}

        <div className="actionsRow">
          <button className="button" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Tracker"}
          </button>
        </div>
      </form>
    </main>
  );
}

function getNowForInput() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offsetMs);

  return localDate.toISOString().slice(0, 16);
}

function createBlankCustomField() {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "number",
    value: "",
    unit: ""
  };
}

function createBlankCustomMilestone() {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: "",
    unit: "days",
    description: ""
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function convertToMinutes(amount, unit) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const unitMap = {
    minutes: 1,
    hours: 60,
    days: 1440,
    weeks: 10080,
    months: 43200,
    years: 525600
  };

  return amount * (unitMap[unit] || 1);
}