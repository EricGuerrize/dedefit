import { useState } from 'react';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, Timer, Plus, Trash2, Calendar } from 'lucide-react';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Full Body'
];

export default function WorkoutLog() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.workout;

  const [status, setStatus] = useState<'planned' | 'completed'>(editData?.status || 'completed');
  const [type, setType] = useState<'musculacao' | 'corrida'>(editData?.type || 'musculacao');
  const [muscleGroup, setMuscleGroup] = useState(editData?.muscleGroup || MUSCLE_GROUPS[0]);
  const [date, setDate] = useState(editData?.workoutDate || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState(editData?.notes || '');
  const [loading, setLoading] = useState(false);
  
  // Musculação
  const [exercises, setExercises] = useState(editData?.exercises || [{ name: '', sets: 0, reps: 0, weight: 0, notes: '' }]);
  
  // Corrida
  const [distance, setDistance] = useState(editData?.cardioSessions?.[0]?.distance || 0);
  const [targetDistance, setTargetDistance] = useState(editData?.cardioSessions?.[0]?.targetDistance || 0);
  const [durationStr, setDurationStr] = useState(() => {
    if (!editData?.cardioSessions?.[0]?.durationSeconds) return '00:00:00';
    const s = editData.cardioSessions[0].durationSeconds;
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  });

  const handleAddExercise = () => setExercises([...exercises, { name: '', sets: 0, reps: 0, weight: 0, notes: '' }]);
  const handleRemoveExercise = (index: number) => setExercises(exercises.filter((_: any, i: number) => i !== index));
  const handleExerciseChange = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const calculatePace = (distKm: number, timeStr: string) => {
    if (!distKm || !timeStr || distKm === 0) return '0:00/km';
    const parts = timeStr.split(':').map(Number);
    if (parts.length !== 3) return '0:00/km';
    const totalMinutes = parts[0] * 60 + parts[1] + parts[2] / 60;
    const paceMinutes = totalMinutes / distKm;
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const workoutData: any = {
        userId: user!.uid,
        workoutDate: date,
        type,
        status,
        notes,
        createdAt: new Date().toISOString(),
      };

      if (type === 'musculacao') {
        workoutData.muscleGroup = muscleGroup;
        workoutData.exercises = status === 'completed' ? exercises : [];
      } else {
        const parts = durationStr.split(':').map(Number);
        const durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        workoutData.cardioSessions = [{
          distance: status === 'completed' ? distance : 0,
          targetDistance: targetDistance || 0,
          durationSeconds: status === 'completed' ? durationSeconds : 0,
          pace: status === 'completed' ? calculatePace(distance, durationStr) : '0:00/km',
        }];
      }

      if (editData?.id) {
        await setDoc(doc(db, 'workouts', editData.id), workoutData);
      } else {
        await addDoc(collection(db, 'workouts'), workoutData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Erro ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            {status === 'completed' ? 'Registrar Treino' : 'Programar Treino'}
          </h1>
          <p className="text-muted-foreground">Mantenha o foco nos seus objetivos.</p>
        </div>
        <div className="flex gap-2 bg-secondary/20 p-1 rounded-xl">
          <button onClick={() => setStatus('completed')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === 'completed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Realizado</button>
          <button onClick={() => setStatus('planned')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === 'planned' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Planejar</button>
        </div>
      </header>

      <div className="glass-card p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipo</label>
              <div className="flex gap-2 p-1 bg-background/50 rounded-lg">
                <button type="button" onClick={() => setType('musculacao')} className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md transition-all ${type === 'musculacao' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-white/5'}`}><Dumbbell size={18} /> Musculação</button>
                <button type="button" onClick={() => setType('corrida')} className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-md transition-all ${type === 'corrida' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-white/5'}`}><Timer size={18} /> Corrida</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground" />
            </div>
          </div>

          <div className="border-t border-border/50 pt-6">
            {type === 'musculacao' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Grupo Muscular</label>
                  <select value={muscleGroup} onChange={(e) => setMuscleGroup(e.target.value)} className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 text-foreground">
                    {MUSCLE_GROUPS.map(g => <option key={g} value={g} className="bg-background">{g}</option>)}
                  </select>
                </div>

                {status === 'completed' && (
                  <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-lg flex justify-between items-center text-foreground">
                      Exercícios
                      <button type="button" onClick={handleAddExercise} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary/20 flex items-center gap-1"><Plus size={16} /> Adicionar</button>
                    </h3>
                    {exercises.map((ex: any, index: number) => (
                      <div key={index} className="p-4 bg-background/30 rounded-xl border border-border/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <input type="text" placeholder="Nome do exercício" value={ex.name} required onChange={(e) => handleExerciseChange(index, 'name', e.target.value)} className="flex-1 bg-transparent border-b border-border/50 focus:border-primary outline-none py-1 mr-4 font-medium" />
                          {exercises.length > 1 && <button type="button" onClick={() => handleRemoveExercise(index)} className="text-destructive p-1 hover:bg-destructive/10 rounded"><Trash2 size={18} /></button>}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div><label className="text-[10px] text-muted-foreground uppercase font-bold">Séries</label><input type="number" min="0" value={ex.sets} required onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg" /></div>
                          <div><label className="text-[10px] text-muted-foreground uppercase font-bold">Reps</label><input type="number" min="0" value={ex.reps} required onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value))} className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg" /></div>
                          <div><label className="text-[10px] text-muted-foreground uppercase font-bold">Peso (kg)</label><input type="number" step="0.5" min="0" value={ex.weight} required onChange={(e) => handleExerciseChange(index, 'weight', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Meta de Distância (km)</label>
                  <input type="number" step="0.1" min="0" value={targetDistance} onChange={(e) => setTargetDistance(parseFloat(e.target.value))} className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50" placeholder="Quanto pretende correr?" />
                </div>
                
                {status === 'completed' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/20">
                    <div>
                      <label className="text-sm font-medium mb-1 block text-primary">Distância Percorrida (km)</label>
                      <input type="number" step="0.01" min="0" value={distance} required onChange={(e) => setDistance(parseFloat(e.target.value))} className="w-full px-4 py-2 bg-background border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tempo Total (hh:mm:ss)</label>
                      <input type="text" pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}" placeholder="00:30:00" value={durationStr} required onChange={(e) => setDurationStr(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50" />
                    </div>
                    <div className="md:col-span-2 bg-primary/5 p-4 rounded-xl flex justify-between items-center border border-primary/20">
                      <span className="font-medium text-foreground">Pace Realizado:</span>
                      <span className="text-2xl font-bold text-primary">{calculatePace(distance, durationStr)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-6">
            <label className="text-sm font-medium mb-1 block">Notas ou Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 resize-none" placeholder={status === 'planned' ? 'O que pretende focar nesse treino?' : 'Como se sentiu?'}></textarea>
          </div>

          <button type="submit" disabled={loading} className={`w-full font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${status === 'completed' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-secondary text-secondary-foreground border border-border'}`}>
            {loading ? 'Processando...' : status === 'completed' ? <><Plus size={20} /> Salvar Treino Realizado</> : <><Calendar size={20} /> Agendar Treino</>}
          </button>
        </form>
      </div>
    </div>
  );
}
