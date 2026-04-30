import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkoutLog from './pages/WorkoutLog';
import History from './pages/History';
import Plans from './pages/Plans';

function App() {
  const { user, setUser, setInitialized, initialized } = useAuthStore();

  useEffect(() => {
    if (!auth) {
      setInitialized(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitialized(true);
    });
    return () => unsubscribe();
  }, [setUser, setInitialized]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<WorkoutLog />} />
          <Route path="/history" element={<History />} />
          <Route path="/plans" element={<Plans />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
