import { useState, useEffect } from 'react';
import {
  BarChart2, BookOpen, Brain, Code2, Terminal, Laptop,
  MessageSquare, Award, Plus, CheckCircle2, Circle, Trash2,
  Edit2, Save, X, ExternalLink, Calendar, ChevronDown, ChevronUp,
  Sparkles, Layers, Sliders, ListChecks, HelpCircle
} from 'lucide-react';
import {
  getDetailedSubjects, toggleSubjectTopic, addSubjectTopic,
  deleteSubjectTopic, createCustomSubject, updateSubjectMetadata,
  deleteCustomSubject, updateSubjectProgress, calculateSubjectProgressPct
} from '../api';
import { playSuccessChime, playChime } from '../lib/soundUtils';
import { triggerCelebration } from '../lib/confetti';
import ProgressBar from '../components/ProgressBar';

const ICONS_MAP = {
  Brain, Code2, Terminal, Laptop, MessageSquare, Award, BookOpen, Sparkles, Layers,
};

const COLOR_OPTIONS = [
  { id: 'purple', label: 'Purple', bg: 'from-purple-500 to-indigo-600', text: 'text-purple-600', dot: 'bg-purple-500' },
  { id: 'blue', label: 'Blue', bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600', dot: 'bg-blue-500' },
  { id: 'orange', label: 'Orange', bg: 'from-amber-500 to-orange-600', text: 'text-orange-600', dot: 'bg-orange-500' },
  { id: 'green', label: 'Green', bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  { id: 'pink', label: 'Pink', bg: 'from-pink-500 to-rose-600', text: 'text-pink-600', dot: 'bg-pink-500' },
  { id: 'yellow', label: 'Yellow', bg: 'from-amber-400 to-yellow-600', text: 'text-yellow-600', dot: 'bg-yellow-500' },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('syllabus'); // 'syllabus' | 'slider'

  // Expand/collapse states for subjects
  const [expandedSubjects, setExpandedSubjects] = useState({});

  // Quick slider edits state
  const [sliderEdits, setSliderEdits] = useState({});
  const [savedId, setSavedId] = useState(null);

  // New Subject Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubForm, setNewSubForm] = useState({
    subject: '',
    icon: 'BookOpen',
    accentColor: 'blue',
    targetDate: '',
    notes: '',
  });

  // Edit Subject Metadata modal
  const [editingSubject, setEditingSubject] = useState(null);

  // New topic input per module state: { [`${subjectId}_${moduleId}`]: string }
  const [newTopicInputs, setNewTopicInputs] = useState({});

  useEffect(() => {
    const list = getDetailedSubjects();
    setSubjects(list);
    
    // Default open first 2 subjects
    const initExpanded = {};
    if (list.length > 0) {
      initExpanded[list[0].id] = true;
      if (list[1]) initExpanded[list[1].id] = true;
    }
    setExpandedSubjects(initExpanded);

    const initialSliders = {};
    list.forEach((s) => {
      initialSliders[s.id] = s.progressPercentage ?? calculateSubjectProgressPct(s);
    });
    setSliderEdits(initialSliders);

    setLoading(false);
  }, []);

  const toggleSubjectExpand = (id) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTopicCheck = async (subjectId, moduleId, topicId) => {
    const res = await toggleSubjectTopic(subjectId, moduleId, topicId);
    setSubjects([...res.list]);

    // Update slider state
    setSliderEdits((prev) => ({ ...prev, [subjectId]: res.updatedPct }));

    if (res.updatedPct === 100) {
      triggerCelebration();
      playSuccessChime();
    } else {
      playChime();
    }
  };

  const handleAddTopic = (subjectId, moduleId) => {
    const key = `${subjectId}_${moduleId}`;
    const name = newTopicInputs[key];
    if (!name || !name.trim()) return;

    const updated = addSubjectTopic(subjectId, moduleId, name.trim());
    setSubjects([...updated]);
    setNewTopicInputs((prev) => ({ ...prev, [key]: '' }));
    playChime();
  };

  const handleDeleteTopic = async (subjectId, moduleId, topicId) => {
    const updated = await deleteSubjectTopic(subjectId, moduleId, topicId);
    setSubjects([...updated]);
  };

  const handleSaveSlider = async (subjectId) => {
    const pct = parseInt(sliderEdits[subjectId], 10);
    if (isNaN(pct)) return;
    try {
      await updateSubjectProgress(subjectId, pct);
      const updatedList = subjects.map((s) => (s.id === subjectId ? { ...s, progressPercentage: pct } : s));
      setSubjects(updatedList);
      setSavedId(subjectId);
      setTimeout(() => setSavedId(null), 2000);
      playSuccessChime();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubForm.subject.trim()) return;

    const colorObj = COLOR_OPTIONS.find((c) => c.id === newSubForm.accentColor) || COLOR_OPTIONS[0];

    const updated = createCustomSubject({
      subject: newSubForm.subject.trim(),
      icon: newSubForm.icon,
      color: colorObj.bg,
      accentColor: newSubForm.accentColor,
      targetDate: newSubForm.targetDate,
      notes: newSubForm.notes,
    });

    setSubjects([...updated]);
    setShowAddModal(false);
    setNewSubForm({ subject: '', icon: 'BookOpen', accentColor: 'blue', targetDate: '', notes: '' });
    playSuccessChime();
  };

  const handleUpdateSubject = (e) => {
    e.preventDefault();
    if (!editingSubject || !editingSubject.subject.trim()) return;

    const colorObj = COLOR_OPTIONS.find((c) => c.id === editingSubject.accentColor) || COLOR_OPTIONS[0];

    const updated = updateSubjectMetadata(editingSubject.id, {
      subject: editingSubject.subject.trim(),
      icon: editingSubject.icon,
      color: colorObj.bg,
      accentColor: editingSubject.accentColor,
      targetDate: editingSubject.targetDate,
      notes: editingSubject.notes,
    });

    setSubjects([...updated]);
    setEditingSubject(null);
    playChime();
  };

  const handleDeleteSubject = (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this custom subject?')) return;
    const updated = deleteCustomSubject(subjectId);
    setSubjects([...updated]);
  };

  // Overall syllabus stats
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;
  subjects.forEach((s) => {
    (s.modules || []).forEach((m) => {
      (m.topics || []).forEach((t) => {
        totalTopicsCount++;
        if (t.completed) completedTopicsCount++;
      });
    });
  });

  const overallPct = subjects.length > 0
    ? Math.round(
        subjects.reduce((sum, s) => {
          const pct = s.modules && s.modules.length > 0 ? calculateSubjectProgressPct(s) : (s.progressPercentage || 0);
          return sum + pct;
        }, 0) / subjects.length
      )
    : 0;

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-sm">Loading Subject Roadmaps...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              Syllabus Roadmap & Tracker
            </span>
            <span className="text-xs text-gray-400">{subjects.length} Subjects Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            Subject Progress & Syllabus
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Check off subtopics to auto-calculate progress, or use quick sliders.
          </p>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center text-xs">
            <button
              onClick={() => setViewMode('syllabus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'syllabus'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Syllabus Checklist</span>
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === 'slider'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Quick Sliders</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary shadow-sm hover:shadow text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Subject</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Banner */}
      <div className="card p-6 bg-gradient-to-r from-purple-900/10 via-primary-900/5 to-indigo-900/10 dark:from-purple-950/40 dark:via-gray-900 dark:to-indigo-950/40 border-purple-100 dark:border-purple-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Overall Syllabus Mastery
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                {overallPct}% Completed
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {completedTopicsCount} of {totalTopicsCount} syllabus topics marked done across all {subjects.length} subjects
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
              <span>Overall Average</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{overallPct}%</span>
            </div>
            <ProgressBar value={overallPct} max={100} />
          </div>
        </div>
      </div>

      {/* Subject Cards List */}
      <div className="space-y-4">
        {subjects.map((subject) => {
          const IconComp = ICONS_MAP[subject.icon] || BookOpen;
          const isExpanded = expandedSubjects[subject.id] ?? false;
          const pct = subject.modules && subject.modules.length > 0
            ? calculateSubjectProgressPct(subject)
            : (subject.progressPercentage || 0);

          const colorObj = COLOR_OPTIONS.find((c) => c.id === subject.accentColor) || COLOR_OPTIONS[0];

          // Subtopic counts
          let subTotal = 0;
          let subDone = 0;
          (subject.modules || []).forEach((m) => {
            (m.topics || []).forEach((t) => {
              subTotal++;
              if (t.completed) subDone++;
            });
          });

          return (
            <div
              key={subject.id}
              className="card overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <div
                  onClick={() => toggleSubjectExpand(subject.id)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer select-none"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subject.color || colorObj.bg} flex items-center justify-center text-white shadow-sm flex-shrink-0`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {subject.subject}
                      </h3>
                      {pct === 100 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> 100% Done
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {subTotal > 0 ? (
                        <span>{subDone} of {subTotal} topics done</span>
                      ) : (
                        <span>Manual tracker</span>
                      )}
                      {subject.targetDate && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span className="flex items-center gap-1 text-[11px] text-primary-600 dark:text-primary-400">
                            <Calendar className="w-3 h-3" /> Target: {subject.targetDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Indicator & Controls */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="w-28 sm:w-36 text-right">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingSubject({ ...subject })}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Edit Subject details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {subject.id > 6 && (
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete custom subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => toggleSubjectExpand(subject.id)}
                      className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Slider View Mode Quick Editor */}
              {viewMode === 'slider' && (
                <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-gray-500 font-medium">Manual Percentage Slider:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    className="flex-1 accent-primary-600 min-w-[150px]"
                    value={sliderEdits[subject.id] ?? pct}
                    onChange={(e) =>
                      setSliderEdits((prev) => ({ ...prev, [subject.id]: parseInt(e.target.value) }))
                    }
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="input-field w-16 text-center py-1 text-xs"
                    value={sliderEdits[subject.id] ?? pct}
                    onChange={(e) =>
                      setSliderEdits((prev) => ({ ...prev, [subject.id]: e.target.value }))
                    }
                  />
                  <button
                    className="btn-primary py-1 px-3 text-xs"
                    onClick={() => handleSaveSlider(subject.id)}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savedId === subject.id ? 'Saved ✓' : 'Save'}
                  </button>
                </div>
              )}

              {/* Syllabus Accordion Body */}
              {isExpanded && viewMode === 'syllabus' && (
                <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-5 space-y-4">
                  {/* Subject Notes / Strategy */}
                  {subject.notes && (
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300">
                      <span className="font-bold mr-1">Study Strategy:</span>
                      {subject.notes}
                    </div>
                  )}

                  {/* Modules & Topics */}
                  <div className="space-y-4">
                    {(subject.modules || []).map((mod) => (
                      <div
                        key={mod.id}
                        className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                            {mod.name}
                          </h4>
                          <span className="text-[11px] text-gray-400">
                            {(mod.topics || []).filter((t) => t.completed).length} / {(mod.topics || []).length} done
                          </span>
                        </div>

                        {/* Topics Checklist */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {(mod.topics || []).map((topic) => (
                            <div
                              key={topic.id}
                              onClick={() => handleTopicCheck(subject.id, mod.id, topic.id)}
                              className={`p-2.5 rounded-lg border flex items-start justify-between gap-2.5 cursor-pointer transition-all ${
                                topic.completed
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                  : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/60 dark:border-gray-800 hover:border-primary-400'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                <button
                                  type="button"
                                  className="mt-0.5 flex-shrink-0 text-gray-400 focus:outline-none"
                                >
                                  {topic.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                                  ) : (
                                    <Circle className="w-4 h-4 hover:text-primary-500" />
                                  )}
                                </button>
                                <span
                                  className={`text-xs leading-relaxed ${
                                    topic.completed
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {topic.name}
                                </span>
                              </div>

                              {/* Custom Topic Delete Button */}
                              {topic.id.startsWith('custom_') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTopic(subject.id, mod.id, topic.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 p-0.5"
                                  title="Delete subtopic"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Topic Input for this Module */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="+ Add custom topic to this module..."
                            className="input-field py-1 px-2.5 text-xs"
                            value={newTopicInputs[`${subject.id}_${mod.id}`] || ''}
                            onChange={(e) =>
                              setNewTopicInputs((prev) => ({
                                ...prev,
                                [`${subject.id}_${mod.id}`]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic(subject.id, mod.id)}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddTopic(subject.id, mod.id)}
                            className="btn-secondary py-1 px-2.5 text-xs flex-shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resource Links Drawer */}
                  {(subject.resources || []).length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Attached Resources & Study Links:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subject.resources.map((res, idx) => (
                          <a
                            key={idx}
                            href={res.url || '#'}
                            target={res.url ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-all"
                          >
                            <span>{res.title}</span>
                            {res.url && <ExternalLink className="w-3 h-3 text-gray-400" />}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Add New Custom Subject
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="label">Subject Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. System Design / Computer Networks"
                  value={newSubForm.subject}
                  onChange={(e) => setNewSubForm({ ...newSubForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color Theme</label>
                  <select
                    className="input-field"
                    value={newSubForm.accentColor}
                    onChange={(e) => setNewSubForm({ ...newSubForm, accentColor: e.target.value })}
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Target Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newSubForm.targetDate}
                    onChange={(e) => setNewSubForm({ ...newSubForm, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Study Notes & Goal (Optional)</label>
                <textarea
                  rows={2}
                  className="input-field text-xs"
                  placeholder="e.g. Complete by end of the month with daily 1 hr study..."
                  value={newSubForm.notes}
                  onChange={(e) => setNewSubForm({ ...newSubForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4" />
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Metadata Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Edit Subject Details
                </h3>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div>
                <label className="label">Subject Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editingSubject.subject}
                  onChange={(e) => setEditingSubject({ ...editingSubject, subject: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Color Theme</label>
                  <select
                    className="input-field"
                    value={editingSubject.accentColor}
                    onChange={(e) => setEditingSubject({ ...editingSubject, accentColor: e.target.value })}
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Target Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={editingSubject.targetDate || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Study Notes & Strategy</label>
                <textarea
                  rows={3}
                  className="input-field text-xs"
                  value={editingSubject.notes || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
