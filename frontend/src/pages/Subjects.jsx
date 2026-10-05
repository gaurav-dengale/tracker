import { useState, useEffect } from 'react';
import { Save, BarChart2 } from 'lucide-react';
import { getSubjectProgress, updateSubjectProgress } from '../api';
import ProgressBar from '../components/ProgressBar';

const subjectColors = {
  'DSA / Striver': 'bg-blue-500',
  'TCS NQT Aptitude': 'bg-purple-500',
  'Coding Practice': 'bg-orange-500',
  'Development': 'bg-green-500',
  'Communication': 'bg-pink-500',
  'Interview Preparation': 'bg-yellow-500',
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => {
    getSubjectProgress()
      .then((res) => {
        setSubjects(res.data);
        const initial = {};
        res.data.forEach((s) => { initial[s.id] = s.progressPercentage; });
        setEditing(initial);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    const pct = parseInt(editing[id], 10);
    if (isNaN(pct)) return;
    try {
      const res = await updateSubjectProgress(id, pct);
      setSubjects((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>;
  }

  const overall = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.progressPercentage, 0) / subjects.length)
    : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subject Progress</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update your progress for each subject manually
        </p>
      </div>

      {/* Overall */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <BarChart2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span className="font-semibold text-gray-900 dark:text-white">Overall Progress</span>
          <span className="ml-auto text-2xl font-bold text-primary-600 dark:text-primary-400">{overall}%</span>
        </div>
        <ProgressBar value={overall} max={100} />
      </div>

      {/* Subject cards */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const colorClass = subjectColors[subject.subject] || 'bg-gray-500';
          return (
            <div key={subject.id} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                <span className="font-semibold text-gray-900 dark:text-white">{subject.subject}</span>
                <span className="ml-auto text-lg font-bold text-gray-700 dark:text-gray-300">
                  {subject.progressPercentage}%
                </span>
              </div>

              <ProgressBar value={subject.progressPercentage} max={100} className="mb-4" />

              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="flex-1 accent-primary-600"
                  value={editing[subject.id] ?? subject.progressPercentage}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [subject.id]: parseInt(e.target.value) }))
                  }
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input-field w-20 text-center"
                  value={editing[subject.id] ?? subject.progressPercentage}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, [subject.id]: e.target.value }))
                  }
                />
                <button
                  className="btn-primary flex-shrink-0"
                  onClick={() => handleSave(subject.id)}
                >
                  <Save className="w-4 h-4" />
                  {savedId === subject.id ? 'Saved ✓' : 'Save'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
