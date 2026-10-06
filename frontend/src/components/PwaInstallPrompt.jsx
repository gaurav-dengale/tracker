import { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, Check } from 'lucide-react';
import { promptPwaInstall, isPwaInstalled } from '../pwa';

export default function PwaInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('nqt_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isPwaInstalled()) {
      setIsInstalled(true);
      return;
    }

    const handleInstallable = () => setCanInstall(true);
    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const success = await promptPwaInstall();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('nqt_pwa_dismissed', 'true');
    } catch (e) {
      console.debug(e);
    }
  };

  if (isInstalled || !canInstall || dismissed) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-600/20 via-indigo-600/20 to-purple-600/20 border border-primary-500/30 text-xs text-primary-300 animate-in fade-in duration-300">
      <Smartphone className="w-3.5 h-3.5 text-primary-400" />
      <span className="font-semibold text-gray-200">Install App</span>
      <button
        onClick={handleInstallClick}
        className="px-2.5 py-0.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm"
      >
        <Download className="w-3 h-3" /> Install
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 text-gray-400 hover:text-white rounded-md transition-colors"
        title="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
