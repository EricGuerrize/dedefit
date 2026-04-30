import { create } from 'zustand';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setInitialized: (val: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setInitialized: (val) => set({ initialized: val }),
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
  },
}));
