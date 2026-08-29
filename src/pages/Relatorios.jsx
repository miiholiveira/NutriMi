import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getConsultas } from '../lib/db';
import BodyAvatar from '../components/BodyAvatar';
import Modal from '../components/Modal';

// Helper seguro para formatação de datas sem risco de Invalid Date
function formatarDataConsulta(dataVal, options = {}) {
  if (!dataVal) return '—';
  try {
    const raw = typeof dataVal === 'string' ? dataVal : dataVal.toISOString?.() || String(dataVal);
    const datePart = raw.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('pt-BR', options);
    }
    const d = new Date(dataVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', options);
  } catch (e) {
    return '—';
  }
}

export default function Relatorios({ nutricionista }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPacienteId = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  const [consultas, setConsultas] = useState([]);
  const [selectedConsultaId, setSelectedConsultaId] = useState(null);
  const [modalAvatarOpen, setModalAvatarOpen] = useState(false);
  
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  useEffect(() => {
    if (selectedPacienteId) {
      loadConsultas(selectedPacienteId);
      setSearchParams({ paciente: selectedPacienteId });
    } else {
      setConsultas([]);
      setSelectedConsultaId(null);
      setSearchParams({});
    }
  }, [selectedPacienteId]);

  async function loadPacientes() {
    setLoadingPacientes(true);
    try {
      const data = await getPacientes(nutricionista.id);
      setPacientes(data);
      if (!selectedPacienteId && data.length > 0) {
        setSelectedPacienteId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPacientes(false);
    }
  }

  async function loadConsultas(pacienteId) {
    setLoadingConsultas(true);
    try {
      const data = await getConsultas(pacienteId);
      // Inverte para ordenar cronologicamente no gráfico (mais antiga para mais recente)
      const ordenadas = [...data].reverse();
      setConsultas(ordenadas);
      if (ordenadas.length > 0) {
        // Seleciona por padrão a consulta mais recente
        setSelectedConsultaId(ordenadas[ordenadas.length - 1].id);
      } else {
        setSelectedConsultaId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConsultas(false);
    }
  }

  const selectedPaciente = pacientes.find(p => p.id === selectedPacienteId);
  const selectedConsulta = consultas.find(c => c.id === selectedConsultaId) || consultas[consultas.length - 1] || null;

  // Cálculos de Evolução
  const totalConsultas = consultas.length;
  const pesoInicial = selectedPaciente?.peso_inicial ? parseFloat(selectedPaciente.peso_inicial) : null;
  const pesoAtual = selectedConsulta?.peso ? parseFloat(selectedConsulta.peso) : (totalConsultas > 0 ? parseFloat(consultas[totalConsultas - 1].peso) : pesoInicial);
  
  let diferencaPeso = null;
  if (pesoInicial && pesoAtual) {
    diferencaPeso = (pesoAtual - pesoInicial).toFixed(1);
  }

  let imc = null;
  if (pesoAtual && selectedPaciente?.altura) {
    const alt = parseFloat(selectedPaciente.altura);
    const alturaMetros = alt > 3 ? alt / 100 : alt;
    imc = (pesoAtual / (alturaMetros * alturaMetros)).toFixed(1);
  }

  // Helper para classificar IMC
  function getClassificacaoIMC(val) {
    const v = parseFloat(val);
    if (v < 18.5) return 'Abaixo do peso';
    if (v < 24.9) return 'Peso normal';
    if (v < 29.9) return 'Sobrepeso';
    if (v < 34.9) return 'Obesidade Grau I';
    if (v < 39.9) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  }

  // --- Renderizador do Gráfico SVG Interativo com Pontos Clicáveis ---
  function renderChart() {
    if (consultas.length < 2) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
          Registre pelo menos 2 consultas para visualizar o gráfico de evolução de peso.
        </div>
      );
    }

    const pesos = consultas.map(c => parseFloat(c.peso || 0)).filter(p => p > 0);
    if (pesos.length === 0) return null;

    const minPeso = Math.min(...pesos) - 2;
    const maxPeso = Math.max(...pesos) + 2;
    const pesoRange = maxPeso - minPeso || 1;

    // Dimensões do SVG
    const width = 500;
    const height = 240;
    const padding = 40;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Mapeamento de coordenadas
    const points = consultas.map((c, idx) => {
      const x = padding + (idx / (consultas.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((parseFloat(c.peso) - minPeso) / pesoRange) * chartHeight;
      return {
        x,
        y,
        label: `${c.peso}kg`,
        date: formatarDataConsulta(c.data_consulta, { day: '2-digit', month: '2-digit' }),
        consulta: c
      };
    });

    // Cria a string do path da linha
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }

    // Path da área sombreada abaixo da linha
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--royal-blue)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--royal-blue)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Linhas de Grade Horizontais */}
        {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => {
          const y = padding + chartHeight * val;
          const labelVal = (maxPeso - val * pesoRange).toFixed(0);
          return (
            <g key={idx}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--gray-100)" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--gray-400)" fontWeight="600">{labelVal}</text>
            </g>
          );
        })}

        {/* Área Sombreada */}
        <path d={areaD} fill="url(#chartGrad)" />

        {/* Linha do Gráfico */}
        <path d={pathD} fill="none" stroke="var(--royal-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pontos de dados interativos e clicáveis */}
        {points.map((pt, idx) => {
          const isSelected = pt.consulta.id === selectedConsulta?.id;

          return (
            <g
              key={idx}
              onClick={() => setSelectedConsultaId(pt.consulta.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulso animado no ponto selecionado */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="10"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  opacity="0.85"
                >
                  <animate
                    attributeName="r"
                    values="8;14;8"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0.2;0.9"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Ponto principal */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 7 : 5}
                fill={isSelected ? '#38bdf8' : 'var(--white)'}
                stroke={isSelected ? '#0284c7' : 'var(--burgundy)'}
                strokeWidth="2.5"
                filter={isSelected ? 'drop-shadow(0 0 6px #38bdf8)' : 'none'}
              />
              
              {/* Texto de Valor de Peso (Acima do Ponto) */}
              <text
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fontSize={isSelected ? "11" : "10"}
                fontWeight={isSelected ? "800" : "700"}
                fill={isSelected ? "#38bdf8" : "var(--white)"}
              >
                {pt.label}
              </text>

              {/* Texto de Data da Consulta (Eixo X) */}
              <text
                x={pt.x}
                y={height - padding + 18}
                textAnchor="middle"
                fontSize="9"
                fontWeight={isSelected ? "800" : "600"}
                fill={isSelected ? "#38bdf8" : "var(--gray-400)"}
              >
                {pt.date}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Evolução e Relatórios</h1>
          <p>Gráficos antropométricos, histórico e silhueta corporal dinâmica interativa</p>
        </div>
      </div>

      <div className="patient-select-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', maxWidth: '400px' }}>
          <label className="form-label" style={{ fontWeight: 700 }}>Selecione o Paciente</label>
          {loadingPacientes ? (
            <select className="form-select" disabled><option>Carregando pacientes...</option></select>
          ) : (
            <select
              className="form-select"
              value={selectedPacienteId}
              onChange={(e) => setSelectedPacienteId(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {pacientes.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingConsultas ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : !selectedPacienteId ? (
        <div className="card-table" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
          Selecione um paciente para ver seus relatórios.
        </div>
      ) : (
        <div className="reports-layout">
          {/* Lado Esquerdo: Gráfico + Histórico Antropométrico */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Evolução de Peso
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                💡 Clique em qualquer ponto para ver a silhueta da data
              </span>
            </div>

            <div className="chart-container">
              {renderChart()}
            </div>

            {/* Tabela de Histórico com Registros Clicáveis */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ color: 'var(--gray-300)', fontSize: '0.92rem', fontWeight: 700, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>📋</span> Histórico Antropométrico (Clique para atualizar o boneco)
                </h4>
                {selectedConsulta && (
                  <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    Exibindo Consulta: {formatarDataConsulta(selectedConsulta.data_consulta)}
                  </span>
                )}
              </div>

              <div className="responsive-table">
                <table className="custom-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                      <th>Data</th>
                      <th>Peso</th>
                      <th>Busto</th>
                      <th>Braço</th>
                      <th>Cintura</th>
                      <th>Quadril</th>
                      <th>Gordura (%)</th>
                      <th style={{ textAlign: 'center' }}>Visualizar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultas.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                          Nenhuma consulta registrada para este paciente.
                        </td>
                      </tr>
                    ) : (
                      [...consultas].reverse().map(c => {
                        const isSelected = c.id === selectedConsulta?.id;

                        return (
                          <tr
                            key={c.id}
                            onClick={() => setSelectedConsultaId(c.id)}
                            style={{
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
                              borderLeft: isSelected ? '4px solid #38bdf8' : '4px solid transparent',
                              transition: 'all 0.2s ease'
                            }}
                            title="Clique para carregar o boneco com as medidas desta consulta"
                          >
                            <td style={{ textAlign: 'center', fontSize: '1rem' }}>
                              {isSelected ? '👉' : '👤'}
                            </td>
                            <td style={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? '#38bdf8' : 'var(--royal-blue)' }}>
                              {formatarDataConsulta(c.data_consulta)}
                            </td>
                            <td style={{ fontWeight: 700 }}>{c.peso ? `${c.peso} kg` : '—'}</td>
                            <td>{c.busto ? `${c.busto} cm` : '—'}</td>
                            <td>{c.braco ? `${c.braco} cm` : '—'}</td>
                            <td>{c.cintura ? `${c.cintura} cm` : '—'}</td>
                            <td>{c.quadril ? `${c.quadril} cm` : '—'}</td>
                            <td>
                              {c.percentual_gordura ? (
                                <span className="badge badge-burgundy" style={{ fontWeight: 700 }}>
                                  {c.percentual_gordura}%
                                </span>
                              ) : '—'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConsultaId(c.id);
                                  setModalAvatarOpen(true);
                                }}
                                style={{
                                  background: 'rgba(56, 189, 248, 0.15)',
                                  border: '1px solid rgba(56, 189, 248, 0.35)',
                                  color: '#38bdf8',
                                  padding: '0.25rem 0.6rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title="Abrir boneco anatômico ampliado"
                              >
                                🔍 Ver Boneco
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Lado Direito: Boneco Anatômico + Cards de Resumo */}
          <div className="info-side-panel">
            {/* COMPONENTE DO BONECO CORPORAL DINÂMICO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>🧍</span> Silhueta Corporal da Consulta
                </span>
                {selectedConsulta && (
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
                    {formatarDataConsulta(selectedConsulta.data_consulta)}
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                A silhueta muda de proporção física (mais cheia ou mais esguia) conforme as medidas registradas.
              </p>

              <BodyAvatar
                medidas={selectedConsulta || {}}
                paciente={selectedPaciente}
              />
            </div>

            {/* Resumo do Paciente */}
            <div className="info-card" style={{ borderLeft: '4px solid var(--royal-blue)' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                Resumo do Paciente
              </h3>
              
              <div className="info-stat-row">
                <span className="info-stat-label">Peso Inicial</span>
                <span className="info-stat-value">{pesoInicial ? `${pesoInicial} kg` : '—'}</span>
              </div>
              <div className="info-stat-row">
                <span className="info-stat-label">Peso Consulta Selecionada</span>
                <span className="info-stat-value">{pesoAtual ? `${pesoAtual} kg` : '—'}</span>
              </div>
              <div className="info-stat-row">
                <span className="info-stat-label">Diferença</span>
                <span className="info-stat-value" style={{ color: diferencaPeso && parseFloat(diferencaPeso) < 0 ? 'var(--success)' : 'var(--white)' }}>
                  {diferencaPeso ? (parseFloat(diferencaPeso) > 0 ? `+${diferencaPeso} kg` : `${diferencaPeso} kg`) : '—'}
                </span>
              </div>
            </div>

            {/* IMC */}
            {imc && (
              <div className="info-card" style={{ borderLeft: '4px solid var(--burgundy)' }}>
                <h3 style={{ color: 'var(--white)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Índice de Massa Corporal (IMC)
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--burgundy)' }}>{imc}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontWeight: 600 }}>kg/m²</span>
                </div>
                
                <span className="badge badge-burgundy" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                  {getClassificacaoIMC(imc)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ampliado para o Boneco Anatômico */}
      <Modal
        isOpen={modalAvatarOpen}
        onClose={() => setModalAvatarOpen(false)}
        title={`Análise Antropométrica — ${selectedPaciente?.nome || 'Paciente'} (${formatarDataConsulta(selectedConsulta?.data_consulta)})`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--gray-400)' }}>
            Representação visual das dimensões de Busto, Cintura e Quadril calculadas para esta consulta.
          </p>

          <BodyAvatar
            medidas={selectedConsulta || {}}
            paciente={selectedPaciente}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setModalAvatarOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
