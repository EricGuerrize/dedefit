import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, TrendingUp, Calendar, ArrowRight, Plus, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressCharts from '../components/ProgressCharts';
import type { Workout } from '../types/models';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recentWorkouts: [] as Workout[],
    plannedWorkouts: [] as Workout[],
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
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Fetch ALL workouts for this user to calculate stats
      const qAll = query(collection(db, 'workouts'), where('userId', '==', user!.uid));
      const snapshotAll = await getDocs(qAll);
      const allWorkouts = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));

      const recent = allWorkouts
        .filter(w => w.status === 'completed')
        .sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
        .slice(0, 5);

      const planned = allWorkouts
        .filter(w => w.status === 'planned' && w.workoutDate >= today)
        .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate));

      let volume = 0;
      let distance = 0;
      let thisWeek = 0;

      allWorkouts.forEach(w => {
        if (w.status === 'completed' && w.workoutDate >= weekStartStr) {
          thisWeek++;
          w.exercises?.forEach(e => { volume += (e.sets || 0) * (e.reps || 0) * (e.weight || 0); });
          w.cardioSessions?.forEach(c => { distance += c.distance || 0; });
        }
      });

      setStats({ recentWorkouts: recent, plannedWorkouts: planned, totalVolume: volume, totalDistance: distance, workoutsThisWeek: thisWeek });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Olá, {user?.displayName || 'Guerreiro'}</h1>
        <p className="text-muted-foreground">Aqui está o seu planejamento e progresso.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary"><Activity size={24} /></div>
            <div><p className="text-sm text-muted-foreground">Feitos na Semana</p><h3 className="text-2xl font-bold">{stats.workoutsThisWeek}</h3></div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><TrendingUp size={24} /></div>
            <div><p className="text-sm text-muted-foreground">Volume Total (kg)</p><h3 className="text-2xl font-bold">{stats.totalVolume.toLocaleString()}</h3></div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-green-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><Calendar size={24} /></div>
            <div><p className="text-sm text-muted-foreground">Distância (km)</p><h3 className="text-2xl font-bold">{stats.totalDistance.toFixed(1)}</h3></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Planejados */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="text-secondary-foreground" /> Próximos Treinos</h2>
          <div className="space-y-3">
            {stats.plannedWorkouts.length === 0 ? (
              <div className="p-6 glass-card rounded-2xl text-center text-muted-foreground italic">Nenhum treino agendado.</div>
            ) : (
              stats.plannedWorkouts.map(w => (
                <div key={w.id} className="glass-card p-4 rounded-xl border-l-4 border-secondary flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div>
                    <h4 className="font-bold text-foreground capitalize">{w.type === 'musculacao' ? `Treino de ${w.muscleGroup}` : 'Corrida Programada'}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(w.workoutDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
                  </div>
                  {w.type === 'corrida' && w.cardioSessions?.[0]?.targetDistance && (
                    <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-md font-bold">{w.cardioSessions[0].targetDistance}km</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recentes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle2 className="text-primary" /> Atividades Recentes</h2>
            <Link to="/history" className="text-sm text-primary hover:underline flex items-center gap-1">Histórico <ArrowRight size={16} /></Link>
          </div>
          <div className="space-y-3">
            {stats.recentWorkouts.length === 0 ? (
              <div className="p-6 glass-card rounded-2xl text-center text-muted-foreground italic">Nenhum treino realizado ainda.</div>
            ) : (
              stats.recentWorkouts.map(w => (
                <div key={w.id} className="glass-card p-4 rounded-xl border-l-4 border-primary flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div>
                    <h4 className="font-bold text-foreground capitalize">{w.type === 'musculacao' ? `Treino de ${w.muscleGroup}` : 'Corrida Realizada'}</h4>
                    <p className="text-sm text-muted-foreground">{new Date(w.workoutDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    {w.type === 'musculacao' ? (
                      <p className="text-sm font-medium">{w.exercises?.length} exers.</p>
                    ) : (
                      <p className="text-sm font-medium">{w.cardioSessions?.[0]?.distance} km</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ProgressCharts />

      <Link to="/log" className="fixed bottom-[84px] right-4 md:bottom-8 md:right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all z-40">
        <Plus size={24} />
      </Link>
    </div>
  );
}
