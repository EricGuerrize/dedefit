import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, TrendingUp, Calendar, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressCharts from '../components/ProgressCharts';
import type { Workout } from '../types/models';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recentWorkouts: [] as Workout[],
    totalVolume: 0,
    totalDistance: 0,
    workoutsThisWeek: 0
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user!.uid),
        orderBy('workoutDate', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const recent: Workout[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));

      let volume = 0;
      let distance = 0;
      let thisWeek = 0;

      recent.forEach(w => {
        if (w.workoutDate >= weekStartStr) thisWeek++;
        w.exercises?.forEach(e => { volume += (e.sets || 0) * (e.reps || 0) * (e.weight || 0); });
        w.cardioSessions?.forEach(c => { distance += c.distance || 0; });
      });

      setStats({ recentWorkouts: recent, totalVolume: volume, totalDistance: distance, workoutsThisWeek: thisWeek });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Resumo</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso da semana.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary"><Activity size={24} /></div>
            <div>
              <p className="text-sm text-muted-foreground">Treinos na Semana</p>
              <h3 className="text-2xl font-bold">{stats.workoutsThisWeek}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><TrendingUp size={24} /></div>
            <div>
              <p className="text-sm text-muted-foreground">Volume Total (kg)</p>
              <h3 className="text-2xl font-bold">{stats.totalVolume.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><Calendar size={24} /></div>
            <div>
              <p className="text-sm text-muted-foreground">Distância (km)</p>
              <h3 className="text-2xl font-bold">{stats.totalDistance.toFixed(1)}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Últimos Treinos</h2>
          <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">Ver todos <ArrowRight size={16} /></Link>
        </div>
        <div className="space-y-4">
          {stats.recentWorkouts.length === 0 ? (
            <div className="text-center p-8 glass-card rounded-2xl text-muted-foreground">Nenhum treino registrado ainda. Bora treinar!</div>
          ) : (
            stats.recentWorkouts.map((workout) => (
              <div key={workout.id} className="glass-card p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${workout.type === 'musculacao' ? 'bg-primary' : 'bg-green-500'}`}></div>
                  <div>
                    <h4 className="font-semibold capitalize">{workout.type === 'musculacao' ? 'Musculação' : 'Corrida'}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(workout.workoutDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {workout.type === 'musculacao' ? (
                  <div className="text-right"><p className="font-medium">{workout.exercises?.length || 0} exercícios</p></div>
                ) : (
                  <div className="text-right"><p className="font-medium">{workout.cardioSessions?.[0]?.distance || 0} km</p></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ProgressCharts />

      <Link to="/log" className="fixed bottom-[84px] right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all z-40">
        <Plus size={24} />
      </Link>
    </div>
  );
}
