export function getEntryValue(entry, key, fallback = 0) {
  const item = entry.values?.find(value => value.key === key);

  if (!item) return fallback;

  const number = Number(item.value);

  return Number.isFinite(number) ? number : fallback;
}

export function getLatestEntry(entries) {
  if (!entries.length) return null;

  return [...entries].sort(
    (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
  )[0];
}

export function getOldestEntry(entries) {
  if (!entries.length) return null;

  return [...entries].sort(
    (a, b) => new Date(a.entryDate) - new Date(b.entryDate)
  )[0];
}

export function getWeightEntryStats(entries) {
  const oldest = getOldestEntry(entries);
  const latest = getLatestEntry(entries);

  if (!oldest || !latest) {
    return {
      latestWeight: 0,
      weightChange: 0
    };
  }

  const oldestWeight = getEntryValue(oldest, "currentWeight", 0);
  const latestWeight = getEntryValue(latest, "currentWeight", 0);

  return {
    latestWeight,
    weightChange: latestWeight - oldestWeight
  };
}

export function getWorkoutEntryStats(entries) {
  let totalMinutes = 0;
  let totalMiles = 0;
  let totalSteps = 0;
  let totalWorkouts = entries.length;

  entries.forEach(entry => {
    totalMinutes += getEntryValue(entry, "minutesPerWorkout", 0);
    totalMiles += getEntryValue(entry, "milesPerWeek", 0);
    totalSteps += getEntryValue(entry, "stepsPerDay", 0);
  });

  return {
    totalWorkouts,
    totalMinutes,
    totalMiles,
    totalSteps
  };
}

export function getFinanceEntryStats(entries) {
  let totalIncome = 0;
  let totalExpenses = 0;

  entries.forEach(entry => {
    totalIncome += getEntryValue(entry, "monthlyIncome", 0);
    totalExpenses += getEntryValue(entry, "monthlyExpenses", 0);
  });

  return {
    totalIncome,
    totalExpenses,
    net: totalIncome - totalExpenses
  };
}

export function getCaloriesEntryStats(entries) {
  let totalCalories = 0;

  entries.forEach(entry => {
    totalCalories += getEntryValue(entry, "estimatedDailyCalories", 0);
  });

  const averageCalories = entries.length ? totalCalories / entries.length : 0;

  return {
    averageCalories
  };
}

export function getEntryBasedSummary(tracker, entries) {
  if (!entries.length) return [];

  if (tracker.type === "weight") {
    const stats = getWeightEntryStats(entries);

    return [
      {
        label: "latest logged weight",
        value: `${stats.latestWeight.toFixed(1)} lb`
      },
      {
        label: "weight change",
        value: `${stats.weightChange > 0 ? "+" : ""}${stats.weightChange.toFixed(
          1
        )} lb`
      }
    ];
  }

  if (tracker.type === "workout") {
    const stats = getWorkoutEntryStats(entries);

    return [
      {
        label: "logged workouts",
        value: stats.totalWorkouts
      },
      {
        label: "logged minutes",
        value: stats.totalMinutes.toFixed(0)
      }
    ];
  }

  if (tracker.type === "finance") {
    const stats = getFinanceEntryStats(entries);

    return [
      {
        label: "logged net",
        value: `$${stats.net.toFixed(0)}`
      },
      {
        label: "logged income",
        value: `$${stats.totalIncome.toFixed(0)}`
      }
    ];
  }

  if (tracker.type === "calories") {
    const stats = getCaloriesEntryStats(entries);

    return [
      {
        label: "avg logged calories",
        value: stats.averageCalories.toFixed(0)
      }
    ];
  }

  return [
    {
      label: "entries logged",
      value: entries.length
    }
  ];
}

export function buildChartPoints(entries, key) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.entryDate) - new Date(b.entryDate)
  );

  return sorted
    .map(entry => ({
      date: entry.entryDate,
      value: getEntryValue(entry, key, null)
    }))
    .filter(point => point.value !== null);
}