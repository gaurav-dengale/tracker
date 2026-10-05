import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TodaysTasks from './pages/TodaysTasks';
import Schedule from './pages/Schedule';
import DsaTracker from './pages/DsaTracker';
import Subjects from './pages/Subjects';
import WeeklyProgress from './pages/WeeklyProgress';

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
