import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Save, Search, Star, ExternalLink, CheckCircle2, Circle,
  Clock, Flame, Filter, ChevronDown, ChevronUp, StickyNote, Plus,
  Sparkles, Layers, FileText, GitCommit, Repeat, Database,
  Maximize2, GitFork, Share2, Cpu, Award, X, Play, RotateCcw
} from 'lucide-react';
import {
  getDsaProgress, updateDsaProgress, updateDsaTargetHours,
  getDsaSheetState, toggleDsaProblemSolved, toggleDsaProblemStarred,
  saveDsaProblemNote, getDsaStudySessions, logDsaStudySession
} from '../api';
import { DSA_TOPICS, DSA_PROBLEMS } from '../data/dsaSheetData';
import { playSuccessChime, playChime } from '../lib/soundUtils';
import { triggerCelebration } from '../lib/confetti';
import ProgressBar from '../components/ProgressBar';

const ICONS = {
  Sparkles, Layers, Search, FileText, GitCommit, Repeat,
  Database, Maximize2, GitFork, Share2, Cpu, Flame,
};

export default function DsaTracker() {
  const [dsa, setDsa] = useState(null);
  const [inputHours, setInputHours] = useState('');
  const [targetHoursInput, setTargetHoursInput] = useState('');
  const [editingTarget, setEditingTarget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sheet state
  const [solvedIds, setSolvedIds] = useState([]);
  const [starredIds, setStarredIds] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [sessions, setSessions] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, solved, unsolved, starred

  // UI state
  const [expandedTopics, setExpandedTopics] = useState(() => {
    // Open first 2 topics by default
    const init = {};
    if (DSA_TOPICS.length > 0) {
      init[DSA_TOPICS[0].id] = true;
      if (DSA_TOPICS[1]) init[DSA_TOPICS[1].id] = true;
    }
    return init;
  });

  // Notes Modal state
  const [activeNoteProblem, setActiveNoteProblem] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Study Session Logger modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ durationHours: 1.5, topic: 'Arrays (Two Pointers)', notes: '' });
  const [showSessionsList, setShowSessionsList] = useState(false);

  useEffect(() => {
    Promise.all([getDsaProgress()])
      .then(([res]) => {
        setDsa(res.data);
        setInputHours(String(res.data.completedHours));
        setTargetHoursInput(String(res.data.totalHours || 110));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load sheet state from local storage
    const state = getDsaSheetState();
    setSolvedIds(state.solvedIds || []);
    setStarredIds(state.starredIds || []);
    setNotesMap(state.notes || {});
    setSessions(getDsaStudySessions() || []);
  }, []);

  const handleSaveHours = async () => {
    const hours = parseFloat(inputHours);
    if (isNaN(hours) || hours < 0) return;
    setSaving(true);
    try {
      const res = await updateDsaProgress(hours);
      setDsa(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTarget = async () => {
    const target = parseFloat(targetHoursInput);
    if (isNaN(target) || target <= 0) return;
    try {
      const res = await updateDsaTargetHours(target);
      setDsa(res.data);
      setEditingTarget(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSolved = (problemId, e) => {
    e?.stopPropagation();
    const res = toggleDsaProblemSolved(problemId);
    setSolvedIds(res.solvedIds);

    if (res.isSolved) {
      playSuccessChime();
      // Check if this topic reached 100%
      const prob = DSA_PROBLEMS.find((p) => p.id === problemId);
      if (prob) {
        const topicProblems = DSA_PROBLEMS.filter((p) => p.topicId === prob.topicId);
        const allSolved = topicProblems.every((p) => p.id === problemId || res.solvedIds.includes(p.id));
        if (allSolved) {
          triggerCelebration();
        }
      }
    } else {
      playChime();
    }
  };

  const handleToggleStarred = (problemId, e) => {
    e?.stopPropagation();
    const res = toggleDsaProblemStarred(problemId);
    setStarredIds(res.starredIds);
    playChime();
  };

  const openNoteModal = (problem, e) => {
    e?.stopPropagation();
    setActiveNoteProblem(problem);
    setNoteText(notesMap[problem.id] || '');
  };

  const handleSaveNote = () => {
    if (!activeNoteProblem) return;
    const updated = saveDsaProblemNote(activeNoteProblem.id, noteText);
    setNotesMap({ ...updated });
    setActiveNoteProblem(null);
  };

  const handleLogSession = async (e) => {
    e.preventDefault();
    const dur = parseFloat(sessionForm.durationHours);
    if (isNaN(dur) || dur <= 0) return;

    const res = await logDsaStudySession({
      durationHours: dur,
      topic: sessionForm.topic,
      notes: sessionForm.notes,
    });

    setSessions(getDsaStudySessions());
    setInputHours(String(res.newCompletedHours));
    setDsa((prev) => prev ? {
      ...prev,
      completedHours: res.newCompletedHours,
      remainingHours: Math.max(0, prev.totalHours - res.newCompletedHours),
      percentageCompleted: Math.min(100, Math.round((res.newCompletedHours / prev.totalHours) * 100)),
    } : null);

    setShowSessionModal(false);
    playSuccessChime();
    setSessionForm({ durationHours: 1.5, topic: 'Arrays (Two Pointers)', notes: '' });
  };

  const toggleAccordion = (topicId) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const expandAll = () => {
    const all = {};
    DSA_TOPICS.forEach((t) => { all[t.id] = true; });
    setExpandedTopics(all);
  };

  const collapseAll = () => {
    setExpandedTopics({});
  };

  // Filtered problems list
  const filteredProblems = useMemo(() => {
    return DSA_PROBLEMS.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchPlatform = p.platform.toLowerCase().includes(q);
        if (!matchTitle && !matchPlatform) return false;
      }
      // Topic
      if (selectedTopic !== 'all' && p.topicId !== selectedTopic) {
        return false;
      }
      // Difficulty
      if (selectedDifficulty !== 'all' && p.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }
      // Status
      const isSolved = solvedIds.includes(p.id);
      const isStarred = starredIds.includes(p.id);
      if (selectedStatus === 'solved' && !isSolved) return false;
      if (selectedStatus === 'unsolved' && isSolved) return false;
      if (selectedStatus === 'starred' && !isStarred) return false;

      return true;
    });
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, solvedIds, starredIds]);

  // Overall stats
  const totalProblems = DSA_PROBLEMS.length;
  const solvedCount = solvedIds.length;
  const sheetPct = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  const easyTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const easySolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Easy' && solvedIds.includes(p.id)).length;

  const medTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const medSolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Medium' && solvedIds.includes(p.id)).length;

  const hardTotal = DSA_PROBLEMS.filter((p) => p.difficulty === 'Hard').length;
  const hardSolved = DSA_PROBLEMS.filter((p) => p.difficulty === 'Hard' && solvedIds.includes(p.id)).length;

  const tcsTotal = DSA_PROBLEMS.filter((p) => p.topicId === 'tcs-nqt').length;
  const tcsSolved = DSA_PROBLEMS.filter((p) => p.topicId === 'tcs-nqt' && solvedIds.includes(p.id)).length;

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading DSA Sheet & Tracker...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              Striver A2Z + TCS NQT
            </span>
            <span className="text-xs text-gray-400">Target: {dsa?.totalHours ?? 110} Hours</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            DSA Problem & Hours Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track solved problems, revision bookmarks, notes, and study hours in one place.
          </p>
        </div>

        {/* Quick Log Session Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSessionModal(true)}
            className="btn-primary shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Study Session</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hours Target */}
        <div className="card p-5 relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-gray-900 dark:to-gray-900 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
              {dsa?.percentageCompleted ?? 0}% Done
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Study Hours Logged</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {dsa?.completedHours ?? 0}h
            </span>
            <span className="text-xs text-gray-400">/ {dsa?.totalHours ?? 110}h target</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={dsa?.percentageCompleted ?? 0} max={100} />
          </div>
        </div>

        {/* Card 2: Problems Solved */}
        <div className="card p-5 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900 border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
              {sheetPct}% Solved
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Sheet Problems</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {solvedCount}
            </span>
            <span className="text-xs text-gray-400">/ {totalProblems} total</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={sheetPct} max={100} />
          </div>
        </div>

        {/* Card 3: Difficulty Breakdown */}
        <div className="card p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Difficulty Stats</p>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Easy</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{easySolved} / {easyTotal}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${easyTotal ? (easySolved/easyTotal)*100 : 0}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-amber-500">Medium</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{medSolved} / {medTotal}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${medTotal ? (medSolved/medTotal)*100 : 0}%` }} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-semibold text-rose-500">Hard</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{hardSolved} / {hardTotal}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hardTotal ? (hardSolved/hardTotal)*100 : 0}%` }} />
          </div>
        </div>

        {/* Card 4: TCS Priority & Starred */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <Flame className="w-4 h-4" /> TCS Must-Do
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {tcsSolved}/{tcsTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${tcsTotal ? (tcsSolved/tcsTotal)*100 : 0}%` }} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'starred' ? 'all' : 'starred')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                selectedStatus === 'starred'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{starredIds.length} Starred for Revision</span>
            </button>
            <button
              onClick={() => setShowSessionsList(!showSessionsList)}
              className="text-primary-600 dark:text-primary-400 hover:underline text-xs"
            >
              {sessions.length} Logs
            </button>
          </div>
        </div>
      </div>

      {/* Manual Hour Update & Target Setting Drawer */}
      <div className="card p-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-primary-500" />
            <span>Manual Hours Adjustment:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="500"
                step="0.5"
                className="input-field w-24 text-center py-1 px-2 text-sm"
                placeholder="Hours"
                value={inputHours}
                onChange={(e) => setInputHours(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveHours()}
              />
              <span className="text-xs text-gray-500">hours</span>
            </div>

            <button
              className="btn-primary py-1 px-3 text-xs"
              onClick={handleSaveHours}
              disabled={saving}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Update Hours'}
            </button>

            {editingTarget ? (
              <div className="flex items-center gap-1.5 ml-2">
                <input
                  type="number"
                  min="10"
                  max="1000"
                  className="input-field w-20 text-center py-1 px-2 text-xs"
                  value={targetHoursInput}
                  onChange={(e) => setTargetHoursInput(e.target.value)}
                  placeholder="Target"
                />
                <button onClick={handleSaveTarget} className="btn-secondary py-1 px-2 text-xs">Save</button>
                <button onClick={() => setEditingTarget(false)} className="text-gray-400 text-xs hover:text-gray-600">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingTarget(true)}
                className="text-xs text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 underline ml-2"
              >
                Change Target ({dsa?.totalHours ?? 110}h)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Study Sessions History Drawer */}
      {showSessionsList && (
        <div className="card p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" /> Recent Study Session Logs ({sessions.length})
            </h3>
            <button
              onClick={() => setShowSessionsList(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="text-xs text-gray-400 py-3 text-center">No study sessions logged yet. Click "+ Log Study Session" to record your study time!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sessions.slice(0, 10).map((s) => (
                <div key={s.id} className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">{s.topic}</span>
                    {s.notes && <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 line-clamp-1">{s.notes}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className="font-bold text-primary-600 dark:text-primary-400">+{s.durationHours}h</span>
                    <p className="text-[10px] text-gray-400">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems (e.g. Two Sum, Binary Search, Kadane, Matrix)..."
              className="input-field pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Topic Select */}
          <select
            className="input-field md:w-56"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="all">All Topics (12 Steps)</option>
            {DSA_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium mr-1">Difficulty:</span>
            {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff.toLowerCase())}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedDifficulty === diff.toLowerCase()
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'unsolved', label: 'Unsolved' },
              { id: 'solved', label: 'Solved ✓' },
              { id: 'starred', label: '★ Starred' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  selectedStatus === st.id
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Expand/Collapse All */}
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
            >
              Expand All
            </button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <button
              onClick={collapseAll}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Topics Accordion List */}
      <div className="space-y-4">
        {DSA_TOPICS.map((topic) => {
          const topicProblems = DSA_PROBLEMS.filter((p) => p.topicId === topic.id);
          const visibleProblems = filteredProblems.filter((p) => p.topicId === topic.id);
          
          // If searching/filtering and no problems match this topic, skip showing it
          if (visibleProblems.length === 0 && (searchQuery || selectedDifficulty !== 'all' || selectedStatus !== 'all' || (selectedTopic !== 'all' && selectedTopic !== topic.id))) {
            return null;
          }

          const isExpanded = expandedTopics[topic.id] ?? false;
          const topicSolvedCount = topicProblems.filter((p) => solvedIds.includes(p.id)).length;
          const topicTotalCount = topicProblems.length;
          const topicPct = topicTotalCount > 0 ? Math.round((topicSolvedCount / topicTotalCount) * 100) : 0;
          const isAllDone = topicTotalCount > 0 && topicSolvedCount === topicTotalCount;

          const IconComponent = ICONS[topic.icon] || BookOpen;

          return (
            <div
              key={topic.id}
              className={`card overflow-hidden transition-all duration-200 border ${
                isAllDone
                  ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleAccordion(topic.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">
                        {topic.name}
                      </h3>
                      {isAllDone && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>{topicSolvedCount} of {topicTotalCount} solved</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                      <span>{topicPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Mini Progress Bar */}
                  <div className="hidden sm:block w-28">
                    <ProgressBar value={topicPct} max={100} />
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Problem List */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800/60 bg-gray-50/30 dark:bg-gray-900/40">
                  {visibleProblems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No problems match your current filters in this step.
                    </div>
                  ) : (
                    visibleProblems.map((problem) => {
                      const isSolved = solvedIds.includes(problem.id);
                      const isStarred = starredIds.includes(problem.id);
                      const hasNotes = Boolean(notesMap[problem.id]);

                      return (
                        <div
                          key={problem.id}
                          className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                            isSolved
                              ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                              : 'hover:bg-white dark:hover:bg-gray-800/60'
                          }`}
                        >
                          {/* Checkbox & Title */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button
                              onClick={(e) => handleToggleSolved(problem.id, e)}
                              className="flex-shrink-0 text-gray-400 hover:text-emerald-500 transition-colors focus:outline-none"
                              title={isSolved ? 'Mark as unsolved' : 'Mark as solved'}
                            >
                              {isSolved ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-5 h-5 hover:text-primary-500" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-sm font-medium ${
                                    isSolved
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}
                                >
                                  {problem.title}
                                </span>

                                {/* Difficulty Badge */}
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                    problem.difficulty === 'Easy'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : problem.difficulty === 'Medium'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  }`}
                                >
                                  {problem.difficulty}
                                </span>

                                {/* TCS Priority tag */}
                                {problem.tcsPriority === 'High' && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                                    TCS Hot
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions: Notes, Star, Link */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Notes Icon */}
                            <button
                              onClick={(e) => openNoteModal(problem, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                hasNotes
                                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/60 dark:text-primary-300'
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              title={hasNotes ? 'View/Edit problem notes' : 'Add problem notes'}
                            >
                              <StickyNote className="w-4 h-4" />
                            </button>

                            {/* Star / Bookmark Icon */}
                            <button
                              onClick={(e) => handleToggleStarred(problem.id, e)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isStarred
                                  ? 'text-amber-500 fill-amber-400 bg-amber-50 dark:bg-amber-950/60'
                                  : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                              title={isStarred ? 'Remove from revision list' : 'Bookmark for revision'}
                            >
                              <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                            </button>

                            {/* External Problem Link */}
                            {problem.url && (
                              <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={`Open on ${problem.platform}`}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Note Modal */}
      {activeNoteProblem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Problem Notes & Approach
                </h3>
              </div>
              <button
                onClick={() => setActiveNoteProblem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Problem:</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activeNoteProblem.title}
              </p>
            </div>

            <div>
              <label className="label">Notes / Algorithm / Key Insights / Edge Cases</label>
              <textarea
                rows={5}
                className="input-field font-mono text-xs"
                placeholder="e.g. Use Two Pointers. Maintain left & right index. Time: O(N), Space: O(1)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveNoteProblem(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="btn-primary"
              >
                <Save className="w-4 h-4" />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Study Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Log DSA Study Session
                </h3>
              </div>
              <button
                onClick={() => setShowSessionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="space-y-4">
              <div>
                <label className="label">Hours Studied Today</label>
                <div className="flex gap-2">
                  {[0.5, 1, 1.5, 2, 2.5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSessionForm({ ...sessionForm, durationHours: val })}
                      className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                        sessionForm.durationHours === val
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {val}h
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  className="input-field mt-2"
                  value={sessionForm.durationHours}
                  onChange={(e) => setSessionForm({ ...sessionForm, durationHours: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Topic Studied</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Binary Search on Answer, Trees BFS"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Session Notes (Optional)</label>
                <textarea
                  rows={2}
                  className="input-field text-xs"
                  placeholder="e.g. Solved 4 Medium questions on LeetCode..."
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4" />
                  Record & Add Hours
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
