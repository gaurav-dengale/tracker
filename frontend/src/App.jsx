import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TodaysTasks from './pages/TodaysTasks';
import Schedule from './pages/Schedule';
import DsaTracker from './pages/DsaTracker';
import Subjects from './pages/Subjects';
import WeeklyProgress from './pages/WeeklyProgress';

function AppContent({ darkMode, setDarkMode }) {
  const { user, loading, isSupabaseConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading tracker...</p>
        </div>
      </div>
    );
  }

  // If Supabase is configured and the user is not authenticated, show Login screen
  if (isSupabaseConfigured && !user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TodaysTasks />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/dsa" element={<DsaTracker />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/weekly" element={<WeeklyProgress />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // default: dark
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </AuthProvider>
  );
}
