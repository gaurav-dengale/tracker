import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { getLocalDateString } from './lib/dateUtils';
import { DEFAULT_SUBJECT_SYLLABUS } from './data/subjectSyllabusData';

const PRIORITY_TAG_REGEX = /\[PRIORITY:(HIGH|MEDIUM|LOW)\]\s*/i;

function encodePriority(notes, priority) {
  const p = (priority || 'MEDIUM').toUpperCase();
  const cleanNotes = (notes || '').replace(PRIORITY_TAG_REGEX, '').trim();
  return `[PRIORITY:${p}]` + (cleanNotes ? ` ${cleanNotes}` : '');
}

// Helper to format/decode task row from DB
function formatTask(row) {
  if (!row) return null;
  let priority = row.priority;
  let notes = row.notes || '';

  const match = notes.match(PRIORITY_TAG_REGEX);
  if (match) {
    if (!priority) {
      priority = match[1].toUpperCase();
    }
    notes = notes.replace(PRIORITY_TAG_REGEX, '').trim();
  }

  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    priority: (priority || 'MEDIUM').toUpperCase(),
    date: row.date,
    plannedDuration: row.planned_duration || row.plannedDuration || '',
    completed: Boolean(row.completed),
    notes,
    createdAt: row.created_at || row.createdAt,
  };
}

// Helper to format DSA row from DB
function formatDsa(row) {
  const totalHours = row?.total_hours ?? 110.0;
  const completedHours = row?.completed_hours ?? 0.0;
  const remainingHours = Math.max(0, totalHours - completedHours);
  const percentageCompleted = Math.min(100, Math.round((completedHours / totalHours) * 100));
  return {
    id: row?.id || 1,
    totalHours,
    completedHours,
    remainingHours,
    percentageCompleted,
  };
}

// Helper to format Schedule row from DB
function formatSchedule(row) {
  if (!row) return null;
  return {
    id: row.id,
    timeSlot: row.time_slot,
    activity: row.activity,
    sortOrder: row.sort_order,
  };
}

// Helper to format Subject Progress row from DB
function formatSubject(row) {
  if (!row) return null;
  return {
    id: row.id,
    subject: row.subject,
    progressPercentage: row.progress_percentage,
  };
}

// LocalStorage Fallback state
const STORAGE_KEYS = {
  TASKS: 'nqt_tasks_local',
  DSA: 'nqt_dsa_local',
  SUBJECTS: 'nqt_subjects_local',
  SCHEDULE: 'nqt_schedule_local',
};

export const DEFAULT_SCHEDULE = [
  { id: 1, timeSlot: '7:00 – 7:30 AM', activity: '🌅 Wake up + Freshen up', sortOrder: 1 },
  { id: 2, timeSlot: '7:30 – 10:30 AM', activity: '💻 Striver DSA', sortOrder: 2 },
  { id: 3, timeSlot: '10:30 AM – 12:00 PM', activity: '🧠 TCS NQT Aptitude', sortOrder: 3 },
  { id: 4, timeSlot: '12:00 – 12:30 PM', activity: '🍛 Lunch + Break', sortOrder: 4 },
  { id: 5, timeSlot: '12:30 – 2:30 PM', activity: '🚀 Development — Java + Spring Boot', sortOrder: 5 },
  { id: 6, timeSlot: '2:30 – 3:30 PM', activity: '🧩 NQT Coding / Coding Practice', sortOrder: 6 },
  { id: 7, timeSlot: '3:30 – 4:00 PM', activity: '🗣️ Communication / Spoken English', sortOrder: 7 },
  { id: 8, timeSlot: '4:00 – 4:30 PM', activity: '☕ Break + Get Ready', sortOrder: 8 },
  { id: 9, timeSlot: '4:30 – 6:30 PM', activity: '🏋️ Gym', sortOrder: 9 },
  { id: 10, timeSlot: '6:30 – 7:00 PM', activity: '🚿 Freshen up / Relax', sortOrder: 10 },
  { id: 11, timeSlot: '7:00 – 8:00 PM', activity: '⚛️ React', sortOrder: 11 },
  { id: 12, timeSlot: '8:00 – 8:30 PM', activity: '🍽️ Dinner', sortOrder: 12 },
  { id: 13, timeSlot: '8:30 – 9:30 PM', activity: '🔄 Revision', sortOrder: 13 },
  { id: 14, timeSlot: '9:30 – 10:15 PM', activity: '🎯 Interview Preparation', sortOrder: 14 },
  { id: 15, timeSlot: '10:15 – 10:30 PM', activity: '☕ Break', sortOrder: 15 },
  { id: 16, timeSlot: '10:30 – 11:30 PM', activity: '⚛️ React — Practice / Project', sortOrder: 16 },
  { id: 17, timeSlot: '11:30 PM – 12:00 AM', activity: '🏗️ System Design', sortOrder: 17 },
];

