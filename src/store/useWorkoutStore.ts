import { create } from 'zustand';
import { Database } from '../types/supabase';

export type Workout = Database['public']['Tables']['workouts']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type CardioSession = Database['public']['Tables']['cardio_sessions']['Row'];
export type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];

interface WorkoutState {
  workouts: Workout[];
  isLoading: boolean;
  setWorkouts: (workouts: Workout[]) => void;
  setLoading: (loading: boolean) => void;
  addWorkout: (workout: Workout) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  workouts: [],
  isLoading: false,
  setWorkouts: (workouts) => set({ workouts }),
  setLoading: (loading) => set({ isLoading: loading }),
  addWorkout: (workout) => set((state) => ({ workouts: [workout, ...state.workouts] })),
}));
