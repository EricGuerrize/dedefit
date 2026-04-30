-- Tabelas básicas
-- Lembre-se de habilitar a extensão "uuid-ossp" se necessário, embora o Supabase suporte uuid nativamente.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT,
  description TEXT,
  type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  plan_id UUID REFERENCES training_plans(id),
  workout_date DATE,
  type TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT,
  sets INTEGER,
  reps INTEGER,
  weight DECIMAL,
  notes TEXT
);

CREATE TABLE cardio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  distance DECIMAL,
  duration_seconds INTEGER,
  pace TEXT,
  notes TEXT
);

-- Políticas de RLS (opcional para segurança, recomendado)
-- ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
-- ...