const DEFAULT_SUBJECTS = [
  { id: 1, subject: 'DSA / Striver', progressPercentage: 0 },
  { id: 2, subject: 'TCS NQT Aptitude', progressPercentage: 0 },
  { id: 3, subject: 'Coding Practice', progressPercentage: 0 },
  { id: 4, subject: 'Development', progressPercentage: 0 },
  { id: 5, subject: 'Communication', progressPercentage: 0 },
  { id: 6, subject: 'Interview Preparation', progressPercentage: 0 },
];

function getLocal(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage errors
  }
}

// -------------------------------------------------------------
// TASKS
// -------------------------------------------------------------

export const getTasks = async (date) => {
  if (isSupabaseConfigured) {
    let query = supabase.from('tasks').select('*').order('id', { ascending: true });
    if (date) {
      query = query.eq('date', date);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(formatTask) };
  }

  // Fallback
  let tasks = getLocal(STORAGE_KEYS.TASKS, []);
  if (date) {
    tasks = tasks.filter((t) => t.date === date);
  }
  return { data: tasks.map(formatTask) };
};

export const getTasksByRange = async (start, end) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return { data: (data || []).map(formatTask) };
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const filtered = tasks.filter((t) => t.date >= start && t.date <= end);
  return { data: filtered.map(formatTask) };
};

export const createTask = async (task) => {
  const priority = (task.priority || 'MEDIUM').toUpperCase();
  const encodedNotes = encodePriority(task.notes, priority);

  if (isSupabaseConfigured) {
    const payload = {
      title: task.title,
      subject: task.subject,
      priority,
      date: task.date,
      planned_duration: task.plannedDuration,
      completed: task.completed || false,
      notes: encodedNotes,
    };
    try {
      const { data, error } = await supabase.from('tasks').insert(payload).select().single();
      if (error) throw error;
      return { data: formatTask(data) };
    } catch {
      // If priority column is missing in DB, insert with priority encoded in notes
      delete payload.priority;
      const { data, error } = await supabase.from('tasks').insert(payload).select().single();
      if (error) throw error;
      return { data: formatTask(data) };
    }
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const newTask = {
    id: Date.now(),
    title: task.title,
    subject: task.subject,
    priority,
    date: task.date,
    plannedDuration: task.plannedDuration,
    completed: task.completed || false,
    notes: task.notes || '',
  };
  tasks.push(newTask);
  setLocal(STORAGE_KEYS.TASKS, tasks);
  return { data: newTask };
};

export const updateTask = async (id, task) => {
  const priority = (task.priority || 'MEDIUM').toUpperCase();
  const encodedNotes = encodePriority(task.notes, priority);

  if (isSupabaseConfigured) {
    const payload = {
      title: task.title,
      subject: task.subject,
      priority,
      date: task.date,
      planned_duration: task.plannedDuration,
      completed: task.completed,
      notes: encodedNotes,
    };
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data: formatTask(data) };
    } catch {
      delete payload.priority;
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data: formatTask(data) };
    }
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...task, priority, id };
    setLocal(STORAGE_KEYS.TASKS, tasks);
    return { data: tasks[idx] };
  }
  return { data: { ...task, priority } };
};

export const toggleTask = async (id) => {
  if (isSupabaseConfigured) {
    const { data: current, error: fetchErr } = await supabase
      .from('tasks')
      .select('completed')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !current.completed })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: formatTask(data) };
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx].completed = !tasks[idx].completed;
    setLocal(STORAGE_KEYS.TASKS, tasks);
    return { data: tasks[idx] };
  }
  return { data: null };
};

export const deleteTask = async (id) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    return { data: true };
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  setLocal(STORAGE_KEYS.TASKS, tasks.filter((t) => t.id !== id));
  return { data: true };
};

