import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/auth';

export default function ResetSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!novaSenha || novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem. Verifique e tente novamente.');
      return;
    }

    setLoading(true);
    try {
      if (authClient.resetPassword) {
        const res = await authClient.resetPassword({
          newPassword: novaSenha,
          token: token
        });
        if (res?.error) {
          setErro(res.error.message || 'Erro ao redefinir a senha. O link pode ter expirado.');
          return;
        }
      }
      setSucesso('Sua senha foi redefinida com sucesso! Você será redirecionado para o login...');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      console.error('Reset error:', err);
      setErro('Ocorreu um erro ao redefinir sua senha. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--site-bg)' }}>
      <div className="auth-form-wrapper" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--panel-border)', boxShadow: 'var(--shadow-premium)' }}>
        <div className="auth-logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img src="/logo.png" alt="NutriMi" className="auth-logo-img" />
          <span className="auth-logo-text">NutriMi</span>
        </div>

        <div className="auth-form-header" style={{ textAlign: 'center' }}>
          <h1>Redefinir Senha</h1>
          <p>Digite e confirme sua nova senha de acesso</p>
        </div>

        {erro && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span>
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <span>✅</span>
            <span>{sucesso}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reset-nova-senha">Nova Senha</label>
            <input
              id="reset-nova-senha"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reset-confirmar-senha">Confirmar Nova Senha</label>
            <input
              id="reset-confirmar-senha"
              type="password"
              className="form-input"
              placeholder="Repita sua nova senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? <><span className="spinner" />Salvando...</> : 'Salvar Nova Senha'}
          </button>
        </form>

        <div className="auth-switch" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/login">Voltar para o Login</Link>
        </div>
      </div>
    </div>
  );
}
