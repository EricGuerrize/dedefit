import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Filter, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import type { Workout } from '../types/models';

export default function History() {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user!.uid),
        orderBy('workoutDate', 'desc')
      );
      const snapshot = await getDocs(q);
      setWorkouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workout)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      await deleteDoc(doc(db, 'workouts', id));
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir.');
    }
  };

  const filteredWorkouts = workouts.filter(w => {
    if (filterType === 'all') return true;
    return w.type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Histórico</h1>
          <p className="text-muted-foreground">Todos os seus registros e planos.</p>
        </div>
        
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg w-fit">
          <Filter size={16} className="text-muted-foreground" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm font-medium text-foreground">
            <option value="all" className="bg-background">Todos</option>
            <option value="musculacao" className="bg-background">Musculação</option>
            <option value="corrida" className="bg-background">Corrida</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="text-center p-8 glass-card rounded-2xl text-muted-foreground">Nenhuma atividade encontrada.</div>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map(workout => (
            <div key={workout.id} className={`glass-card p-5 rounded-2xl border-l-4 transition-all ${workout.status === 'planned' ? 'border-secondary' : 'border-primary'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${workout.status === 'planned' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-primary/20 text-primary'}`}>
                      {workout.status === 'planned' ? 'Programado' : 'Realizado'}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {workout.type === 'musculacao' ? workout.muscleGroup : 'Corrida'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(workout.workoutDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {workout.notes && <p className="text-sm text-muted-foreground italic">"{workout.notes}"</p>}
                  
                  {workout.type === 'musculacao' ? (
                    <div className="mt-4 space-y-1">
                      {workout.exercises?.length === 0 ? <p className="text-xs text-muted-foreground">Aguardando execução...</p> : 
                        workout.exercises?.map((ex: any, i) => (
                        <div key={i} className="text-sm flex justify-between border-b border-border/10 pb-1">
                          <span className="text-foreground">{ex.name}</span>
                          <span className="text-muted-foreground font-mono">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-secondary/5 p-3 rounded-xl border border-border/10">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Distância</p>
                        <p className="font-bold text-foreground">{workout.cardioSessions?.[0]?.distance || 0} km</p>
                      </div>
                      {workout.cardioSessions?.[0]?.targetDistance && (
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Meta</p>
                          <p className="font-bold text-secondary-foreground">{workout.cardioSessions[0].targetDistance} km</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Tempo</p>
                        <p className="font-bold text-foreground">{Math.floor((workout.cardioSessions?.[0]?.durationSeconds || 0) / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Pace</p>
                        <p className="font-bold text-primary">{workout.cardioSessions?.[0]?.pace || '0:00'}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex md:flex-col justify-end items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-border/10 md:pl-4">
                  <button onClick={() => handleDelete(workout.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
