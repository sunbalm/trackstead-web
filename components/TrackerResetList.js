"use client";

export default function TrackerResetList({ resets, onDelete }) {
  if (!resets.length) {
    return <p className="mutedText">No resets logged for this tracker.</p>;
  }

  return (
    <div className="resetList">
      {resets.map(reset => (
        <article className="resetItem" key={reset._id}>
          <strong>{formatResetDate(reset.resetDate)}</strong>

          {reset.reason ? <p>Reason: {reset.reason}</p> : null}
          {reset.notes ? <p>{reset.notes}</p> : null}

          <div className="actionsRow" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="removeButton"
              onClick={() => onDelete(reset._id)}
            >
              Delete Reset
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function formatResetDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(dateValue));
}