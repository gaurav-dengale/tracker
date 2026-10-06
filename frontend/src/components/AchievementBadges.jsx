import { useState, useEffect } from 'react';
import { Award, Trophy, Star, Lock, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { getBadges, getUserXp, getLevelInfo } from '../lib/gamificationUtils';

export default function AchievementBadges({ stats = {} }) {
  const [xp, setXp] = useState(getUserXp());

  useEffect(() => {
    const handleXpUpdate = (e) => {
      if (e?.detail?.xp !== undefined) {
        setXp(e.detail.xp);
      } else {
        setXp(getUserXp());
      }
    };
    window.addEventListener('xp-updated', handleXpUpdate);
    return () => window.removeEventListener('xp-updated', handleXpUpdate);
  }, []);

  const levelInfo = getLevelInfo(xp);
  const badges = getBadges({ ...stats, xp });
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Preparation Badges & Level
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {unlockedCount} of {badges.length} badges unlocked
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-base">{levelInfo.icon}</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            Level {levelInfo.level}: {levelInfo.title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-500 font-bold border border-primary-500/20">
            {xp} XP
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-3 rounded-xl border transition-all text-center relative overflow-hidden group ${
              badge.unlocked
                ? 'bg-amber-500/5 border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5'
                : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-800 opacity-50 grayscale'
            }`}
          >
            <div className="text-2xl mb-1 flex justify-center">
              {badge.icon}
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {badge.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
              {badge.description}
            </p>

            {badge.unlocked ? (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1.5">
                <Sparkles className="w-2.5 h-2.5" /> Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-400 mt-1.5">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
