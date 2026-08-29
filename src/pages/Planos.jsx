import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getPlanos, savePlano, deletePlano } from '../lib/db';
import { gerarPlanoAlimentar7Dias, estimarCaloriasOpcao } from '../utils/dietGenerator';
import { gerarPlanoTreinos } from '../utils/workoutGenerator';
import { BANCO_DE_ALIMENTOS, buscarAlimentos } from '../data/tabelaAlimentos';
import { calcularIdade, obterClassificacaoEtaria } from '../utils/healthCalculators';
import { converterPlanoIAparaDietPlan } from '../utils/aiDietConverter';

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

  // Estados específicos da Geração com IA (Gemini)
  const [loadingIA, setLoadingIA] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [errorModal, setErrorModal] = useState(null);
  const [toast, setToast] = useState(null);

  // Active Tab: 'resumo', 'Segunda-feira', ..., 'Domingo', 'treinos', 'alimentos'
  const [activeTab, setActiveTab] = useState('resumo');

  // Estado do Plano Alimentar de 7 Dias
  const [dietPlan, setDietPlan] = useState(null);
  // Estado do Plano de Treinos
  const [workoutPlan, setWorkoutPlan] = useState(null);
  // Alternador de Visualização do Treino Menstrual (para mulheres)
  const [viewMenstrual, setViewMenstrual] = useState(false);

  // Estados da Tabela de Alimentos TACO
  const [buscaAlimento, setBuscaAlimento] = useState('');
  const [categoriaAlimento, setCategoriaAlimento] = useState('Todas');

  // Auto-limpeza do Toast de Notificações
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  useEffect(() => {
    if (selectedPacienteId) {
      const found = pacientes.find(p => p.id === selectedPacienteId);
      setSelectedPaciente(found || null);
      if (found) {
        loadPlanos(selectedPacienteId, found);
      }
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

  async function loadPlanos(pacienteId, pacienteObj) {
    setLoadingPlanos(true);
    try {
      const targetPac = pacienteObj || pacientes.find(p => p.id === pacienteId);
      if (!targetPac) return;

      const data = await getPlanos(pacienteId);
      setPlanos(data);
      if (data.length > 0) {
        setActivePlano(data[0]);
        if (data[0].conteudo?.dietPlan) {
          setDietPlan(data[0].conteudo.dietPlan);
        } else {
          setDietPlan(gerarPlanoAlimentar7Dias(targetPac));
        }

        let loadedWorkout = data[0].conteudo?.workoutPlan;
        const idadePac = targetPac.data_nascimento ? calcularIdade(targetPac.data_nascimento) : 30;
        const faixaPac = obterClassificacaoEtaria(idadePac);

        // Se não há treino ou se o treino salvo não corresponde à faixa etária ou ao sexo do paciente atual, regenera para o paciente correto
        const precisaRegenerar =
          !loadedWorkout ||
          !loadedWorkout.faixaEtaria ||
          loadedWorkout.faixaEtaria.tipo !== faixaPac.tipo ||
          loadedWorkout.sexo !== targetPac.sexo ||
          (idadePac <= 12 && (loadedWorkout.divisao?.includes('ABC') || loadedWorkout.divisao?.toLowerCase().includes('musculação')));

        if (precisaRegenerar) {
          loadedWorkout = gerarPlanoTreinos(targetPac);
        }

        setWorkoutPlan(loadedWorkout);
      } else {
        setActivePlano(null);
        handleGenerateAll(targetPac);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlanos(false);
    }
  }

  function handleGenerateAll(pacienteObj) {
    const target = pacienteObj || selectedPaciente || (selectedPacienteId ? pacientes.find(p => p.id === selectedPacienteId) : null);
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

  function handleSwapExercise(treinoIdx, exercicioIdx, chosenVariation, isMenstrual = false) {
    if (!workoutPlan) return;
    if (isMenstrual && workoutPlan.treinoMenstrual) {
      const newMenstrual = JSON.parse(JSON.stringify(workoutPlan.treinoMenstrual));
      const ex = newMenstrual.rotina[treinoIdx].exercicios[exercicioIdx];
      const oldExercicio = ex.exercicio;
      ex.exercicio = chosenVariation;
      if (ex.variacoes) {
        ex.variacoes = ex.variacoes.map(v => v === chosenVariation ? oldExercicio : v);
      }
      setWorkoutPlan({ ...workoutPlan, treinoMenstrual: newMenstrual });
      return;
    }

    const newRotina = JSON.parse(JSON.stringify(workoutPlan.rotina));
    const ex = newRotina[treinoIdx].exercicios[exercicioIdx];
    const oldExercicio = ex.exercicio;
    
    ex.exercicio = chosenVariation;
    if (ex.variacoes) {
      ex.variacoes = ex.variacoes.map(v => v === chosenVariation ? oldExercicio : v);
    }
    setWorkoutPlan({ ...workoutPlan, rotina: newRotina });
  }

  function handleRegenerateWorkoutOnly() {
    if (!selectedPaciente) return;
    const generatedWorkout = gerarPlanoTreinos(selectedPaciente);
    setWorkoutPlan(generatedWorkout);
    setViewMenstrual(false);
  }

  const IA_MESSAGES = [
    '🔍 Lendo dados clínicos, metas e restrições do paciente...',
    '🤖 IA Google Gemini calculando cardápio semanal personalizado...',
    '🥗 Harmonizando alimentos da culinária brasileira...',
    '🛡️ Adequando rigorosamente a restrições e alergias alimentares...',
    '✨ Estruturando 5 opções equilibradas para cada refeição...',
    '✅ Finalizando e renderizando plano interativo...'
  ];

  async function handleGerarPlanoIA() {
    const targetPac = selectedPaciente || pacientes.find(p => p.id === selectedPacienteId);
    if (!targetPac) return;

    setLoadingIA(true);
    setErrorModal(null);
    setLoadingMsg(IA_MESSAGES[0]);

    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % IA_MESSAGES.length;
      setLoadingMsg(IA_MESSAGES[msgIdx]);
    }, 1600);

    try {
      const res = await fetch('/api/gerar-plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente: {
            nome: targetPac.nome,
            idade: targetPac.data_nascimento ? calcularIdade(targetPac.data_nascimento) : 30,
            sexo: targetPac.sexo,
            peso_inicial: targetPac.peso_inicial,
            altura: targetPac.altura,
            nivel_atividade: targetPac.nivel_atividade,
            objetivos: targetPac.objetivos,
            alergias: targetPac.alergias,
            restricoes_alimentares: targetPac.restricoes_alimentares,
            observacoes: targetPac.observacoes,
            objetivo_texto: targetPac.objetivo_texto
          }
        })
      });

      const json = await res.json();
      if (!json.ok || !json.data?.plano_semanal) {
        throw new Error(json.error || 'Falha na resposta da IA.');
      }

      const convertedDiet = converterPlanoIAparaDietPlan(json.data.plano_semanal, targetPac);
      const generatedWorkout = gerarPlanoTreinos(targetPac);

      setDietPlan(convertedDiet);
      setWorkoutPlan(generatedWorkout);
      setActiveTab('Segunda-feira');
      setToast({
        type: 'success',
        message: '✨ Plano alimentar gerado com IA com sucesso! Cada refeição conta com 5 opções editáveis.'
      });
    } catch (err) {
      console.error('Erro na geração com IA:', err);
      setErrorModal({
        open: true,
        message: 'Não foi possível gerar o plano com IA no momento. Deseja tentar novamente ou criar um Plano Manual?'
      });
    } finally {
      clearInterval(interval);
      setLoadingIA(false);
    }
  }

  function handleSelectPlanoFromHistory(planoObj) {
    setActivePlano(planoObj);
    if (planoObj.conteudo?.dietPlan) {
      setDietPlan(planoObj.conteudo.dietPlan);
    }
    if (planoObj.conteudo?.workoutPlan) {
      setWorkoutPlan(planoObj.conteudo.workoutPlan);
    }
    setToast({
      type: 'info',
      message: `Carregado plano de ${new Date(planoObj.created_at).toLocaleDateString('pt-BR')} do histórico.`
    });
  }

  async function handleSavePlano() {
    if (!selectedPacienteId || !dietPlan) return;

    setActionLoading(true);
    try {
      const saved = await savePlano({
        paciente_id: selectedPacienteId,
        conteudo: {
          dietPlan,
          workoutPlan,
          tipoGeracao: dietPlan.tipoGeracao || 'ia',
          salvoEm: new Date().toISOString()
        }
      });
      setActivePlano(saved);
      setToast({
        type: 'success',
        message: 'Plano alimentar e de treinos salvo com sucesso no histórico do paciente! 🎉'
      });
      // Atualiza a lista de históricos preservando todos os registros
      const updatedList = await getPlanos(selectedPacienteId);
      setPlanos(updatedList);
    } catch (err) {
      console.error(err);
      setToast({
        type: 'error',
        message: 'Erro ao salvar plano alimentar no banco de dados.'
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePlano(id) {
    if (window.confirm('Tem certeza que deseja excluir este plano do histórico?')) {
      try {
        await deletePlano(id);
        const updated = await getPlanos(selectedPacienteId);
        setPlanos(updated);
        if (activePlano?.id === id) {
          if (updated.length > 0) {
            handleSelectPlanoFromHistory(updated[0]);
          } else {
            setActivePlano(null);
            handleGenerateAll(selectedPaciente);
          }
        }
        setToast({ type: 'info', message: 'Plano removido do histórico.' });
      } catch (err) {
        console.error(err);
        setToast({ type: 'error', message: 'Erro ao excluir o plano alimentar.' });
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
      <div className="page-header no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="page-title" style={{ maxWidth: '650px' }}>
          <h1 style={{ fontSize: '1.45rem', marginBottom: '0.2rem' }}>Planos Alimentares & Dietas</h1>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Gere e gerencie dietas completas com IA (Gemini), opções editáveis por refeição e treinos semanais</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', flexDirection: 'row', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', width: 'auto' }}>
          {/* Botão em Destaque: Gerar com IA */}
          <button
            className="btn-primary"
            onClick={handleGerarPlanoIA}
            disabled={loadingIA || !selectedPacienteId}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              border: '1px solid #a855f7',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              height: '32px',
              width: 'auto',
              maxWidth: 'fit-content',
              flex: '0 0 auto',
              cursor: loadingIA ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {loadingIA ? (
              <>
                <div className="spinner" style={{ width: '13px', height: '13px' }} />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Gerar Plano com IA</span>
              </>
            )}
          </button>

          {/* Botão Secundário: Gerar Manual */}
          <button
            className="btn-secondary"
            onClick={() => handleGenerateAll(selectedPaciente)}
            disabled={loadingIA || !selectedPaciente}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.35rem 0.7rem',
              fontSize: '0.8rem',
              height: '32px',
              width: 'auto',
              maxWidth: 'fit-content',
              flex: '0 0 auto',
              whiteSpace: 'nowrap'
            }}
            title="Gera dieta calculada pelo algoritmo local"
          >
            <span>⚡</span>
            <span>Plano Manual</span>
          </button>

          {/* Salvar Plano (Visível quando há plano carregado) */}
          {dietPlan && (
            <button
              className="btn-primary"
              onClick={handleSavePlano}
              disabled={actionLoading || loadingIA}
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                border: '1px solid #34d399',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                height: '32px',
                width: 'auto',
                maxWidth: 'fit-content',
                flex: '0 0 auto',
                whiteSpace: 'nowrap'
              }}
            >
              {actionLoading ? <div className="spinner" style={{ width: '13px', height: '13px' }} /> : <span>💾</span>}
              <span>Salvar Plano</span>
            </button>
          )}

          <button
            className="btn-secondary"
            onClick={handlePrintPDF}
            disabled={!dietPlan}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              height: '32px',
              width: 'auto',
              maxWidth: 'fit-content',
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            🖨️ Imprimir
          </button>
          <button
            className="btn-secondary"
            onClick={handlePrintPDF}
            disabled={!dietPlan}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              height: '32px',
              width: 'auto',
              maxWidth: 'fit-content',
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'linear-gradient(135deg, #9d174d, #be123c)',
              color: '#ffffff',
              border: '1px solid #f43f5e'
            }}
          >
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
                  {selectedPaciente.peso_inicial || '—'} kg / {(() => {
                    const altNum = parseFloat(selectedPaciente.altura);
                    if (!altNum) return '—';
                    return altNum > 3 ? (altNum / 100).toFixed(2) + ' m' : altNum.toFixed(2) + ' m';
                  })()}
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

      {/* HISTÓRICO DE PLANOS DO PACIENTE */}
      {selectedPaciente && (
        <div className="no-print" style={{
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem' }}>📋</span>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--white)', margin: 0 }}>
                Histórico de Planos Salvos ({planos.length})
              </h3>
            </div>
            {dietPlan?.tipoGeracao === 'ia' && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                color: '#c084fc',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                ✨ Cardápio Gerado via Inteligência Artificial
              </span>
            )}
          </div>

          {planos.length === 0 ? (
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💡</span>
              <span>Nenhum plano salvo no histórico para {selectedPaciente.nome}. Clique no botão <strong>"✨ Gerar Plano com IA"</strong> no topo para gerar e salvar cardápios personalizados.</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {planos.map((p, idx) => {
                const isActive = activePlano?.id === p.id;
                const isIA = p.conteudo?.tipoGeracao === 'ia' || p.conteudo?.dietPlan?.tipoGeracao === 'ia';
                const dataFormatada = p.created_at ? new Date(p.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data não informada';

                return (
                  <div
                    key={p.id}
                    style={{
                      background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1.5px solid ${isActive ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '12px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--white)' }}>
                          Plano #{planos.length - idx}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          background: isIA ? 'rgba(168, 85, 247, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                          color: isIA ? '#c084fc' : '#6ee7b7',
                          border: `1px solid ${isIA ? 'rgba(168, 85, 247, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}>
                          {isIA ? '✨ IA' : '📋 Manual'}
                        </span>
                      </div>
                      {isActive && (
                        <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          🟢 Em exibição
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      🕒 Salvo em: {dataFormatada}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectPlanoFromHistory(p)}
                        className={isActive ? 'btn-primary' : 'btn-secondary'}
                        style={{ flex: 1, padding: '0.3rem 0.6rem', fontSize: '0.75rem', textAlign: 'center' }}
                      >
                        {isActive ? '✓ Selecionado' : '👁️ Carregar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlano(p.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          borderRadius: '8px',
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        title="Excluir este plano do histórico"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LOADING OVERLAY COM MENSAGENS DINÂMICAS DA IA */}
      {loadingIA && (
        <div className="no-print" style={{
          background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.25) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1.5px solid #a855f7',
          borderRadius: '16px',
          padding: '2rem 1.5rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '2.5rem' }}>🤖✨</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="spinner" style={{ width: '22px', height: '22px', borderColor: '#c084fc', borderTopColor: 'transparent' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#f3e8ff', fontWeight: 800, margin: 0 }}>
              Inteligência Artificial NutriMi em Execução
            </h3>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#e9d5ff', margin: 0, fontWeight: 600, minHeight: '1.5rem' }}>
            {loadingMsg}
          </p>
          <div style={{ fontSize: '0.8rem', color: '#c084fc' }}>
            O Google Gemini está formulando um cardápio semanal completo com 5 opções para cada uma das 5 refeições diárias.
          </div>
        </div>
      )}

      {/* MODAL DE ERRO COM FALLBACK MANUAL */}
      {errorModal?.open && (
        <div className="no-print" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#111827',
            border: '1.5px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '16px',
            padding: '1.75rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠️</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Aviso de Geração com IA</h3>
            </div>
            <p style={{ color: 'var(--gray-300)', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
              {errorModal.message}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setErrorModal(null)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Fechar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setErrorModal(null);
                  handleGenerateAll(selectedPaciente);
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: '#3b82f6', color: '#93c5fd' }}
              >
                📋 Criar Plano Manual
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setErrorModal(null);
                  handleGerarPlanoIA();
                }}
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
              >
                🔄 Tentar Novamente com IA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST DE NOTIFICAÇÕES FLUTUANTE */}
      {toast && (
        <div className="no-print" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toast.type === 'error' ? '#7f1d1d' : toast.type === 'info' ? '#1e3a8a' : '#065f46',
          border: `1px solid ${toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981'}`,
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <span>{toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅'}</span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '0.5rem', opacity: 0.7 }}
          >
            ✕
          </button>
        </div>
      )}

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
            {selectedPaciente && calcularIdade(selectedPaciente.data_nascimento) <= 12 ? '🤸 Atividades Infantis (Sem Musculação)' : '🏋️ Treinos Semanais'}
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
          <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', fontWeight: 700 }}>Nenhum plano alimentar ativo na tela</h3>
          <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Selecione um paciente acima para carregar um plano salvo do histórico ou gere um novo cardápio semanal personalizado.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={handleGerarPlanoIA}
              disabled={loadingIA || !selectedPacienteId}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                border: '1px solid #a855f7',
                padding: '0.65rem 1.4rem',
                fontWeight: 700
              }}
            >
              ✨ Gerar com IA (Gemini)
            </button>
            <button
              className="btn-secondary"
              onClick={() => handleGenerateAll(selectedPaciente)}
              disabled={loadingIA || !selectedPaciente}
              style={{ padding: '0.65rem 1.4rem' }}
            >
              ⚡ Gerar Plano Manual
            </button>
          </div>
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
          {(activeTab === 'treinos' || window.matchMedia('print').matches) && workoutPlan && (() => {
            const currentPac = selectedPaciente || pacientes.find(p => p.id === selectedPacienteId);
            const idadePaciente = currentPac?.data_nascimento ? calcularIdade(currentPac.data_nascimento) : (workoutPlan.idade || 30);
            const faixaEtaria = obterClassificacaoEtaria(idadePaciente);
            const isCrianca = faixaEtaria.tipo === 'crianca';
            const isAdolescente = faixaEtaria.tipo === 'adolescente';
            const isAdulto = faixaEtaria.tipo === 'adulto';
            const isIdoso = faixaEtaria.tipo === 'idoso';
            const isFeminino = String(currentPac?.sexo || workoutPlan.sexo || 'Feminino').toLowerCase().includes('fem');
            const isMasculino = !isFeminino;
            const hasMenstrual = Boolean(workoutPlan.treinoMenstrual && isFeminino);

            return (
              <div className="workout-plan-container" style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                {/* Header Principal do Treino com Identificação da Faixa Etária e Sexo */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 23, 42, 0.65) 100%)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <span style={{
                          background: faixaEtaria.badgeCor,
                          border: `1px solid ${faixaEtaria.badgeBorder}`,
                          color: faixaEtaria.badgeTexto,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}>
                          {faixaEtaria.icone} {faixaEtaria.label} ({idadePaciente} {idadePaciente === 1 ? 'ano' : 'anos'})
                        </span>

                        <span style={{
                          background: isFeminino ? 'rgba(219, 39, 119, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          border: `1px solid ${isFeminino ? 'rgba(219, 39, 119, 0.35)' : 'rgba(59, 130, 246, 0.35)'}`,
                          color: isFeminino ? '#f472b6' : '#93c5fd',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}>
                          {isFeminino ? '♀️ Sexo Feminino' : '♂️ Sexo Masculino'}
                        </span>

                        {isCrianca && (
                          <span style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.35)', color: '#fde047', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}>
                            🤸 Atividades Físicas & Esportes Infantis (Sem Musculação)
                          </span>
                        )}

                        {isAdulto && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#6ee7b7', padding: '0.25rem 0.65rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}>
                            🏋️ Musculação + Atividade Física Complementar
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--white)', margin: '0.2rem 0' }}>
                        {isCrianca ? '🤸 ' : '🏋️ '} {workoutPlan.divisao}
                      </h3>
                    </div>

                    {/* Botões de Ação na Aba de Treinos */}
                    <div className="no-print" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {hasMenstrual && (
                        <button
                          type="button"
                          onClick={() => setViewMenstrual(!viewMenstrual)}
                          style={{
                            background: viewMenstrual
                              ? 'linear-gradient(135deg, #be185d, #db2777)'
                              : 'linear-gradient(135deg, rgba(219, 39, 119, 0.2), rgba(190, 24, 93, 0.3))',
                            border: '1.5px solid rgba(244, 114, 182, 0.5)',
                            color: '#ffffff',
                            borderRadius: '10px',
                            padding: '0.55rem 1.1rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            boxShadow: '0 4px 14px rgba(219, 39, 119, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>{viewMenstrual ? '🏋️' : '🌸'}</span>
                          <span>{viewMenstrual ? 'Ver Treino Semanal Padrão' : 'Ver Adaptação Menstrual (Treino Leve)'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleRegenerateWorkoutOnly}
                        className="btn-secondary"
                        style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                        title="Recalcular o treino baseado na idade e sexo atuais do paciente"
                      >
                        🔄 Atualizar Treino
                      </button>
                    </div>
                  </div>

                  {/* Card com Detalhes da Prescrição e Frequência */}
                  {isCrianca ? (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(202, 138, 4, 0.08) 100%)',
                      border: '1.5px solid rgba(234, 179, 8, 0.35)',
                      borderRadius: '12px',
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#facc15', fontWeight: 800, fontSize: '1rem' }}>
                        <span>🚫 Sem Musculação em Academia:</span>
                        <span style={{ color: '#fef08a', fontWeight: 600, fontSize: '0.9rem' }}>
                          Crianças não possuem altura, estatura ou força muscular para aparelhos de academia.
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', fontSize: '0.88rem' }}>
                        <div>
                          <strong style={{ color: '#fef08a' }}>⏰ Frequência Recomendada:</strong>
                          <p style={{ margin: '0.2rem 0', color: 'var(--gray-200)' }}>{workoutPlan.frequenciaRecomendada || '1 vez ao dia (45 a 60 min) — 3 a 5 vezes por semana'}</p>
                        </div>
                        <div>
                          <strong style={{ color: '#fef08a' }}>🥋 Modalidades Infantis Adequadas:</strong>
                          <p style={{ margin: '0.2rem 0', color: 'var(--gray-200)' }}>Natação, Judô, Muay Thai Infantil / Lutas Lúdicas, Capoeira, Futebol e Brincadeiras Motoras.</p>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#fef08a', background: 'rgba(0, 0, 0, 0.25)', padding: '0.6rem 0.85rem', borderRadius: '8px', borderLeft: '3px solid #facc15' }}>
                        💡 <strong>Objetivo Pediátrico:</strong> Estimular o desenvolvimento neuropsicomotor, agilidade, flexibilidade e socialização com alegria, sem nenhum risco articular ou sobrecarga de peso de academia.
                      </div>
                    </div>
                  ) : isAdulto ? (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1rem'
                    }}>
                      <div style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#93c5fd', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                          🏋️ 1. Musculação com Sobrecarga Progressiva
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                          <strong>Frequência:</strong> {isMasculino ? '4 a 5 vezes por semana (60 min)' : '3 a 5 vezes por semana (50-60 min)'}<br />
                          <strong>Foco:</strong> {workoutPlan.modalidadePrincipal}
                        </div>
                      </div>
                      <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#6ee7b7', fontSize: '0.92rem', marginBottom: '0.25rem' }}>
                          🏃 2. Atividade Física Complementar Obrigatória
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray-300)' }}>
                          <strong>Frequência:</strong> 2 a 3 vezes por semana (45 min)<br />
                          <strong>Opções sugeridas:</strong> {workoutPlan.modalidadeComplementar}
                        </div>
                      </div>
                    </div>
                  ) : isAdolescente ? (
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      fontSize: '0.88rem'
                    }}>
                      <strong style={{ color: '#c084fc' }}>👦 Prescrição Juvenil / Adolescente:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-300)' }}>
                        Calistenia, fortalecimento funcional com peso corporal e modalidades esportivas (4 a 5x na semana). Foco em condicionamento, coordenação motora avançada e disciplina.
                      </p>
                    </div>
                  ) : isIdoso ? (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      fontSize: '0.88rem'
                    }}>
                      <strong style={{ color: '#34d399' }}>🧓 Prescrição para Terceira Idade:</strong>
                      <p style={{ margin: '0.25rem 0 0 0', color: 'var(--gray-300)' }}>
                        Musculação e Fortalecimento Articular (3x na semana) + Atividade Aeróbica Leve / Hidroginástica ou Caminhada (2x na semana). Foco em autonomia, prevenção de sarcopenia e segurança.
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* VISUALIZAÇÃO: PROTOCOLO & TREINO ADAPTADO PARA O PERÍODO MENSTRUAL (SE ATIVADO OU EM IMPRESSÃO) */}
                {hasMenstrual && (viewMenstrual || window.matchMedia('print').matches) && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(136, 19, 55, 0.2) 0%, rgba(88, 28, 135, 0.2) 100%)',
                    border: '1.5px solid rgba(244, 114, 182, 0.4)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    boxShadow: '0 8px 32px rgba(219, 39, 119, 0.15)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f472b6', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                          <span>🌸</span> {workoutPlan.treinoMenstrual.titulo}
                        </h3>
                        <p style={{ color: '#fbcfe8', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
                          {workoutPlan.treinoMenstrual.subtitulo}
                        </p>
                      </div>
                      <span className="badge" style={{ background: 'rgba(219, 39, 119, 0.25)', color: '#fbcfe8', border: '1px solid rgba(219, 39, 119, 0.4)', fontSize: '0.82rem' }}>
                        Treino Regenerativo & Alívio de Cólicas
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#fce7f3', lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                      {workoutPlan.treinoMenstrual.descricao}
                    </p>

                    {/* Guia das 4 Fases do Ciclo Hormonal */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f9a8d4', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🩸</span> Como Treinar em Cada Fase do Ciclo Feminino:
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                        {workoutPlan.treinoMenstrual.fasesCiclo.map((fc, fcIdx) => (
                          <div
                            key={fcIdx}
                            style={{
                              background: fcIdx === 0 ? 'rgba(219, 39, 119, 0.25)' : 'rgba(255,255,255,0.04)',
                              border: fcIdx === 0 ? '1.5px solid #f472b6' : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '10px',
                              padding: '0.85rem',
                              fontSize: '0.82rem'
                            }}
                          >
                            <strong style={{ color: fcIdx === 0 ? '#fbcfe8' : 'var(--white)', display: 'block', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                              {fc.fase}
                            </strong>
                            <div style={{ color: '#f472b6', fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                              {fc.status} • Energia: {fc.energia}
                            </div>
                            <div style={{ color: 'var(--gray-300)', lineHeight: 1.4 }}>
                              {fc.treinoRecomendado}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabelas de Treinos Menstruais Suaves */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {workoutPlan.treinoMenstrual.rotina.map((tMenstrual, tmIdx) => (
                        <div key={tmIdx} className="card-table" style={{ padding: '1.25rem', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                          <div style={{ marginBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f472b6', margin: 0 }}>
                              {tMenstrual.nome}
                            </h4>
                            <span style={{ fontSize: '0.82rem', color: '#fbcfe8' }}>
                              🎯 Foco: {tMenstrual.foco}
                            </span>
                          </div>
                          <table className="custom-table">
                            <thead>
                              <tr>
                                <th>Exercício Regenerativo</th>
                                <th>Séries</th>
                                <th>Tempo / Repetições</th>
                                <th>Descanso</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tMenstrual.exercicios.map((ex, exIdx) => (
                                <tr key={exIdx}>
                                  <td style={{ fontWeight: 600, color: 'var(--white)', verticalAlign: 'top' }}>
                                    <div style={{ fontSize: '0.94rem', marginBottom: '0.35rem' }}>{ex.exercicio}</div>
                                    {ex.variacoes && ex.variacoes.length > 0 && (
                                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                                        <span style={{ color: '#f472b6', fontWeight: 600 }}>🔄 Se ocupado:</span>
                                        {ex.variacoes.map((v, vIdx) => (
                                          <span
                                            key={vIdx}
                                            onClick={() => handleSwapExercise(tmIdx, exIdx, v, true)}
                                            title="Clique para definir esta variação como principal"
                                            style={{
                                              background: 'rgba(219, 39, 119, 0.15)',
                                              border: '1px solid rgba(219, 39, 119, 0.3)',
                                              borderRadius: '6px',
                                              padding: '0.15rem 0.5rem',
                                              color: '#fbcfe8',
                                              fontSize: '0.78rem',
                                              cursor: 'pointer'
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
                                  <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}><span className="badge" style={{ background: 'rgba(219, 39, 119, 0.2)', color: '#f472b6' }}>{ex.descanso}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: 'rgba(219, 39, 119, 0.12)', border: '1px solid rgba(219, 39, 119, 0.25)', padding: '1rem', borderRadius: '12px', fontSize: '0.86rem', color: '#fce7f3', marginTop: '1.25rem' }}>
                      {workoutPlan.treinoMenstrual.orientacoesCuidados}
                    </div>
                  </div>
                )}

                {/* VISUALIZAÇÃO: ROTINA DE TREINOS SEMANAIS REGULARES */}
                {(!viewMenstrual || window.matchMedia('print').matches) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {workoutPlan.rotina.map((treino, tIdx) => (
                      <div key={tIdx} className="card-table" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#3b82f6', margin: 0 }}>
                            {treino.nome}
                          </h4>
                          {treino.diasSugeridos && (
                            <span style={{ fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                              🗓️ {treino.diasSugeridos}
                            </span>
                          )}
                        </div>

                        {treino.foco && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', margin: '0 0 0.85rem 0' }}>
                            🎯 <strong>Foco:</strong> {treino.foco}
                          </p>
                        )}

                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>{isCrianca ? 'Atividade / Esporte Infantil' : 'Exercício / Atividade'}</th>
                              <th>{isCrianca ? 'Sessões' : 'Séries'}</th>
                              <th>{isCrianca ? 'Duração / Repetições' : 'Repetições'}</th>
                              <th>{isCrianca ? 'Intervalo / Pausa' : 'Descanso'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {treino.exercicios.map((ex, exIdx) => (
                              <tr key={exIdx}>
                                <td style={{ fontWeight: 600, color: 'var(--white)', verticalAlign: 'top' }}>
                                  <div style={{ fontSize: '0.96rem', marginBottom: '0.35rem' }}>{ex.exercicio}</div>
                                  {ex.variacoes && ex.variacoes.length > 0 && (
                                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-300)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                                      <span style={{ color: isCrianca ? '#facc15' : '#93c5fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                        {isCrianca ? '🔄 Opção alternativa:' : '🔄 Se ocupado:'}
                                      </span>
                                      {ex.variacoes.map((v, vIdx) => (
                                        <span
                                          key={vIdx}
                                          onClick={() => handleSwapExercise(tIdx, exIdx, v, false)}
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

                    {/* Nota Especial para Mulheres se houver treino menstrual */}
                    {hasMenstrual && (
                      <div className="no-print" style={{
                        background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.12), rgba(136, 19, 55, 0.12))',
                        border: '1px solid rgba(244, 114, 182, 0.35)',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>🌸</span>
                          <div>
                            <strong style={{ color: '#f472b6', display: 'block', fontSize: '0.9rem' }}>
                              Adaptação Menstrual Disponível para esta Paciente
                            </strong>
                            <span style={{ color: '#fce7f3', fontSize: '0.82rem' }}>
                              Durante os dias de menstruação ou cólica, utilize a rotina leve regenerativa com alívio lombar e pélvico.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setViewMenstrual(true)}
                          style={{
                            background: 'rgba(219, 39, 119, 0.25)',
                            border: '1px solid #f472b6',
                            color: '#ffffff',
                            borderRadius: '8px',
                            padding: '0.45rem 0.9rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Visualizar Treino Menstrual 🌸
                        </button>
                      </div>
                    )}

                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', fontSize: '0.88rem', color: 'var(--gray-300)' }}>
                      <strong>💡 Recomendações Gerais de Treino:</strong> {workoutPlan.observacoes}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
          <div className="no-print" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                className="btn-primary"
                onClick={handleGerarPlanoIA}
                disabled={loadingIA || !selectedPacienteId}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  border: '1px solid #a855f7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 700
                }}
              >
                ✨ Regenerar com IA
              </button>
              <button className="btn-secondary" onClick={() => handleGenerateAll(selectedPaciente)} disabled={loadingIA}>
                🔄 Recalcular Manual
              </button>
            </div>
            <button
              className="btn-primary"
              onClick={handleSavePlano}
              disabled={actionLoading || loadingIA}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #059669, #10b981)',
                border: '1px solid #34d399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: 700
              }}
            >
              {actionLoading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : '💾'}
              <span>Salvar no Histórico de Planos</span>
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
