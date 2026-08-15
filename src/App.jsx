import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from './lib/auth';
import { getNutricionistaByEmail, saveNutricionista } from './lib/db';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import ResetSenha from './pages/ResetSenha';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import Pacientes from './pages/Pacientes';
import Consultas from './pages/Consultas';
import Planos from './pages/Planos';
import Relatorios from './pages/Relatorios';

function AuthGuard({ session, loading, children }) {
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }
  return session ? children : <Navigate to="/login" replace />;
}

function PublicGuard({ session, loading, children }) {
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }
  return !session ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [nutricionista, setNutricionista] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkSession() {
    try {
      const result = await authClient.getSession();
      const currentSession = result?.data?.session || null;
      setSession(currentSession);
      
      if (currentSession?.user?.email) {
        let nut = await getNutricionistaByEmail(currentSession.user.email);
        if (!nut) {
          const nome = currentSession.user.name || currentSession.user.email.split('@')[0];
          await saveNutricionista(nome, currentSession.user.email);
          nut = await getNutricionistaByEmail(currentSession.user.email);
        }
        setNutricionista(nut);
      } else {
        setNutricionista(null);
      }
    } catch (err) {
      console.error(err);
      setSession(null);
      setNutricionista(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSession();
  }, []);

  async function handleAuthSuccess(sessionData) {
    setLoading(true);
    const userSession = sessionData?.session || sessionData;
    setSession(userSession);
    
    if (userSession?.user?.email) {
      let nut = await getNutricionistaByEmail(userSession.user.email);
      if (!nut) {
        const nome = userSession.user.name || userSession.user.email.split('@')[0];
        await saveNutricionista(nome, userSession.user.email);
        nut = await getNutricionistaByEmail(userSession.user.email);
      }
      setNutricionista(nut);
    }
    setLoading(false);
    navigate('/dashboard', { replace: true });
  }

  async function handleLogout() {
    setLoading(true);
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn(err);
    } finally {
      setSession(null);
      setNutricionista(null);
      setLoading(false);
      navigate('/login', { replace: true });
    }
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicGuard session={session} loading={loading}>
            <Login onSuccess={handleAuthSuccess} />
          </PublicGuard>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PublicGuard session={session} loading={loading}>
            <Cadastro onSuccess={handleAuthSuccess} />
          </PublicGuard>
        }
      />
      <Route
        path="/reset-senha"
        element={
          <PublicGuard session={session} loading={loading}>
            <ResetSenha />
          </PublicGuard>
        }
      />
      
      {/* Rotas protegidas sob Layout */}
      <Route
        path="/dashboard/*"
        element={
          <AuthGuard session={session} loading={loading}>
            <DashboardLayout session={session} nutricionista={nutricionista} onLogout={handleLogout}>
              <Routes>
                <Route index element={<DashboardHome session={session} nutricionista={nutricionista} />} />
                <Route path="pacientes" element={<Pacientes nutricionista={nutricionista} />} />
                <Route path="consultas" element={<Consultas nutricionista={nutricionista} />} />
                <Route path="planos" element={<Planos nutricionista={nutricionista} />} />
                <Route path="relatorios" element={<Relatorios nutricionista={nutricionista} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
