"use client";

import { buildChartPoints } from "../lib/entryStats";

export default function SimpleEntryChart({ entries, fieldKey, title }) {
  const points = buildChartPoints(entries, fieldKey);

  if (points.length < 2) {
    return (
      <p className="mutedText">
        Add at least two entries to see a simple progress chart.
      </p>
    );
  }

  const values = points.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <div className="simpleChart">
      <div className="simpleChartHeader">
        <strong>{title}</strong>
        <span>
          {min.toFixed(1)} → {max.toFixed(1)}
        </span>
      </div>

      <div className="simpleChartBars">
        {points.map((point, index) => {
          const height = 18 + ((point.value - min) / range) * 82;

          return (
            <div className="simpleChartBarWrap" key={`${point.date}-${index}`}>
              <div
                className="simpleChartBar"
                style={{
                  height: `${height}%`
                }}
                title={`${formatChartDate(point.date)}: ${point.value}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatChartDate(dateValue) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric"
  }).format(new Date(dateValue));
}