import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getConsultas } from '../lib/db';

export default function Relatorios({ nutricionista }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPacienteId = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  const [consultas, setConsultas] = useState([]);
  
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
      setConsultas([...data].reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConsultas(false);
    }
  }

  const selectedPaciente = pacientes.find(p => p.id === selectedPacienteId);

  // Cálculos de Evolução
  const totalConsultas = consultas.length;
  const pesoInicial = selectedPaciente?.peso_inicial ? parseFloat(selectedPaciente.peso_inicial) : null;
  const pesoAtual = totalConsultas > 0 ? parseFloat(consultas[totalConsultas - 1].peso) : pesoInicial;
  
  let diferencaPeso = null;
  if (pesoInicial && pesoAtual) {
    diferencaPeso = (pesoAtual - pesoInicial).toFixed(1);
  }

  let imc = null;
  if (pesoAtual && selectedPaciente?.altura) {
    const alt = parseFloat(selectedPaciente.altura);
    // Trata altura salva tanto em cm (ex: 170) quanto metros (ex: 1.70)
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

  // --- Renderizador do Gráfico SVG ---
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
      return { x, y, label: `${c.peso}kg`, date: new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) };
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
        {/* Definições de gradiente */}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--royal-blue)" stopOpacity="0.2" />
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

        {/* Pontos de dados e labels */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="var(--white)" stroke="var(--burgundy)" strokeWidth="2.5" />
            
            {/* Texto de Valor de Peso (Acima do Ponto) */}
            <text x={pt.x} y={pt.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--white)">
              {pt.label}
            </text>

            {/* Texto de Data da Consulta (Eixo X) */}
            <text x={pt.x} y={height - padding + 18} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--gray-400)">
              {pt.date}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Evolução e Relatórios</h1>
          <p>Gráficos antropométricos e histórico de evolução física do paciente</p>
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
          {/* Gráfico */}
          <div className="chart-card">
            <h3 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              Evolução de Peso
            </h3>
            <div className="chart-container">
              {renderChart()}
            </div>

            {/* Tabela Resumo */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ color: 'var(--gray-300)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Histórico Antropométrico
              </h4>
              <div className="responsive-table">
                <table className="custom-table" style={{ fontSize: '0.88rem' }}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Peso</th>
                      <th>Cintura</th>
                      <th>Quadril</th>
                      <th>Gordura (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...consultas].reverse().map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td style={{ fontWeight: 700 }}>{c.peso ? `${c.peso} kg` : '—'}</td>
                        <td>{c.cintura ? `${c.cintura} cm` : '—'}</td>
                        <td>{c.quadril ? `${c.quadril} cm` : '—'}</td>
                        <td>{c.percentual_gordura ? `${c.percentual_gordura}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cards Rápidos de Status */}
          <div className="info-side-panel">
            <div className="info-card" style={{ borderLeft: '4px solid var(--royal-blue)' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
                Resumo do Paciente
              </h3>
              
              <div className="info-stat-row">
                <span className="info-stat-label">Peso Inicial</span>
                <span className="info-stat-value">{pesoInicial ? `${pesoInicial} kg` : '—'}</span>
              </div>
              <div className="info-stat-row">
                <span className="info-stat-label">Peso Atual</span>
                <span className="info-stat-value">{pesoAtual ? `${pesoAtual} kg` : '—'}</span>
              </div>
              <div className="info-stat-row">
                <span className="info-stat-label">Diferença</span>
                <span className="info-stat-value" style={{ color: diferencaPeso && parseFloat(diferencaPeso) < 0 ? 'var(--success)' : 'var(--white)' }}>
                  {diferencaPeso ? (parseFloat(diferencaPeso) > 0 ? `+${diferencaPeso} kg` : `${diferencaPeso} kg`) : '—'}
                </span>
              </div>
            </div>

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
    </div>
  );
}
