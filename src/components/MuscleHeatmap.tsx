import { Dumbbell } from 'lucide-react';

interface MuscleHeatmapProps {
  stats: Record<string, number>;
}

export default function MuscleHeatmap({ stats }: MuscleHeatmapProps) {
  const muscles = [
    { id: 'Peito', label: 'Peito', pos: 'top-[22%] left-[35%] w-[30%]' },
    { id: 'Costas', label: 'Costas', pos: 'top-[20%] left-[35%] w-[30%]' },
    { id: 'Ombros', label: 'Ombros', pos: 'top-[18%] left-[20%] w-[60%]' },
    { id: 'Pernas', label: 'Pernas', pos: 'top-[50%] left-[25%] w-[50%]' },
    { id: 'Bíceps', label: 'Bíceps', pos: 'top-[25%] left-[15%] w-[15%]' },
    { id: 'Tríceps', label: 'Tríceps', pos: 'top-[25%] right-[15%] w-[15%]' },
    { id: 'Abdômen', label: 'Core', pos: 'top-[35%] left-[40%] w-[20%]' },
  ];

  const getColor = (count: number) => {
    if (!count) return 'bg-zinc-800';
    if (count < 2) return 'bg-blue-500/40';
    if (count < 4) return 'bg-green-500/60';
    if (count < 6) return 'bg-yellow-500/80';
    return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]';
  };

  return (
    <div className="glass-card p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Dumbbell className="text-orange-500" /> Fadiga Muscular
        </h3>
      </div>

      <div className="relative aspect-[3/4] max-w-[200px] mx-auto bg-zinc-900/50 rounded-full p-4 overflow-hidden border border-white/5">
        {/* Simple Body Silhouette SVG */}
        <svg viewBox="0 0 100 150" className="w-full h-full opacity-20 fill-white">
          <path d="M50,10 c5,0 10,5 10,10 s-5,10 -10,10 s-10,-5 -10,-10 s5,-10 10,-10 M35,35 c0,0 -5,0 -10,5 c-5,5 -10,20 -10,35 c0,15 5,20 10,20 h5 v40 c0,10 5,15 10,15 s10,-5 10,-15 v-40 h10 v40 c0,10 5,15 10,15 s10,-5 10,-15 v-40 h5 c5,0 10,-5 10,-20 c0,-15 -5,-30 -10,-35 c-5,-5 -10,-5 -10,-5 z" />
        </svg>

        {/* Heatmap Overlays (Simplified with Circles/Blobs) */}
        <div className={`absolute top-[28%] left-[30%] w-10 h-6 rounded-full blur-md transition-all duration-500 ${getColor(stats['Peito'])}`}></div>
        <div className={`absolute top-[18%] left-[25%] w-6 h-6 rounded-full blur-md transition-all duration-500 ${getColor(stats['Ombros'])}`}></div>
        <div className={`absolute top-[18%] right-[25%] w-6 h-6 rounded-full blur-md transition-all duration-500 ${getColor(stats['Ombros'])}`}></div>
        <div className={`absolute top-[55%] left-[30%] w-8 h-16 rounded-full blur-md transition-all duration-500 ${getColor(stats['Pernas'])}`}></div>
        <div className={`absolute top-[55%] right-[30%] w-8 h-16 rounded-full blur-md transition-all duration-500 ${getColor(stats['Pernas'])}`}></div>
        <div className={`absolute top-[38%] left-[40%] w-6 h-10 rounded-full blur-md transition-all duration-500 ${getColor(stats['Abdômen'])}`}></div>
        <div className={`absolute top-[28%] left-[18%] w-5 h-10 rounded-full blur-md transition-all duration-500 ${getColor(stats['Bíceps'])}`}></div>
        <div className={`absolute top-[28%] right-[18%] w-5 h-10 rounded-full blur-md transition-all duration-500 ${getColor(stats['Tríceps'])}`}></div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
          <div className="w-2 h-2 rounded-full bg-zinc-800"></div> Descanso
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div> Recuperando
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
          <div className="w-2 h-2 rounded-full bg-green-500"></div> Treinado
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div> Fadigado
        </div>
      </div>
    </div>
  );
}
