import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, ArrowRight, ShieldCheck, Flag } from 'lucide-react';

const STORAGE_KEY = 'tcs_nqt_milestone_phases';

const DEFAULT_PHASES = [
  {
    id: 'phase1',
    phase: 'Phase 1',
    title: 'Core DSA & Aptitude Foundation',
    timeline: 'Months 1 – 2',
    target: 'Complete Striver DSA (110 hrs) + IndiaBix Numerical Basics',
    completed: false,
    color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'phase2',
    phase: 'Phase 2',
    title: 'Speed Aptitude & Advanced Coding',
    timeline: 'Months 3 – 4',
    target: 'Timed 30-min Aptitude Sections + LeetCode Mediums',
    completed: false,
    color: 'from-purple-600 to-pink-600',
  },
  {
    id: 'phase3',
    phase: 'Phase 3',
    title: 'Full Mocks & Interview Readiness',
    timeline: 'Final Months',
    target: '5+ Full TCS NQT Mock Tests + CS Fundamentals & HR Prep',
    completed: false,
    color: 'from-emerald-600 to-teal-600',
  },
];

export default function PreparationMilestones() {
  const [phases, setPhases] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_PHASES;
    } catch {
      return DEFAULT_PHASES;
    }
  });

  const togglePhase = (id) => {
    const updated = phases.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
    setPhases(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const completedCount = phases.filter((p) => p.completed).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Preparation Roadmap & Phases
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Targeting TCS NQT March 2027</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
          {completedCount} / {phases.length} Phases Done
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {phases.map((p) => (
          <div
            key={p.id}
            onClick={() => togglePhase(p.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
              p.completed
                ? 'bg-green-500/5 border-green-500/30 dark:bg-green-950/20'
                : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-800 hover:border-primary-500/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  p.completed
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                    : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                }`}>
                  {p.phase} • {p.timeline}
                </span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  {p.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              <h3 className={`text-sm font-bold mt-1 ${p.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                {p.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {p.target}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
              <span className={p.completed ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-400'}>
                {p.completed ? '✅ Milestone Achieved' : 'Click to mark complete'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
