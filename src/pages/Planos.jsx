import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getPlanos, savePlano, deletePlano } from '../lib/db';
import { gerarPlanoAlimentar7Dias, estimarCaloriasOpcao } from '../utils/dietGenerator';
import { gerarPlanoTreinos } from '../utils/workoutGenerator';
import { BANCO_DE_ALIMENTOS, buscarAlimentos, analisarOpcaoAlimentar } from '../data/tabelaAlimentos';

export default function Planos({ nutricionista }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPacienteId = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [activePlano, setActivePlano] = useState(null);

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Active Tab: 'resumo', 'Segunda-feira', ..., 'Domingo', 'treinos', 'alimentos'
  const [activeTab, setActiveTab] = useState('resumo');

  // Estado do Plano Alimentar de 7 Dias
  const [dietPlan, setDietPlan] = useState(null);
  // Estado do Plano de Treinos
  const [workoutPlan, setWorkoutPlan] = useState(null);

  // Estados da Tabela de Alimentos TACO
  const [buscaAlimento, setBuscaAlimento] = useState('');
  const [categoriaAlimento, setCategoriaAlimento] = useState('Todas');

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  useEffect(() => {
    if (selectedPacienteId) {
      const found = pacientes.find(p => p.id === selectedPacienteId);
      setSelectedPaciente(found || null);
      loadPlanos(selectedPacienteId);
      setSearchParams({ paciente: selectedPacienteId });
    } else {
      setSelectedPaciente(null);
      setPlanos([]);
      setActivePlano(null);
      setDietPlan(null);
      setWorkoutPlan(null);
      setSearchParams({});
    }
  }, [selectedPacienteId, pacientes]);

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

  async function loadPlanos(pacienteId) {
    setLoadingPlanos(true);
    try {
      const data = await getPlanos(pacienteId);
      setPlanos(data);
      if (data.length > 0) {
        setActivePlano(data[0]);
        if (data[0].conteudo?.dietPlan) setDietPlan(data[0].conteudo.dietPlan);
        if (data[0].conteudo?.workoutPlan) setWorkoutPlan(data[0].conteudo.workoutPlan);
      } else {
        setActivePlano(null);
        handleGenerateAll(selectedPaciente);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlanos(false);
    }
  }

  function handleGenerateAll(pacienteObj) {
    const target = pacienteObj || selectedPaciente;
    if (!target) return;
    const generatedDiet = gerarPlanoAlimentar7Dias(target);
    const generatedWorkout = gerarPlanoTreinos(target);
    setDietPlan(generatedDiet);
    setWorkoutPlan(generatedWorkout);
  }

  // Modificadores do Plano Alimentar com cálculo automático de calorias por opção
  function handleOpcaoChange(diaIdx, refeicaoIdx, opcaoIdx, val) {
    if (!dietPlan) return;
    const newDias = JSON.parse(JSON.stringify(dietPlan.dias));
    const ref = newDias[diaIdx].refeicoes[refeicaoIdx];
    const currentOp = ref.opcoes[opcaoIdx];
    const autoKcal = estimarCaloriasOpcao(val, ref.calorias || 350);

    if (typeof currentOp === 'object' && currentOp !== null) {
      ref.opcoes[opcaoIdx] = {
        ...currentOp,
        texto: val,
        calorias: autoKcal
      };
    } else {
      ref.opcoes[opcaoIdx] = {
        texto: val,
        calorias: autoKcal
      };
    }
    setDietPlan({ ...dietPlan, dias: newDias });
  }

  function handleAddOpcao(diaIdx, refeicaoIdx) {
    if (!dietPlan) return;
    const newDias = JSON.parse(JSON.stringify(dietPlan.dias));
    const ref = newDias[diaIdx].refeicoes[refeicaoIdx];
    const defaultKcal = ref.calorias || Math.round((dietPlan.resumo?.metaCalorias || 2000) * 0.2);
    const newTexto = `Opção ${ref.opcoes.length + 1}: Descreva o alimento equivalente...`;
    
    ref.opcoes.push({
      texto: newTexto,
      calorias: estimarCaloriasOpcao(newTexto, defaultKcal)
    });
    setDietPlan({ ...dietPlan, dias: newDias });
  }

  function handleRemoveOpcao(diaIdx, refeicaoIdx, opcaoIdx) {
    if (!dietPlan) return;
    const newDias = JSON.parse(JSON.stringify(dietPlan.dias));
    const ref = newDias[diaIdx].refeicoes[refeicaoIdx];
    if (ref.opcoes.length <= 1) return;
    ref.opcoes.splice(opcaoIdx, 1);
    setDietPlan({ ...dietPlan, dias: newDias });
  }

  function handleSwapExercise(treinoIdx, exercicioIdx, chosenVariation) {
    if (!workoutPlan) return;
    const newRotina = JSON.parse(JSON.stringify(workoutPlan.rotina));
    const ex = newRotina[treinoIdx].exercicios[exercicioIdx];
    const oldExercicio = ex.exercicio;
    
    ex.exercicio = chosenVariation;
    if (ex.variacoes) {
      ex.variacoes = ex.variacoes.map(v => v === chosenVariation ? oldExercicio : v);
    }
    setWorkoutPlan({ ...workoutPlan, rotina: newRotina });
  }

  async function handleSavePlano() {
    if (!selectedPacienteId || !dietPlan) return;

    setActionLoading(true);
    try {
      await savePlano({
        paciente_id: selectedPacienteId,
        conteudo: {
          dietPlan,
          workoutPlan
        }
      });
      alert('Plano alimentar e de treinos salvo com sucesso! 🎉');
      loadPlanos(selectedPacienteId);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar plano alimentar.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePlano(id) {
    if (window.confirm('Tem certeza que deseja excluir este plano alimentar?')) {
      try {
        await deletePlano(id);
        loadPlanos(selectedPacienteId);
      } catch (err) {
        alert('Erro ao excluir plano alimentar.');
      }
    }
  }

  function handlePrintPDF() {
    window.print();
  }

  const diasList = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  return (
    <div className="planos-page">
      <div className="page-header no-print">
        <div className="page-title">
          <h1>Planos Alimentares & Dietas</h1>
          <p>Gere e gerencie dietas completas de 7 dias com 3 opções por refeição e treinos semanais</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => handleGenerateAll(selectedPaciente)} disabled={!selectedPaciente}>
            ⚡ Gerar Dieta & Treino Automático
          </button>
          <button className="btn-secondary" onClick={handlePrintPDF} disabled={!dietPlan}>
            🖨️ Imprimir
          </button>
          <button className="btn-primary" onClick={handlePrintPDF} disabled={!dietPlan}>
            📄 Baixar PDF
          </button>
        </div>
      </div>

      {/* Seleção do Paciente */}
      <div className="patient-select-wrapper no-print" style={{ background: 'var(--panel-bg)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--panel-border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>Selecione o Paciente</label>
            {loadingPacientes ? (
              <select className="form-select" disabled><option>Carregando pacientes...</option></select>
            ) : (
              <select
                className="form-select"
                value={selectedPacienteId}
                onChange={(e) => setSelectedPacienteId(e.target.value)}
                style={{ background: '#111827', color: '#fff' }}
              >
                <option value="">-- Selecione um paciente --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.sexo})</option>
                ))}
              </select>
            )}
          </div>
          {selectedPaciente && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Objetivo:</span>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#3b82f6' }}>
                  {selectedPaciente.objetivos?.join(', ') || 'Manutenção'}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Peso/Altura:</span>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#10b981' }}>
                  {selectedPaciente.peso_inicial || '—'} kg / {selectedPaciente.altura || '—'} m
                </div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>💧 Água Ideal:</span>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#06b6d4' }}>
                  {dietPlan?.resumo?.consumoAgua?.litrosFormatado || ((parseFloat(selectedPaciente.peso_inicial || 70) * 35) / 1000).toFixed(1) + ' L/dia'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visualização de Impressão (PDF Header) */}
      <div className="print-only-header" style={{ display: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#1e3a8a', margin: 0, fontWeight: 800 }}>NutriMi — Prescrição Nutricional</h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.9rem' }}>Acompanhamento & Cuidado Nutricional Personalizado</p>
          </div>
          {selectedPaciente && (
            <div style={{ textAlign: 'right', fontSize: '0.88rem', color: '#1f2937' }}>
              <strong>Paciente:</strong> {selectedPaciente.nome}<br />
              <strong>Idade:</strong> {dietPlan?.pacienteInfo?.idade || '—'} anos | <strong>Sexo:</strong> {selectedPaciente.sexo}<br />
              <strong>Peso:</strong> {selectedPaciente.peso_inicial || '—'} kg | <strong>Altura:</strong> {selectedPaciente.altura || '—'} m<br />
              <strong>💧 Meta Hídrica:</strong> {dietPlan?.resumo?.consumoAgua?.recomendacao || ((parseFloat(selectedPaciente.peso_inicial || 70) * 35) / 1000).toFixed(1) + ' L/dia'}<br />
              <strong>Data da Prescrição:</strong> {new Date().toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      {/* Abas de Navegação */}
      {dietPlan && (
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
          <button
            className={`btn-secondary ${activeTab === 'resumo' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('resumo')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            📊 Resumo Nutricional
          </button>
          {diasList.map((d) => (
            <button
              key={d}
              className={`btn-secondary ${activeTab === d ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(d)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              🗓️ {d.split('-')[0]}
            </button>
          ))}
          <button
            className={`btn-secondary ${activeTab === 'treinos' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('treinos')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            🏋️ Treinos Semanais
          </button>
          <button
            className={`btn-secondary ${activeTab === 'alimentos' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('alimentos')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: activeTab === 'alimentos' ? 'linear-gradient(135deg, #059669, #10b981)' : '' }}
          >
            📖 Banco de Alimentos (TACO)
          </button>
        </div>
      )}

      {/* Conteúdo Principal do Editor */}
      {!dietPlan ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px dashed var(--panel-border)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🥗</span>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', fontWeight: 700 }}>Nenhum plano alimentar selecionado</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Selecione um paciente acima ou clique para gerar a dieta de 7 dias automaticamente com 3 opções por refeição.
          </p>
          <button className="btn-primary" onClick={() => handleGenerateAll(selectedPaciente)} disabled={!selectedPaciente}>
            ⚡ Gerar Dieta de 7 Dias Agora
          </button>
        </div>
      ) : (
        <div className="plan-editor-container">
          {/* ABA 1: RESUMO NUTRICIONAL */}
          {(activeTab === 'resumo' || window.matchMedia('print').matches) && (
            <div className="card-table" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--white)', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🎯</span> Metas de Calorias, Macronutrientes & Hidratação
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>Meta Calórica</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{dietPlan.resumo.metaCalorias} <span style={{ fontSize: '0.9rem' }}>kcal</span></div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>Carboidratos ({dietPlan.resumo.carboPct}%)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{dietPlan.resumo.carboGrams} <span style={{ fontSize: '0.9rem' }}>g</span></div>
                </div>

                <div style={{ background: 'rgba(190, 18, 60, 0.15)', border: '1px solid rgba(190, 18, 60, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#f43f5e', textTransform: 'uppercase', fontWeight: 700 }}>Proteínas ({dietPlan.resumo.protPct}%)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#be123c' }}>{dietPlan.resumo.protGrams} <span style={{ fontSize: '0.9rem' }}>g</span></div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 700 }}>Gorduras ({dietPlan.resumo.fatPct}%)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{dietPlan.resumo.fatGrams} <span style={{ fontSize: '0.9rem' }}>g</span></div>
                </div>

                <div style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', padding: '1rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#67e8f9', textTransform: 'uppercase', fontWeight: 700 }}>💧 Água Ideal (35ml/kg)</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4' }}>
                    {dietPlan.resumo.consumoAgua?.litrosFormatado || ((parseFloat(dietPlan.pacienteInfo?.peso || selectedPaciente?.peso_inicial || 70) * 35) / 1000).toFixed(1) + ' L'} <span style={{ fontSize: '0.9rem' }}>/dia</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#a5f3fc', marginTop: '0.2rem' }}>
                    ~{dietPlan.resumo.consumoAgua?.mlTotal?.toLocaleString('pt-BR') || Math.round(parseFloat(dietPlan.pacienteInfo?.peso || selectedPaciente?.peso_inicial || 70) * 35).toLocaleString('pt-BR')} ml ({dietPlan.resumo.consumoAgua?.copos250ml || Math.round((parseFloat(dietPlan.pacienteInfo?.peso || selectedPaciente?.peso_inicial || 70) * 35) / 250)} copos de 250ml)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABAS DOS 7 DIAS DA SEMANA */}
          {diasList.map((diaNome, diaIdx) => {
            const diaData = dietPlan.dias[diaIdx];
            if (!diaData) return null;
            const isVisible = activeTab === diaNome || window.matchMedia('print').matches;
            if (!isVisible) return null;

            return (
              <div key={diaNome} className="day-meals-container" style={{ marginBottom: '2rem' }}>
                <div className="form-section-title" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '2px solid var(--royal-blue-light)', paddingBottom: '0.5rem' }}>
                  🗓️ Cardápio — {diaNome} (Mínimo 3 Opções Equivalentes por Refeição)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {diaData.refeicoes.map((refeicao, refIdx) => (
                    <div key={refIdx} className="meal-card" style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', borderRadius: '16px', padding: '1.25rem' }}>
                      <div className="meal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1.2rem' }}>🍽️</span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)' }}>{refeicao.nome}</span>
                          {refeicao.calorias && (
                            <span
                              style={{
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.15))',
                                border: '1px solid rgba(245, 158, 11, 0.4)',
                                color: '#fde047',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              🔥 ~{refeicao.calorias} kcal
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Horário Sugerido:</span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                            value={refeicao.horario}
                            onChange={(e) => {
                              const newDias = [...dietPlan.dias];
                              newDias[diaIdx].refeicoes[refIdx].horario = e.target.value;
                              setDietPlan({ ...dietPlan, dias: newDias });
                            }}
                          />
                        </div>
                      </div>

                      {/* Lista de Opções Equivalentes */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {refeicao.opcoes.map((opcaoItem, opIdx) => {
                          const opcaoText = typeof opcaoItem === 'object' && opcaoItem !== null ? opcaoItem.texto : opcaoItem;
                          const opcaoKcal = typeof opcaoItem === 'object' && opcaoItem !== null && opcaoItem.calorias
                            ? opcaoItem.calorias
                            : estimarCaloriasOpcao(opcaoText, refeicao.calorias || 350);

                          return (
                            <div key={opIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.15)', padding: '0.3rem 0.6rem', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                  Opção {opIdx + 1}
                                </span>
                                <span
                                  title="Calorias calculadas automaticamente para esta opção"
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#fbbf24',
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgba(245, 158, 11, 0.35)',
                                    padding: '0.25rem 0.55rem',
                                    borderRadius: '6px',
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem'
                                  }}
                                >
                                  🔥 {opcaoKcal} kcal
                                </span>
                              </div>
                              <input
                                type="text"
                                className="form-input"
                                value={opcaoText}
                                onChange={(e) => handleOpcaoChange(diaIdx, refIdx, opIdx, e.target.value)}
                                style={{ flex: 1, minWidth: '260px', fontSize: '0.9rem' }}
                                placeholder="Descreva os alimentos da opção..."
                              />
                              {refeicao.opcoes.length > 1 && (
                                <button
                                  type="button"
                                  className="btn-action btn-action-delete no-print"
                                  onClick={() => handleRemoveOpcao(diaIdx, refIdx, opIdx)}
                                  title="Remover esta opção"
                                >
                                  ➖
                                </button>
                              )}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          className="btn-secondary no-print"
                          onClick={() => handleAddOpcao(diaIdx, refIdx)}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'fit-content', marginTop: '0.5rem' }}
                        >
                          ➕ Adicionar Mais Uma Opção Equivalente
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {dietPlan.observacoesGerais && (
                  <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '1.25rem', borderRadius: '14px', fontSize: '0.9rem', color: '#e0f2fe', marginTop: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>💧</span>
                    <div>
                      <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>Recomendações de Hidratação & Cuidados Gerais:</strong>
                      {dietPlan.observacoesGerais}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ABA DE TREINOS SEMANAIS */}
          {(activeTab === 'treinos' || window.matchMedia('print').matches) && workoutPlan && (
            <div className="workout-plan-container" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <div className="form-section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                🏋️ Plano de Treinos Semanal Prescrito ({workoutPlan.divisao})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {workoutPlan.rotina.map((treino, tIdx) => (
                  <div key={tIdx} className="card-table" style={{ padding: '1.25rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#3b82f6', marginBottom: '1rem' }}>
                      {treino.nome}
                    </h4>
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Exercício / Atividade</th>
                          <th>Séries</th>
                          <th>Repetições</th>
                          <th>Descanso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treino.exercicios.map((ex, exIdx) => (
                          <tr key={exIdx}>
                            <td style={{ fontWeight: 600, color: 'var(--white)', verticalAlign: 'top' }}>
                              <div style={{ fontSize: '0.96rem', marginBottom: '0.35rem' }}>{ex.exercicio}</div>
                              {ex.variacoes && ex.variacoes.length > 0 && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  <span style={{ color: '#93c5fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                    🔄 Se ocupado:
                                  </span>
                                  {ex.variacoes.map((v, vIdx) => (
                                    <span
                                      key={vIdx}
                                      onClick={() => handleSwapExercise(tIdx, exIdx, v)}
                                      title="Clique para definir esta variação como o exercício principal"
                                      style={{
                                        background: 'rgba(59, 130, 246, 0.15)',
                                        border: '1px solid rgba(59, 130, 246, 0.28)',
                                        borderRadius: '6px',
                                        padding: '0.15rem 0.5rem',
                                        color: '#bfdbfe',
                                        fontSize: '0.78rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        display: 'inline-block'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.35)';
                                        e.currentTarget.style.borderColor = '#60a5fa';
                                        e.currentTarget.style.color = '#ffffff';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.28)';
                                        e.currentTarget.style.color = '#bfdbfe';
                                      }}
                                    >
                                      {v}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{ex.series}</td>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>{ex.repeticoes}</td>
                            <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}><span className="badge badge-blue">{ex.descanso}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', fontSize: '0.88rem', color: 'var(--gray-300)' }}>
                  <strong>💡 Recomendações Gerais de Treino:</strong> {workoutPlan.observacoes}
                </div>
              </div>
            </div>
          )}

          {/* ABA: BANCO DE ALIMENTOS (TABELA TACO / TBCA) */}
          {activeTab === 'alimentos' && (
            <div className="card-table" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <span>📖</span> Banco Nutricional de Alimentos (Tabela TACO / TBCA)
                  </h3>
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    Consulte calorias em gramas, macronutrientes e medidas caseiras padrão para composição e cálculo automático de dietas
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-green" style={{ fontSize: '0.85rem' }}>
                    {BANCO_DE_ALIMENTOS.length} Alimentos Cadastrados
                  </span>
                </div>
              </div>

              {/* Filtros de Categoria e Barra de Pesquisa */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="🔎 Buscar alimento por nome ou sinônimo (ex: frango, arroz, patinho, aveia, banana, azeite, whey, etc.)..."
                    value={buscaAlimento}
                    onChange={(e) => setBuscaAlimento(e.target.value)}
                    style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                  />
                  {buscaAlimento && (
                    <button
                      onClick={() => setBuscaAlimento('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Categorias */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    'Todas', 'Carnes & Aves', 'Peixes & Frutos do Mar', 'Cereais & Tubérculos',
                    'Leguminosas', 'Pães & Farinhas', 'Laticínios', 'Frutas',
                    'Vegetais & Legumes', 'Oleaginosas & Sementes', 'Óleos & Gorduras', 'Suplementos'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoriaAlimento(cat)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.78rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        background: categoriaAlimento === cat ? 'var(--royal-blue-light)' : 'rgba(255,255,255,0.05)',
                        borderColor: categoriaAlimento === cat ? 'var(--royal-blue-light)' : 'rgba(255,255,255,0.1)',
                        color: categoriaAlimento === cat ? '#ffffff' : 'var(--gray-300)'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Alimentos */}
              <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ minWidth: '200px' }}>Alimento</th>
                      <th>Categoria</th>
                      <th style={{ textAlign: 'right' }}>Calorias (100g)</th>
                      <th style={{ textAlign: 'right' }}>Proteínas</th>
                      <th style={{ textAlign: 'right' }}>Carboidratos</th>
                      <th style={{ textAlign: 'right' }}>Gorduras</th>
                      <th style={{ textAlign: 'right' }}>Fibras</th>
                      <th style={{ minWidth: '180px' }}>Medida Caseira Padrão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buscarAlimentos(buscaAlimento)
                      .filter((ali) => categoriaAlimento === 'Todas' || ali.categoria.includes(categoriaAlimento))
                      .map((ali) => (
                        <tr key={ali.id} style={{ transition: 'background 0.2s' }}>
                          <td style={{ fontWeight: 600, color: 'var(--white)' }}>
                            {ali.nome}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--gray-300)' }}>
                              {ali.categoria}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>
                            🔥 {ali.calorias_100g} kcal
                          </td>
                          <td style={{ textAlign: 'right', color: '#f43f5e', fontWeight: 600 }}>
                            {ali.proteinas_100g}g
                          </td>
                          <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                            {ali.carboidratos_100g}g
                          </td>
                          <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 600 }}>
                            {ali.gorduras_100g}g
                          </td>
                          <td style={{ textAlign: 'right', color: '#60a5fa' }}>
                            {ali.fibras_100g}g
                          </td>
                          <td style={{ color: 'var(--gray-300)', fontSize: '0.85rem' }}>
                            🥄 {ali.medida_caseira_padrao}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Observações Gerais & Ações */}
          <div className="no-print" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn-secondary" onClick={() => handleGenerateAll(selectedPaciente)}>
              🔄 Recalcular / Gerar Novas Opções
            </button>
            <button className="btn-primary" onClick={handleSavePlano} disabled={actionLoading} style={{ padding: '0.75rem 2rem' }}>
              {actionLoading ? <div className="spinner" /> : '💾 Salvar Plano Alimentar & Treino'}
            </button>
          </div>

          {/* Rodapé de Impressão PDF */}
          <div className="print-only-footer" style={{ display: 'none', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0, fontWeight: 600 }}>NutriMi — Nutrição Inteligente</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>Documento emitido para acompanhamento nutricional individual do paciente.</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderTop: '1.5px solid #111827', width: '250px', paddingTop: '0.4rem' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#111827', display: 'block' }}>Assinatura / Carimbo</strong>
                  <span style={{ fontSize: '0.78rem', color: '#4b5563' }}>Nutricionista Responsável CRN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
