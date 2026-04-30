import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, TrendingUp, Calendar, ArrowRight, Plus, CheckCircle2, Clock, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProgressCharts from '../components/ProgressCharts';
import MuscleHeatmap from '../components/MuscleHeatmap';
import type { Workout } from '../types/models';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    recentWorkouts: [] as Workout[],
    plannedWorkouts: [] as Workout[],
    totalVolume: 0,
    totalDistance: 0,
    workoutsThisWeek: 0,
    muscleStats: {} as Record<string, number>
  });

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const qAll = query(collection(db, 'workouts'), where('userId', '==', user!.uid));
      const snapshotAll = await getDocs(qAll);
      const allWorkouts = snapshotAll.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout));

      const recent = allWorkouts
        .filter(w => w.status === 'completed')
        .sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
        .slice(0, 3);

      // Filter planned workouts for the current week starting from today
      const planned = allWorkouts
        .filter(w => w.status === 'planned' && w.workoutDate >= today)
        .sort((a, b) => a.workoutDate.localeCompare(b.workoutDate));

      let volume = 0;
      let distance = 0;
      let thisWeek = 0;
      const mStats: Record<string, number> = {};

      allWorkouts.forEach(w => {
        if (w.status === 'completed' && w.workoutDate >= weekStartStr) {
          thisWeek++;
          if (w.muscleGroup) {
            mStats[w.muscleGroup] = (mStats[w.muscleGroup] || 0) + 1;
          }
          w.exercises?.forEach(e => { volume += (e.sets || 0) * (e.reps || 0) * (e.weight || 0); });
          w.cardioSessions?.forEach(c => { distance += c.distance || 0; });
        }
      });

      setStats({ 
        recentWorkouts: recent, 
        plannedWorkouts: planned, 
        totalVolume: volume, 
        totalDistance: distance, 
        workoutsThisWeek: thisWeek,
        muscleStats: mStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long' });
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Olá, {user?.displayName?.split(' ')[0] || 'Guerreiro'}</h1>
          <p className="text-muted-foreground mt-1 text-lg">Pronto para o treino de hoje? 🔥</p>
        </div>
        <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500 border border-orange-500/20">
          <TrendingUp size={24} />
        </div>
      </header>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Treinos', value: stats.workoutsThisWeek, icon: Activity, color: 'text-orange-500' },
          { label: 'Volume', value: `${(stats.totalVolume/1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-blue-400' },
          { label: 'KM', value: stats.totalDistance.toFixed(1), icon: Calendar, color: 'text-green-400' },
          { label: 'Meta', value: '80%', icon: CheckCircle2, color: 'text-purple-400' }
        ].map((item, i) => (
          <div key={i} className="glass-card p-4 rounded-2xl border border-white/5">
            <div className={`${item.color} mb-2`}><item.icon size={18} /></div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{item.label}</p>
            <h3 className="text-xl font-bold text-white">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximos Treinos (Timeline View) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">Próximos Passos</h2>
            <Link to="/log" className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:underline">Novo Treino <Plus size={16} /></Link>
          </div>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            {stats.plannedWorkouts.length === 0 ? (
              <div className="p-12 glass-card rounded-3xl text-center border-dashed border-white/10">
                <p className="text-muted-foreground italic">Nenhum treino agendado para esta semana.</p>
                <Link to="/log" className="mt-4 inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold">Programar Agora</Link>
              </div>
            ) : (
              stats.plannedWorkouts.map((w, i) => (
                <div key={w.id} className="relative">
                  <div className={`timeline-dot ${i === 0 ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]' : 'pending'}`}></div>
                  <Link to="/log" className="step-card block group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{getDayName(w.workoutDate)}</p>
                        <h4 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors capitalize">
                          {w.type === 'musculacao' ? `${w.muscleGroup}` : 'Corrida Programada'}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Activity size={14} /> {w.type === 'musculacao' ? 'Hipertrofia' : 'Cardio'}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> 45-60 min</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground group-hover:border-orange-500 group-hover:text-orange-500 transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
            
            {/* Exemplo de etapa concluída para efeito visual se o histórico tiver treinos de hoje */}
            {stats.recentWorkouts.length > 0 && stats.recentWorkouts[0].workoutDate === new Date().toISOString().split('T')[0] && (
              <div className="relative">
                <div className="timeline-dot completed flex items-center justify-center text-white"><Check size={12} /></div>
                <div className="step-card opacity-60">
                   <p className="text-xs font-bold text-green-500 uppercase mb-1">Hoje</p>
                   <h4 className="text-lg font-bold text-white">Treino Finalizado ✅</h4>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Stats Secundários (estilo Detalhes do Treino) */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Performance</h2>
          <div className="space-y-4">
             {[
               { label: 'Tempo de treino', value: '4:22:15', sub: 'Total na semana', icon: Clock },
               { label: 'Calorias', value: '2.450', sub: 'Estimação kcal', icon: Activity },
               { label: 'Exercícios', value: stats.totalVolume > 0 ? '24' : '0', sub: 'Diferentes tipos', icon: Dumbbell }
             ].map((stat, i) => (
               <div key={i} className="glass-card p-5 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <stat.icon size={48} />
                 </div>
                 <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                 <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                 <div className="mt-4 h-[2px] w-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-orange-500 w-2/3"></div>
                 </div>
               </div>
             ))}
          </div>
          
          <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/10">
            <h4 className="font-bold text-white mb-2">Transformação</h4>
            <p className="text-xs text-muted-foreground mb-4">Você está a 3kg da sua meta mensal!</p>
            <div className="flex items-end gap-1 h-12">
               {[4,7,5,8,6,9,7].map((h, i) => <div key={i} className="flex-1 bg-orange-500/40 rounded-t-sm" style={{ height: `${h*10}%` }}></div>)}
            </div>
          </div>

          <MuscleHeatmap stats={stats.muscleStats} />
        </div>
      </div>

      <ProgressCharts />

      <Link to="/log" className="fixed bottom-[84px] right-4 md:bottom-8 md:right-8 w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all z-40 rotate-45 group">
        <Plus size={32} className="-rotate-45" />
      </Link>
    </div>
  );
}
