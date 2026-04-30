import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, CalendarDays, Dumbbell, History, LogOut, Route } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuthStore();

  const navItems = [
    { icon: Activity, label: 'Treino', path: '/' },
    { icon: Route, label: 'Corrida', path: '/run' },
    { icon: Dumbbell, label: 'Planos', path: '/plans' },
    { icon: History, label: 'Histórico', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 glass soft-reveal z-50 rounded-[28px]">
        <ul className="grid grid-cols-4 p-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition-all duration-300 ${location.pathname === item.path ? 'bg-primary/15 text-primary -translate-y-0.5' : 'text-muted-foreground hover:text-foreground hover:-translate-y-0.5'}`}>
                <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.8 : 2.2} />
                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Nav (Sidebar) */}
      <nav className="hidden md:flex flex-col w-72 glass soft-reveal border-r border-white/10 h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Dede<span className="text-primary">Fit</span></h1>
              <p className="text-xs font-medium text-muted-foreground">Performance pessoal</p>
            </div>
          </div>
        </div>
        <ul className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-primary/15 text-primary font-semibold shadow-inner shadow-primary/10' : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-white/10">
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 pt-6 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
}
