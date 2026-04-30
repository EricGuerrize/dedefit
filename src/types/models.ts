export interface Workout {
  id: string;
  userId: string;
  workoutDate: string; // ISO date string YYYY-MM-DD
  type: 'musculacao' | 'corrida';
  notes?: string;
  exercises?: Exercise[];
  cardioSessions?: CardioSession[];
  createdAt: string;
}

export interface Exercise {
  id?: string;
  workoutId?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface CardioSession {
  id?: string;
  workoutId?: string;
  distance: number;
  durationSeconds: number;
  pace: string;
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
}
