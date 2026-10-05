import { useState } from 'react';
import { Sparkles, RefreshCw, Lightbulb } from 'lucide-react';

const TIPS = [
  {
    topic: 'Numerical Ability',
    tip: 'In TCS NQT, questions on Percentages, Profit & Loss, and Time & Work carry maximum weightage. Memorize fractional values of percentages (1/7 = 14.28%, 1/8 = 12.5%).',
  },
  {
    topic: 'Coding Strategy',
    tip: 'Ensure your code handles corner cases (N=0, single element array, large constraints up to 10^9). Always use `long long` in C++ or `long` in Java to prevent integer overflow.',
  },
  {
    topic: 'Time Management',
    tip: 'TCS NQT has sub-sectional timing! You cannot return to a previous section once time expires, so answer all questions before the section timer ends.',
  },
  {
    topic: 'Reasoning Ability',
    tip: 'For Blood Relations & Seating Arrangement, draw quick visual family trees and circular/linear diagrams on scratch paper to avoid confusion.',
  },
  {
    topic: 'Verbal Ability',
    tip: 'In Para Jumbles, identify mandatory pairs (noun followed by pronoun, cause and effect) rather than trying all combinations.',
  },
  {
    topic: 'DSA Best Practice',
    tip: 'When practicing Striver DSA questions, always write down the Brute Force, Better, and Optimal approach with time & space complexities.',
  },
  {
    topic: 'Consistency Tip',
    tip: 'Studying 2 hours consistently every single day is 10x more effective than studying 10 hours once a week. Protect your morning Striver DSA slot!',
  },
];

export default function DailyExamTip() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TIPS.length));
  const current = TIPS[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-primary-500/10 border border-amber-500/20 text-gray-800 dark:text-gray-200 relative flex items-start gap-3 shadow-sm">
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            TCS NQT Daily Tip • {current.topic}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {current.tip}
        </p>
      </div>

      <button
        onClick={handleNext}
        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors flex-shrink-0 absolute top-3 right-3"
        title="Next Tip"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
