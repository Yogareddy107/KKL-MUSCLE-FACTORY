import { createClient } from '@supabase/supabase-js';

const defaultSupabaseUrl = 'https://ongheyduancudpzoopxa.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ2hleWR1YW5jdWRwem9vcHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjIyNDksImV4cCI6MjEwNzg5ODI0OX0.a93p5s565zdt_h6JeEHOdabcZh1lWPFqFsE6I_zwwZk';

// Sanitize inputs
const sanitize = (val?: string): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

const envUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL);
const envKey = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const supabaseUrl = (envUrl && envUrl.startsWith('http') && !envUrl.includes('your-project'))
  ? envUrl
  : defaultSupabaseUrl;

export const supabaseAnonKey = (envKey && envKey.startsWith('eyJ') && !envKey.includes('your-anon-key'))
  ? envKey
  : defaultSupabaseAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Purge any stale Supabase auth tokens from localStorage so they never contaminate headers
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith('sb-') || k.includes('supabase.auth'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => window.localStorage.removeItem(k));
  } catch {
    // Ignore storage exceptions
  }
}

// Client configured with persistSession: false so it never falls into invalid bearer token traps
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'apikey': supabaseAnonKey,
        },
      },
    })
  : null;


