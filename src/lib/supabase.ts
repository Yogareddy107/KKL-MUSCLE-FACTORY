import { createClient } from '@supabase/supabase-js';

const defaultSupabaseUrl = 'https://ongheyduancudpzoopxa.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZ2hleWR1YW5jdWRwem9vcHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMjIyNDksImV4cCI6MjEwNzg5ODI0OX0.a93p5s565zdt_h6JeEHOdabcZh1lWPFqFsE6I_zwwZk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

