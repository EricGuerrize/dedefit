import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Filter, Trash2 } from 'lucide-react';

export default function History() {
  const { user } = useAuthStore();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('all');
  
  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises(*), cardio_sessions(*)')
        .eq('user_id', user?.id)
        .order('workout_date', { ascending: false });
        
      if (error) throw error;
      setWorkouts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este treino?')) return;
    try {
      await supabase.from('exercises').delete().eq('workout_id', id);
      await supabase.from('cardio_sessions').delete().eq('workout_id', id);
      const { error } = await supabase.from('workouts').delete().eq('id', id);
      if (error) throw error;
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir treino.');
    }
  };

  const filteredWorkouts = workouts.filter(w => {
    if (filterType !== 'all' && w.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Histórico</h1>
          <p className="text-muted-foreground">Todos os seus treinos registrados.</p>
        </div>
        
        <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-lg w-fit">
          <Filter size={16} className="text-muted-foreground" />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm font-medium text-foreground"
          >
            <option value="all" className="bg-background">Todos os tipos</option>
            <option value="musculacao" className="bg-background">Musculação</option>
            <option value="corrida" className="bg-background">Corrida</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : filteredWorkouts.length === 0 ? (
        <div className="text-center p-8 glass-card rounded-2xl text-muted-foreground">
          Nenhum treino encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map(workout => (
            <div key={workout.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 hover:border-primary/30 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${workout.type === 'musculacao' ? 'bg-primary/20 text-primary' : 'bg-green-500/20 text-green-500'}`}>
                    {workout.type === 'musculacao' ? 'Musculação' : 'Corrida'}
                  </span>
                  <span className="text-sm font-medium text-foreground">{new Date(workout.workout_date).toLocaleDateString('pt-BR')}</span>
                </div>
                
                {workout.notes && <p className="text-sm text-muted-foreground italic">"{workout.notes}"</p>}
                
                {workout.type === 'musculacao' ? (
                  <div className="mt-4 space-y-1">
                    {workout.exercises?.map((ex: any) => (
                      <div key={ex.id} className="text-sm flex justify-between border-b border-border/30 pb-1 last:border-0">
                        <span className="font-medium text-foreground">{ex.name}</span>
                        <span className="text-muted-foreground">{ex.sets}x{ex.reps} @ {ex.weight}kg</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 flex gap-4 text-sm bg-secondary/10 p-3 rounded-lg">
                    <div>
                      <p className="text-muted-foreground text-xs">Distância</p>
                      <p className="font-medium text-foreground">{workout.cardio_sessions?.[0]?.distance} km</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Tempo</p>
                      <p className="font-medium text-foreground">{Math.floor((workout.cardio_sessions?.[0]?.duration_seconds || 0) / 60)} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pace</p>
                      <p className="font-medium text-foreground">{workout.cardio_sessions?.[0]?.pace}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end items-start border-t border-border/30 md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 mt-2 md:mt-0">
                <button onClick={() => handleDelete(workout.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors flex items-center justify-center w-full md:w-auto">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
