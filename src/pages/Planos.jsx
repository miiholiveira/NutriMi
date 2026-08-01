import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getPlanos, savePlano, deletePlano } from '../lib/db';

export default function Planos({ nutricionista }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPacienteId = searchParams.get('paciente') || '';

  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(initialPacienteId);
  const [planos, setPlanos] = useState([]);
  const [activePlano, setActivePlano] = useState(null);

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingPlanos, setLoadingPlanos] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Editor State
  const [meals, setMeals] = useState([
    { id: '1', name: 'Café da Manhã', time: '08:00', items: [''] },
    { id: '2', name: 'Colação', time: '10:30', items: [''] },
    { id: '3', name: 'Almoço', time: '13:00', items: [''] },
    { id: '4', name: 'Lanche da Tarde', time: '16:00', items: [''] },
    { id: '5', name: 'Jantar', time: '20:00', items: [''] }
  ]);

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  useEffect(() => {
    if (selectedPacienteId) {
      loadPlanos(selectedPacienteId);
      setSearchParams({ paciente: selectedPacienteId });
    } else {
      setPlanos([]);
      setActivePlano(null);
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

  async function loadPlanos(pacienteId) {
    setLoadingPlanos(true);
    try {
      const data = await getPlanos(pacienteId);
      setPlanos(data);
      if (data.length > 0) {
        setActivePlano(data[0]); // Seleciona o mais recente por padrão
      } else {
        setActivePlano(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlanos(false);
    }
  }

  // Modificadores de refeições do editor
  function handleMealTimeChange(mealId, time) {
    setMeals(meals.map(m => m.id === mealId ? { ...m, time } : m));
  }

  function handleItemChange(mealId, itemIdx, value) {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        const newItems = [...m.items];
        newItems[itemIdx] = value;
        return { ...m, items: newItems };
      }
      return m;
    }));
  }

  function handleAddItem(mealId) {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        return { ...m, items: [...m.items, ''] };
      }
      return m;
    }));
  }

  function handleRemoveItem(mealId, itemIdx) {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        const newItems = m.items.filter((_, idx) => idx !== itemIdx);
        return { ...m, items: newItems.length === 0 ? [''] : newItems };
      }
      return m;
    }));
  }

  async function handleSavePlano() {
    if (!selectedPacienteId) return;

    // Filtra itens vazios nas refeições antes de salvar
    const filteredMeals = meals.map(m => ({
      ...m,
      items: m.items.filter(item => item.trim() !== '')
    })).filter(m => m.items.length > 0);

    if (filteredMeals.length === 0) {
      alert('Preencha pelo menos um item de refeição para criar o plano.');
      return;
    }

    setActionLoading(true);
    try {
      await savePlano({
        paciente_id: selectedPacienteId,
        conteudo: { meals: filteredMeals }
      });
      alert('Plano alimentar salvo com sucesso!');
      loadPlanos(selectedPacienteId);
      // Reseta editor
      setMeals([
        { id: '1', name: 'Café da Manhã', time: '08:00', items: [''] },
        { id: '2', name: 'Colação', time: '10:30', items: [''] },
        { id: '3', name: 'Almoço', time: '13:00', items: [''] },
        { id: '4', name: 'Lanche da Tarde', time: '16:00', items: [''] },
        { id: '5', name: 'Jantar', time: '20:00', items: [''] }
      ]);
    } catch (err) {
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

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Planos Alimentares</h1>
          <p>Prescreva dietas personalizadas e monte cardápios específicos</p>
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

      <div className="reports-layout">
        {/* Editor de Planos */}
        <div className="chart-card">
          <h3 style={{ color: 'var(--gray-800)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📝</span> Criar Novo Plano Alimentar
          </h3>

          <div className="meal-list">
            {meals.map((meal) => (
              <div key={meal.id} className="meal-card">
                <div className="meal-header">
                  <span className="meal-title">{meal.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Horário:</span>
                    <input
                      type="text"
                      className="form-input"
                      style={{ width: '70px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      value={meal.time}
                      onChange={(e) => handleMealTimeChange(meal.id, e.target.value)}
                      placeholder="00:00"
                    />
                  </div>
                </div>

                <div className="meal-body">
                  {meal.items.map((item, idx) => (
                    <div key={idx} className="meal-item-row">
                      <input
                        type="text"
                        className="form-input meal-item-input"
                        placeholder="Ex: 2 ovos mexidos ou 150ml de iogurte natural"
                        value={item}
                        onChange={(e) => handleItemChange(meal.id, idx, e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-action btn-action-delete"
                        onClick={() => handleRemoveItem(meal.id, idx)}
                        style={{ padding: '0.5rem' }}
                      >
                        ➖
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleAddItem(meal.id)}
                    style={{ padding: '0.4rem', fontSize: '0.85rem', width: 'fit-content' }}
                  >
                    ➕ Adicionar Opção
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSavePlano}
              className="btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
              disabled={actionLoading || !selectedPacienteId}
            >
              {actionLoading ? <div className="spinner" /> : 'Salvar Plano Alimentar'}
            </button>
          </div>
        </div>

        {/* Histórico / Planos salvos */}
        <div className="info-side-panel">
          <div className="info-card">
            <h3 style={{ color: 'var(--gray-800)', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Histórico de Planos
            </h3>

            {loadingPlanos ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                <div className="loading-spinner" />
              </div>
            ) : planos.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                Nenhum plano cadastrado.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {planos.map((p) => {
                  const dataStr = new Date(p.created_at).toLocaleDateString('pt-BR');
                  const isActive = activePlano?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActivePlano(p)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid',
                        borderColor: isActive ? 'var(--royal-blue)' : 'var(--gray-100)',
                        background: isActive ? 'var(--royal-blue-bg)' : 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>Plano Prescrito</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Criado em {dataStr}</span>
                      </div>
                      <button
                        className="btn-action btn-action-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlano(p.id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {activePlano && (
            <div className="info-card" style={{ borderColor: 'var(--royal-blue)', background: '#fafbfc' }}>
              <h4 style={{ color: 'var(--royal-blue)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                Visualizando Plano Ativo
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {activePlano.conteudo?.meals?.map((m) => (
                  <div key={m.id} style={{ fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.2rem' }}>
                      <span>{m.name}</span>
                      <span style={{ color: 'var(--burgundy)' }}>{m.time}</span>
                    </div>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--gray-600)' }}>
                      {m.items.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '0.15rem' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
