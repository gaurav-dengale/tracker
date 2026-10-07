import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, CheckCircle2, BookOpen, ChevronRight, Sparkles, Flame, Zap, ArrowRight, Check
} from 'lucide-react';
import { getTasks, getDsaProgress, getSchedule, generateTasksFromSchedule, toggleTask } from '../api';
import { getLocalDateString, formatIndianDate } from '../lib/dateUtils';
import { getActiveScheduleItem } from '../lib/timeUtils';
import { calculateStreak } from '../lib/streakUtils';
import { triggerCelebration, triggerTaskCelebration } from '../lib/confetti';
import { addXp, deductXp } from '../lib/gamificationUtils';
import ProgressBar from '../components/ProgressBar';
import DailyExamTip from '../components/DailyExamTip';
import PreparationMilestones from '../components/PreparationMilestones';
import StudyResources from '../components/StudyResources';
import StudyHeatmap from '../components/StudyHeatmap';
import AchievementBadges from '../components/AchievementBadges';

const EXAM_DATE = new Date('2027-01-01');

const priorityConfig = {
  HIGH: { label: 'High', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  MEDIUM: { label: 'Med', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  LOW: { label: 'Quick', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

function getDaysRemaining() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = EXAM_DATE - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Dashboard() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [dsa, setDsa] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);

  const today = getLocalDateString();
  const daysRemaining = getDaysRemaining();

  const loadData = async () => {
    try {
      const [todayTasksRes, allTasksRes, dsaRes, scheduleRes] = await Promise.all([
        getTasks(today),
        getTasks(),
        getDsaProgress(),
        getSchedule(),
      ]);
      setTodayTasks(todayTasksRes?.data || []);
      setAllTasks(allTasksRes?.data || []);
      setDsa(dsaRes?.data || null);
      setSchedule(scheduleRes?.data || []);

      if (scheduleRes?.data && scheduleRes.data.length > 0) {
        const current = getActiveScheduleItem(scheduleRes.data);
        setActiveSlot(current);
      }
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [today]);

  useEffect(() => {
    if (!schedule || schedule.length === 0) return;

    const updateActiveSlot = () => {
      setActiveSlot(getActiveScheduleItem(schedule));
    };

    updateActiveSlot();

    const interval = setInterval(updateActiveSlot, 10000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updateActiveSlot();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [schedule]);

  const handleToggleTask = async (task, e) => {
    const isNowCompleting = !task.completed;
    if (isNowCompleting) {
      triggerTaskCelebration(e);
      addXp(15);
      setRecentlyCompletedId(task.id);
      setTimeout(() => {
        setRecentlyCompletedId((prev) => (prev === task.id ? null : prev));
      }, 1200);
    } else {
      deductXp(15);
    }

    try {
      const res = await toggleTask(task.id);
      setTodayTasks((prev) => {
        const next = prev.map((t) => (t.id === task.id ? res.data : t));
        const allDone = next.length > 0 && next.every((t) => t.completed);
        if (allDone && isNowCompleting) {
          addXp(50); // Daily completion bonus
          triggerCelebration();
        }
        return next;
      });
      setAllTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling task', err);
    }
  };

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateTasksFromSchedule(today);
      setTodayTasks(res?.data || []);
      const allRes = await getTasks();
      setAllTasks(allRes?.data || []);
    } catch (err) {
      console.error('Error generating tasks', err);
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = (todayTasks || []).filter((t) => t?.completed).length;
  const totalCount = (todayTasks || []).length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  const streakData = calculateStreak(allTasks || []);
  const currentStreak = streakData?.currentStreak || 0;
  const longestStreak = streakData?.longestStreak || 0;

  useEffect(() => {
    if (totalCount > 0 && completedCount === totalCount && !celebrated) {
      triggerCelebration();
      setCelebrated(true);
    }
  }, [completedCount, totalCount, celebrated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header with Title & Streak */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TCS NQT Preparation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatIndianDate()}</p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
          <Flame className="w-5 h-5 fill-orange-500 text-orange-500 animate-pulse" />
          <div className="text-right">
            <span className="text-sm font-bold block leading-none">
              {currentStreak} Day{currentStreak === 1 ? '' : 's'}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
              Streak (Best: {longestStreak}d)
            </span>
          </div>
        </div>
      </div>

      {/* Daily Exam Tip */}
      <DailyExamTip />

      {/* Live Active Schedule Slot Banner */}
      {activeSlot && (() => {
        const totalDuration = activeSlot.startMinutes && activeSlot.endMinutes ? Math.max(1, activeSlot.endMinutes - activeSlot.startMinutes) : 0;
        const elapsedMinutes = totalDuration ? Math.max(0, totalDuration - (activeSlot.minutesRemaining || 0)) : 0;
        const progressPct = totalDuration ? Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalDuration) * 100))) : 0;

        return (
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-blue-600/10 via-indigo-600/15 to-purple-600/10 dark:from-blue-900/30 dark:via-indigo-900/35 dark:to-purple-900/30 border border-primary-500/30 dark:border-primary-500/40 shadow-xl shadow-primary-950/10 backdrop-blur-sm">
            {/* Top accent glowing bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary-500 to-indigo-500" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="relative flex h-3.5 w-3.5 flex-shrink-0 mt-1 sm:mt-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Active Routine Slot
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      ({activeSlot.timeSlot})
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {activeSlot.activity}
                  </p>

                  {/* Micro Progress Bar */}
                  {totalDuration > 0 && (
                    <div className="mt-2.5 flex items-center gap-3 max-w-sm">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {progressPct}% ({elapsedMinutes}m / {totalDuration}m)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-center">
                {activeSlot.minutesRemaining > 0 ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/30 whitespace-nowrap shadow-sm">
                    ⏱ {activeSlot.minutesRemaining}m remaining
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap shadow-sm">
                    ⏱ Ending soon
                  </span>
                )}
                <Link to="/tasks" className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span>Tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/schedule" className="btn-secondary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5">
                  <span>Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam: January 2027</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{daysRemaining}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">days remaining</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Progress</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {completedCount} / {totalCount}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">tasks completed — {completionPct}%</p>
          <ProgressBar value={completedCount} max={totalCount} className="mt-3" />
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Striver DSA</span>
          </div>
          {dsa ? (
            <>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {dsa.completedHours}h
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                of {dsa.totalHours}h — {dsa.percentageCompleted}%
              </p>
              <ProgressBar value={dsa.completedHours} max={dsa.totalHours} className="mt-3" />
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No data</p>
          )}
        </div>
      </div>

      {/* Practice & Quiz Arena Feature Spotlight Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 border border-purple-500/30 p-5 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
              ⚡ Practice Arena
            </span>
            <span className="text-xs text-purple-200">Quant · Reasoning · Verbal · Coding</span>
          </div>
          <h2 className="text-lg font-bold">Ready for a quick 5-min TCS NQT Sprint?</h2>
          <p className="text-xs text-purple-200 max-w-xl">
            Test yourself with authentic TCS NQT questions, step-by-step mathematical shortcuts, and earn XP.
          </p>
        </div>
        <Link
          to="/quiz"
          className="btn-primary py-2.5 px-4 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Zap className="w-4 h-4 text-purple-600 fill-purple-600" /> Start Practice Quiz <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Study Consistency Heatmap (GitHub Style) */}
      <StudyHeatmap tasks={allTasks || []} />

      {/* Today's Checklist */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {(todayTasks || []).length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-gray-400 text-sm">No tasks added for today yet.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                className="btn-primary inline-flex items-center gap-1.5 text-sm"
                onClick={handleAutoGenerate}
                disabled={generating}
              >
                <Sparkles className="w-4 h-4" />
                {generating ? 'Generating...' : 'Auto-Fill Routine Tasks'}
              </button>
              <Link to="/tasks" className="btn-secondary inline-flex text-sm">Custom Task</Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {todayTasks.map((task) => {
              const pConfig = priorityConfig[task.priority] || priorityConfig.MEDIUM;
              return (
                <li
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    task.completed
                      ? 'bg-green-50/50 dark:bg-green-950/20 opacity-75'
                      : 'bg-gray-50 dark:bg-gray-800/70 border border-transparent dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleTask(task, e)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      task.completed
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-400 dark:border-gray-600 hover:border-primary-500 hover:scale-110 active:scale-95'
                    } ${task.completed && recentlyCompletedId === task.id ? 'animate-check-pop' : ''}`}
                    title={task.completed ? 'Mark incomplete' : 'Complete task'}
                  >
                    {task.completed && (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0 relative flex items-center gap-2">
                    <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                      {task.title}
                    </span>
                    {recentlyCompletedId === task.id && (
                      <span className="animate-xp-sparkle text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 inline-flex items-center gap-1 flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-yellow-200" /> +15 XP! 🎉
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${pConfig.color}`}>
                    {pConfig.label}
                  </span>
                  <span className="text-xs text-gray-400">{task.plannedDuration}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Gamification Badges & Level */}
      <AchievementBadges
        stats={{
          streak: currentStreak,
          dsaHours: dsa?.completedHours || 0,
          completedTasksCount: (allTasks || []).filter((t) => t?.completed).length,
        }}
      />

      {/* Preparation Roadmap Milestones */}
      <PreparationMilestones />

      {/* Quick Study Resources */}
      <StudyResources />
    </div>
  );
}
