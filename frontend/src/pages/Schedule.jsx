import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, Clock, Radio, Sparkles } from 'lucide-react';
import {
  getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem,
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

  useEffect(() => {
    getSchedule()
      .then((res) => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
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

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading schedule...</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your default study routine</p>
        </div>
        <button className="btn-primary" onClick={() => setAddingNew(true)}>
          <Plus className="w-4 h-4" /> Add Slot
        </button>
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
          const { isActive, minutesRemaining } = isSlotActiveNow(item.timeSlot, currentTime);
          return (
            <div
              key={item.id}
              className={`px-5 py-4 transition-colors ${
                isActive
                  ? 'bg-primary-50/70 dark:bg-primary-950/40 border-l-4 border-l-primary-500'
                  : ''
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-shrink-0 w-44">
                    <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary-500 animate-pulse' : 'text-gray-400'}`} />
                    <span className={`text-xs font-semibold ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.timeSlot}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-primary-950 dark:text-white font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.activity}
                    </span>
                    {isActive && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                        Active Now {minutesRemaining > 0 && `(${minutesRemaining}m left)`}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
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
    </div>
  );
}
