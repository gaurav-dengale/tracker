import { useState, useEffect } from 'react';
import { Target, Clock, Trophy, Flame, ChevronRight } from 'lucide-react';
import { getTasksByRange } from '../api';
import { getLocalDateString } from '../lib/dateUtils';
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
const WEEKLY_HOURS_KEY = 'tcs_nqt_weekly_target_hours';

// Helper to estimate hours from plannedDuration string (e.g. "2 hours", "30 mins", "45 mins")
function parseDurationToHours(durationStr) {
  if (!durationStr) return 1.0;
  const s = durationStr.toLowerCase();
  if (s.includes('30 min')) return 0.5;
  if (s.includes('45 min')) return 0.75;
  if (s.includes('15 min')) return 0.25;
  const match = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/);
  if (match) return parseFloat(match[1]);
  return 1.0;
}

export default function WeeklyProgress() {
  const [weekTasks, setWeekTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [targetHours, setTargetHours] = useState(() => {
    try {
      const saved = localStorage.getItem(WEEKLY_HOURS_KEY);
      return saved ? parseInt(saved, 10) : 35;
    } catch {
      return 35;
    }
  });
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetHours);

  const weekDates = getWeekDates();
  const start = getLocalDateString(weekDates[0]);
  const end = getLocalDateString(weekDates[6]);

  useEffect(() => {
    getTasksByRange(start, end)
      .then((res) => {
        const grouped = {};
        res.data.forEach((task) => {
          const key = task.date;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(task);
        });
        setWeekTasks(grouped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [start, end]);

  const saveTargetHours = () => {
    const val = parseInt(tempTarget, 10);
    if (!isNaN(val) && val > 0) {
      setTargetHours(val);
      localStorage.setItem(WEEKLY_HOURS_KEY, String(val));
    }
    setEditingTarget(false);
  };

  const today = getLocalDateString();

  let completedHoursTotal = 0;
  const weekStats = weekDates.map((date, i) => {
    const dateStr = getLocalDateString(date);
    const tasks = weekTasks[dateStr] || [];
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate hours for completed tasks
    const dayHours = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + parseDurationToHours(t.plannedDuration), 0);

    completedHoursTotal += dayHours;

    return {
      day: DAY_NAMES[i],
      dateStr,
      displayDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      total,
      completed,
      dayHours: Math.round(dayHours * 10) / 10,
      pct,
      isToday: dateStr === today,
    };
  });

  const totalAllTasks = weekStats.reduce((s, d) => s + d.total, 0);
  const totalCompleted = weekStats.reduce((s, d) => s + d.completed, 0);
  const weekPct = totalAllTasks > 0 ? Math.round((totalCompleted / totalAllTasks) * 100) : 0;
  const hoursPct = Math.min(100, Math.round((completedHoursTotal / targetHours) * 100));

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading weekly summary...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} –{' '}
          {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Target Hours Goal Gauge Card */}
      <div className="card p-5 bg-gradient-to-br from-primary-900/15 via-gray-900 to-indigo-950/20 border-primary-500/30 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Weekly Study Goal</span>
              <p className="text-[11px] text-gray-400">Target hours completed this week</p>
            </div>
          </div>

          {editingTarget ? (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                className="w-16 input-field py-1 px-2 text-xs text-center"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                autoFocus
              />
              <button className="btn-primary text-xs py-1 px-2.5" onClick={saveTargetHours}>Save</button>
            </div>
          ) : (
            <button
              onClick={() => { setTempTarget(targetHours); setEditingTarget(true); }}
              className="text-xs text-primary-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Goal: {targetHours}h / week ✏️
            </button>
          )}
        </div>

        <div className="flex items-end justify-between my-2">
          <div>
            <span className="text-3xl font-black text-white">{completedHoursTotal}h</span>
            <span className="text-xs text-gray-400 ml-1.5">/ {targetHours} hours ({hoursPct}%)</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            hoursPct >= 100
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
          }`}>
            {hoursPct >= 100 ? '🎉 Goal Achieved!' : `${Math.max(0, targetHours - completedHoursTotal)}h remaining`}
          </span>
        </div>

        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${hoursPct}%` }}
          />
        </div>
      </div>

      {/* Task Completion Summary */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-gray-900 dark:text-white">Task Completion Rate</span>
          <span className="text-base font-bold text-primary-600 dark:text-primary-400">
            {totalCompleted} / {totalAllTasks} Tasks — {weekPct}%
          </span>
        </div>
        <ProgressBar value={totalCompleted} max={totalAllTasks || 1} />
      </div>

      {/* Day-by-Day Cards */}
      <div className="space-y-3">
        {weekStats.map(({ day, dateStr, displayDate, total, completed, dayHours, pct, isToday }) => (
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
              <div className="text-right flex items-center gap-3">
                {dayHours > 0 && (
                  <span className="text-xs text-primary-400 font-mono font-medium">⏱ {dayHours}h</span>
                )}
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
