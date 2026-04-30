import { create } from 'zustand';
import type { Workout } from '../types/models';

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
