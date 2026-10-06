import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Clock, Trophy, Flame, ChevronRight, BarChart3, PieChart,
  TrendingUp, AlertTriangle, CheckCircle2, Zap, Brain, Sparkles, BookOpen,
  Calendar, RotateCcw, ArrowUpRight, Award, ShieldAlert
} from 'lucide-react';
import { getTasksByRange, getDsaProgress, getSubjectProgress } from '../api';
import { getLocalDateString } from '../lib/dateUtils';
import { getQuizHistory } from '../lib/gamificationUtils';
import ProgressBar from '../components/ProgressBar';

function getWeekDates(offsetWeeks = 0) {
  const today = new Date();
  today.setDate(today.getDate() + offsetWeeks * 7);
  const dayOfWeek = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const WEEKLY_HOURS_KEY = 'tcs_nqt_weekly_target_hours';

// Subject Color & Icon mapping
const SUBJECT_CONFIG = {
  'DSA / Striver': { label: 'Striver DSA', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Development': { label: 'Java + Spring / React', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'TCS NQT Aptitude': { label: 'TCS NQT Aptitude', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  'Coding Practice': { label: 'Coding Practice', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'Interview Preparation': { label: 'Interview Prep / Revision', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  'Communication': { label: 'Communication', color: '#06b6d4', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
};

function parseDurationToHours(durationStr) {
  if (!durationStr) return 1.0;
  const s = durationStr.toLowerCase();
  if (s.includes('30 min')) return 0.5;
  if (s.includes('45 min')) return 0.75;
  if (s.includes('15 min')) return 0.25;
  if (s.includes('1.5 hour') || s.includes('1.5 hr')) return 1.5;
  if (s.includes('2.5 hour') || s.includes('2.5 hr')) return 2.5;
  if (s.includes('3 hour') || s.includes('3 hr')) return 3.0;
  const match = s.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour)/);
  if (match) return parseFloat(match[1]);
  return 1.0;
}

