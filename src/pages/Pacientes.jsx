import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPacientes, savePaciente, updatePaciente, deletePaciente } from '../lib/db';
import Modal from '../components/Modal';

export default function Pacientes({ nutricionista }) {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
        loadPacientes();
      } catch (err) {
        alert('Erro ao excluir paciente.');
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
      } else {
        await savePaciente(dataPayload);
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

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Meus Pacientes</h1>
          <p>Cadastre e gerencie a ficha clínica dos seus pacientes</p>
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
                  <th>Objetivos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPacientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                      Nenhum paciente cadastrado.
                    </td>
                  </tr>
                ) : (
                  filteredPacientes.map((paciente) => (
                    <tr key={paciente.id}>
                      <td style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{paciente.nome}</td>
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
                        {paciente.objetivos && paciente.objetivos.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {paciente.objetivos.map((o) => (
                              <span key={o} className="badge" style={{ background: 'var(--gray-50)', color: 'var(--gray-600)' }}>{o}</span>
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
                        <button className="btn-action" title="Editar Ficha" onClick={() => handleOpenEdit(paciente)}>
                          ✏️
                        </button>
                        <button className="btn-action btn-action-delete" title="Excluir Paciente" onClick={() => handleDelete(paciente.id)}>
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

      {/* Modal Cadastro/Edicao */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editMode ? 'Editar Paciente' : 'Novo Paciente'}
        size="large"
      >
        <form onSubmit={handleSubmit} className="auth-form">
          {formError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{formError}</span>
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
                placeholder="email@paciente.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp</label>
              <input
                type="text"
                className="form-input"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Data de Nascimento</label>
              <input
                type="date"
                className="form-input"
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select
                className="form-select"
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">⚖️ Avaliação Física e Metas</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={form.altura}
                onChange={(e) => setForm({ ...form, altura: e.target.value })}
                placeholder="Ex: 1.70"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Peso Inicial (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={form.peso_inicial}
                onChange={(e) => setForm({ ...form, peso_inicial: e.target.value })}
                placeholder="Ex: 72.5"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nível de Atividade Física</label>
            <select
              className="form-select"
              value={form.nivel_atividade}
              onChange={(e) => setForm({ ...form, nivel_atividade: e.target.value })}
            >
              <option value="Sedentário">Sedentário (Pouco ou nenhum exercício)</option>
              <option value="Leve">Atividade Leve (Exercício leve 1-3 dias/semana)</option>
              <option value="Moderado">Atividade Moderada (Exercício moderado 3-5 dias/semana)</option>
              <option value="Intenso">Atividade Intensa (Exercício pesado 6-7 dias/semana)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Objetivos Principais</label>
            <div className="checkbox-group">
              {['Emagrecimento', 'Hipertrofia', 'Saúde e Bem-estar', 'Performance Esportiva', 'Reeducação Alimentar', 'Ganho de Peso'].map(obj => (
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
          </div>

          <div className="form-section-title">🏥 Anamnese Clínica e Restrições</div>

          <div className="form-group">
            <label className="form-label">Patologias (Condições Médicas)</label>
            <div className="checkbox-group">
              {['Diabetes', 'Hipertensão', 'Gastrite/Refluxo', 'Intestino Irritável', 'Colesterol Alto', 'Hipotireoidismo'].map(pat => (
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
              <div className="checkbox-group" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {['Intolerância à Lactose', 'Sensibilidade ao Glúten', 'Vegano/Vegetariano', 'Sem restrições'].map(res => (
                  <label key={res} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.restricoes_alimentares.includes(res)}
                      onChange={() => handleCheckboxChange('restricoes_alimentares', res)}
                    />
                    {res}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Alergias</label>
              <div className="checkbox-group" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {['Amendoim / Nozes', 'Frutos do Mar', 'Leite de Vaca', 'Ovo'].map(al => (
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
              <label className="form-label">Medicamentos em uso</label>
              <input
                type="text"
                className="form-input"
                value={form.medicamentos}
                onChange={(e) => setForm({ ...form, medicamentos: e.target.value })}
                placeholder="Ex: Metformina, Puran T4"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Suplementos em uso</label>
              <input
                type="text"
                className="form-input"
                value={form.suplementos}
                onChange={(e) => setForm({ ...form, suplementos: e.target.value })}
                placeholder="Ex: Creatina, Whey Protein"
              />
            </div>
          </div>

          <div className="form-section-title">⏰ Rotina e Hábitos</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Refeições ao dia</label>
              <input
                type="number"
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? <div className="spinner" /> : (editMode ? 'Salvar Alterações' : 'Cadastrar Paciente')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
