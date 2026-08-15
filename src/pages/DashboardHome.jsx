import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardData, getTituloNutricionista } from '../lib/db';

export default function DashboardHome({ session, nutricionista }) {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalPacientes: 0,
    consultasSemana: 0,
    pacientesSemRetorno: []
  });
  const [loading, setLoading] = useState(true);

  const titulo = getTituloNutricionista(nutricionista);
  const userName = nutricionista?.nome || session?.user?.name || 'Nutricionista';

  useEffect(() => {
    if (nutricionista?.id) {
      setLoading(true);
      getDashboardData(nutricionista.id)
        .then(setData)
        .catch((err) => console.error('Erro ao carregar dashboard:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [nutricionista]);

  // Saudação dinâmica por horário
  const hora = new Date().getHours();
  let saudacao = 'Boa noite';
  if (hora < 12) saudacao = 'Bom dia';
  else if (hora < 18) saudacao = 'Boa tarde';

  return (
    <div className="dashboard-home">
      {/* Banner de boas-vindas */}
      <div className="welcome-banner">
        <h2>{saudacao}, {titulo} {userName.split(' ')[0]}! 👋</h2>
        <p>Bem-vinda ao NutriMi. Acompanhe seus pacientes e consultas em tempo real.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="dashboard-cards-container">
          {/* Grid com os 3 Cards Principais */}
          <div className="dashboard-main-grid">
            {/* Card 1 — Total de pacientes ativos */}
            <div className="dashboard-card card-3d card-blue">
              <div className="card-header">
                <div className="card-icon-wrapper blue">
                  <span>👥</span>
                </div>
                <span className="card-tag">Ativos</span>
              </div>
              <div className="card-body">
                <span className="card-label">Total de Pacientes</span>
                <h3 className="card-value">{data.totalPacientes}</h3>
                <p className="card-subtext">Pacientes cadastrados pela nutricionista</p>
              </div>
              <div className="card-footer">
                <Link to="/dashboard/pacientes" className="card-link">
                  Ver lista de pacientes →
                </Link>
              </div>
            </div>

            {/* Card 2 — Consultas da semana */}
            <div className="dashboard-card card-3d card-burgundy">
              <div className="card-header">
                <div className="card-icon-wrapper burgundy">
                  <span>📅</span>
                </div>
                <span className="card-tag">Semana Atual</span>
              </div>
              <div className="card-body">
                <span className="card-label">Consultas da Semana</span>
                <h3 className="card-value">{data.consultasSemana}</h3>
                <p className="card-subtext">Atendimentos na semana atual</p>
              </div>
              <div className="card-footer">
                <Link to="/dashboard/consultas" className="card-link">
                  Gerenciar consultas →
                </Link>
              </div>
            </div>

            {/* Card 3 — Pacientes sem retorno */}
            <div className="dashboard-card card-3d card-warning">
              <div className="card-header">
                <div className="card-icon-wrapper warning">
                  <span>⏳</span>
                </div>
                <span className="card-tag warning-tag">Sem Retorno</span>
              </div>
              <div className="card-body">
                <span className="card-label">Pacientes sem Retorno</span>
                <p className="card-subtext" style={{ marginBottom: '1rem' }}>
                  Última consulta &gt; 30 dias sem retorno agendado
                </p>

                {data.pacientesSemRetorno.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">✅</span>
                    <p className="empty-text">Nenhum paciente sem retorno no momento</p>
                  </div>
                ) : (
                  <ul className="pacientes-sem-retorno-list">
                    {data.pacientesSemRetorno.map((paciente) => (
                      <li key={paciente.id} className="paciente-item">
                        <button
                          type="button"
                          className="paciente-name-btn"
                          onClick={() => navigate(`/dashboard/pacientes?id=${paciente.id}`)}
                          title="Clique para ver o perfil do paciente"
                        >
                          <span className="paciente-avatar">👤</span>
                          <span className="paciente-name">{paciente.nome}</span>
                        </button>
                        {paciente.ultima_consulta && (
                          <span className="paciente-date">
                            {new Date(paciente.ultima_consulta).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="card-footer">
                <Link to="/dashboard/pacientes" className="card-link">
                  Ver todos os pacientes →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
