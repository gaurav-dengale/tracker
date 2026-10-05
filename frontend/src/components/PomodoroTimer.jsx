import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Coffee, Brain, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { playChime } from '../lib/soundUtils';

const MODES = [
  { id: 'focus25', label: '25m Focus', minutes: 25, icon: Brain },
  { id: 'deep50', label: '50m Deep Work', minutes: 50, icon: Sparkles },
  { id: 'break5', label: '5m Break', minutes: 5, icon: Coffee },
  { id: 'break15', label: '15m Long Break', minutes: 15, icon: Coffee },
];

export default function PomodoroTimer({ isOpen, onClose }) {
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(MODES[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  const totalSeconds = selectedMode.minutes * 60;

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setIsRunning(false);
    setTimeLeft(mode.minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMode.minutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-gray-900/95 border border-primary-500/50 shadow-2xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-primary-500' : 'bg-gray-500'}`} />
          </span>
          <span className="text-sm font-bold font-mono text-white">{formattedTime}</span>
        </div>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          title="Maximize"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-7 w-full max-w-sm shadow-2xl relative overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Study Focus Timer</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              title="Minimize to Corner"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode.id === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-gray-800/70 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center py-4 relative mb-4">
          <div className="text-6xl font-black tracking-tight font-mono text-white mb-2">
            {formattedTime}
          </div>
          <p className="text-xs text-gray-400 font-medium">
            {isRunning ? '🔥 Stay Focused!' : timeLeft === 0 ? '🎉 Session Completed!' : 'Ready to start'}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-5">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-semibold flex items-center gap-2 transition-all shadow-xl shadow-primary-600/30 text-sm"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Start Focus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
