import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Timer, Plus, Trash2 } from 'lucide-react';

export default function WorkoutLog() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [type, setType] = useState<'musculacao' | 'corrida'>('musculacao');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const [exercises, setExercises] = useState([{ name: '', sets: 0, reps: 0, weight: 0, notes: '' }]);
  const [distance, setDistance] = useState(0);
  const [durationStr, setDurationStr] = useState('00:00:00');

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: 0, reps: 0, weight: 0, notes: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const calculatePace = (distKm: number, timeStr: string) => {
    if (!distKm || !timeStr) return '0:00/km';
    const parts = timeStr.split(':').map(Number);
    if (parts.length !== 3) return '0:00/km';
    const totalMinutes = (parts[0] * 60) + parts[1] + (parts[2] / 60);
    if (distKm === 0) return '0:00/km';
    const paceMinutes = totalMinutes / distKm;
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user?.id,
          workout_date: date,
          type,
          notes,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      if (type === 'musculacao') {
        const exercisesToInsert = exercises.map((ex) => ({
          workout_id: workout.id,
          ...ex
        }));
        const { error: exercisesError } = await supabase.from('exercises').insert(exercisesToInsert);
        if (exercisesError) throw exercisesError;
      } else {
        const parts = durationStr.split(':').map(Number);
        const durationSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        const { error: cardioError } = await supabase.from('cardio_sessions').insert({
          workout_id: workout.id,
          distance,
          duration_seconds: durationSeconds,
          pace: calculatePace(distance, durationStr),
          notes
        });
        if (cardioError) throw cardioError;
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Erro ao salvar treino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Novo Treino</h1>
        <p className="text-muted-foreground">Registre sua atividade de hoje.</p>
      </header>

      <div className="glass-card p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Treino</label>
              <div className="flex gap-2 p-1 bg-background/50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('musculacao')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md transition-all ${type === 'musculacao' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  <Dumbbell size={18} /> Musculação
                </button>
                <button
                  type="button"
                  onClick={() => setType('corrida')}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md transition-all ${type === 'corrida' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-white/5'}`}
                >
                  <Timer size={18} /> Corrida
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                required
              />
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            {type === 'musculacao' ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex justify-between items-center">
                  Exercícios
                  <button type="button" onClick={handleAddExercise} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 flex items-center gap-1 transition-colors">
                    <Plus size={16} /> Adicionar
                  </button>
                </h3>
                
                {exercises.map((ex, index) => (
                  <div key={index} className="p-4 bg-background/30 rounded-xl border border-border/50 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-muted-foreground">Exercício {index + 1}</h4>
                      {exercises.length > 1 && (
                        <button type="button" onClick={() => handleRemoveExercise(index)} className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          placeholder="Nome do exercício"
                          value={ex.name}
                          onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Séries</label>
                          <input type="number" min="0" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" required />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Reps</label>
                          <input type="number" min="0" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" required />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Peso (kg)</label>
                        <input type="number" step="0.5" min="0" value={ex.weight} onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:outline-none" required />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Detalhes da Corrida</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Distância (km)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={distance}
                      onChange={(e) => setDistance(parseFloat(e.target.value))}
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tempo (hh:mm:ss)</label>
                    <input
                      type="text"
                      pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}"
                      placeholder="00:30:00"
                      value={durationStr}
                      onChange={(e) => setDurationStr(e.target.value)}
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 bg-secondary/10 p-4 rounded-xl flex justify-between items-center">
                    <span className="font-medium text-foreground">Pace Calculado:</span>
                    <span className="text-xl font-bold text-primary">{calculatePace(distance, durationStr)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-6">
            <label className="text-sm font-medium mb-1 block">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Como foi o treino?"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-4 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </form>
      </div>
    </div>
  );
}
