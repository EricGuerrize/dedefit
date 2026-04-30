import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Dumbbell, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TrainingPlan } from '../types/models';

const DEFAULT_PLANS = [
  { name: 'Push / Pull / Legs', description: 'Treino focado em divisão por movimentos. Ideal para hipertrofia.', type: 'push_pull_legs' },
  { name: 'Upper / Lower', description: 'Divisão superior e inferior. Excelente para treinar 4x na semana.', type: 'upper_lower' },
  { name: 'Full Body', description: 'Treino de corpo inteiro. Perfeito para iniciantes ou 3x na semana.', type: 'full_body' }
];

export default function Plans() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [userPlans, setUserPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'training_plans'), where('userId', '==', user!.uid));
      const snapshot = await getDocs(q);
      setUserPlans(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingPlan)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClonePlan = async (template: typeof DEFAULT_PLANS[0]) => {
    try {
      const docRef = await addDoc(collection(db, 'training_plans'), {
        userId: user!.uid,
        name: template.name,
        description: template.description,
        type: template.type,
        createdAt: new Date().toISOString(),
      });
      setUserPlans([...userPlans, { id: docRef.id, userId: user!.uid, ...template, createdAt: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
      alert('Erro ao clonar plano.');
    }
  };

  const hasCloned = (type: string) => userPlans.some(p => p.type === type);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Planos de Treino</h1>
        <p className="text-muted-foreground">Escolha um modelo ou gerencie seus planos.</p>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Meus Planos</h2>
        {loading ? (
          <div className="animate-pulse bg-white/5 h-24 rounded-2xl w-full max-w-sm"></div>
        ) : userPlans.length === 0 ? (
          <div className="text-center p-8 glass-card rounded-2xl text-muted-foreground">Você ainda não tem planos salvos. Clone um modelo abaixo.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPlans.map(plan => (
              <div key={plan.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                </div>
                <button onClick={() => navigate('/log', { state: { planId: plan.id, type: 'musculacao' } })}
                  className="w-full bg-primary/20 text-primary hover:bg-primary/30 py-2 rounded-lg font-medium transition-colors">
                  Usar para Treinar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-8 border-t border-border/50">
        <h2 className="text-xl font-bold">Modelos Pré-montados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_PLANS.map((template, idx) => {
            const cloned = hasCloned(template.type);
            return (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-primary/10 w-fit rounded-lg text-primary mb-4"><Dumbbell size={24} /></div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{template.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{template.description}</p>
                </div>
                <button onClick={() => !cloned && handleClonePlan(template)} disabled={cloned}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex justify-center items-center gap-2 ${cloned ? 'bg-green-500/20 text-green-500 cursor-not-allowed' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                  {cloned ? <><Check size={18} /> Já Clonado</> : <><Plus size={18} /> Clonar Plano</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
