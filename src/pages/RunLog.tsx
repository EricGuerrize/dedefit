import { useMemo, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { Activity, CalendarClock, Gauge, HeartPulse, Map, Mountain, Plus, Route, Timer } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const TERRAIN_OPTIONS = ['Rua', 'Esteira', 'Trilha', 'Pista', 'Misto'];

const parseDuration = (timeStr: string) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

const formatPace = (distanceKm: number, durationSeconds: number) => {
  if (!distanceKm || !durationSeconds) return '0:00/km';
  const paceSeconds = durationSeconds / distanceKm;
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
};

export default function RunLog() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'planned' | 'completed'>('completed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [distance, setDistance] = useState(5);
  const [targetDistance, setTargetDistance] = useState(5);
  const [durationStr, setDurationStr] = useState('00:30:00');
  const [targetPace, setTargetPace] = useState('6:00/km');
  const [elevationGain, setElevationGain] = useState(0);
  const [avgHeartRate, setAvgHeartRate] = useState(145);
  const [calories, setCalories] = useState(0);
  const [perceivedEffort, setPerceivedEffort] = useState(5);
  const [terrain, setTerrain] = useState(TERRAIN_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const durationSeconds = useMemo(() => parseDuration(durationStr), [durationStr]);
  const pace = useMemo(() => formatPace(distance, durationSeconds), [distance, durationSeconds]);
  const estimatedCalories = calories || Math.round(distance * 68);
  const speed = distance && durationSeconds ? (distance / (durationSeconds / 3600)).toFixed(1) : '0.0';
  const isCompleted = status === 'completed';
  const primaryDistance = isCompleted ? distance : targetDistance;
  const primaryPace = isCompleted ? pace : targetPace;
  const runCards = isCompleted
    ? [
        { label: 'KM feitos', value: distance.toFixed(2), icon: Map, color: 'text-accent' },
        { label: 'Pace real', value: pace, icon: Gauge, color: 'text-primary' },
        { label: 'Tempo', value: durationStr, icon: Timer, color: 'text-white' },
        { label: 'Km/h', value: speed, icon: Activity, color: 'text-emerald-300' },
      ]
    : [
        { label: 'Meta km', value: targetDistance.toFixed(1), icon: Map, color: 'text-accent' },
        { label: 'Pace alvo', value: targetPace, icon: Gauge, color: 'text-primary' },
        { label: 'Duração alvo', value: durationStr, icon: CalendarClock, color: 'text-white' },
        { label: 'Esforço', value: `${perceivedEffort}/10`, icon: Activity, color: 'text-emerald-300' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        userId: user!.uid,
        workoutDate: date,
        type: 'corrida',
        status,
        notes,
        createdAt: new Date().toISOString(),
        cardioSessions: [{
          distance: status === 'completed' ? distance : 0,
          targetDistance,
          durationSeconds: status === 'completed' ? durationSeconds : 0,
          pace: status === 'completed' ? pace : '0:00/km',
          targetPace,
          elevationGain,
          avgHeartRate,
          calories: estimatedCalories,
          perceivedEffort,
          terrain,
          notes,
        }],
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving run:', error);
      alert('Erro ao salvar corrida.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-in fade-in duration-500">
      <header className="ios-panel soft-reveal relative overflow-hidden p-6">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl float-slow"></div>
        <div className="absolute bottom-0 left-6 right-6 h-px shimmer-line bg-white/10"></div>
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">{isCompleted ? 'Corrida realizada' : 'Corrida planejada'}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-foreground">{isCompleted ? 'Registrar corrida' : 'Planejar corrida'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isCompleted ? 'Registre o que aconteceu no treino e acompanhe o pace real.' : 'Defina a rota, meta, pace alvo e carga antes de sair.'}
            </p>
          </div>
          <div className="pulse-glow grid h-14 w-14 shrink-0 place-items-center rounded-[20px] bg-accent text-accent-foreground shadow-xl shadow-accent/20">
            <Route size={26} />
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="ios-panel soft-reveal p-5 space-y-5" style={{ animationDelay: '60ms' }}>
          <div className="grid grid-cols-2 gap-1 rounded-[18px] bg-black/25 p-1 border border-white/10">
            <button type="button" onClick={() => setStatus('completed')} className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${status === 'completed' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-white/[0.05]'}`}>Realizada</button>
            <button type="button" onClick={() => setStatus('planned')} className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ${status === 'planned' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:bg-white/[0.05]'}`}>Planejada</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ios-control w-full" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Terreno</label>
              <select value={terrain} onChange={(e) => setTerrain(e.target.value)} className="ios-control w-full">
                {TERRAIN_OPTIONS.map(option => <option key={option} value={option} className="bg-background">{option}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="soft-reveal grid grid-cols-2 gap-3" style={{ animationDelay: '120ms' }}>
          {runCards.map((item, index) => (
            <div key={item.label} className="ios-tile p-4" style={{ animationDelay: `${index * 60}ms` }}>
              <div className={`mb-4 grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.06] ${item.color}`}><item.icon size={18} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-foreground">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="ios-panel soft-reveal p-5 space-y-4" style={{ animationDelay: '180ms' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight">{isCompleted ? 'Resultado da corrida' : 'Plano da corrida'}</h2>
              <p className="text-xs text-muted-foreground">
                {isCompleted ? 'Preencha os dados reais do treino.' : 'Monte a meta antes de registrar o resultado.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] px-3 py-2 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{isCompleted ? 'Pace' : 'Alvo'}</p>
              <p className="text-sm font-black text-primary">{primaryPace}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">{isCompleted ? 'Distância real' : 'Distância prevista'}</label>
              <input type="number" min="0" step="0.01" value={primaryDistance} onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                if (isCompleted) setDistance(value);
                else setTargetDistance(value);
              }} className="ios-control w-full text-xl font-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Meta km</label>
              <input type="number" min="0" step="0.1" value={targetDistance} onChange={(e) => setTargetDistance(parseFloat(e.target.value) || 0)} className="ios-control w-full text-xl font-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">{isCompleted ? 'Tempo real' : 'Tempo previsto'}</label>
              <input type="text" pattern="[0-9]{1,2}:[0-9]{2}:[0-9]{2}" value={durationStr} onChange={(e) => setDurationStr(e.target.value)} className="ios-control w-full text-xl font-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Pace alvo</label>
              <input type="text" value={targetPace} onChange={(e) => setTargetPace(e.target.value)} className="ios-control w-full text-xl font-black" placeholder="6:00/km" />
            </div>
          </div>
        </section>

        <section className="ios-panel soft-reveal p-5 space-y-4" style={{ animationDelay: '240ms' }}>
          <h2 className="text-xl font-black tracking-tight">{isCompleted ? 'Carga e intensidade' : 'Intensidade planejada'}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-widest text-muted-foreground"><Mountain size={13} /> Elevação</label>
              <input type="number" min="0" value={elevationGain} onChange={(e) => setElevationGain(parseInt(e.target.value) || 0)} className="ios-control w-full text-xl font-black" />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1 text-xs font-black uppercase tracking-widest text-muted-foreground"><HeartPulse size={13} /> BPM médio</label>
              <input type="number" min="0" value={avgHeartRate} onChange={(e) => setAvgHeartRate(parseInt(e.target.value) || 0)} className="ios-control w-full text-xl font-black" />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Calorias</label>
              <input type="number" min="0" value={calories} onChange={(e) => setCalories(parseInt(e.target.value) || 0)} className="ios-control w-full text-xl font-black" placeholder={`${estimatedCalories}`} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-muted-foreground">Esforço {perceivedEffort}/10</label>
              <input type="range" min="1" max="10" value={perceivedEffort} onChange={(e) => setPerceivedEffort(parseInt(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>
        </section>

        <section className="ios-panel soft-reveal p-5 space-y-4" style={{ animationDelay: '300ms' }}>
          <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="ios-control w-full resize-none" placeholder={isCompleted ? 'Tênis, clima, rota, sensação, intervalos...' : 'Rota, objetivo, tênis, estratégia de pace...'} />
        </section>

        <button type="submit" disabled={loading} className="ios-button soft-reveal flex w-full items-center justify-center gap-2 px-4 py-4" style={{ animationDelay: '360ms' }}>
          {loading ? 'Salvando...' : <><Plus size={20} /> {isCompleted ? 'Salvar Corrida Realizada' : 'Salvar Corrida Planejada'}</>}
        </button>
      </form>
    </div>
  );
}
