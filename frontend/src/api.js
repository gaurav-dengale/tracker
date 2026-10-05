import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

// Helper to format task row from DB
function formatTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    date: row.date,
    plannedDuration: row.planned_duration,
    completed: row.completed,
    notes: row.notes,
    createdAt: row.created_at,
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

const DEFAULT_SCHEDULE = [
  { id: 1, timeSlot: '7:00 – 7:30 AM', activity: 'Wake up + Freshen up', sortOrder: 1 },
  { id: 2, timeSlot: '7:30 – 9:30 AM', activity: 'Striver DSA', sortOrder: 2 },
  { id: 3, timeSlot: '9:30 – 10:00 AM', activity: 'Breakfast / Break', sortOrder: 3 },
  { id: 4, timeSlot: '10:00 AM – 12:00 PM', activity: 'TCS NQT Aptitude', sortOrder: 4 },
  { id: 5, timeSlot: '12:00 – 12:30 PM', activity: 'Break', sortOrder: 5 },
  { id: 6, timeSlot: '12:30 – 2:30 PM', activity: 'Development', sortOrder: 6 },
  { id: 7, timeSlot: '2:30 – 3:00 PM', activity: 'Lunch', sortOrder: 7 },
  { id: 8, timeSlot: '3:00 – 4:00 PM', activity: 'Coding / NQT Coding Practice', sortOrder: 8 },
  { id: 9, timeSlot: '4:00 – 4:30 PM', activity: 'Communication', sortOrder: 9 },
  { id: 10, timeSlot: '4:30 – 5:00 PM', activity: 'Break / Get Ready', sortOrder: 10 },
  { id: 11, timeSlot: '5:00 – 7:30 PM', activity: 'Gym', sortOrder: 11 },
  { id: 12, timeSlot: '7:30 – 8:00 PM', activity: 'Dinner', sortOrder: 12 },
  { id: 13, timeSlot: '8:00 – 9:00 PM', activity: 'Revision', sortOrder: 13 },
  { id: 14, timeSlot: '9:00 – 9:45 PM', activity: 'Interview Preparation', sortOrder: 14 },
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
  return { data: tasks };
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
  return { data: filtered };
};

export const createTask = async (task) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        subject: task.subject,
        date: task.date,
        planned_duration: task.plannedDuration,
        completed: task.completed || false,
        notes: task.notes || '',
      })
      .select()
      .single();
    if (error) throw error;
    return { data: formatTask(data) };
  }

  // Fallback
  const tasks = getLocal(STORAGE_KEYS.TASKS, []);
  const newTask = {
    id: Date.now(),
    title: task.title,
    subject: task.subject,
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
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        subject: task.subject,
        date: task.date,
        planned_duration: task.plannedDuration,
        completed: task.completed,
        notes: task.notes,
      })
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
    tasks[idx] = { ...tasks[idx], ...task, id };
    setLocal(STORAGE_KEYS.TASKS, tasks);
    return { data: tasks[idx] };
  }
  return { data: task };
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

// -------------------------------------------------------------
// DSA PROGRESS
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
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('dsa_progress')
      .upsert({ id: 1, total_hours: 110.0, completed_hours: completedHours })
      .select()
      .single();
    if (error) throw error;
    return { data: formatDsa(data) };
  }

  // Fallback
  const dsa = { id: 1, totalHours: 110, completedHours };
  setLocal(STORAGE_KEYS.DSA, dsa);
  return { data: formatDsa({ total_hours: 110, completed_hours: completedHours }) };
};

// -------------------------------------------------------------
// SUBJECT PROGRESS
// -------------------------------------------------------------

export const getSubjectProgress = async () => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('subject_progress')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) {
      // Auto seed
      await supabase.from('subject_progress').upsert(
        DEFAULT_SUBJECTS.map((s) => ({ subject: s.subject, progress_percentage: s.progressPercentage })),
        { onConflict: 'subject' }
      );
      return { data: DEFAULT_SUBJECTS };
    }
    return { data: data.map(formatSubject) };
  }

  // Fallback
  const subjects = getLocal(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  return { data: subjects };
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
