import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  setAuth: (user: User | null, session: Session | null) => void;
  setInitialized: (val: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  initialized: false,
  setAuth: (user, session) => set({ user, session }),
  setInitialized: (val) => set({ initialized: val }),
  signOut: () => set({ user: null, session: null }),
}));