export const generateTasksFromSchedule = async (date) => {
  const targetDate = date || getLocalDateString();
  
  // Standard routine mapping with priority assignments based on Master Daily Routine
  const routineTasks = [
    { title: '💻 Striver DSA Sheet', subject: 'DSA / Striver', priority: 'HIGH', plannedDuration: '3 hours', notes: '7:30 – 10:30 AM' },
    { title: '🧠 TCS NQT Aptitude', subject: 'TCS NQT Aptitude', priority: 'HIGH', plannedDuration: '1.5 hours', notes: '10:30 AM – 12:00 PM' },
    { title: '🚀 Development — Java + Spring Boot', subject: 'Development', priority: 'HIGH', plannedDuration: '2 hours', notes: '12:30 – 2:30 PM' },
    { title: '🧩 NQT Coding / Coding Practice', subject: 'Coding Practice', priority: 'HIGH', plannedDuration: '1 hour', notes: '2:30 – 3:30 PM' },
    { title: '🗣️ Communication / Spoken English', subject: 'Communication', priority: 'LOW', plannedDuration: '30 mins', notes: '3:30 – 4:00 PM' },
    { title: '⚛️ React Theory & Concepts', subject: 'Development', priority: 'MEDIUM', plannedDuration: '1 hour', notes: '7:00 – 8:00 PM' },
    { title: '🔄 Daily Revision', subject: 'Interview Preparation', priority: 'MEDIUM', plannedDuration: '1 hour', notes: '8:30 – 9:30 PM' },
    { title: '🎯 Interview Preparation & Core CS', subject: 'Interview Preparation', priority: 'HIGH', plannedDuration: '45 mins', notes: '9:30 – 10:15 PM' },
    { title: '⚛️ React — Practice / Project', subject: 'Development', priority: 'HIGH', plannedDuration: '1 hour', notes: '10:30 – 11:30 PM' },
    { title: '🏗️ System Design Basics', subject: 'DSA / Striver', priority: 'MEDIUM', plannedDuration: '30 mins', notes: '11:30 PM – 12:00 AM' },
  ];

  if (isSupabaseConfigured) {
    const { data: existing } = await supabase.from('tasks').select('id').eq('date', targetDate);
    if (existing && existing.length > 0) {
      return getTasks(targetDate);
    }

    const toInsert = routineTasks.map((t) => ({
      title: t.title,
      subject: t.subject,
      priority: t.priority,
      date: targetDate,
      planned_duration: t.plannedDuration,
      completed: false,
      notes: encodePriority(t.notes, t.priority),
    }));

    try {
      const { data, error } = await supabase.from('tasks').insert(toInsert).select();
      if (error) throw error;
      return { data: (data || []).map(formatTask) };
    } catch {
      // Fallback if priority column isn't created in Supabase yet
      const safeInsert = toInsert.map(({ priority: _p, ...rest }) => rest);
      const { data, error } = await supabase.from('tasks').insert(safeInsert).select();
      if (error) throw error;
      return { data: (data || []).map(formatTask) };
    }
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const existingForDate = tasks.filter((t) => t.date === targetDate);
  if (existingForDate.length > 0) {
    return { data: existingForDate };
  }

  const newCreated = routineTasks.map((t, idx) => ({
    id: Date.now() + idx,
    title: t.title,
    subject: t.subject,
    priority: t.priority,
    date: targetDate,
    plannedDuration: t.plannedDuration,
    completed: false,
    notes: t.notes,
  }));

  const updated = [...tasks, ...newCreated];
  setLocal(STORAGE_KEYS.TASKS, updated);
  return { data: newCreated };
};

// -------------------------------------------------------------
// DSA PROGRESS & SHEET TRACKER
// -------------------------------------------------------------

export const getDsaProgress = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('dsa_progress')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Create initial row if empty
      const { data: created, error: createErr } = await supabase
        .from('dsa_progress')
        .insert({ id: 1, total_hours: 110.0, completed_hours: 0.0 })
        .select()
        .single();
      if (createErr) return { data: formatDsa(null) };
      return { data: formatDsa(created) };
    }
    return { data: formatDsa(data) };
  }

  // Fallback
  const dsa = getLocal(STORAGE_KEYS.DSA, { id: 1, totalHours: 110, completedHours: 0 });
  return { data: formatDsa({ total_hours: dsa.totalHours, completed_hours: dsa.completedHours }) };
};

