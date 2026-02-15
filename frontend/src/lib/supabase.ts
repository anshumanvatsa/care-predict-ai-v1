import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock client for when environment variables are not set
const mockSupabaseClient = {
  auth: {
    signUp: async (credentials: any) => ({ 
      data: { user: { id: 'mock-user', email: credentials.email } }, 
      error: null 
    }),
    signInWithPassword: async (credentials: any) => ({ 
      data: { user: { id: 'mock-user', email: credentials.email } }, 
      error: null 
    }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: any) => ({ data: { subscription: null } })
  }
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockSupabaseClient;

export const isMockMode = !supabaseUrl || !supabaseAnonKey;