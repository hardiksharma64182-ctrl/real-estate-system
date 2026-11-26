import { createClient } from '@supabase/supabase-js';

// Read from environment variables or custom localStorage overrides
export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('custom_supabase_url');
  const customKey = localStorage.getItem('custom_supabase_anon_key');

  const supabaseUrl = customUrl || import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('YOUR_SUPABASE')
  );

  return { supabaseUrl, supabaseAnonKey, isConfigured };
};

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

export const getSupabaseClient = () => {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (cachedClient && lastUrl === supabaseUrl && lastKey === supabaseAnonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    lastUrl = supabaseUrl;
    lastKey = supabaseAnonKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
};