export default function WeeklyProgress() {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week
  const [weekTasks, setWeekTasks] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [dsa, setDsa] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'breakdown' | 'diagnostics'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const [targetHours, setTargetHours] = useState(() => {
    try {
      const saved = localStorage.getItem(WEEKLY_HOURS_KEY);
      return saved ? parseInt(saved, 10) : 45;
    } catch {
      return 45;
    }
  });
  const [editingTarget, setEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(targetHours);

  const weekDates = getWeekDates(weekOffset);
  const start = getLocalDateString(weekDates[0]);
  const end = getLocalDateString(weekDates[6]);
  const todayStr = getLocalDateString();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTasksByRange(start, end),
      getDsaProgress(),
      getSubjectProgress(),
    ])
      .then(([tasksRes, dsaRes, subjectsRes]) => {
        const grouped = {};
        const allList = tasksRes?.data || [];
        setAllTasks(allList);
        allList.forEach((task) => {
          const key = task.date;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(task);
        });
        setWeekTasks(grouped);
        setDsa(dsaRes?.data || null);
        setSubjects(subjectsRes?.data || []);
        setQuizHistory(getQuizHistory() || []);
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

  // Calculate day-by-day stats
  let completedHoursTotal = 0;
  let plannedHoursTotal = 0;

  const weekStats = weekDates.map((date, i) => {
    const dateStr = getLocalDateString(date);
    const tasks = weekTasks[dateStr] || [];
    const total = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed);
    const completed = completedTasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const dayCompletedHours = completedTasks.reduce(
      (sum, t) => sum + parseDurationToHours(t.plannedDuration),
      0
    );
    const dayPlannedHours = tasks.reduce(
      (sum, t) => sum + parseDurationToHours(t.plannedDuration),
      0
    );

    completedHoursTotal += dayCompletedHours;
    plannedHoursTotal += dayPlannedHours;

    return {
      dayShort: DAY_NAMES[i],
      dayFull: DAY_FULL_NAMES[i],
      dateStr,
      displayDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      total,
      completed,
      dayHours: Math.round(dayCompletedHours * 10) / 10,
      plannedHours: Math.round(dayPlannedHours * 10) / 10,
      pct,
      isToday: dateStr === todayStr,
      tasks,
    };
  });

  const totalAllTasks = weekStats.reduce((s, d) => s + d.total, 0);
  const totalCompletedTasks = weekStats.reduce((s, d) => s + d.completed, 0);
  const weekCompletionPct = totalAllTasks > 0 ? Math.round((totalCompletedTasks / totalAllTasks) * 100) : 0;
  const hoursPct = Math.min(100, Math.round((completedHoursTotal / targetHours) * 100));
  const dailyAverageHours = Math.round((completedHoursTotal / 7) * 10) / 10;

  // Calculate subject-wise hours breakdown
  const subjectBreakdown = {};
  allTasks
    .filter((t) => t.completed)
    .forEach((task) => {
      const subj = task.subject || 'Development';
      const hrs = parseDurationToHours(task.plannedDuration);
      subjectBreakdown[subj] = (subjectBreakdown[subj] || 0) + hrs;
    });

  const subjectDataList = Object.entries(subjectBreakdown).map(([name, hrs]) => {
    const cfg = SUBJECT_CONFIG[name] || { label: name, color: '#6366f1', bg: 'bg-primary-500/10 text-primary-400' };
    const pct = completedHoursTotal > 0 ? Math.round((hrs / completedHoursTotal) * 100) : 0;
    return {
      name,
      label: cfg.label,
      hours: Math.round(hrs * 10) / 10,
      pct,
      color: cfg.color,
      bg: cfg.bg,
    };
  }).sort((a, b) => b.hours - a.hours);

  // Weak Area Diagnostics
  const quizCategoryStats = {};
  quizHistory.forEach((q) => {
    if (!quizCategoryStats[q.category]) {
      quizCategoryStats[q.category] = { totalQuestions: 0, totalCorrect: 0, attempts: 0 };
    }
    quizCategoryStats[q.category].totalQuestions += q.total || 5;
    quizCategoryStats[q.category].totalCorrect += q.score || 0;
    quizCategoryStats[q.category].attempts += 1;
  });

  const diagnosticResults = Object.entries(quizCategoryStats).map(([cat, stat]) => {
    const accuracy = stat.totalQuestions > 0 ? Math.round((stat.totalCorrect / stat.totalQuestions) * 100) : 0;
    let status = 'strong';
    let statusLabel = 'Mastered';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

    if (accuracy < 50) {
      status = 'weak';
      statusLabel = 'Priority Revision Needed';
      statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (accuracy < 75) {
      status = 'moderate';
      statusLabel = 'Developing / Needs Practice';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }

    return {
      category: cat,
      accuracy,
      attempts: stat.attempts,
      status,
      statusLabel,
      statusColor,
    };
  }).sort((a, b) => a.accuracy - b.accuracy);

  // SVG Bar Chart Dimensions
  const maxDayHours = Math.max(8, ...weekStats.map((d) => Math.max(d.dayHours, d.plannedHours)));
  const chartHeight = 160;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Compiling study analytics & performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Header & Range Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            Study Analytics & Weekly Progress
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {weekDates[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
            {weekDates[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Week Switcher */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            ← Previous Week
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              weekOffset === 0
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Current Week
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            disabled={weekOffset >= 0}
            className="px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* 4 High-Level Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hours Logged */}
        <div className="card p-5 bg-gradient-to-br from-primary-900/20 via-gray-900 to-indigo-950/20 border-primary-500/30 border">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Study Hours</span>
            <Clock className="w-4 h-4 text-primary-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-white">{completedHoursTotal}h</span>
            <span className="text-xs text-gray-400">/ {targetHours}h goal</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${hoursPct}%` }}
            />
          </div>
        </div>

        {/* Task Completion % */}
        <div className="card p-5">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Tasks Finished</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 dark:text-white">{totalCompletedTasks}</span>
            <span className="text-xs text-gray-400">/ {totalAllTasks} ({weekCompletionPct}%)</span>
          </div>
          <ProgressBar value={totalCompletedTasks} max={totalAllTasks || 1} className="mt-3" />
        </div>

        {/* Daily Study Average */}
        <div className="card p-5">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Daily Average</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 dark:text-white">{dailyAverageHours}h</span>
            <span className="text-xs text-gray-400">/ day</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">
            Target: ~6.5h / day for TCS NQT Prime
          </p>
        </div>

        {/* DSA Status */}
        <div className="card p-5">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Striver DSA</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {dsa ? dsa.completedHours : 0}h
            </span>
            <span className="text-xs text-gray-400">/ {dsa ? dsa.totalHours : 110}h</span>
          </div>
          <ProgressBar value={dsa ? dsa.completedHours : 0} max={dsa ? dsa.totalHours : 110} className="mt-3" />
        </div>
      </div>

      {/* Main Visuals Grid: 7-Day Bar Chart + Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Interactive Hours Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-500" /> 7-Day Study Hours Distribution
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Completed study hours compared to daily routine target
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary-500" /> Completed
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-gray-700" /> Planned
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="relative pt-4">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-44 border-b border-gray-200 dark:border-gray-800 pb-2 px-2">
              {weekStats.map((item, idx) => {
                const heightPct = Math.min(100, Math.round((item.dayHours / maxDayHours) * 100));
                const plannedHeightPct = Math.min(100, Math.round((item.plannedHours / maxDayHours) * 100));
                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={item.dateStr}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-14 z-20 bg-gray-900 border border-gray-700 rounded-xl p-2 shadow-2xl text-center min-w-[100px] pointer-events-none animate-in fade-in duration-150">
                        <span className="text-[10px] text-gray-400 block">{item.dayFull} ({item.displayDate})</span>
                        <span className="text-xs font-bold text-white block">
                          ⏱ {item.dayHours}h <span className="text-gray-500">/ {item.plannedHours}h</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 block">{item.completed}/{item.total} tasks done</span>
                      </div>
                    )}

                    {/* Bars Container */}
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full">
                      {/* Completed Hours Bar */}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          item.isToday
                            ? 'bg-gradient-to-t from-primary-600 to-indigo-400 shadow-md shadow-primary-500/20'
                            : item.dayHours >= 6
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : item.dayHours > 0
                            ? 'bg-gradient-to-t from-primary-600 to-blue-500'
                            : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                        style={{ height: `${Math.max(6, heightPct)}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <div className="mt-2 text-center">
                      <span className={`text-xs font-semibold block ${item.isToday ? 'text-primary-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.dayShort}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        {item.dayHours > 0 ? `${item.dayHours}h` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject Category Breakdown (1 Col) */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary-500" /> Focus Category Share
            </h2>
          </div>

          {subjectDataList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Complete today's tasks to see your real-time subject distribution!
            </div>
          ) : (
            <div className="space-y-3.5">
              {subjectDataList.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                      {item.label}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.hours}h <span className="text-gray-400 font-normal">({item.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weak Area Diagnostic Radar & Preparation Recommendations */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" /> Diagnostic Weak Area Analyzer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AI-driven insights calculated from your authentic Practice Quiz performance
            </p>
          </div>
          <Link
            to="/quiz"
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-white" /> Take Diagnostic Quiz
          </Link>
        </div>

        {diagnosticResults.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 space-y-2">
            <Brain className="w-8 h-8 text-primary-400 mx-auto opacity-70" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No Quiz Diagnostic Data Available Yet
            </p>
            <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
              Attempt 5-minute timed quizzes in Numerical, Verbal, Reasoning, and Coding to identify your weak spots.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {diagnosticResults.map((item) => (
              <div
                key={item.category}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[140px]">
                    {item.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.accuracy}% Accuracy
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.accuracy >= 75 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>

                <p className="text-[11px] text-gray-500">
                  {item.accuracy < 50
                    ? '⚠️ Needs urgent revision on formulas & shortcuts.'
                    : item.accuracy < 75
                    ? '⚡ Good progress. Focus on speed drills.'
                    : '🔥 Strong concept clarity. Maintain with quick retakes.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day-by-Day Detailed Log Accordion */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-500" /> Daily Task & Schedule Logs
        </h2>

        <div className="space-y-3">
          {weekStats.map(({ dayFull, dateStr, displayDate, total, completed, dayHours, pct, isToday, tasks }) => (
            <div
              key={dateStr}
              className={`p-4 rounded-2xl transition-all border ${
                isToday
                  ? 'bg-primary-500/5 border-primary-500/40 ring-1 ring-primary-500/20'
                  : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${isToday ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                    {dayFull}
                  </span>
                  {isToday && (
                    <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full font-bold">
                      Today
                    </span>
                  )}
                  <span className="text-xs text-gray-400">({displayDate})</span>
                </div>
                <div className="flex items-center gap-3">
                  {dayHours > 0 && (
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ⏱ {dayHours}h completed
                    </span>
                  )}
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-500' : 'text-gray-500'}`}>
                    {completed}/{total} Tasks ({pct}%)
                  </span>
                </div>
              </div>

              {tasks.length > 0 ? (
                <div className="mt-2.5 pt-2 border-t border-gray-200 dark:border-gray-800/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800"
                    >
                      <span className={`w-2 h-2 rounded-full ${t.completed ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      <span className={`truncate flex-1 ${t.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {t.title}
                      </span>
                      <span className="text-[10px] text-gray-400">{t.plannedDuration}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No tasks logged for this day.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
