import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, CheckCircle2, Clock, TrendingUp, BookOpen, ChevronRight, Sparkles
} from 'lucide-react';
import { getTasks, getDsaProgress, getSubjectProgress, generateTasksFromSchedule } from '../api';
import ProgressBar from '../components/ProgressBar';

const EXAM_DATE = new Date('2027-03-01');

function getDaysRemaining() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = EXAM_DATE - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatToday() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function Dashboard() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [dsa, setDsa] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const daysRemaining = getDaysRemaining();

  const loadData = async () => {
    try {
      const [tasksRes, dsaRes, subjectsRes] = await Promise.all([
        getTasks(today),
        getDsaProgress(),
        getSubjectProgress(),
      ]);
      setTodayTasks(tasksRes.data);
      setDsa(dsaRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error('Error loading dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [today]);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateTasksFromSchedule(today);
      setTodayTasks(res.data);
    } catch (err) {
      console.error('Error generating tasks', err);
    } finally {
      setGenerating(false);
    }
  };

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TCS NQT Preparation</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatToday()}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Exam: March 2027</span>
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

      {/* Today's Checklist */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Today's Tasks</h2>
          <Link to="/tasks" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {todayTasks.length === 0 ? (
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
          <ul className="space-y-2">
            {todayTasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  task.completed
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.completed
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-400 dark:border-gray-600'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-400">{task.plannedDuration}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Subject Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Subject Progress</h2>
          <Link to="/subjects" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            Edit <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {subjects.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{s.subject}</span>
                <span className="text-gray-500 dark:text-gray-400">{s.progressPercentage}%</span>
              </div>
              <ProgressBar value={s.progressPercentage} max={100} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
