import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPacientes, getConsultas, saveConsulta, updateConsulta, deleteConsulta } from '../lib/db';
import Modal from '../components/Modal';

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

  // Form
  const [form, setForm] = useState({
    data_consulta: new Date().toISOString().substring(0, 10),
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

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

  function handleOpenCreate() {
    if (!selectedPacienteId) return;
    setEditMode(false);
    setCurrentId(null);
    setForm({
      data_consulta: new Date().toISOString().substring(0, 10),
      peso: '',
      cintura: '',
      quadril: '',
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
    setForm({
      data_consulta: consulta.data_consulta || '',
      peso: consulta.peso || '',
      cintura: consulta.cintura || '',
      quadril: consulta.quadril || '',
      percentual_gordura: consulta.percentual_gordura || '',
      observacoes: consulta.observacoes || '',
      proximo_retorno: consulta.proximo_retorno || ''
    });
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
              <strong style={{ color: 'var(--gray-800)' }}>{selectedPaciente.altura ? `${selectedPaciente.altura} m` : '—'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--gray-400)' }}>Peso Inicial: </span>
              <strong style={{ color: 'var(--gray-800)' }}>{selectedPaciente.peso_inicial ? `${selectedPaciente.peso_inicial} kg` : '—'}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="card-table">
        <div className="table-header-bar">
          <h3 style={{ color: 'var(--gray-800)', fontSize: '1rem', fontWeight: 700 }}>Histórico de Consultas</h3>
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
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Selecione um paciente para ver as consultas.
                    </td>
                  </tr>
                ) : consultas.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Nenhuma consulta registrada para este paciente.
                    </td>
                  </tr>
                ) : (
                  consultas.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: 'var(--royal-blue)' }}>
                        {new Date(c.data_consulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ fontWeight: 700 }}>{c.peso ? `${c.peso} kg` : '—'}</td>
                      <td>{c.cintura ? `${c.cintura} cm` : '—'}</td>
                      <td>{c.quadril ? `${c.quadril} cm` : '—'}</td>
                      <td>
                        {c.percentual_gordura ? (
                          <span className="badge badge-burgundy">{c.percentual_gordura}%</span>
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
                  ))
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
              <label className="form-label">Percentual de Gordura (%)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.percentual_gordura}
                onChange={(e) => setForm({ ...form, percentual_gordura: e.target.value })}
                placeholder="Ex: 22.5"
              />
            </div>
          </div>

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
                placeholder="Ex: 96"
              />
            </div>
          </div>

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
