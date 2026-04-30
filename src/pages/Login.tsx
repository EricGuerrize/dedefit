import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Dumbbell } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setError('Conta criada! Fazendo login...');
      }
    } catch (err: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'Email já cadastrado.',
        'auth/weak-password': 'Senha fraca. Use no mínimo 6 caracteres.',
        'auth/invalid-email': 'Email inválido.',
      };
      setError(msg[err.code] || err.message || 'Erro de autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"></div>
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl float-slow"></div>

      <div className="w-full max-w-md z-10">
        <div className="ios-panel soft-reveal p-8 space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary rounded-[22px] flex items-center justify-center mb-4 border border-white/10 shadow-xl shadow-primary/25 pulse-glow">
              <Dumbbell className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Dede<span className="text-primary">Fit</span></h2>
            <p className="text-muted-foreground mt-2">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta para começar'}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className={`soft-reveal p-3 rounded-lg text-sm ${error.includes('Conta criada') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'}`}>
                {error}
              </div>
            )}
            <div className="space-y-4">
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nome Completo</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="ios-control w-full"
                    placeholder="Como podemos te chamar?" />
                </div>
              )}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="ios-control w-full"
                  placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 block">Senha</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="ios-control w-full"
                  placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="ios-button w-full py-4 px-4 disabled:pointer-events-none">
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <div className="text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
