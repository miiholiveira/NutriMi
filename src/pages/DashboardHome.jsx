import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlobalStats } from '../lib/db';

export default function DashboardHome({ session, nutricionista }) {
  const [stats, setStats] = useState({ pacientes: 0, nutricionistas: 0, consultas: 0, planos: 0 });
  const [loading, setLoading] = useState(true);

  const userName = nutricionista?.nome || session?.user?.name || 'Nutricionista';

  useEffect(() => {
    if (nutricionista?.id) {
      getGlobalStats(nutricionista.id)
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [nutricionista]);

  // Saudação dinâmica por horário
  const hora = new Date().getHours();
  let saudacao = 'Boa noite';
  if (hora < 12) saudacao = 'Bom dia';
  else if (hora < 18) saudacao = 'Boa tarde';

  return (
    <div>
      <div className="welcome-banner">
        <h2>{saudacao}, Dra. {userName.split(' ')[0]}! 👋</h2>
        <p>Bem-vinda ao NutriMi. Seu espaço completo de acompanhamento e cuidado nutricional está ativo.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="dashboard-grid">
          <Link to="/dashboard/pacientes" className="metric-card">
            <div className="metric-icon blue">👥</div>
            <div className="metric-info">
              <span className="metric-label">Pacientes</span>
              <span className="metric-value">{stats.pacientes}</span>
            </div>
          </Link>

          <Link to="/dashboard/consultas" className="metric-card">
            <div className="metric-icon burgundy">📅</div>
            <div className="metric-info">
              <span className="metric-label">Consultas</span>
              <span className="metric-value">{stats.consultas}</span>
            </div>
          </Link>

          <Link to="/dashboard/planos" className="metric-card">
            <div className="metric-icon green">🥗</div>
            <div className="metric-info">
              <span className="metric-label">Planos</span>
              <span className="metric-value">{stats.planos}</span>
            </div>
          </Link>

          <div className="metric-card" style={{ cursor: 'default' }}>
            <div className="metric-icon warning">✨</div>
            <div className="metric-info">
              <span className="metric-label">Nutricionistas</span>
              <span className="metric-value">{stats.nutricionistas}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
