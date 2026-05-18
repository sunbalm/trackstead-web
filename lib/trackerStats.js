export function getEffectiveStartDate(tracker, resets = []) {
  if (!resets.length) {
    return tracker.startDate;
  }

  const latestReset = [...resets].sort(
    (a, b) => new Date(b.resetDate) - new Date(a.resetDate)
  )[0];

  return latestReset?.resetDate || tracker.startDate;
}

export function formatCurrentStreak(tracker, resets = []) {
  return formatElapsed(getEffectiveStartDate(tracker, resets));
}

export function getElapsedParts(startDate) {
  const start = new Date(startDate);
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  return {
    totalMinutes,
    days,
    hours,
    minutes
  };
}

export function formatElapsed(startDate) {
  const elapsed = getElapsedParts(startDate);

  if (elapsed.days > 0) {
    return `${elapsed.days}d ${elapsed.hours}h`;
  }

  if (elapsed.hours > 0) {
    return `${elapsed.hours}h ${elapsed.minutes}m`;
  }

  return `${elapsed.minutes}m`;
}

export function getFieldValue(tracker, key, fallback = 0) {
  const field = tracker.fields?.find(item => item.key === key);

  if (!field) return fallback;

  const value = Number(field.value);

  return Number.isFinite(value) ? value : fallback;
}

export function getTextFieldValue(tracker, key, fallback = "") {
  const field = tracker.fields?.find(item => item.key === key);

  if (!field) return fallback;

  return field.value || fallback;
}

export function getUnlockedMilestones(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  return (tracker.milestones || []).filter(
    milestone => elapsed.totalMinutes >= milestone.unlockAfterMinutes
  );
}

export function getNextMilestone(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  return (tracker.milestones || []).find(
    milestone => elapsed.totalMinutes < milestone.unlockAfterMinutes
  );
}

export function getSmokingStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const cigarettesPerDay = getFieldValue(tracker, "cigarettesPerDay", 0);
  const cigarettesPerPack = getFieldValue(tracker, "cigarettesPerPack", 20);
  const costPerPack = getFieldValue(tracker, "costPerPack", 0);

  const days = elapsed.totalMinutes / 1440;
  const cigarettesAvoided = Math.max(0, cigarettesPerDay * days);
  const packsAvoided =
    cigarettesPerPack > 0 ? cigarettesAvoided / cigarettesPerPack : 0;
  const moneySaved = packsAvoided * costPerPack;

  return {
    cigarettesAvoided,
    packsAvoided,
    moneySaved
  };
}

export function getAlcoholStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const drinksPerWeek = getFieldValue(tracker, "drinksPerWeek", 0);
  const costPerDrink = getFieldValue(tracker, "costPerDrink", 0);

  const weeks = elapsed.totalMinutes / 10080;
  const drinksAvoided = Math.max(0, drinksPerWeek * weeks);
  const moneySaved = drinksAvoided * costPerDrink;

  return {
    drinksAvoided,
    moneySaved
  };
}

export function getMarijuanaStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const usesPerWeek = getFieldValue(tracker, "usesPerWeek", 0);
  const costPerWeek = getFieldValue(tracker, "costPerWeek", 0);

  const weeks = elapsed.totalMinutes / 10080;
  const usesAvoided = Math.max(0, usesPerWeek * weeks);
  const moneySaved = Math.max(0, costPerWeek * weeks);

  return {
    usesAvoided,
    moneySaved
  };
}

export function getTimeReclaimedStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const minutesPerDay = getFieldValue(tracker, "minutesPerDay", 0);
  const hoursPerWeek = getFieldValue(tracker, "hoursPerWeek", 0);
  const monthlySpend = getFieldValue(tracker, "monthlySpend", 0);

  const days = elapsed.totalMinutes / 1440;
  const weeks = elapsed.totalMinutes / 10080;
  const months = elapsed.totalMinutes / 43200;

  const reclaimedFromDaily = (minutesPerDay * days) / 60;
  const reclaimedFromWeekly = hoursPerWeek * weeks;
  const hoursReclaimed = reclaimedFromDaily + reclaimedFromWeekly;
  const moneySaved = monthlySpend * months;

  return {
    hoursReclaimed,
    moneySaved
  };
}

export function getFastFoodStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const mealsPerWeek = getFieldValue(tracker, "mealsPerWeek", 0);
  const costPerMeal = getFieldValue(tracker, "costPerMeal", 0);
  const caloriesPerMeal = getFieldValue(tracker, "caloriesPerMeal", 0);

  const weeks = elapsed.totalMinutes / 10080;
  const mealsAvoided = Math.max(0, mealsPerWeek * weeks);
  const moneySaved = mealsAvoided * costPerMeal;
  const caloriesAvoided = mealsAvoided * caloriesPerMeal;

  return {
    mealsAvoided,
    moneySaved,
    caloriesAvoided
  };
}

export function getWeightStats(tracker) {
  const heightFeet = getFieldValue(tracker, "heightFeet", 0);
  const heightInches = getFieldValue(tracker, "heightInches", 0);
  const currentWeight = getFieldValue(tracker, "currentWeight", 0);
  const goalWeight = getFieldValue(tracker, "goalWeight", 0);

  const totalInches = heightFeet * 12 + heightInches;
  const bmi =
    totalInches > 0 ? (currentWeight / (totalInches * totalInches)) * 703 : 0;

  const poundsToGoal = goalWeight ? Math.abs(currentWeight - goalWeight) : 0;

  return {
    bmi,
    currentWeight,
    goalWeight,
    poundsToGoal
  };
}

