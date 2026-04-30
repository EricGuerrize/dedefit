import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Activity, TrendingUp, Calendar, ArrowRight, Plus, CheckCircle2, Clock, Check, Dumbbell, Flame } from 'lucide-react';
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
    workoutsThisWeek: 0,
    totalDurationSeconds: 0,
    exerciseCount: 0,
    estimatedCalories: 0,
    goalProgress: 0
  });

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
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
      let totalDurationSeconds = 0;
      let exerciseCount = 0;

      allWorkouts.forEach(w => {
        if (w.status === 'completed' && w.workoutDate >= weekStartStr) {
          thisWeek++;
          exerciseCount += w.exercises?.filter(e => e.name?.trim()).length || 0;
          w.exercises?.forEach(e => { volume += (e.sets || 0) * (e.reps || 0) * (e.weight || 0); });
          w.cardioSessions?.forEach(c => {
            distance += c.distance || 0;
            totalDurationSeconds += c.durationSeconds || 0;
          });
        }
      });

      const estimatedStrengthMinutes = exerciseCount * 7;
      const estimatedCalories = Math.round((estimatedStrengthMinutes * 6) + (distance * 70));
      const goalProgress = Math.min(100, Math.round((thisWeek / 5) * 100));

      setStats({ 
        recentWorkouts: recent, 
        plannedWorkouts: planned, 
        totalVolume: volume, 
        totalDistance: distance, 
        workoutsThisWeek: thisWeek,
        totalDurationSeconds: totalDurationSeconds + estimatedStrengthMinutes * 60,
        exerciseCount,
        estimatedCalories,
        goalProgress
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

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-7 pb-12">
      <header className="ios-panel soft-reveal relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl float-slow"></div>
        <div className="absolute bottom-0 right-0 h-px w-2/3 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="relative flex justify-between items-start gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">DedeFit</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-foreground">Olá, {user?.displayName?.split(' ')[0] || 'Guerreiro'}</h1>
          <p className="text-muted-foreground mt-2 text-base md:text-lg">Resumo real da sua semana de treino.</p>
        </div>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-primary text-primary-foreground shadow-xl shadow-primary/25">
          <Flame size={25} />
        </div>
        </div>
      </header>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Treinos', value: stats.workoutsThisWeek, icon: Activity, color: 'text-primary' },
          { label: 'Volume', value: `${(stats.totalVolume/1000).toFixed(1)}k`, icon: TrendingUp, color: 'text-accent' },
          { label: 'KM', value: stats.totalDistance.toFixed(1), icon: Calendar, color: 'text-emerald-300' },
          { label: 'Meta', value: `${stats.goalProgress}%`, icon: CheckCircle2, color: 'text-white' }
        ].map((item, i) => (
          <div key={i} className="ios-tile soft-reveal p-4 md:p-5" style={{ animationDelay: `${i * 70}ms` }}>
            <div className={`mb-5 grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.06] ${item.color}`}><item.icon size={18} /></div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{item.label}</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">{item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximos Treinos (Timeline View) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">Próximos Passos</h2>
            <Link to="/log" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">Novo <Plus size={16} /></Link>
          </div>
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
            {stats.plannedWorkouts.length === 0 ? (
              <div className="p-10 ios-panel soft-reveal text-center border-dashed">
                <p className="text-muted-foreground italic">Nenhum treino agendado para esta semana.</p>
                <Link to="/log" className="mt-4 inline-block ios-button px-6 py-3">Programar Agora</Link>
              </div>
            ) : (
              stats.plannedWorkouts.map((w, i) => (
                <div key={w.id} className="relative soft-reveal" style={{ animationDelay: `${i * 70}ms` }}>
                  <div className={`timeline-dot ${i === 0 ? 'bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.45)]' : 'pending'}`}></div>
                  <Link to="/log" className="step-card block group">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{getDayName(w.workoutDate)}</p>
                        <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors capitalize">
                          {w.type === 'musculacao' ? `${w.muscleGroup}` : 'Corrida Programada'}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Activity size={14} /> {w.type === 'musculacao' ? 'Hipertrofia' : 'Cardio'}</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> 45-60 min</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:border-primary group-hover:text-primary transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
            
            {/* Exemplo de etapa concluída para efeito visual se o histórico tiver treinos de hoje */}
            {stats.recentWorkouts.length > 0 && stats.recentWorkouts[0].workoutDate === new Date().toISOString().split('T')[0] && (
              <div className="relative soft-reveal" style={{ animationDelay: '210ms' }}>
                <div className="timeline-dot completed flex items-center justify-center text-white">
                  <Check size={12} />
                </div>
                <div className="step-card ml-0 min-h-[112px] opacity-90">
                  <div className="flex min-h-[80px] flex-col justify-center">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Hoje</p>
                    <h4 className="text-xl font-bold text-foreground">Treino Finalizado</h4>
                    <p className="mt-2 text-sm text-muted-foreground">Sessao concluida e registrada no historico.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Stats Secundários (estilo Detalhes do Treino) */}
        <div className="space-y-6">
          <h2 className="text-xl font-black tracking-tight text-foreground">Performance</h2>
          <div className="space-y-4">
             {[
               { label: 'Tempo de treino', value: formatDuration(stats.totalDurationSeconds), sub: 'Estimado na semana', icon: Clock },
               { label: 'Calorias', value: stats.estimatedCalories.toLocaleString('pt-BR'), sub: 'Estimativa kcal', icon: Activity },
               { label: 'Exercícios', value: stats.exerciseCount.toString(), sub: 'Registrados na semana', icon: Dumbbell }
             ].map((stat, i) => (
               <div key={i} className="ios-tile soft-reveal p-5 relative overflow-hidden group" style={{ animationDelay: `${i * 90}ms` }}>
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <stat.icon size={48} />
                 </div>
                 <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                 <h3 className="text-2xl font-black text-foreground mt-1">{stat.value}</h3>
                 <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                 <div className="mt-4 h-[2px] w-full bg-muted overflow-hidden rounded-full">
                    <div className="h-full bg-primary" style={{ width: `${Math.max(8, stats.goalProgress)}%` }}></div>
                 </div>
               </div>
             ))}
          </div>
          
          <div className="ios-panel soft-reveal p-6 bg-gradient-to-br from-primary/15 to-transparent border-primary/20">
            <h4 className="font-bold text-foreground mb-2">Consistência Semanal</h4>
            <p className="text-xs text-muted-foreground mb-4">{stats.workoutsThisWeek} de 5 treinos concluídos nesta semana.</p>
            <div className="flex items-end gap-1 h-12">
               {[20, 40, 60, 80, 100].map((h, i) => <div key={i} className={`flex-1 rounded-t-sm transition-all duration-700 ${i < stats.workoutsThisWeek ? 'bg-primary/70' : 'bg-muted'}`} style={{ height: `${h}%`, transitionDelay: `${i * 80}ms` }}></div>)}
            </div>
          </div>
        </div>
      </div>

      <ProgressCharts />

      <Link to="/log" className="fixed bottom-28 right-5 md:bottom-8 md:right-8 w-16 h-16 bg-primary text-primary-foreground rounded-[22px] flex items-center justify-center shadow-2xl shadow-primary/35 hover:scale-105 active:scale-95 transition-all z-40 rotate-45 group">
        <Plus size={32} className="-rotate-45" />
      </Link>
    </div>
  );
}