export const updateDsaProgress = async (completedHours) => {
  const comp = Math.max(0, parseFloat(completedHours) || 0);
  if (isSupabaseConfigured) {
    const current = await getDsaProgress();
    const total = current?.data?.totalHours || 110.0;
    const { data, error } = await supabase
      .from('dsa_progress')
      .upsert({ id: 1, total_hours: total, completed_hours: comp })
      .select()
      .single();
    if (error) throw error;
    return { data: formatDsa(data) };
  }

  // Fallback
  const current = getLocal(STORAGE_KEYS.DSA, { id: 1, totalHours: 110, completedHours: 0 });
  const dsa = { ...current, id: 1, completedHours: comp };
  setLocal(STORAGE_KEYS.DSA, dsa);
  return { data: formatDsa({ total_hours: dsa.totalHours, completed_hours: comp }) };
};

export const updateDsaTargetHours = async (totalHours) => {
  const target = Math.max(1, parseFloat(totalHours) || 110);
  if (isSupabaseConfigured) {
    const current = await getDsaProgress();
    const comp = current?.data?.completedHours || 0;
    const { data, error } = await supabase
      .from('dsa_progress')
      .upsert({ id: 1, total_hours: target, completed_hours: comp })
      .select()
      .single();
    if (error) throw error;
    return { data: formatDsa(data) };
  }

  const current = getLocal(STORAGE_KEYS.DSA, { id: 1, totalHours: 110, completedHours: 0 });
  const dsa = { ...current, totalHours: target };
  setLocal(STORAGE_KEYS.DSA, dsa);
  return { data: formatDsa({ total_hours: target, completed_hours: dsa.completedHours }) };
};

export const getDsaSheetState = () => {
  return {
    solvedIds: getLocal('nqt_dsa_solved_ids', []),
    starredIds: getLocal('nqt_dsa_starred_ids', []),
    notes: getLocal('nqt_dsa_notes', {}),
  };
};

export const toggleDsaProblemSolved = (problemId) => {
  const solved = new Set(getLocal('nqt_dsa_solved_ids', []));
  let isNowSolved = false;
  if (solved.has(problemId)) {
    solved.delete(problemId);
    isNowSolved = false;
  } else {
    solved.add(problemId);
    isNowSolved = true;
  }
  const updated = Array.from(solved);
  setLocal('nqt_dsa_solved_ids', updated);
  return { isSolved: isNowSolved, solvedIds: updated };
};

export const toggleDsaProblemStarred = (problemId) => {
  const starred = new Set(getLocal('nqt_dsa_starred_ids', []));
  let isNowStarred = false;
  if (starred.has(problemId)) {
    starred.delete(problemId);
    isNowStarred = false;
  } else {
    starred.add(problemId);
    isNowStarred = true;
  }
  const updated = Array.from(starred);
  setLocal('nqt_dsa_starred_ids', updated);
  return { isStarred: isNowStarred, starredIds: updated };
};

export const saveDsaProblemNote = (problemId, noteText) => {
  const notes = getLocal('nqt_dsa_notes', {});
  if (!noteText || !noteText.trim()) {
    delete notes[problemId];
  } else {
    notes[problemId] = noteText.trim();
  }
  setLocal('nqt_dsa_notes', notes);
  return notes;
};

export const getDsaStudySessions = () => {
  return getLocal('nqt_dsa_sessions', []);
};

export const logDsaStudySession = async (session) => {
  const sessions = getLocal('nqt_dsa_sessions', []);
  const newSession = {
    id: Date.now(),
    date: session.date || getLocalDateString(),
    durationHours: session.durationHours || 1.0,
    topic: session.topic || 'General Practice',
    notes: session.notes || '',
    createdAt: new Date().toISOString(),
  };
  sessions.unshift(newSession);
  setLocal('nqt_dsa_sessions', sessions);

  // Auto-increment completed hours
  const dsaRes = await getDsaProgress();
  const currentHours = dsaRes?.data?.completedHours || 0;
  const updatedHours = +(currentHours + Number(session.durationHours || 0)).toFixed(1);
  await updateDsaProgress(updatedHours);

  return { session: newSession, newCompletedHours: updatedHours };
};

// -------------------------------------------------------------
// SUBJECT PROGRESS & SYLLABUS ROADMAP
// -------------------------------------------------------------

export function calculateSubjectProgressPct(subjectObj) {
  if (!subjectObj?.modules || subjectObj.modules.length === 0) {
    return subjectObj?.progressPercentage || 0;
  }
  let totalTopics = 0;
  let completedTopics = 0;
  subjectObj.modules.forEach((mod) => {
    (mod.topics || []).forEach((t) => {
      totalTopics++;
      if (t.completed) completedTopics++;
    });
  });
  if (totalTopics === 0) return subjectObj?.progressPercentage || 0;
  return Math.round((completedTopics / totalTopics) * 100);
}