export function getWorkoutStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const workoutsPerWeek = getFieldValue(tracker, "workoutsPerWeek", 0);
  const minutesPerWorkout = getFieldValue(tracker, "minutesPerWorkout", 0);
  const stepsPerDay = getFieldValue(tracker, "stepsPerDay", 0);
  const milesPerWeek = getFieldValue(tracker, "milesPerWeek", 0);

  const days = elapsed.totalMinutes / 1440;
  const weeks = elapsed.totalMinutes / 10080;

  const estimatedWorkouts = workoutsPerWeek * weeks;
  const workoutMinutes = estimatedWorkouts * minutesPerWorkout;
  const estimatedSteps = stepsPerDay * days;
  const estimatedMiles = milesPerWeek * weeks;

  return {
    estimatedWorkouts,
    workoutMinutes,
    estimatedSteps,
    estimatedMiles
  };
}

export function getCalorieStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const dailyCalorieGoal = getFieldValue(tracker, "dailyCalorieGoal", 0);
  const estimatedDailyCalories = getFieldValue(
    tracker,
    "estimatedDailyCalories",
    0
  );

  const days = elapsed.totalMinutes / 1440;
  const dailyDifference = estimatedDailyCalories - dailyCalorieGoal;
  const caloriesReduced = Math.max(0, dailyDifference * days);

  return {
    dailyCalorieGoal,
    estimatedDailyCalories,
    caloriesReduced
  };
}

export function getFinanceStats(tracker) {
  const monthlyIncome = getFieldValue(tracker, "monthlyIncome", 0);
  const monthlyExpenses = getFieldValue(tracker, "monthlyExpenses", 0);
  const savingsGoal = getFieldValue(tracker, "savingsGoal", 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;
  const goalDifference = monthlyBalance - savingsGoal;

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyBalance,
    savingsGoal,
    goalDifference
  };
}

export function getCustomStats(tracker) {
  const elapsed = getElapsedParts(tracker.startDate);

  const moneyPerWeek = getFieldValue(tracker, "moneyPerWeek", 0);
  const weeks = elapsed.totalMinutes / 10080;

  return {
    moneySaved: moneyPerWeek * weeks
  };
}

export function getTrackerSummaryStats(tracker) {
  if (tracker.type === "smoking") {
    const stats = getSmokingStats(tracker);

    return [
      {
        label: "money saved",
        value: `$${stats.moneySaved.toFixed(0)}`
      },
      {
        label: "cigarettes avoided",
        value: stats.cigarettesAvoided.toFixed(0)
      }
    ];
  }

  if (tracker.type === "alcohol") {
    const stats = getAlcoholStats(tracker);

    return [
      {
        label: "money saved",
        value: `$${stats.moneySaved.toFixed(0)}`
      },
      {
        label: "drinks avoided",
        value: stats.drinksAvoided.toFixed(0)
      }
    ];
  }

  if (tracker.type === "marijuana") {
    const stats = getMarijuanaStats(tracker);

    return [
      {
        label: "money saved",
        value: `$${stats.moneySaved.toFixed(0)}`
      },
      {
        label: "uses avoided",
        value: stats.usesAvoided.toFixed(0)
      }
    ];
  }

  if (
    tracker.type === "social_media" ||
    tracker.type === "pornography" ||
    tracker.type === "video_games" ||
    tracker.type === "television"
  ) {
    const stats = getTimeReclaimedStats(tracker);

    return [
      {
        label: "hours reclaimed",
        value: stats.hoursReclaimed.toFixed(1)
      },
      {
        label: "money saved",
        value: `$${stats.moneySaved.toFixed(0)}`
      }
    ];
  }

  if (tracker.type === "fast_food") {
    const stats = getFastFoodStats(tracker);

    return [
      {
        label: "money saved",
        value: `$${stats.moneySaved.toFixed(0)}`
      },
      {
        label: "calories avoided",
        value: stats.caloriesAvoided.toFixed(0)
      }
    ];
  }

  if (tracker.type === "weight") {
    const stats = getWeightStats(tracker);

    return [
      {
        label: "BMI",
        value: stats.bmi.toFixed(1)
      },
      {
        label: "lbs to goal",
        value: stats.poundsToGoal.toFixed(1)
      }
    ];
  }

  if (tracker.type === "workout") {
    const stats = getWorkoutStats(tracker);

    return [
      {
        label: "workouts",
        value: stats.estimatedWorkouts.toFixed(0)
      },
      {
        label: "steps",
        value: stats.estimatedSteps.toFixed(0)
      }
    ];
  }

  if (tracker.type === "calories") {
    const stats = getCalorieStats(tracker);

    return [
      {
        label: "daily goal",
        value: stats.dailyCalorieGoal.toFixed(0)
      },
      {
        label: "calories reduced",
        value: stats.caloriesReduced.toFixed(0)
      }
    ];
  }

  if (tracker.type === "finance") {
    const stats = getFinanceStats(tracker);

    return [
      {
        label: "monthly balance",
        value: `$${stats.monthlyBalance.toFixed(0)}`
      },
      {
        label: "savings goal",
        value: `$${stats.savingsGoal.toFixed(0)}`
      }
    ];
  }

  const stats = getCustomStats(tracker);

  return [
    {
      label: "money saved",
      value: `$${stats.moneySaved.toFixed(0)}`
    }
  ];
}