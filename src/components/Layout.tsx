import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, History, Dumbbell, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Layout() {
  const location = useLocation();
  const { signOut } = useAuthStore();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Dumbbell, label: 'Planos', path: '/plans' },
    { icon: History, label: 'Histórico', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Mobile Nav (Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-50">
        <ul className="flex justify-around p-3 pb-safe">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <item.icon size={24} className={location.pathname === item.path ? 'fill-primary/20' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop Nav (Sidebar) */}
      <nav className="hidden md:flex flex-col w-64 glass border-r border-border/50 h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">DedeFit</h1>
        </div>
        <ul className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.path ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                <item.icon size={20} className={location.pathname === item.path ? 'fill-primary/20' : ''} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-border/50">
          <button onClick={signOut} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
}
