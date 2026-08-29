import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getConsultas, saveConsulta, updateConsulta, deleteConsulta } from '../lib/db';
import Modal from '../components/Modal';
import { calcularPercentualGordura, classificarPercentualGordura, calcularIdade } from '../utils/healthCalculators';

export default function Consultas({ nutricionista }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPacienteId = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  const [consultas, setConsultas] = useState([]);
  
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingConsultas, setLoadingConsultas] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form com medidas antropométricas completas
  const [form, setForm] = useState({
    data_consulta: new Date().toISOString().substring(0, 10),
    peso: '',
    busto: '',
    braco: '',
    cintura: '',
    quadril: '',
    pescoco: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  // Estado do cálculo em tempo real de gordura corporal
  const [gorduraCalculada, setGorduraCalculada] = useState(null);
  const [isCalculoAutomatico, setIsCalculoAutomatico] = useState(true);

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  useEffect(() => {
    if (selectedPacienteId) {
      loadConsultas(selectedPacienteId);
      // Sincroniza a query param da URL
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
      // Se não houver paciente selecionado mas houver lista, seleciona o primeiro
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
      setConsultas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConsultas(false);
    }
  }

  // Cálculo automático do percentual de gordura sempre que as medidas forem preenchidas
  useEffect(() => {
    if (!modalOpen) return;
    const targetPac = pacientes.find(p => p.id === selectedPacienteId);
    if (!targetPac) return;

    const res = calcularPercentualGordura({
      sexo: targetPac.sexo,
      altura: targetPac.altura,
      peso: form.peso || targetPac.peso_inicial,
      cintura: form.cintura,
      quadril: form.quadril,
      busto: form.busto,
      pescoco: form.pescoco,
      idade: targetPac.data_nascimento ? calcularIdade(targetPac.data_nascimento) : 30
    });

    if (res && res.percentual) {
      setGorduraCalculada(res);
      if (isCalculoAutomatico) {
        setForm(prev => ({
          ...prev,
          percentual_gordura: String(res.percentual)
        }));
      }
    } else {
      setGorduraCalculada(null);
    }
  }, [form.peso, form.cintura, form.quadril, form.busto, form.pescoco, modalOpen, isCalculoAutomatico, selectedPacienteId, pacientes]);

    function handleOpenCreate() {
    if (!selectedPacienteId) return;
    setEditMode(false);
    setCurrentId(null);
    setIsCalculoAutomatico(true);
    setGorduraCalculada(null);
    setForm({
      data_consulta: new Date().toISOString().substring(0, 10),
      peso: '',
      busto: '',
      braco: '',
      cintura: '',
      quadril: '',
      pescoco: '',
      percentual_gordura: '',
      observacoes: '',
      proximo_retorno: ''
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleOpenEdit(consulta) {
    setEditMode(true);
    setCurrentId(consulta.id);
    setIsCalculoAutomatico(false);
    setForm({
      data_consulta: consulta.data_consulta || '',
      peso: consulta.peso || '',
      busto: consulta.busto || '',
      braco: consulta.braco || '',
      cintura: consulta.cintura || '',
      quadril: consulta.quadril || '',
      pescoco: consulta.pescoco || '',
      percentual_gordura: consulta.percentual_gordura || '',
      observacoes: consulta.observacoes || '',
      proximo_retorno: consulta.proximo_retorno || ''
    });

    const targetPac = pacientes.find(p => p.id === selectedPacienteId);
    if (targetPac && consulta.percentual_gordura) {
      const classif = classificarPercentualGordura(consulta.percentual_gordura, targetPac.sexo);
      setGorduraCalculada({
        percentual: parseFloat(consulta.percentual_gordura),
        classificacao: classif?.label || 'Ideal',
        classifObj: classif,
        metodo: 'Registro da Consulta'
      });
    }

    setFormError('');
    setModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Tem certeza que deseja excluir este registro de consulta?')) {
      try {
        await deleteConsulta(id);
        loadConsultas(selectedPacienteId);
      } catch (err) {
        alert('Erro ao excluir consulta.');
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.data_consulta) {
      setFormError('A data da consulta é obrigatória.');
      return;
    }

    setActionLoading(true);
    try {
      const dataPayload = {
        ...form,
        paciente_id: selectedPacienteId
      };

      if (editMode) {
        await updateConsulta(currentId, dataPayload);
      } else {
        await saveConsulta(dataPayload);
      }
      setModalOpen(false);
      loadConsultas(selectedPacienteId);
    } catch (err) {
      setFormError('Erro ao registrar consulta.');
    } finally {
      setActionLoading(false);
    }
  }

  const selectedPaciente = pacientes.find(p => p.id === selectedPacienteId);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Registro de Consultas</h1>
          <p>Acompanhamento antropométrico e evolução clínica dos pacientes</p>
        </div>
        <div className="page-actions">
          <button 
            className="btn-primary" 
            onClick={handleOpenCreate}
            disabled={!selectedPacienteId}
          >
            + Nova Consulta
          </button>
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

        {selectedPaciente && (
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--gray-400)' }}>Altura: </span>
              <strong style={{ color: 'var(--white)' }}>{selectedPaciente.altura ? `${selectedPaciente.altura} m` : '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--gray-400)' }}>Peso Inicial: </span>
              <strong style={{ color: 'var(--white)' }}>{selectedPaciente.peso_inicial ? `${selectedPaciente.peso_inicial} kg` : '—'}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="card-table">
        <div className="table-header-bar">
          <h3 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 700 }}>Histórico de Consultas</h3>
        </div>

        {loadingConsultas ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="responsive-table">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso (kg)</th>
                  <th>Busto (cm)</th>
                  <th>Braço (cm)</th>
                  <th>Cintura (cm)</th>
                  <th>Quadril (cm)</th>
                  <th>Gordura (%)</th>
                  <th>Próximo Retorno</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {!selectedPacienteId ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Selecione um paciente para ver as consultas.
                    </td>
                  </tr>
                ) : consultas.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Nenhuma consulta registrada para este paciente.
                    </td>
                  </tr>
                ) : (
                  consultas.map((c) => {
                    const classif = c.percentual_gordura ? classificarPercentualGordura(c.percentual_gordura, selectedPaciente?.sexo) : null;

                    return (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: 'var(--royal-blue)' }}>
                          {new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ fontWeight: 700 }}>{c.peso ? `${c.peso} kg` : '—'}</td>
                        <td>{c.busto ? `${c.busto} cm` : '—'}</td>
                        <td>{c.braco ? `${c.braco} cm` : '—'}</td>
                        <td>{c.cintura ? `${c.cintura} cm` : '—'}</td>
                        <td>{c.quadril ? `${c.quadril} cm` : '—'}</td>
                        <td>
                          {c.percentual_gordura ? (
                            <span
                              style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: classif?.cor || '#f59e0b',
                                background: classif?.badgeBg || 'rgba(245, 158, 11, 0.15)',
                                border: `1px solid ${classif?.badgeBorder || 'rgba(245, 158, 11, 0.35)'}`,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              title={classif?.label ? `Classificação: ${classif.label}` : ''}
                            >
                              {classif?.icone || '🔥'} {c.percentual_gordura}%
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {c.proximo_retorno ? (
                            <span className="badge badge-blue">
                              {new Date(c.proximo_retorno + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="actions-cell">
                          <button className="btn-action" title="Editar Consulta" onClick={() => handleOpenEdit(c)}>
                            ✏️
                          </button>
                          <button className="btn-action btn-action-delete" title="Excluir Registro" onClick={() => handleDelete(c.id)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Consulta */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar Consulta' : 'Registrar Nova Consulta'}
      >
        <form onSubmit={handleSubmit} className="auth-form">
          {formError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Data da Consulta *</label>
            <input
              type="date"
              className="form-input"
              value={form.data_consulta}
              onChange={(e) => setForm({ ...form, data_consulta: e.target.value })}
              required
            />
          </div>

          {/* Linha 1: Peso e Percentual de Gordura */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.peso}
                onChange={(e) => setForm({ ...form, peso: e.target.value })}
                placeholder="Ex: 68.4"
              />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Percentual de Gordura (%)</label>
                {gorduraCalculada && isCalculoAutomatico && (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                    ✨ Auto-calculado
                  </span>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={form.percentual_gordura}
                  onChange={(e) => {
                    setIsCalculoAutomatico(false);
                    setForm({ ...form, percentual_gordura: e.target.value });
                  }}
                  placeholder="Calculado pelas medidas..."
                />
                {!isCalculoAutomatico && gorduraCalculada && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCalculoAutomatico(true);
                      setForm(prev => ({ ...prev, percentual_gordura: String(gorduraCalculada.percentual) }));
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    title="Recalcular automaticamente pelas medidas corporais"
                  >
                    🔄 Auto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Linha 2: Busto / Tórax e Braço */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Busto / Tórax (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.busto}
                onChange={(e) => setForm({ ...form, busto: e.target.value })}
                placeholder="Ex: 92"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Braço (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.braco}
                onChange={(e) => setForm({ ...form, braco: e.target.value })}
                placeholder="Ex: 30"
              />
            </div>
          </div>

          {/* Linha 3: Cintura e Quadril */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cintura (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.cintura}
                onChange={(e) => setForm({ ...form, cintura: e.target.value })}
                placeholder="Ex: 78"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quadril (cm)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.quadril}
                onChange={(e) => setForm({ ...form, quadril: e.target.value })}
                placeholder="Ex: 98"
              />
            </div>
          </div>

          {/* Linha 4: Pescoço */}
          <div className="form-group">
            <label className="form-label">Pescoço (cm) <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>(opcional)</span></label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={form.pescoco}
              onChange={(e) => setForm({ ...form, pescoco: e.target.value })}
              placeholder="Ex: 36 (auto se vazio)"
            />
          </div>

          {/* CARD DE ANÁLISE DE COMPOSIÇÃO CORPORAL EM TEMPO REAL */}
          {gorduraCalculada && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(168, 85, 247, 0.06) 100%)',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              marginTop: '0.25rem',
              marginBottom: '0.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>⚡</span> Estimativa Antropométrica de Gordura
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: gorduraCalculada.classifObj?.cor || '#60a5fa',
                  background: gorduraCalculada.classifObj?.badgeBg || 'rgba(96, 165, 250, 0.15)',
                  border: `1px solid ${gorduraCalculada.classifObj?.badgeBorder || 'rgba(96, 165, 250, 0.3)'}`,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  {gorduraCalculada.classifObj?.icone} {gorduraCalculada.classificacao}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--white)', marginTop: '0.2rem' }}>
                <div><strong>Gordura:</strong> <span style={{ color: '#f59e0b', fontWeight: 800 }}>{gorduraCalculada.percentual}%</span></div>
                {gorduraCalculada.massaGordaKg && (
                  <div><strong>Massa Gorda:</strong> {gorduraCalculada.massaGordaKg} kg</div>
                )}
                {gorduraCalculada.massaMagraKg && (
                  <div><strong>Massa Magra:</strong> {gorduraCalculada.massaMagraKg} kg</div>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                Baseado em {gorduraCalculada.metodo}, altura ({selectedPaciente?.altura > 3 ? (selectedPaciente.altura / 100).toFixed(2) : selectedPaciente?.altura}m) e sexo ({selectedPaciente?.sexo}).
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Previsão Próximo Retorno</label>
            <input
              type="date"
              className="form-input"
              value={form.proximo_retorno}
              onChange={(e) => setForm({ ...form, proximo_retorno: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Observações Clínicas / Evolução</label>
            <textarea
              className="form-textarea"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Descreva detalhes como adesão à dieta, queixas, progresso, etc."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? <div className="spinner" /> : (editMode ? 'Salvar Registro' : 'Registrar')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
