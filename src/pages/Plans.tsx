import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Dumbbell, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PLANS = [
  {
    name: 'Push / Pull / Legs',
    description: 'Treino focado em divisão por movimentos. Ideal para hipertrofia.',
    type: 'push_pull_legs'
  },
  {
    name: 'Upper / Lower',
    description: 'Divisão superior e inferior. Excelente para treinar 4x na semana.',
    type: 'upper_lower'
  },
  {
    name: 'Full Body',
    description: 'Treino de corpo inteiro. Perfeito para iniciantes ou 3x na semana.',
    type: 'full_body'
  }
];

export default function Plans() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [userPlans, setUserPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      setUserPlans(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClonePlan = async (template: any) => {
    try {
      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          user_id: user?.id,
          name: template.name,
          description: template.description,
          type: template.type
        })
        .select()
        .single();
        
      if (error) throw error;
      setUserPlans([...userPlans, data]);
      alert('Plano clonado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao clonar plano.');
    }
  };

  const hasCloned = (type: string) => {
    return userPlans.some(p => p.type === type);
  };

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
          <div className="text-center p-8 glass-card rounded-2xl text-muted-foreground">
            Você ainda não tem planos salvos. Clone um modelo abaixo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPlans.map(plan => (
              <div key={plan.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                </div>
                <button 
                  onClick={() => navigate('/log', { state: { planId: plan.id, type: 'musculacao' } })}
                  className="w-full bg-primary/20 text-primary hover:bg-primary/30 py-2 rounded-lg font-medium transition-colors"
                >
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
                  <div className="p-3 bg-primary/10 w-fit rounded-lg text-primary mb-4">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">{template.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{template.description}</p>
                </div>
                <button 
                  onClick={() => !cloned && handleClonePlan(template)}
                  disabled={cloned}
                  className={`w-full py-3 rounded-lg font-medium transition-all flex justify-center items-center gap-2 ${cloned ? 'bg-green-500/20 text-green-500 cursor-not-allowed' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >
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
