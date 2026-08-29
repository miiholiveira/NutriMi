import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes, savePaciente, updatePaciente, deletePaciente } from '../lib/db';
import { calcularIMC, calcularPesoIdeal, calcularIdade, obterClassificacaoEtaria } from '../utils/healthCalculators';
import Modal from '../components/Modal';

export default function Pacientes({ nutricionista }) {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Toast feedback
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Controle do Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    sexo: 'Feminino',
    data_nascimento: '',
    altura: '',
    peso_inicial: '',
    nivel_atividade: 'Leve',
    objetivos: [],
    patologias: [],
    alergias: [],
    restricoes_alimentares: [],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: 4,
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  }

  useEffect(() => {
    if (nutricionista?.id) {
      loadPacientes();
    }
  }, [nutricionista]);

  async function loadPacientes() {
    setLoading(true);
    try {
      const data = await getPacientes(nutricionista.id);
      setPacientes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditMode(false);
    setCurrentId(null);
    setForm({
      nome: '',
      email: '',
      whatsapp: '',
      sexo: 'Feminino',
      data_nascimento: '',
      altura: '',
      peso_inicial: '',
      nivel_atividade: 'Leve',
      objetivos: [],
      patologias: [],
      alergias: [],
      restricoes_alimentares: [],
      medicamentos: '',
      suplementos: '',
      refeicoes_por_dia: 4,
      horario_acorda: '',
      horario_dorme: '',
      litros_agua: '',
      atividade_fisica: false,
      atividade_fisica_descricao: '',
      observacoes: ''
    });
    setFormError('');
    setModalOpen(true);
  }

  function handleOpenEdit(paciente) {
    setEditMode(true);
    setCurrentId(paciente.id);
    setForm({
      nome: paciente.nome || '',
      email: paciente.email || '',
      whatsapp: paciente.whatsapp || '',
      sexo: paciente.sexo || 'Feminino',
      data_nascimento: paciente.data_nascimento || '',
      altura: paciente.altura || '',
      peso_inicial: paciente.peso_inicial || '',
      nivel_atividade: paciente.nivel_atividade || 'Leve',
      objetivos: paciente.objetivos || [],
      patologias: paciente.patologias || [],
      alergias: paciente.alergias || [],
      restricoes_alimentares: paciente.restricoes_alimentares || [],
      medicamentos: paciente.medicamentos || '',
      suplementos: paciente.suplementos || '',
      refeicoes_por_dia: paciente.refeicoes_por_dia || 4,
      horario_acorda: paciente.horario_acorda || '',
      horario_dorme: paciente.horario_dorme || '',
      litros_agua: paciente.litros_agua || '',
      atividade_fisica: paciente.atividade_fisica || false,
      atividade_fisica_descricao: paciente.atividade_fisica_descricao || '',
      observacoes: paciente.observacoes || ''
    });
    setFormError('');
    setModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Tem certeza que deseja excluir este paciente? Todos os planos e consultas associados também serão apagados.')) {
      try {
        await deletePaciente(id);
        showToast('Paciente excluído com sucesso.', 'info');
        loadPacientes();
      } catch (err) {
        showToast('Erro ao excluir paciente.', 'error');
      }
    }
  }

  // Checkbox arrays helpers
  function handleCheckboxChange(category, value) {
    const list = [...form[category]];
    if (list.includes(value)) {
      setForm({ ...form, [category]: list.filter(item => item !== value) });
    } else {
      setForm({ ...form, [category]: [...list, value] });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!form.nome.trim()) {
      setFormError('O nome do paciente é obrigatório.');
      return;
    }

    if (!nutricionista?.id) {
      setFormError('Perfil da nutricionista não carregado ou sessão expirada. Por favor, recarregue a página.');
      return;
    }

    setActionLoading(true);
    try {
      const dataPayload = {
        ...form,
        nutricionista_id: nutricionista.id
      };

      if (editMode) {
        await updatePaciente(currentId, dataPayload);
        showToast('Paciente atualizado com sucesso! 🎉', 'success');
      } else {
        await savePaciente(dataPayload);
        showToast('Paciente cadastrado com sucesso! 🚀', 'success');
      }
      setModalOpen(false);
      loadPacientes();
    } catch (err) {
      setFormError(err.message || 'Erro ao salvar paciente. Verifique os dados inseridos.');
    } finally {
      setActionLoading(false);
    }
  }

  const filteredPacientes = pacientes.filter(p =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculadora de saúde para o modal
  const imcLive = calcularIMC(form.peso_inicial, form.altura);
  const pesoIdealLive = calcularPesoIdeal(form.altura, form.sexo);
  const idadeLive = form.data_nascimento ? calcularIdade(form.data_nascimento) : null;
  const faixaEtariaLive = idadeLive !== null ? obterClassificacaoEtaria(idadeLive) : null;

  return (
    <div>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`alert alert-${toast.type}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          animation: 'slide-in 0.3s ease-out'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="page-header">
        <div className="page-title">
          <h1>Meus Pacientes</h1>
          <p>Cadastre, edite e gerencie a ficha clínica dos seus pacientes</p>
        </div>
        <div className="page-actions">
          <button className="btn-primary" onClick={handleOpenCreate}>
            + Novo Paciente
          </button>
        </div>
      </div>

      <div className="card-table">
        <div className="table-header-bar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="responsive-table">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Gênero</th>
                  <th>IMC / Peso Ideal</th>
                  <th>Objetivos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Nenhum paciente cadastrado.
                    </td>
                  </tr>
                ) : (
                  filteredPacientes.map((paciente) => {
                    const imc = calcularIMC(paciente.peso_inicial, paciente.altura);
                    const pi = calcularPesoIdeal(paciente.altura, paciente.sexo);
                    return (
                      <tr key={paciente.id}>
                        <td style={{ fontWeight: 600, color: 'var(--white)' }}>
                          <div>{paciente.nome}</div>
                          {paciente.data_nascimento && (() => {
                            const id = calcularIdade(paciente.data_nascimento);
                            const fx = obterClassificacaoEtaria(id);
                            return (
                              <span style={{
                                background: fx.badgeCor,
                                border: `1px solid ${fx.badgeBorder}`,
                                color: fx.badgeTexto,
                                borderRadius: '4px',
                                padding: '0.12rem 0.45rem',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginTop: '0.3rem'
                              }}>
                                {fx.icone} {id} {id === 1 ? 'ano' : 'anos'} • {fx.tipo === 'crianca' ? 'Criança' : (fx.tipo === 'adolescente' ? 'Adolescente' : (fx.tipo === 'idoso' ? 'Idoso' : 'Adulto'))}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span>{paciente.email || '—'}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{paciente.whatsapp || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${paciente.sexo === 'Masculino' ? 'badge-blue' : 'badge-burgundy'}`}>
                            {paciente.sexo}
                          </span>
                        </td>
                        <td>
                          {imc ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{ fontWeight: 700, color: imc.cor }}>{imc.valor} kg/m²</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{imc.classificacao}</span>
                              {pi && <span style={{ fontSize: '0.72rem', color: '#10b981' }}>Faixa ideal: {pi.faixaFormatada}</span>}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--gray-400)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {paciente.objetivos && paciente.objetivos.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {paciente.objetivos.map((o) => (
                                <span key={o} className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--gray-300)' }}>{o}</span>
                              ))}
                            </div>
                          ) : '—'}
                        </td>
                        <td className="actions-cell">
                          <button className="btn-action" title="Histórico de Consultas" onClick={() => navigate(`/dashboard/consultas?paciente=${paciente.id}`)}>
                            📅
                          </button>
                          <button className="btn-action" title="Planos Alimentares" onClick={() => navigate(`/dashboard/planos?paciente=${paciente.id}`)}>
                            🥗
                          </button>
                          <button className="btn-action" title="Relatório de Evolução" onClick={() => navigate(`/dashboard/relatorios?paciente=${paciente.id}`)}>
                            📊
                          </button>
                          <button className="btn-action" title="Editar Ficha do Paciente" onClick={() => handleOpenEdit(paciente)} style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            ✏️ Editar
                          </button>
                          <button className="btn-action btn-action-delete" title="Excluir Paciente" onClick={() => handleDelete(paciente.id)}>
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

      {/* Modal Cadastro / Edição */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? '✏️ Editar Ficha do Paciente' : '➕ Novo Paciente'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="auth-form">
          {formError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Calculadora Automática de Saúde (Preview em tempo real com Alerta) */}
          {imcLive && pesoIdealLive && (
            <div style={{
              background: imcLive.alerta
                ? 'linear-gradient(135deg, rgba(136, 19, 55, 0.35) 0%, rgba(185, 28, 28, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(30, 58, 138, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)',
              border: imcLive.alerta ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: imcLive.alerta ? '#fca5a5' : 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  💡 IMC Automático
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: imcLive.cor }}>{imcLive.valor}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: imcLive.cor }}>{imcLive.classificacao}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  ⚖️ Faixa de Peso Ideal (Eutrofia)
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#10b981', marginTop: '0.2rem' }}>
                  {pesoIdealLive.faixaFormatada}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                  Ideal Devine: <strong>{pesoIdealLive.estimadoDevine} kg</strong>
                </span>
              </div>

              {imcLive.alerta && (
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>⚠️ ALERTA DE IMC:</span>
                  <span>O IMC ({imcLive.valor} kg/m²) está na faixa de {imcLive.classificacao}. Recomendada intervenção nutricional focada.</span>
                </div>
              )}
            </div>
          )}

          <div className="form-section-title">👤 Informações Básicas</div>
          
          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input
              type="text"
              className="form-input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do paciente"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="paciente@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp / Telefone</label>
              <input
                type="text"
                className="form-input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sexo do Paciente</label>
              <select
                className="form-input"
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                style={{ background: '#111827', color: '#fff' }}
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                className="form-input"
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
              />
              {faixaEtariaLive && form.data_nascimento && (
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: faixaEtariaLive.badgeCor,
                    border: `1px solid ${faixaEtariaLive.badgeBorder}`,
                    color: faixaEtariaLive.badgeTexto,
                    borderRadius: '6px',
                    padding: '0.18rem 0.5rem',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {faixaEtariaLive.icone} {faixaEtariaLive.label} ({idadeLive} {idadeLive === 1 ? 'ano' : 'anos'})
                  </span>
                  <span style={{ color: 'var(--gray-300)', fontSize: '0.78rem' }}>
                    {faixaEtariaLive.tipo === 'crianca' && '• Atividades físicas lúdicas & motoras (natação, judô, muay thai)'}
                    {faixaEtariaLive.tipo === 'adolescente' && '• Calistenia e esportes complementares'}
                    {faixaEtariaLive.tipo === 'adulto' && '• Musculação + Atividade física complementar'}
                    {faixaEtariaLive.tipo === 'idoso' && '• Fortalecimento funcional & mobilidade articular'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section-title">📏 Medidas Antropométricas</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Altura (cm ou metros)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={form.altura}
                onChange={(e) => setForm({ ...form, altura: e.target.value })}
                placeholder="Ex: 170 cm ou 1.70 m"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso Inicial / Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.peso_inicial}
                onChange={(e) => setForm({ ...form, peso_inicial: e.target.value })}
                placeholder="Ex: 72.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nível de Atividade Diária</label>
              <select
                className="form-input"
                value={form.nivel_atividade}
                onChange={(e) => setForm({ ...form, nivel_atividade: e.target.value })}
                style={{ background: '#111827', color: '#fff' }}
              >
                <option value="Sedentário">Sedentário</option>
                <option value="Leve">Leve (1-2x/semana)</option>
                <option value="Moderado">Moderado (3-5x/semana)</option>
                <option value="Intenso">Intenso (6-7x/semana)</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">🎯 Objetivos do Paciente</div>
          <div className="checkbox-group" style={{ marginBottom: '1.25rem' }}>
            {['Emagrecimento', 'Hipertrofia', 'Reeducação Alimentar', 'Saúde & Disposição', 'Desempenho Esportivo'].map(obj => (
              <label key={obj} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.objetivos.includes(obj)}
                  onChange={() => handleCheckboxChange('objetivos', obj)}
                />
                {obj}
              </label>
            ))}
          </div>

          <div className="form-section-title">🩺 Saúde & Anamnese Clínica</div>

          <div className="form-group">
            <label className="form-label">Patologias / Condições Diagnosticadas</label>
            <div className="checkbox-group">
              {['Diabetes', 'Hipertensão', 'Dislipidemia (Colesterol/Triglicerídeos)', 'Gastrite / Refluxo', 'SOP', 'Hipotireoidismo'].map(pat => (
                <label key={pat} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.patologias.includes(pat)}
                    onChange={() => handleCheckboxChange('patologias', pat)}
                  />
                  {pat}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Restrições Alimentares</label>
              <div className="checkbox-group">
                {['Intolerância à Lactose', 'Celíaco / Sem Glúten', 'Vegetariano', 'Vegano'].map(rest => (
                  <label key={rest} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.restricoes_alimentares.includes(rest)}
                      onChange={() => handleCheckboxChange('restricoes_alimentares', rest)}
                    />
                    {rest}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alergias Alimentares</label>
              <div className="checkbox-group">
                {['Amendoim / Oleaginosas', 'Frutos do Mar', 'Ovo', 'Soja', 'Leite de Vaca'].map(al => (
                  <label key={al} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.alergias.includes(al)}
                      onChange={() => handleCheckboxChange('alergias', al)}
                    />
                    {al}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Medicamentos em uso contínuo</label>
              <input
                type="text"
                className="form-input"
                value={form.medicamentos}
                onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
                placeholder="Ex: Puran T4 50mcg, Anticoncepcional..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Suplementos em uso</label>
              <input
                type="text"
                className="form-input"
                value={form.suplementos}
                onChange={(e) => setForm({ ...form, suplementos: e.target.value })}
                placeholder="Ex: Whey Protein, Creatina 5g, Vitamina D..."
              />
            </div>
          </div>

          <div className="form-section-title">⏰ Rotina & Estilo de Vida</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Refeições por dia</label>
              <input
                type="number"
                min="1"
                max="8"
                className="form-input"
                value={form.refeicoes_por_dia}
                onChange={(e) => setForm({ ...form, refeicoes_por_dia: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Água (litros/dia)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.litros_agua}
                onChange={(e) => setForm({ ...form, litros_agua: e.target.value })}
                placeholder="Ex: 2.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Horário que Acorda</label>
              <input
                type="text"
                className="form-input"
                value={form.horario_acorda}
                onChange={(e) => setForm({ ...form, horario_acorda: e.target.value })}
                placeholder="Ex: 06:30"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Horário que Dorme</label>
              <input
                type="text"
                className="form-input"
                value={form.horario_dorme}
                onChange={(e) => setForm({ ...form, horario_dorme: e.target.value })}
                placeholder="Ex: 22:30"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label" style={{ fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={form.atividade_fisica}
                onChange={(e) => setForm({ ...form, atividade_fisica: e.target.checked })}
              />
              Pratica Atividade Física Regularmente
            </label>
          </div>

          {form.atividade_fisica && (
            <div className="form-group" style={{ animation: 'slide-in 0.2s ease' }}>
              <label className="form-label">Quais Atividades e Frequência</label>
              <input
                type="text"
                className="form-input"
                value={form.atividade_fisica_descricao}
                onChange={(e) => setForm({ ...form, atividade_fisica_descricao: e.target.value })}
                placeholder="Ex: Musculação 5x na semana, Corrida 2x"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Observações Gerais / Anotações</label>
            <textarea
              className="form-textarea"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Outros detalhes observados na consulta de avaliação..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? <div className="spinner" /> : (editMode ? '💾 Salvar Alterações' : '✨ Cadastrar Paciente')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
