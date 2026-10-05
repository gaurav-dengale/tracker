import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://epfhtmkeorzmxckyuksm.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_wN6rg7_5llcWd7eLwKiudg_6n2nEfYD';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