export const getDetailedSubjects = () => {
  return getLocal('nqt_subjects_detailed', DEFAULT_SUBJECT_SYLLABUS);
};

export const saveDetailedSubjects = (subjectsList) => {
  setLocal('nqt_subjects_detailed', subjectsList);
  return subjectsList;
};

export const getSubjectProgress = async () => {
  const detailed = getDetailedSubjects();
  const calculatedMap = {};
  detailed.forEach((s) => {
    calculatedMap[s.subject] = calculateSubjectProgressPct(s);
  });

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('subject_progress')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) {
      await supabase.from('subject_progress').upsert(
        DEFAULT_SUBJECTS.map((s) => ({
          subject: s.subject,
          progress_percentage: calculatedMap[s.subject] ?? s.progressPercentage,
        })),
        { onConflict: 'subject' }
      );
      return { data: DEFAULT_SUBJECTS };
    }
    return {
      data: data.map((d) => {
        const fmt = formatSubject(d);
        if (calculatedMap[fmt.subject] !== undefined) {
          fmt.progressPercentage = calculatedMap[fmt.subject];
        }
        return fmt;
      }),
    };
  }

  // Fallback
  const subjects = getLocal(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  const synced = subjects.map((s) => ({
    ...s,
    progressPercentage: calculatedMap[s.subject] !== undefined ? calculatedMap[s.subject] : s.progressPercentage,
  }));
  return { data: synced };
};

export const updateSubjectProgress = async (id, progressPercentage) => {
  const pct = Math.max(0, Math.min(100, progressPercentage));
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('subject_progress')
      .update({ progress_percentage: pct })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: formatSubject(data) };
  }

  // Fallback
  const subjects = getLocal(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  const idx = subjects.findIndex((s) => s.id === id);
  if (idx !== -1) {
    subjects[idx].progressPercentage = pct;
    setLocal(STORAGE_KEYS.SUBJECTS, subjects);
    return { data: subjects[idx] };
  }
  return { data: { id, progressPercentage: pct } };
};

export const toggleSubjectTopic = async (subjectId, moduleId, topicId) => {
  const list = getDetailedSubjects();
  const subIdx = list.findIndex((s) => s.id === subjectId);
  if (subIdx === -1) return { list, updatedPct: 0 };

  const subject = list[subIdx];
  const modIdx = (subject.modules || []).findIndex((m) => m.id === moduleId);
  if (modIdx === -1) return { list, updatedPct: 0 };

  const topicIdx = (subject.modules[modIdx].topics || []).findIndex((t) => t.id === topicId);
  if (topicIdx === -1) return { list, updatedPct: 0 };

  const currentVal = subject.modules[modIdx].topics[topicIdx].completed;
  subject.modules[modIdx].topics[topicIdx].completed = !currentVal;

  const newPct = calculateSubjectProgressPct(subject);
  subject.progressPercentage = newPct;

  list[subIdx] = subject;
  saveDetailedSubjects(list);

  try {
    await updateSubjectProgress(subjectId, newPct);
  } catch (err) {
    console.debug('Failed to sync subject progress to DB', err);
  }

  return { list, updatedPct: newPct };
};

export const addSubjectTopic = (subjectId, moduleId, topicName) => {
  const list = getDetailedSubjects();
  const subIdx = list.findIndex((s) => s.id === subjectId);
  if (subIdx === -1) return list;

  const modIdx = (list[subIdx].modules || []).findIndex((m) => m.id === moduleId);
  if (modIdx === -1) return list;

  const newTopic = {
    id: `custom_t_${Date.now()}`,
    name: topicName.trim(),
    completed: false,
  };

  list[subIdx].modules[modIdx].topics.push(newTopic);
  saveDetailedSubjects(list);
  return list;
};

export const deleteSubjectTopic = async (subjectId, moduleId, topicId) => {
  const list = getDetailedSubjects();
  const subIdx = list.findIndex((s) => s.id === subjectId);
  if (subIdx === -1) return list;

  const modIdx = (list[subIdx].modules || []).findIndex((m) => m.id === moduleId);
  if (modIdx === -1) return list;

  list[subIdx].modules[modIdx].topics = list[subIdx].modules[modIdx].topics.filter(
    (t) => t.id !== topicId
  );
  const newPct = calculateSubjectProgressPct(list[subIdx]);
  list[subIdx].progressPercentage = newPct;

  saveDetailedSubjects(list);
  try {
    await updateSubjectProgress(subjectId, newPct);
  } catch {}
  return list;
};

