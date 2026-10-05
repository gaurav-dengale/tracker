import { useState, useEffect } from 'react';
import { X, Flag } from 'lucide-react';
import { getLocalDateString } from '../lib/dateUtils';

const SUBJECTS = [
  'DSA / Striver',
  'TCS NQT Aptitude',
  'Coding Practice',
  'Development',
  'Communication',
  'Interview Preparation',
];

const PRIORITIES = [
  { id: 'HIGH', label: 'High Priority', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  { id: 'MEDIUM', label: 'Medium Priority', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
  { id: 'LOW', label: 'Low / Quick', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
];

const defaultForm = {
  title: '',
  subject: SUBJECTS[0],
  priority: 'MEDIUM',
  date: getLocalDateString(),
  plannedDuration: '',
  notes: '',
  completed: false,
};

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        subject: task.subject || SUBJECTS[0],
        priority: task.priority || 'MEDIUM',
        date: task.date || getLocalDateString(),
        plannedDuration: task.plannedDuration || '',
        notes: task.notes || '',
        completed: task.completed || false,
      });
    } else {
      setForm(defaultForm);
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, id: task?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="card w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Add Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Task Name *</label>
            <input
              className="input-field"
              placeholder="e.g. Striver DSA Practice"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <select
                className="input-field text-sm"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="input-field text-sm font-medium"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="HIGH">🔴 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field text-sm"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Planned Duration</label>
              <input
                className="input-field text-sm"
                placeholder="e.g. 2 hours"
                value={form.plannedDuration}
                onChange={(e) => setForm({ ...form, plannedDuration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes & Links</label>
            <textarea
              className="input-field resize-none text-sm"
              rows={3}
              placeholder="Optional topics, formulas, or question links..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {task ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
