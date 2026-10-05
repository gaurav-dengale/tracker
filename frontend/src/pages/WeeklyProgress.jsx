import { useState, useEffect } from 'react';
import { getTasksByRange } from '../api';
import ProgressBar from '../components/ProgressBar';

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyProgress() {
  const [weekTasks, setWeekTasks] = useState({});
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates();
  const start = weekDates[0].toISOString().slice(0, 10);
  const end = weekDates[6].toISOString().slice(0, 10);

  useEffect(() => {
    getTasksByRange(start, end)
      .then((res) => {
        const grouped = {};
        res.data.forEach((task) => {
          const key = task.date;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(task);
        })
        setWeekTasks(grouped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const today = new Date().toISOString().slice(0, 10);

  const weekStats = weekDates.map((date, i) => {
    const dateStr = date.toISOString().slice(0, 10);
    const tasks = weekTasks[dateStr] || [];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      day: DAY_NAMES[i],
      dateStr,
      displayDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      total,
      completed,
      pct,
      isToday: dateStr === today,
    };
  });

  const totalAllTasks = weekStats.reduce((s, d) => s + d.total, 0);
  const totalCompleted = weekStats.reduce((s, d) => s + d.completed, 0);
  const weekPct = totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} –{' '}
          {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Weekly summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">This Week</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {totalCompleted} / {totalAllTasks} — {weekPct}%
          </span>
        </div>
        <ProgressBar value={totalCompleted} max={totalAllTasks || 1} />
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {weekStats.map(({ day, dateStr, displayDate, total, completed, pct, isToday }) => (
          <div
            key={dateStr}
            className={`card p-4 ${isToday ? 'border-primary-400 dark:border-primary-600 border-2' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-sm ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                  {day}
                </span>
                {isToday && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                    Today
                  </span>
                )}
                <span className="text-xs text-gray-400">{displayDate}</span>
              </div>
              <div className="text-right">
                {total === 0 ? (
                  <span className="text-xs text-gray-400">No tasks</span>
                ) : (
                  <span className={`text-sm font-semibold ${
                    pct === 100
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {completed}/{total} — {pct}%
                    {pct === 100 && ' ✅'}
                  </span>
                )}
              </div>
            </div>
            {total > 0 && <ProgressBar value={completed} max={total} />}
          </div>
        ))}
      </div>
    </div>
  );
}
