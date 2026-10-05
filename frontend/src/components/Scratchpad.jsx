import { useState, useEffect } from 'react';
import { X, BookMarked, Save, Check } from 'lucide-react';

const STORAGE_KEY = 'tcs_nqt_scratchpad_notes';

const DEFAULT_NOTES = `# TCS NQT Quick Revision Notes & Formulas

## 📐 Aptitude Shortcuts
- Speed = Distance / Time (km/h to m/s: multiply by 5/18)
- Time & Work: If A does work in x days and B in y days, together = (x*y)/(x+y)
- Profit % = (Profit / CP) * 100

## 💻 DSA Time Complexities
- Binary Search: O(log N)
- Merge Sort / Quick Sort: O(N log N)
- 2 Sum (Hashing): O(N) time, O(N) space

## 📝 Key Topics to Revise
- [ ] Number system & divisibility rules
- [ ] Coding-decoding & series completion
- [ ] Array sliding window & two pointers
`;

export default function Scratchpad({ isOpen, onClose }) {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? saved : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, notes);
      setSavedStatus(true);
      const t = setTimeout(() => setSavedStatus(false), 1500);
      return () => clearTimeout(t);
    } catch {
      // ignore
    }
  }, [notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col text-gray-100">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
                <BookMarked className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Study Scratchpad & Formulas</h3>
                <p className="text-[11px] text-gray-400">Auto-saved to your browser</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savedStatus && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              className="w-full flex-1 bg-gray-950/70 border border-gray-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none leading-relaxed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your study notes, formulas, or questions here..."
            />
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-gray-800/80 text-center text-[11px] text-gray-500">
            Jot down aptitude formulas, code snippets, or interview talking points anytime.
          </div>
        </div>
      </div>
    </div>
  );
}
