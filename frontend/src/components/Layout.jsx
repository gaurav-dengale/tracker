import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  BookOpen,
  BarChart2,
  Calendar,
  Moon,
  Sun,
  Menu,
  X,
  GraduationCap,
  LogOut,
  User as UserIcon,
  Timer,
  BookMarked,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PomodoroTimer from './PomodoroTimer';
import Scratchpad from './Scratchpad';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: "Today's Tasks", icon: CheckSquare },
  { to: '/quiz', label: 'Practice & Quiz', icon: Zap },
  { to: '/schedule', label: 'Schedule', icon: Clock },
  { to: '/dsa', label: 'DSA Tracker', icon: BookOpen },
  { to: '/subjects', label: 'Subjects', icon: BarChart2 },
  { to: '/weekly', label: 'Weekly Progress', icon: Calendar },
];

export default function Layout({ children, darkMode, setDarkMode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <img
            src="/icon-192.png"
            alt="TCS NQT Icon"
            className="w-9 h-9 rounded-xl shadow-md shadow-primary-500/20 object-cover"
          />
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">TCS NQT</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Study Tracker</p>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-primary-600/20 text-primary-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {user.email ? user.email.slice(0, 2).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                title="Log Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="px-2 pt-1 flex justify-between items-center text-[11px] text-gray-400 dark:text-gray-500">
            <span>Exam: January 2027</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-2 sm:gap-3">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mr-1"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Quick Focus Pomodoro Timer Button */}
          <button
            onClick={() => setPomodoroOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/50 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800/60 text-primary-700 dark:text-primary-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Open Focus Timer"
          >
            <Timer className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="hidden sm:inline">Focus Timer</span>
          </button>

          {/* Quick Formulas Scratchpad Button */}
          <button
            onClick={() => setScratchpadOpen(true)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title="Formulas & Notes Scratchpad"
          >
            <BookMarked className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Global Overlays */}
      <PomodoroTimer isOpen={pomodoroOpen} onClose={() => setPomodoroOpen(false)} />
      <Scratchpad isOpen={scratchpadOpen} onClose={() => setScratchpadOpen(false)} />
    </div>
  );
}