export const createCustomSubject = (newSubject) => {
  const list = getDetailedSubjects();
  const id = Date.now();
  const created = {
    id,
    subject: newSubject.subject || 'New Subject',
    icon: newSubject.icon || 'BookOpen',
    color: newSubject.color || 'from-blue-500 to-indigo-600',
    accentColor: newSubject.accentColor || 'blue',
    targetDate: newSubject.targetDate || '',
    resources: newSubject.resources || [],
    notes: newSubject.notes || '',
    progressPercentage: 0,
    modules: newSubject.modules && newSubject.modules.length > 0 ? newSubject.modules : [
      {
        id: `mod_${id}_1`,
        name: '1. Core Topics',
        topics: [
          { id: `top_${id}_1`, name: 'Getting Started & Overview', completed: false },
        ],
      },
    ],
  };
  list.push(created);
  saveDetailedSubjects(list);
  return list;
};

export const updateSubjectMetadata = (subjectId, updates) => {
  const list = getDetailedSubjects();
  const idx = list.findIndex((s) => s.id === subjectId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    saveDetailedSubjects(list);
  }
  return list;
};

export const deleteCustomSubject = (subjectId) => {
  const list = getDetailedSubjects();
  const filtered = list.filter((s) => s.id !== subjectId);
  saveDetailedSubjects(filtered);
  return filtered;
};


// -------------------------------------------------------------
// SCHEDULE
// -------------------------------------------------------------

export const getSchedule = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) {
      // Auto seed
      await supabase.from('schedule_items').insert(
        DEFAULT_SCHEDULE.map((s) => ({
          time_slot: s.timeSlot,
          activity: s.activity,
          sort_order: s.sortOrder,
        }))
      );
      return { data: DEFAULT_SCHEDULE };
    }
    return { data: data.map(formatSchedule) };
  }

  // Fallback
  const schedule = getLocal(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  return { data: schedule };
};

export const createScheduleItem = async (item) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_items')
      .insert({
        time_slot: item.timeSlot,
        activity: item.activity,
        sort_order: item.sortOrder || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return { data: formatSchedule(data) };
  }

  // Fallback
  const schedule = getLocal(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  const newItem = {
    id: Date.now(),
    timeSlot: item.timeSlot,
    activity: item.activity,
    sortOrder: item.sortOrder || 0,
  };
  schedule.push(newItem);
  schedule.sort((a, b) => a.sortOrder - b.sortOrder);
  setLocal(STORAGE_KEYS.SCHEDULE, schedule);
  return { data: newItem };
};

export const updateScheduleItem = async (id, item) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('schedule_items')
      .update({
        time_slot: item.timeSlot,
        activity: item.activity,
        sort_order: item.sortOrder,
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data: formatSchedule(data) };
  }

  // Fallback
  const schedule = getLocal(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  const idx = schedule.findIndex((s) => s.id === id);
  if (idx !== -1) {
    schedule[idx] = { ...schedule[idx], ...item, id };
    setLocal(STORAGE_KEYS.SCHEDULE, schedule);
    return { data: schedule[idx] };
  }
  return { data: item };
};

export const deleteScheduleItem = async (id) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('schedule_items').delete().eq('id', id);
    if (error) throw error;
    return { data: true };
  }

  // Fallback
  const schedule = getLocal(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  setLocal(STORAGE_KEYS.SCHEDULE, schedule.filter((s) => s.id !== id));
  return { data: true };
};

export const resetScheduleToMaster = async () => {
  if (isSupabaseConfigured) {
    try {
      // Delete existing
      await supabase.from('schedule_items').delete().neq('id', 0);
      // Insert master default schedule
      const toInsert = DEFAULT_SCHEDULE.map((s) => ({
        time_slot: s.timeSlot,
        activity: s.activity,
        sort_order: s.sortOrder,
      }));
      const { data, error } = await supabase.from('schedule_items').insert(toInsert).select();
      if (error) throw error;
      return { data: (data || []).map(formatSchedule) };
    } catch (e) {
      console.warn('Supabase reset failed, falling back to local', e);
    }
  }

  // Fallback
  setLocal(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE);
  return { data: DEFAULT_SCHEDULE };
};

