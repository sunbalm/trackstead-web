"use client";

export default function TrackerEntryList({ entries, onDelete }) {
  if (!entries.length) {
    return (
      <p className="mutedText">
        No entries yet. Add your first log to start building history.
      </p>
    );
  }

  return (
    <div className="entryList">
      {entries.map(entry => (
        <article className="entryItem" key={entry._id}>
          <div className="entryItemHeader">
            <div className="entryDate">{formatEntryDate(entry.entryDate)}</div>

            <button
              type="button"
              className="removeButton"
              onClick={() => onDelete(entry._id)}
            >
              Delete
            </button>
          </div>

          {entry.values?.length ? (
            <div className="entryValues">
              {entry.values.map(value => (
                <span className="entryValue" key={value.key}>
                  <span>{value.label}:</span>
                  <strong>
                    {value.value}
                    {value.unit && value.unit !== "USD" ? ` ${value.unit}` : ""}
                    {value.unit === "USD" ? " USD" : ""}
                  </strong>
                </span>
              ))}
            </div>
          ) : null}

          {entry.notes ? <p className="entryNotes">{entry.notes}</p> : null}
        </article>
      ))}
    </div>
  );
}

function formatEntryDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateValue));
}