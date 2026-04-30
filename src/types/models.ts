export interface Workout {
  id: string;
  userId: string;
  workoutDate: string; // ISO date string YYYY-MM-DD
  type: 'musculacao' | 'corrida';
  muscleGroup?: string; // Ex: Peito, Costas, Pernas
  notes?: string;
  exercises?: Exercise[];
  cardioSessions?: CardioSession[];
  createdAt: string;
  status: 'planned' | 'completed'; // Adicionado para suportar programação
}

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export interface CardioSession {
  id?: string;
  distance: number;
  targetDistance?: number; // Meta programada
  durationSeconds: number;
  pace: string;
  targetPace?: string; // Pace programado
  elevationGain?: number;
  avgHeartRate?: number;
  calories?: number;
  perceivedEffort?: number;
  terrain?: string;
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  muscleGroup?: string;
  createdAt: string;
}
