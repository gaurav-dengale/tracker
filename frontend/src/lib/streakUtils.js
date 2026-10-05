import { getLocalDateString } from './dateUtils';

export function calculateStreak(tasks) {
  const data = getStreakData(tasks);
  return data;
}

export function getStreakData(tasks = []) {
  if (!tasks || !tasks.length) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  // Get unique dates where at least one task was completed
  const completedDates = new Set(
    tasks.filter((t) => t.completed && t.date).map((t) => t.date)
  );

  if (completedDates.size === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  let streak = 0;
  const today = new Date();
  const todayStr = getLocalDateString(today);

  // If today has a completed task, start streak checking from today
  // Otherwise, start from yesterday to see if active streak was maintained
  let checkDate = new Date(today);
  if (!completedDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = getLocalDateString(checkDate);
    if (completedDates.has(dateStr)) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak by sorting unique dates
  const sortedDates = Array.from(completedDates).sort();
  let maxStreak = 0;
  let running = 0;
  let lastDateObj = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const curDate = new Date(y, m - 1, d);
    if (lastDateObj) {
      const diffDays = Math.round((curDate - lastDateObj) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running += 1;
      } else {
        running = 1;
      }
    } else {
      running = 1;
    }
    lastDateObj = curDate;
    if (running > maxStreak) {
      maxStreak = running;
    }
  }

  return {
    currentStreak: streak,
    longestStreak: Math.max(streak, maxStreak),
    activeDays: completedDates.size,
  };
}
