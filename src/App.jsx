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
import PwaInstallPrompt from './components/PwaInstallPrompt';

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

  // Inicialização síncrona com persistência local para manter o login após recarregar a página (F5)
  const [session, setSession] = useState(() => {
    try {
      const cached = localStorage.getItem('nutrimi_session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [nutricionista, setNutricionista] = useState(() => {
    try {
      const cached = localStorage.getItem('nutrimi_nutricionista');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    // Se já temos a sessão em cache, não bloqueia a renderização com o spinner
    return !localStorage.getItem('nutrimi_session');
  });

  async function checkSession() {
    try {
      const result = await authClient.getSession();
      const apiSession = result?.data?.session || result?.data || null;
      const apiUser = result?.data?.user || result?.data?.session?.user || null;
      const email = apiUser?.email || apiSession?.user?.email;

      if (apiSession && email) {
        setSession(apiSession);
        localStorage.setItem('nutrimi_session', JSON.stringify(apiSession));

        let nut = await getNutricionistaByEmail(email);
        if (!nut) {
          const nome = apiUser?.name || email.split('@')[0];
          await saveNutricionista(nome, email);
          nut = await getNutricionistaByEmail(email);
        }
        if (nut) {
          setNutricionista(nut);
          localStorage.setItem('nutrimi_nutricionista', JSON.stringify(nut));
        }
      } else {
        // Se a API remota não retornou sessão válida, verifica se temos o cache local
        const cachedStr = localStorage.getItem('nutrimi_session');
        if (!cachedStr) {
          setSession(null);
          setNutricionista(null);
        } else {
          // Mantém a sessão ativa a partir do cache e restaura o nutricionista se necessário
          try {
            const cachedObj = JSON.parse(cachedStr);
            const cachedEmail = cachedObj?.user?.email || cachedObj?.email;
            if (cachedEmail && !nutricionista) {
              const nut = await getNutricionistaByEmail(cachedEmail);
              if (nut) {
                setNutricionista(nut);
                localStorage.setItem('nutrimi_nutricionista', JSON.stringify(nut));
              }
            }
          } catch (e) {
            console.warn('Erro ao restaurar cache local:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Verificação de sessão remota:', err);
      // Se houver erro de rede ou CORS, mantém o cache local do usuário sem deslogar
      const cached = localStorage.getItem('nutrimi_session');
      if (!cached) {
        setSession(null);
        setNutricionista(null);
      }
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
    const userObj = sessionData?.user || sessionData?.session?.user || userSession?.user || (typeof sessionData === 'object' ? sessionData : null);
    const email = userObj?.email || userSession?.email;

    setSession(userSession);
    localStorage.setItem('nutrimi_session', JSON.stringify(userSession));

    if (email) {
      let nut = await getNutricionistaByEmail(email);
      if (!nut) {
        const nome = userObj?.name || email.split('@')[0];
        await saveNutricionista(nome, email);
        nut = await getNutricionistaByEmail(email);
      }
      if (nut) {
        setNutricionista(nut);
        localStorage.setItem('nutrimi_nutricionista', JSON.stringify(nut));
      }
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
      localStorage.removeItem('nutrimi_session');
      localStorage.removeItem('nutrimi_nutricionista');
      setSession(null);
      setNutricionista(null);
      setLoading(false);
      navigate('/login', { replace: true });
    }
  }

  return (
    <>
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

      {/* Banner / Prompt de Instalação PWA */}
      <PwaInstallPrompt />
    </>
  );
}
