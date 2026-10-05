import { useState, useEffect } from 'react';
import { BookOpen, Save } from 'lucide-react';
import { getDsaProgress, updateDsaProgress } from '../api';
import ProgressBar from '../components/ProgressBar';

export default function DsaTracker() {
  const [dsa, setDsa] = useState(null);
  const [inputHours, setInputHours] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDsaProgress()
      .then((res) => {
        setDsa(res.data);
        setInputHours(String(res.data.completedHours));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const hours = parseFloat(inputHours);
    if (isNaN(hours) || hours < 0) return;
    setSaving(true);
    try {
      const res = await updateDsaProgress(hours);
      setDsa(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Striver DSA Tracker</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Target: 110 hours in 2 months</p>
      </div>

      {/* Main progress card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Striver DSA Sheet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total target: 110 hours</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {dsa?.completedHours ?? 0}h
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-orange-500">
              {dsa?.remainingHours ?? 110}h
            </p>
            <p className="text-xs text-gray-500 mt-1">Remaining</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dsa?.percentageCompleted ?? 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Progress</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Completed: {dsa?.completedHours ?? 0}h / {dsa?.totalHours ?? 110}h</span>
            <span>{dsa?.percentageCompleted ?? 0}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-primary-600 rounded-full transition-all duration-700"
              style={{ width: `${dsa?.percentageCompleted ?? 0}%` }}
            />
          </div>
        </div>

        {/* Manual input */}
        <div>
          <label className="label">Update Completed Hours</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="110"
              step="0.5"
              className="input-field"
              placeholder="e.g. 35"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              className="btn-primary flex-shrink-0"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Enter total hours completed so far</p>
        </div>
      </div>

      {/* Tips */}
      <div className="card p-5">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Daily Target</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between">
            <span>Target hours/day</span>
            <span className="font-medium text-gray-900 dark:text-white">~1.8h</span>
          </div>
          <div className="flex justify-between">
            <span>Total target</span>
            <span className="font-medium text-gray-900 dark:text-white">110 hours</span>
          </div>
          <div className="flex justify-between">
            <span>Target duration</span>
            <span className="font-medium text-gray-900 dark:text-white">2 months</span>
          </div>
          <div className="flex justify-between">
            <span>Daily schedule slot</span>
            <span className="font-medium text-gray-900 dark:text-white">7:30 – 9:30 AM (2h)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
