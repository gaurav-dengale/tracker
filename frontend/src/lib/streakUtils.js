import { getLocalDateString } from './dateUtils';

export function calculateStreak(tasks) {
  if (!tasks || !tasks.length) return 0;

  // Get unique dates where at least one task was completed
  const completedDates = new Set(
    tasks.filter((t) => t.completed).map((t) => t.date)
  );

  if (completedDates.size === 0) return 0;

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

  return streak;
}
