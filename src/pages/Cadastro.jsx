import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { saveNutricionista } from '../lib/db';

export default function Cadastro({ onSuccess }) {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  function clearErrors() {
    setErro('');
    setSucesso('');
  }

  function validate() {
    if (!nome.trim()) return 'Informe seu nome completo.';
    if (nome.trim().split(' ').length < 2) return 'Por favor, informe seu nome completo (nome e sobrenome).';
    if (!email.trim()) return 'Informe seu e-mail.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Informe um e-mail válido.';
    if (!senha) return 'Informe uma senha.';
    if (senha.length < 6) return 'A senha deve ter no mínimo 6 caracteres.';
    if (senha !== confirmarSenha) return 'As senhas não coincidem. Verifique e tente novamente.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearErrors();

    const validationError = validate();
    if (validationError) {
      setErro(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: email.trim().toLowerCase(),
        password: senha,
        name: nome.trim(),
      });

      if (result.error) {
        console.error('Signup error:', result.error);
        const errObj = result.error || {};
        const msg = String(errObj.message || errObj.statusText || '').toLowerCase();
        const code = String(errObj.code || '').toLowerCase();

        if (
          code.includes('already') ||
          code.includes('exist') ||
          msg.includes('already') ||
          msg.includes('exist') ||
          msg.includes('cadastrado') ||
          msg.includes('user_already_exists')
        ) {
          setErro('Este e-mail já está cadastrado. Faça login ou clique abaixo para entrar.');
        } else if (msg.includes('password') || code.includes('password')) {
          setErro('A senha não atende aos requisitos. Use pelo menos 6 caracteres.');
        } else {
          setErro(errObj.message || 'Não foi possível criar sua conta. Tente novamente em instantes.');
        }
        return;
      }

      // Salvar nutricionista na tabela pública (não-bloqueante)
      try {
        await saveNutricionista(nome.trim(), email.trim().toLowerCase());
      } catch {
        // Falha silenciosa — o cadastro no Auth já teve sucesso
      }

      onSuccess(result.data?.session ?? result.data);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      setErro('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* Painel esquerdo */}
      <div className="auth-panel">
        <div className="auth-panel-content">
          <img
            src="/logo.png"
            alt="NutriMi logo"
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.15)',
              padding: 12,
            }}
          />
          <p className="tagline">Comece sua jornada<br />nutricional hoje</p>
          <p className="subtitle">
            Crie sua conta gratuitamente e transforme a forma como você cuida dos seus pacientes.
          </p>
        </div>

        <div className="auth-panel-features">
          <div className="auth-feature-item">
            <div className="feature-icon">✅</div>
            <span>Cadastro gratuito e sem burocracia</span>
          </div>
          <div className="auth-feature-item">
            <div className="feature-icon">🔒</div>
            <span>Seus dados protegidos com segurança</span>
          </div>
          <div className="auth-feature-item">
            <div className="feature-icon">🚀</div>
            <span>Pronto para usar imediatamente</span>
          </div>
          <div className="auth-feature-item">
            <div className="feature-icon">💡</div>
            <span>Interface intuitiva e moderna</span>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper">
          {/* Logo */}
          <div className="auth-logo">
            <img src="/logo.png" alt="NutriMi" className="auth-logo-img" />
            <span className="auth-logo-text">NutriMi</span>
          </div>

          {/* Cabeçalho */}
          <div className="auth-form-header">
            <h1>Criar sua conta</h1>
            <p>Preencha os dados abaixo para começar</p>
          </div>

          {/* Alertas */}
          {erro && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              <span>{erro}</span>
            </div>
          )}
          {sucesso && (
            <div className="alert alert-success" role="alert" style={{ marginBottom: '1rem' }}>
              <span>✅</span>
              <span>{sucesso}</span>
            </div>
          )}

          {/* Formulário */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="cad-nome">Nome completo</label>
              <input
                id="cad-nome"
                type="text"
                className="form-input"
                placeholder="Dra. Maria Silva"
                value={nome}
                onChange={(e) => { setNome(e.target.value); clearErrors(); }}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cad-email">E-mail</label>
              <input
                id="cad-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors(); }}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cad-senha">Senha</label>
              <input
                id="cad-senha"
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); clearErrors(); }}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cad-confirmar-senha">Confirmar senha</label>
              <input
                id="cad-confirmar-senha"
                type="password"
                className={`form-input${confirmarSenha && senha !== confirmarSenha ? ' error' : ''}`}
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(e) => { setConfirmarSenha(e.target.value); clearErrors(); }}
                autoComplete="new-password"
                required
              />
              {confirmarSenha && senha !== confirmarSenha && (
                <span style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: '0.2rem' }}>
                  As senhas não coincidem
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="cad-submit"
            >
              {loading ? (
                <><span className="spinner" />Criando conta...</>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          <div className="auth-switch">
            Já tem conta?{' '}
            <Link to="/login">Faça login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
