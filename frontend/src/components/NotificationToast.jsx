import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  CheckCircle2,
  Flame,
  Timer,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

const typeConfig = {
  routine: {
    icon: Clock,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    barColor: 'bg-indigo-500',
  },
  task: {
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    barColor: 'bg-emerald-500',
  },
  pomodoro: {
    icon: Timer,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    barColor: 'bg-rose-500',
  },
  streak: {
    icon: Flame,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    barColor: 'bg-amber-500',
  },
  achievement: {
    icon: Sparkles,
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    barColor: 'bg-yellow-500',
  },
  general: {
    icon: Bell,
    color: 'text-primary-500 bg-primary-500/10 border-primary-500/30',
    barColor: 'bg-primary-500',
  },
};

export default function NotificationToast() {
  const { toasts, dismissToast, markAsRead } = useNotifications();
  const navigate = useNavigate();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none sm:top-5 sm:right-5">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type] || typeConfig.general;
        const Icon = config.icon;

        const handleAction = () => {
          markAsRead(toast.id);
          dismissToast(toast.id);
          if (toast.actionUrl) {
            navigate(toast.actionUrl);
          }
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto group relative overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-800/80 shadow-2xl shadow-primary-950/20 p-4 transition-all duration-300 animate-slide-in-right hover:scale-[1.01]"
            role="alert"
          >
            {/* Top color indicator line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${config.barColor}`} />

            <div className="flex items-start gap-3">
              {/* Icon badge */}
              <div className={`p-2 rounded-xl border flex-shrink-0 ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {toast.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {toast.message}
                </p>

                {/* Optional Action Button */}
                {toast.actionUrl && (
                  <button
                    onClick={handleAction}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                  >
                    <span>{toast.actionLabel || 'View'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
