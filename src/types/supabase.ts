export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string | null
        }
      }
      training_plans: {
        Row: {
          id: string
          user_id: string | null
          name: string | null
          description: string | null
          type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name?: string | null
          description?: string | null
          type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string | null
          description?: string | null
          type?: string | null
          created_at?: string | null
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string | null
          plan_id: string | null
          workout_date: string | null
          type: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          plan_id?: string | null
          workout_date?: string | null
          type?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          plan_id?: string | null
          workout_date?: string | null
          type?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string | null
          name: string | null
          sets: number | null
          reps: number | null
          weight: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          workout_id?: string | null
          name?: string | null
          sets?: number | null
          reps?: number | null
          weight?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          workout_id?: string | null
          name?: string | null
          sets?: number | null
          reps?: number | null
          weight?: number | null
          notes?: string | null
        }
      }
      cardio_sessions: {
        Row: {
          id: string
          workout_id: string | null
          distance: number | null
          duration_seconds: number | null
          pace: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          workout_id?: string | null
          distance?: number | null
          duration_seconds?: number | null
          pace?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          workout_id?: string | null
          distance?: number | null
          duration_seconds?: number | null
          pace?: string | null
          notes?: string | null
        }
      }
    }
  }
}
