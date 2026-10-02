import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  initialize: async () => {
    const supabase = createClient();
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    set({ 
      user: session?.user || null, 
      session, 
      isAuthenticated: !!session,
      isLoading: false 
    });

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, currentSession) => {
      set({ 
        user: currentSession?.user || null, 
        session: currentSession,
        isAuthenticated: !!currentSession,
      });
    });
  },
  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  }
}));
