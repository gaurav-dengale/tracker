import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { playNotificationChime } from '../lib/soundUtils';
import { getSchedule, getTasks } from '../api';
import { getLocalDateString } from '../lib/dateUtils';
import { isSlotActiveNow, parseSlotRange } from '../lib/timeUtils';

const NotificationContext = createContext(null);

const STORAGE_KEY = 'tcs_nqt_notifications';
const SETTINGS_KEY = 'tcs_nqt_notification_settings';
const ALERTED_SLOTS_KEY = 'tcs_nqt_alerted_slots';

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  desktopEnabled: typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted',
  routineAlerts: true,
  taskAlerts: true,
  pomodoroAlerts: true,
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [toasts, setToasts] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const scheduleRef = useRef([]);
  const lastTaskCheckRef = useRef(0);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }, [notifications]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save notification settings', e);
    }
  }, [settings]);

  // Request browser desktop notification permission
  const requestDesktopPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      if (perm === 'granted') {
        setSettings((prev) => ({ ...prev, desktopEnabled: true }));
      }
      return perm;
    } catch (e) {
      console.error('Error requesting notification permission', e);
      return 'denied';
    }
  };

  // Trigger browser desktop notification
  const sendDesktopNotification = useCallback((title, body, tag, actionUrl) => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      settings.desktopEnabled
    ) {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: tag || 'tcs-nqt-notification',
        });
        if (actionUrl) {
          notif.onclick = () => {
            window.focus();
            window.location.hash = '';
            notif.close();
          };
        }
      } catch (e) {
        console.debug('Desktop notification failed', e);
      }
    }
  }, [settings.desktopEnabled]);

  // Core notify method
  const notify = useCallback(
    ({
      title,
      message,
      type = 'general',
      sound = true,
      actionUrl = null,
      actionLabel = null,
      tag = null,
    }) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const newNotif = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
        actionUrl,
        actionLabel,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);

      // Add toast
      setToasts((prev) => [...prev, newNotif]);

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);

      // Play sound
      if (sound && settings.soundEnabled) {
        playNotificationChime();
      }

      // Desktop notification
      sendDesktopNotification(title, message, tag, actionUrl);

      return id;
    },
    [settings.soundEnabled, sendDesktopNotification]
  );

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setToasts([]);
  };

  const updateSettings = (newPartial) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  // Helper to retrieve alerted slot keys for today
  const getAlertedKeys = () => {
    try {
      const today = getLocalDateString();
      const raw = sessionStorage.getItem(ALERTED_SLOTS_KEY);
      if (!raw) return { date: today, keys: {} };
      const parsed = JSON.parse(raw);
      if (parsed.date !== today) return { date: today, keys: {} };
      return parsed;
    } catch {
      return { date: getLocalDateString(), keys: {} };
    }
  };

  const setAlertedKey = (key) => {
    try {
      const current = getAlertedKeys();
      current.keys[key] = true;
      sessionStorage.setItem(ALERTED_SLOTS_KEY, JSON.stringify(current));
    } catch (e) {
      console.debug('Failed to save alerted key', e);
    }
  };

  // Load schedule for background checking
  useEffect(() => {
    getSchedule()
      .then((res) => {
        if (res?.data) scheduleRef.current = res.data;
      })
      .catch((e) => console.debug('Failed loading schedule for notifications', e));
  }, []);

  // Monitor routine slot starts and warnings
  useEffect(() => {
    if (!settings.routineAlerts) return;

    const checkRoutineSlots = () => {
      const schedule = scheduleRef.current;
      if (!schedule || !schedule.length) return;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const alerted = getAlertedKeys();

      for (const item of schedule) {
        const range = parseSlotRange(item.timeSlot);
        if (!range) continue;

        // 1. Check if slot just became active
        const { isActive, minutesRemaining } = isSlotActiveNow(item.timeSlot, now);
        const startKey = `active_${item.id || item.timeSlot}`;
        if (isActive && !alerted.keys[startKey]) {
          setAlertedKey(startKey);
          notify({
            title: '⏰ Routine Slot Active',
            message: `${item.activity} (${item.timeSlot}) is now active! (${minutesRemaining}m left)`,
            type: 'routine',
            actionUrl: '/schedule',
            actionLabel: 'View Schedule',
            tag: `slot-${item.id}`,
          });
        }

        // 2. Check 5-minute warning before upcoming slot
        const diff = range.startMinutes - currentMinutes;
        const warnKey = `warn_5m_${item.id || item.timeSlot}`;
        if (diff > 0 && diff <= 5 && !alerted.keys[warnKey]) {
          setAlertedKey(warnKey);
          notify({
            title: '⏳ Upcoming Routine Slot (5m)',
            message: `Starting in ${diff}m: ${item.activity} (${item.timeSlot})`,
            type: 'routine',
            actionUrl: '/schedule',
            actionLabel: 'Prepare Now',
            tag: `slot-warn-${item.id}`,
          });
        }
      }
    };

    checkRoutineSlots();
    const interval = setInterval(checkRoutineSlots, 15000);
    return () => clearInterval(interval);
  }, [settings.routineAlerts, notify]);

  // Monitor daily pending tasks & streak reminder in evening
  useEffect(() => {
    if (!settings.taskAlerts) return;

    const checkEveningTasks = async () => {
      const now = new Date();
      const hours = now.getHours();
      // Check in evening after 18:00 (6:00 PM) once per session
      if (hours >= 18) {
        const alerted = getAlertedKeys();
        const eveningKey = `evening_task_reminder_${hours >= 21 ? 'night' : 'evening'}`;
        if (!alerted.keys[eveningKey]) {
          try {
            const today = getLocalDateString();
            const res = await getTasks(today);
            const pendingTasks = (res?.data || []).filter((t) => !t.completed);
            if (pendingTasks.length > 0) {
              setAlertedKey(eveningKey);
              notify({
                title: '🔥 Protect Your Study Streak!',
                message: `You have ${pendingTasks.length} pending task${pendingTasks.length === 1 ? '' : 's'} remaining for today. Finish them before midnight!`,
                type: 'streak',
                actionUrl: '/tasks',
                actionLabel: "View Today's Tasks",
                tag: 'evening-task-reminder',
              });
            }
          } catch (e) {
            console.debug('Failed checking pending tasks for notification', e);
          }
        }
      }
    };

    checkEveningTasks();
    const interval = setInterval(checkEveningTasks, 60000);
    return () => clearInterval(interval);
  }, [settings.taskAlerts, notify]);

  // Global event listener for custom notifications
  useEffect(() => {
    const handleCustomNotify = (e) => {
      if (e?.detail) {
        notify(e.detail);
      }
    };
    window.addEventListener('app-notify', handleCustomNotify);
    return () => window.removeEventListener('app-notify', handleCustomNotify);
  }, [notify]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        settings,
        permissionStatus,
        notify,
        dismissToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        requestDesktopPermission,
        updateSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
