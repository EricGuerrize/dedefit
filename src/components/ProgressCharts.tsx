import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { Workout } from '../types/models';

export default function ProgressCharts() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [volumeData, setVolumeData] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchChartData();
  }, [user]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user!.uid),
        where('type', '==', 'musculacao'),
        orderBy('workoutDate', 'asc'),
        limit(30)
      );
      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workout));

      const vData = workouts.map(w => {
        let dailyVolume = 0;
        let maxWeight = 0;
        w.exercises?.forEach(e => {
          dailyVolume += (e.sets || 0) * (e.reps || 0) * (e.weight || 0);
          if (e.weight > maxWeight) maxWeight = e.weight;
        });
        return {
          date: new Date(w.workoutDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          volume: dailyVolume,
          maxWeight
        };
      });

      setVolumeData(vData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (volumeData.length === 0) return null;

  return (
    <div className="space-y-8 mt-8 border-t border-border/50 pt-8">
      <h2 className="text-xl font-bold">Progresso (Musculação)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-4 rounded-2xl hover:border-primary/30 transition-colors">
          <h3 className="font-medium text-muted-foreground mb-4 text-sm">Evolução de Carga Máxima (kg/dia)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Line type="monotone" dataKey="maxWeight" name="Carga Máx." stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl hover:border-primary/30 transition-colors">
          <h3 className="font-medium text-muted-foreground mb-4 text-sm">Volume Total Diário (kg)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} cursor={{ fill: 'rgba(150,150,150,0.05)' }} />
                <Bar dataKey="volume" name="Volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
