import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Coffee, Brain, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { playChime } from '../lib/soundUtils';
import { addXp } from '../lib/gamificationUtils';

const STORAGE_KEY = 'nqt_pomodoro_state';

const MODES = [
  { id: 'focus25', label: '25m Focus', minutes: 25, icon: Brain },
  { id: 'deep50', label: '50m Deep Work', minutes: 50, icon: Sparkles },
  { id: 'break5', label: '5m Break', minutes: 5, icon: Coffee },
  { id: 'break15', label: '15m Long Break', minutes: 15, icon: Coffee },
];

function getInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function PomodoroTimer({ isOpen, onClose }) {
  const savedState = getInitialState();

  const initialMode = MODES.find((m) => m.id === savedState?.selectedModeId) || MODES[0];
  
  let initialTime = initialMode.minutes * 60;
  let initialIsRunning = false;
  let initialTargetEndTime = null;

  if (savedState) {
    if (savedState.isRunning && savedState.targetEndTime) {
      const remaining = Math.max(0, Math.ceil((savedState.targetEndTime - Date.now()) / 1000));
      if (remaining > 0) {
        initialTime = remaining;
        initialIsRunning = true;
        initialTargetEndTime = savedState.targetEndTime;
      } else {
        initialTime = 0;
        initialIsRunning = false;
      }
    } else if (typeof savedState.timeLeft === 'number') {
      initialTime = savedState.timeLeft;
      initialIsRunning = false;
    }
  }

  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);
  const targetEndTimeRef = useRef(initialTargetEndTime);

  const totalSeconds = selectedMode.minutes * 60;

  // Request notification permission when user starts timer
  const requestNotificationPermission = () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (e) {
      console.debug('Notification permission error', e);
    }
  };

  // Synchronize timer with real-world clock (timestamp-based)
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const checkTime = () => {
      if (!targetEndTimeRef.current) return;
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        targetEndTimeRef.current = null;
        setIsRunning(false);
        playChime();
        addXp(selectedMode.minutes >= 50 ? 40 : 20); // Award Focus XP

        // Dispatch global app-notify event for Notification Center & Toasts
        window.dispatchEvent(
          new CustomEvent('app-notify', {
            detail: {
              title: '🍅 Focus Session Complete! 🎉',
              message: `${selectedMode.label} completed! You earned +${selectedMode.minutes >= 50 ? 40 : 20} XP. Take a short break or continue.`,
              type: 'pomodoro',
              actionUrl: '/schedule',
              actionLabel: 'Check Routine',
              tag: 'pomodoro-complete',
            },
          })
        );

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              selectedModeId: selectedMode.id,
              targetEndTime: null,
              isRunning: false,
              timeLeft: 0,
            })
          );
        } catch (e) {
          console.debug(e);
        }
      }
    };

    // Run immediately on effect mount
    checkTime();

    // High precision 500ms interval for smooth ticking
    timerRef.current = setInterval(checkTime, 500);

    // Instant resynchronization on tab switch / window focus
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' || !document.hidden) {
        checkTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [isRunning, selectedMode]);

  // Tab Title ticker (so user can see the timer ticking even when viewing other tabs)
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      document.title = `(${formatted}) ${selectedMode.label} | TCS NQT Tracker`;
    } else {
      document.title = 'TCS NQT Study Tracker';
    }

    return () => {
      document.title = 'TCS NQT Study Tracker';
    };
  }, [isRunning, timeLeft, selectedMode]);

  const handleStart = () => {
    requestNotificationPermission();
    const duration = timeLeft <= 0 ? selectedMode.minutes * 60 : timeLeft;
    const targetEnd = Date.now() + duration * 1000;
    targetEndTimeRef.current = targetEnd;
    setTimeLeft(duration);
    setIsRunning(true);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedModeId: selectedMode.id,
          targetEndTime: targetEnd,
          isRunning: true,
          timeLeft: duration,
        })
      );
    } catch (e) {
      console.debug(e);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedModeId: selectedMode.id,
          targetEndTime: null,
          isRunning: false,
          timeLeft,
        })
      );
    } catch (e) {
      console.debug(e);
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setIsRunning(false);
    targetEndTimeRef.current = null;
    const initialSecs = mode.minutes * 60;
    setTimeLeft(initialSecs);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedModeId: mode.id,
          targetEndTime: null,
          isRunning: false,
          timeLeft: initialSecs,
        })
      );
    } catch (e) {
      console.debug(e);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    targetEndTimeRef.current = null;
    const initialSecs = selectedMode.minutes * 60;
    setTimeLeft(initialSecs);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedModeId: selectedMode.id,
          targetEndTime: null,
          isRunning: false,
          timeLeft: initialSecs,
        })
      );
    } catch (e) {
      console.debug(e);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // If closed and not running, don't display anything
  if (!isOpen && !isRunning) return null;

  // Minimized pill view in bottom corner
  if (isMinimized || (!isOpen && isRunning)) {
    return (
      <div className="fixed bottom-5 right-5 z-50 bg-gray-900/95 border border-primary-500/50 shadow-2xl rounded-2xl p-3 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-primary-500' : 'bg-gray-500'}`} />
          </span>
          <span className="text-sm font-bold font-mono text-white">{formattedTime}</span>
          <span className="text-[11px] text-gray-400 font-medium">({selectedMode.label})</span>
        </div>
        <button
          onClick={isRunning ? handlePause : handleStart}
          className="p-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white transition-colors"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
        </button>
        <button
          onClick={() => {
            setIsMinimized(false);
            if (!isOpen && onClose) {
              // Re-open full view by triggering parent
              window.dispatchEvent(new CustomEvent('open-pomodoro'));
            }
          }}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          title="Maximize"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
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
              title="Close"
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
          <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            {isRunning ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                🔥 Stay Focused!
              </>
            ) : timeLeft === 0 ? (
              '🎉 Session Completed!'
            ) : (
              'Ready to start'
            )}
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
            onClick={isRunning ? handlePause : handleStart}
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
