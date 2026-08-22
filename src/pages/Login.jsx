import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import Modal from '../components/Modal';

const FEATURES = [
  {
    icon: '🥗',
    label: 'Planos alimentares personalizados',
    desc: 'Crie dietas sob medida com cálculo automático de calorias, distribuição de macronutrientes e cardápios completos para cada objetivo do paciente.',
  },
  {
    icon: '👥',
    label: 'Gestão completa de pacientes',
    desc: 'Acompanhe histórico clínico, anamnese, evolução antropométrica, metas e preferências em um prontuário eletrônico unificado.',
  },
  {
    icon: '📅',
    label: 'Agendamento de consultas',
    desc: 'Organize sua agenda com facilidade, programe retornos periódicos e mantenha o acompanhamento nutricional sempre em dia.',
  },
  {
    icon: '📊',
    label: 'Relatórios nutricionais',
    desc: 'Gere gráficos de progresso corporal, evolução de medidas e exporte planos alimentares profissionais prontos para impressão ou PDF.',
  },
];

export default function Login({ onSuccess }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [expandedFeature, setExpandedFeature] = useState(null);

  // Modal Esqueci minha senha
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha o e-mail e a senha.');
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (result.error) {
        console.error('Login error:', result.error);
        const errObj = result.error || {};
        const msg = String(errObj.message || errObj.statusText || '').toLowerCase();
        const code = String(errObj.code || '').toLowerCase();

        if (msg.includes('invalid') || msg.includes('credential') || code.includes('invalid') || code.includes('credential')) {
          setErro('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
        } else if (msg.includes('not found') || msg.includes('user') || code.includes('not_found')) {
          setErro('Conta não encontrada. Verifique o e-mail ou crie uma conta.');
        } else {
          setErro(errObj.message || 'Não foi possível fazer o login. Tente novamente em instantes.');
        }
        return;
      }

      onSuccess(result.data?.session ?? result.data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setErro('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setResetError('');
    setResetMsg('');

    if (!resetEmail.trim()) {
      setResetError('Por favor, informe o seu e-mail cadastrado.');
      return;
    }

    setResetLoading(true);
    try {
      if (authClient.forgetPassword) {
        await authClient.forgetPassword({
          email: resetEmail.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-senha`
        });
      }
      setResetMsg('Se o e-mail informado estiver cadastrado, enviamos as instruções e o link seguro de redefinição para a sua caixa de entrada.');
    } catch (err) {
      console.error('Forget password error:', err);
      setResetMsg('Se o e-mail informado estiver cadastrado, enviamos as instruções de redefinição para a sua caixa de entrada.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Painel esquerdo */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <img src="/logo.png" alt="NutriMi logo" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 16, background: 'rgba(255,255,255,0.15)', padding: 12 }} />
          <p className="tagline">Nutrição inteligente,<br />cuidado personalizado</p>
          <p className="subtitle">Tudo que você precisa para gerenciar seus pacientes em um só lugar.</p>
        </div>

        <div className="auth-panel-features">
          {FEATURES.map((f, idx) => {
            const isExpanded = expandedFeature === idx;
            return (
              <div
                className={`auth-feature-item${isExpanded ? ' active' : ''}`}
                key={f.label}
                onClick={() => setExpandedFeature(isExpanded ? null : idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setExpandedFeature(isExpanded ? null : idx);
                  }
                }}
              >
                <div className="auth-feature-header">
                  <div className="feature-icon">{f.icon}</div>
                  <span className="feature-title">{f.label}</span>
                  <span className="auth-feature-chevron">▼</span>
                </div>
                {isExpanded && (
                  <div className="auth-feature-desc">
                    {f.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="auth-form-panel">
        <div className="auth-glow-blue" />
        <div className="auth-glow-burgundy" />

        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/logo.png" alt="NutriMi" className="auth-logo-img" />
            <span className="auth-logo-text">NutriMi</span>
          </div>

          {/* Cabeçalho */}
          <div className="auth-form-header">
            <h1>Bem-vinda de volta!</h1>
            <p>Acesse sua conta para continuar</p>
          </div>

          {/* Erro */}
          {erro && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                className={`form-input${erro ? ' error' : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErro(''); }}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-senha">Senha</label>
                <button
                  type="button"
                  className="auth-link-forgot"
                  onClick={() => { setResetEmail(email); setResetError(''); setResetMsg(''); setResetModalOpen(true); }}
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="login-senha"
                  type={showSenha ? 'text' : 'password'}
                  className={`form-input${erro ? ' error' : ''}`}
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowSenha(!showSenha)}
                  title={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? '🐵' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <><span className="spinner" />Entrando...</>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Não tem conta?{' '}
            <Link to="/cadastro">Cadastre-se gratuitamente</Link>
          </div>
        </div>
      </div>

      {/* Modal Esqueci Minha Senha */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="🔒 Recuperação de Senha"
        size="medium"
      >
        <form onSubmit={handleResetSubmit} className="auth-form">
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-300)', marginBottom: '1.25rem' }}>
            Digite o e-mail cadastrado na sua conta. Enviaremos um link de redefinição de senha com segurança.
          </p>

          {resetError && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              <span>{resetError}</span>
            </div>
          )}

          {resetMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <span>✅</span>
              <span>{resetMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">E-mail Cadastrado</label>
            <input
              id="reset-email"
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setResetModalOpen(false)}>
              Fechar
            </button>
            <button type="submit" className="btn-primary" disabled={resetLoading}>
              {resetLoading ? <><span className="spinner" />Enviando...</> : 'Enviar Link de Redefinição'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
