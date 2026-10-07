import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Clock, Radio, Sparkles, RotateCcw } from 'lucide-react';
import {
  getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem, resetScheduleToMaster,
} from '../api';
import { isSlotActiveNow } from '../lib/timeUtils';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Schedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ timeSlot: '', activity: '', sortOrder: 0 });
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState({ timeSlot: '', activity: '', sortOrder: 99 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getSchedule()
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    const handleVis = () => {
      if (document.visibilityState === 'visible') setCurrentTime(new Date());
    };
    document.addEventListener('visibilitychange', handleVis);
    window.addEventListener('focus', handleVis);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('focus', handleVis);
    };
  }, []);

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ timeSlot: item.timeSlot, activity: item.activity, sortOrder: item.sortOrder });
  };

  const saveEdit = async (id) => {
    try {
      const res = await updateScheduleItem(id, editForm);
      setItems((prev) => prev.map((i) => (i.id === id ? res.data : i)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteScheduleItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNew = async () => {
    if (!newForm.timeSlot.trim() || !newForm.activity.trim()) return;
    try {
      const res = await createScheduleItem(newForm);
      setItems((prev) => [...prev, res.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setNewForm({ timeSlot: '', activity: '', sortOrder: 99 });
      setAddingNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetMaster = async () => {
    setResetting(true);
    try {
      const res = await resetScheduleToMaster();
      setItems(res.data);
      setResetConfirm(false);
    } catch (err) {
      console.error('Error resetting schedule', err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading schedule...</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your 17-slot master study & routine schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary text-xs"
            onClick={() => setResetConfirm(true)}
            title="Reset to default Master Routine"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Master
          </button>
          <button className="btn-primary" onClick={() => setAddingNew(true)}>
            <Plus className="w-4 h-4" /> Add Slot
          </button>
        </div>
      </div>

      {/* Add new form */}
      {addingNew && (
        <div className="card p-4 border-primary-200 dark:border-primary-800 border-2">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">New Schedule Item</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="label">Time Slot</label>
              <input
                className="input-field"
                placeholder="e.g. 10:00 AM – 12:00 PM"
                value={newForm.timeSlot}
                onChange={(e) => setNewForm({ ...newForm, timeSlot: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input
                type="number"
                className="input-field"
                value={newForm.sortOrder}
                onChange={(e) => setNewForm({ ...newForm, sortOrder: parseInt(e.target.value) || 99 })}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="label">Activity</label>
            <input
              className="input-field"
              placeholder="e.g. TCS NQT Aptitude"
              value={newForm.activity}
              onChange={(e) => setNewForm({ ...newForm, activity: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => setAddingNew(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddNew}>Add</button>
          </div>
        </div>
      )}

      {/* Schedule list */}
      <div className="card divide-y divide-gray-200 dark:divide-gray-800 overflow-hidden">
        {items.map((item) => {
          const { isActive, minutesRemaining, startMinutes, endMinutes } = isSlotActiveNow(item.timeSlot, currentTime);
          const totalDuration = startMinutes && endMinutes ? Math.max(1, endMinutes - startMinutes) : 0;
          const elapsedMinutes = totalDuration ? Math.max(0, totalDuration - minutesRemaining) : 0;
          const progressPct = totalDuration ? Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalDuration) * 100))) : 0;

          return (
            <div
              key={item.id}
              className={`px-5 py-4 transition-all duration-300 relative ${
                isActive
                  ? 'bg-gradient-to-r from-primary-500/10 via-indigo-500/15 to-purple-500/10 dark:from-primary-950/70 dark:via-indigo-950/60 dark:to-purple-950/70 border-l-4 border-l-primary-500 shadow-inner'
                  : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
              }`}
            >
              {editingId === item.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="input-field text-sm"
                      value={editForm.timeSlot}
                      onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                      placeholder="Time slot"
                    />
                    <input
                      type="number"
                      className="input-field text-sm"
                      value={editForm.sortOrder}
                      onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                      placeholder="Order"
                    />
                  </div>
                  <input
                    className="input-field text-sm"
                    value={editForm.activity}
                    onChange={(e) => setEditForm({ ...editForm, activity: e.target.value })}
                    placeholder="Activity"
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary text-xs py-1.5"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      className="btn-primary text-xs py-1.5"
                      onClick={() => saveEdit(item.id)}
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-shrink-0 w-36 sm:w-44">
                      {isActive ? (
                        <div className="relative flex h-3 w-3 flex-shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </div>
                      ) : (
                        <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className={`text-xs ${isActive ? 'text-primary-600 dark:text-primary-400 font-bold' : 'text-gray-600 dark:text-gray-400 font-medium'}`}>
                        {item.timeSlot}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm ${isActive ? 'text-gray-900 dark:text-white font-bold text-[15px]' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                          {item.activity}
                        </span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Now · {minutesRemaining > 0 ? `${minutesRemaining}m left` : '< 1m left'}
                          </span>
                        )}
                      </div>

                      {/* Live Slot Micro Progress Bar */}
                      {isActive && totalDuration > 0 && (
                        <div className="mt-2 flex items-center gap-2.5 max-w-xs">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary-500 transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {progressPct}% ({elapsedMinutes}m / {totalDuration}m)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Edit slot"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          message={`Delete "${deleteConfirm.activity}" from the schedule?`}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {resetConfirm && (
        <ConfirmDialog
          title="Reset to Master Daily Routine?"
          message="This will reset your daily schedule to the authentic 17-slot routine (7:00 AM – 12:00 AM) with Striver DSA, TCS NQT Aptitude, Java+Spring Boot, React, Coding, Revision, Gym, and System Design."
          confirmLabel={resetting ? 'Resetting...' : 'Yes, Load Master Routine'}
          onConfirm={handleResetMaster}
          onCancel={() => setResetConfirm(false)}
        />
      )}
    </div>
  );
}
