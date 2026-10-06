import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Check, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { getTasks, createTask, updateTask, toggleTask, deleteTask, generateTasksFromSchedule } from '../api';
import { getLocalDateString, formatIndianDate } from '../lib/dateUtils';
import { triggerCelebration, triggerTaskCelebration } from '../lib/confetti';
import { addXp, deductXp } from '../lib/gamificationUtils';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ProgressBar from '../components/ProgressBar';

const subjectColors = {
  'DSA / Striver': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'TCS NQT Aptitude': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Coding Practice': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Development': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Communication': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Interview Preparation': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

export default function TodaysTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [recentlyCompletedId, setRecentlyCompletedId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTasks(selectedDate);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateTasksFromSchedule(selectedDate);
      setTasks(res.data);
    } catch (err) {
      console.error('Error generating tasks from schedule', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await updateTask(form.id, form);
      } else {
        await createTask(form);
      }
      setShowModal(false);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (task, e) => {
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
      setTasks((prev) => {
        const next = prev.map((t) => (t.id === task.id ? res.data : t));
        const allDone = next.length > 0 && next.every((t) => t.completed);
        if (allDone && isNowCompleting) {
          addXp(50); // Grand completion daily bonus
          triggerCelebration();
        }
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCyclePriority = async (task, e) => {
    e.stopPropagation();
    const cycle = { HIGH: 'MEDIUM', MEDIUM: 'LOW', LOW: 'HIGH' };
    const nextPriority = cycle[task.priority] || 'HIGH';
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, priority: nextPriority } : t)));
    try {
      const res = await updateTask(task.id, { ...task, priority: nextPriority });
      if (res?.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
      }
    } catch (err) {
      console.error('Error updating priority', err);
      loadTasks();
    }
  };

  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const isToday = selectedDate === getLocalDateString();

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isToday ? "Today's Tasks" : 'Tasks'}
          </h1>
          {isToday && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{formatIndianDate()}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="date"
            className="input-field w-auto text-sm"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            className="btn-secondary text-sm flex items-center gap-1.5"
            onClick={handleAutoGenerate}
            disabled={generating}
            title="Generate standard routine study tasks"
          >
            {generating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-primary-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary-500" />
            )}
            <span>Auto-Fill Routine</span>
          </button>
          <button
            className="btn-primary text-sm flex items-center gap-1.5"
            onClick={() => { setEditingTask(null); setShowModal(true); }}
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Progress summary */}
      {total > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completed} / {total} Tasks Completed — {pct}%
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              pct === 100
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
              {pct === 100 ? '🎉 All done!' : `${pct}%`}
            </span>
          </div>
          <ProgressBar value={completed} max={total} />
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <div>
            <p className="text-gray-400 text-sm">No tasks added for this date yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              You can populate today's schedule routine with 1 click or create custom tasks.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleAutoGenerate}
              disabled={generating}
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Populating...' : 'Auto-Fill from Daily Routine'}
            </button>
            <button
              className="btn-secondary flex items-center gap-1.5"
              onClick={() => { setEditingTask(null); setShowModal(true); }}
            >
              <Plus className="w-4 h-4" /> Custom Task
            </button>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className={`card p-4 flex items-start gap-4 transition-all ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => handleToggle(task, e)}
                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  task.completed
                    ? 'border-green-500 bg-green-500 hover:bg-green-600'
                    : 'border-gray-400 dark:border-gray-600 hover:border-primary-500 hover:scale-110 active:scale-95'
                } ${task.completed && recentlyCompletedId === task.id ? 'animate-check-pop' : ''}`}
                title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
              >
                {task.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 relative">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold transition-all ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </span>
                  {task.completed && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">✅ Completed</span>
                  )}
                  {recentlyCompletedId === task.id && (
                    <span className="animate-xp-sparkle text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/40 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-200" /> +15 XP! 🎉
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${subjectColors[task.subject] || 'bg-gray-100 text-gray-600'}`}>
                    {task.subject}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCyclePriority(task, e)}
                    title="Click to cycle priority (High -> Med -> Low)"
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] border cursor-pointer hover:scale-105 transition-transform ${
                      task.priority === 'HIGH'
                        ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                        : task.priority === 'LOW'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                    }`}
                  >
                    {task.priority === 'HIGH' ? '🔴 High' : task.priority === 'LOW' ? '🟢 Low' : '🟡 Med'}
                  </button>
                  {task.plannedDuration && (
                    <span>⏱ {task.plannedDuration}</span>
                  )}
                  {task.notes && (
                    <span className="text-gray-400 truncate max-w-[200px]">📍 {task.notes}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => { setEditingTask(task); setShowModal(true); }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(task)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modals */}
      {showModal && (
        <TaskModal
          task={editingTask ? { ...editingTask, date: editingTask.date || selectedDate } : { date: selectedDate }}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteConfirm.title}"?`}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
