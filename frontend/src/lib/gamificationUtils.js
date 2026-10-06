// Gamification & XP System for TCS NQT Study Tracker

const STORAGE_KEY_XP = 'nqt_user_xp';
const STORAGE_KEY_QUIZ_HISTORY = 'nqt_quiz_history';

export const LEVEL_TIERS = [
  { level: 1, minXp: 0, title: 'NQT Aspirant', icon: '🌱' },
  { level: 2, minXp: 200, title: 'Aptitude Explorer', icon: '🎯' },
  { level: 3, minXp: 500, title: 'Logic Builder', icon: '🧠' },
  { level: 4, minXp: 1000, title: 'Code Warrior', icon: '⚔️' },
  { level: 5, minXp: 1800, title: 'Striver Grinder', icon: '🔥' },
  { level: 6, minXp: 2800, title: 'Speed Solver', icon: '⚡' },
  { level: 7, minXp: 4000, title: 'Mock Test Ace', icon: '🏆' },
  { level: 8, minXp: 5500, title: 'Ninja Ranker', icon: '🥋' },
  { level: 9, minXp: 7500, title: 'Digital Contender', icon: '👑' },
  { level: 10, minXp: 10000, title: 'TCS Digital Master', icon: '🚀' },
];

export function getUserXp() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_XP);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addXp(amount) {
  try {
    const current = getUserXp();
    const updated = current + amount;
    localStorage.setItem(STORAGE_KEY_XP, updated.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: updated, diff: amount } }));
    }
    return updated;
  } catch {
    return getUserXp();
  }
}

export function deductXp(amount) {
  try {
    const current = getUserXp();
    const updated = Math.max(0, current - amount);
    localStorage.setItem(STORAGE_KEY_XP, updated.toString());
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xp-updated', { detail: { xp: updated, diff: -amount } }));
    }
    return updated;
  } catch {
    return getUserXp();
  }
}

export function getLevelInfo(xp) {
  const currentXp = xp !== undefined ? xp : getUserXp();
  let currentTier = LEVEL_TIERS[0];
  let nextTier = LEVEL_TIERS[1];

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (currentXp >= LEVEL_TIERS[i].minXp) {
      currentTier = LEVEL_TIERS[i];
      nextTier = LEVEL_TIERS[i + 1] || null;
      break;
    }
  }

  const prevMin = currentTier.minXp;
  const nextMin = nextTier ? nextTier.minXp : currentTier.minXp + 2000;
  const progressInLevel = Math.max(0, currentXp - prevMin);
  const neededInLevel = nextMin - prevMin;
  const percentage = Math.min(100, Math.round((progressInLevel / neededInLevel) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    icon: currentTier.icon,
    currentXp,
    nextTierXp: nextMin,
    progressInLevel,
    neededInLevel,
    percentage,
  };
}

export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUIZ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizResult(category, score, total, timeSpentSeconds) {
  try {
    const history = getQuizHistory();
    const entry = {
      id: Date.now(),
      category,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      timeSpentSeconds,
      date: new Date().toISOString(),
    };
    const updated = [entry, ...history].slice(0, 50); // Keep last 50 attempts
    localStorage.setItem(STORAGE_KEY_QUIZ_HISTORY, JSON.stringify(updated));
    
    // Reward XP based on performance
    const earnedXp = score * 30 + (score === total ? 50 : 10);
    addXp(earnedXp);
    
    return { entry, earnedXp };
  } catch {
    return null;
  }
}

export function getBadges(stats = {}) {
  const { streak = 0, dsaHours = 0, completedTasksCount = 0, quizCount = 0 } = stats;
  const xp = getUserXp();

  return [
    {
      id: 'first_step',
      name: 'First Step',
      description: 'Logged your first study session or task',
      icon: '🌱',
      unlocked: completedTasksCount >= 1 || xp > 0,
    },
    {
      id: 'streak_3',
      name: 'Consistent Spark',
      description: 'Maintained a 3-day study streak',
      icon: '🔥',
      unlocked: streak >= 3,
    },
    {
      id: 'streak_7',
      name: 'Weekly Legend',
      description: 'Crushed a 7-day study streak',
      icon: '⚡',
      unlocked: streak >= 7,
    },
    {
      id: 'dsa_10',
      name: 'DSA Starter',
      description: 'Completed 10+ hours of Striver DSA Sheet',
      icon: '💻',
      unlocked: dsaHours >= 10,
    },
    {
      id: 'dsa_50',
      name: 'DSA Champion',
      description: 'Completed 50+ hours of Striver DSA Sheet',
      icon: '🛡️',
      unlocked: dsaHours >= 50,
    },
    {
      id: 'quiz_master',
      name: 'Quiz Master',
      description: 'Attempted 5+ TCS NQT Practice Quizzes',
      icon: '🎯',
      unlocked: quizCount >= 5,
    },
    {
      id: 'task_pro',
      name: 'Task Terminator',
      description: 'Checked off 25+ daily routine tasks',
      icon: '✅',
      unlocked: completedTasksCount >= 25,
    },
    {
      id: 'level_5',
      name: 'High Flyer',
      description: 'Reached Level 5 in TCS NQT Prep XP',
      icon: '👑',
      unlocked: xp >= 1800,
    },
  ];
}
