import { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 shadow-xl backdrop-blur-md text-xs font-medium">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Offline Mode — All changes saved locally</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 shadow-xl backdrop-blur-md text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Back Online — Connected</span>
        </div>
      )}
    </div>
  );
}
