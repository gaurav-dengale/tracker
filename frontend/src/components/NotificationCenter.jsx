import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { playNotificationChime } from '../lib/soundUtils';
import {
  Bell,
  Clock,
  CheckCircle2,
  Flame,
  Timer,
  Sparkles,
  Settings,
  CheckCheck,
  Trash2,
  X,
  Volume2,
  VolumeX,
  Monitor,
  ExternalLink,
  Info,
} from 'lucide-react';

const typeConfig = {
  routine: {
    icon: Clock,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
  task: {
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  pomodoro: {
    icon: Timer,
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  },
  streak: {
    icon: Flame,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  achievement: {
    icon: Sparkles,
    color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  },
  general: {
    icon: Bell,
    color: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
  },
};

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    settings,
    permissionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    requestDesktopPermission,
    updateSettings,
    notify,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'settings'
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const handleAction = (notif) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleTestNotification = () => {
    notify({
      title: '🔔 Notification Test',
      message: 'Everything is working! Routine alerts, sound, and toasts are active.',
      type: 'general',
      actionUrl: '/schedule',
      actionLabel: 'View Schedule',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors focus:outline-none"
        title="Notifications"
        aria-label="Open notifications"
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-primary-600 dark:text-primary-400 animate-wiggle' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-colors text-xs flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Mark read</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab(activeTab === 'settings' ? 'all' : 'settings')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700/60'
                }`}
                title="Notification Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 px-3 pt-2 text-xs font-semibold gap-1 bg-white dark:bg-gray-900">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-3 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`pb-2 px-3 border-b-2 transition-colors ${
                activeTab === 'unread'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-2 px-3 border-b-2 transition-colors ml-auto ${
                activeTab === 'settings'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-[380px] overflow-y-auto">
            {activeTab === 'settings' ? (
              /* Settings Panel */
              <div className="p-4 space-y-4 text-xs">
                {/* Desktop Notification Banner */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-primary-500" />
                      <span className="font-bold text-gray-900 dark:text-white">
                        Desktop Popups
                      </span>
                    </div>
                    {permissionStatus === 'granted' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                        Granted
                      </span>
                    ) : (
                      <button
                        onClick={requestDesktopPermission}
                        className="px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-[11px]">
                    Receive system desktop notifications even when this browser tab is in the background.
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  {/* Sound Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      {settings.soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-gray-400" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Sound Chime
                        </p>
                        <p className="text-[10px] text-gray-500">Play pleasant synthesized audio chime</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                  </label>

                  {/* Routine Slot Alerts */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Routine Slot Alerts
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Alert when slot starts & 5m before next slot
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.routineAlerts}
                      onChange={(e) => updateSettings({ routineAlerts: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                  </label>

                  {/* Daily Task & Streak Reminder */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Daily Task & Streak Alerts
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Evening reminder to protect your active study streak
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.taskAlerts}
                      onChange={(e) => updateSettings({ taskAlerts: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                  </label>

                  {/* Pomodoro Timer Alerts */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-rose-500" />
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          Pomodoro Session Alerts
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Alert when study timer or break ends
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pomodoroAlerts}
                      onChange={(e) => updateSettings({ pomodoroAlerts: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                  </label>
                </div>

                {/* Test notification button */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                  <button
                    onClick={handleTestNotification}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-colors text-center"
                  >
                    Send Test Alert
                  </button>
                  <button
                    onClick={() => playNotificationChime()}
                    className="py-1.5 px-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-colors text-center"
                    title="Test Audio"
                  >
                    🔊 Test Sound
                  </button>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              /* Empty State */
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[220px] mx-auto">
                  {activeTab === 'unread'
                    ? 'You are all caught up with your routine!'
                    : 'Routine changes, study streak alerts, and timer completions will appear here.'}
                </p>
              </div>
            ) : (
              /* Notification List */
              <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredNotifications.map((item) => {
                  const config = typeConfig[item.type] || typeConfig.general;
                  const Icon = config.icon;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 transition-colors flex items-start gap-3 group relative ${
                        !item.read
                          ? 'bg-primary-50/40 dark:bg-primary-950/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed break-words">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gray-400">
                            {formatTimeAgo(item.timestamp)}
                          </span>

                          {item.actionUrl && (
                            <button
                              onClick={() => handleAction(item)}
                              className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                            >
                              <span>{item.actionLabel || 'View'}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        onClick={() => deleteNotification(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-opacity absolute top-3 right-3"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab !== 'settings' && notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 flex justify-between items-center text-xs">
              <span className="text-[11px] text-gray-400 px-2">
                {notifications.length} total notification{notifications.length === 1 ? '' : 's'}
              </span>
              <button
                onClick={clearAllNotifications}
                className="text-[11px] font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 px-2 py-1 rounded transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
