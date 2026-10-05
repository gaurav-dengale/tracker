import { useMemo } from 'react';
import { Flame, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { getLocalDateString } from '../lib/dateUtils';
import { getStreakData } from '../lib/streakUtils';

export default function StudyHeatmap({ tasks = [] }) {
  const streak = getStreakData(tasks);

  // Generate grid of last 16 weeks (112 days)
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // Map completed tasks count by date string YYYY-MM-DD
    const taskCountByDate = {};
    tasks.forEach((t) => {
      if (t.completed && t.date) {
        taskCountByDate[t.date] = (taskCountByDate[t.date] || 0) + 1;
      }
    });

    // Generate 112 days ending today
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const count = taskCountByDate[dateStr] || 0;
      
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      days.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        count,
        level,
        formatted: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    }

    return days;
  }, [tasks]);

  const levelColors = [
    'bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-800',
    'bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800',
    'bg-emerald-400 dark:bg-emerald-600/80 border-emerald-500 dark:border-emerald-600',
    'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400 shadow-xs shadow-emerald-500/20',
    'bg-emerald-600 dark:bg-emerald-400 border-emerald-700 dark:border-emerald-300 shadow-sm shadow-emerald-500/30',
  ];

  const totalActiveDays = heatmapData.filter((d) => d.count > 0).length;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              Study Consistency Heatmap
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalActiveDays} active study days in the last 16 weeks
            </p>
          </div>
        </div>

        {/* Quick Streak Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-orange-500" /> {streak.currentStreak} Day Streak
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {heatmapData.map((day, idx) => (
              <div
                key={idx}
                title={`${day.formatted}: ${day.count} tasks completed`}
                className={`w-3.5 h-3.5 rounded-xs border transition-transform hover:scale-125 cursor-pointer ${
                  levelColors[day.level]
                }`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>Past 16 Weeks Activity</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              {levelColors.map((colorClass, i) => (
                <div key={i} className={`w-3 h-3 rounded-xs border ${colorClass}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
