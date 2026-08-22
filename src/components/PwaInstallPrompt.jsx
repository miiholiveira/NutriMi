import React, { useState, useEffect } from 'react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado e rodando em modo Standalone
    const inStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(inStandalone);
    if (inStandalone) return;

    // Detecta se é iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIos(isIosDevice);

    // Captura o evento nativo de instalação do Chrome / Edge / Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Se for iOS e não standalone, exibe o prompt após alguns segundos
    if (isIosDevice && !inStandalone) {
      const dismissed = localStorage.getItem('nutrimi_pwa_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  async function handleInstallClick() {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem('nutrimi_pwa_dismissed', 'true');
  }

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      <div
        className="no-print"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(59, 130, 246, 0.25)',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          maxWidth: '380px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          animation: 'slideUp 0.4s ease-out'
        }}
      >
        <img
          src="/logo.png"
          alt="NutriMi Logo"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            objectFit: 'contain',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px'
          }}
        />

        <div style={{ flex: 1 }}>
          <strong style={{ color: 'var(--white)', fontSize: '0.92rem', display: 'block', marginBottom: '0.15rem' }}>
            Instalar NutriMi App
          </strong>
          <span style={{ color: 'var(--gray-300)', fontSize: '0.78rem', lineHeight: '1.2', display: 'block' }}>
            Acesse direto da sua tela de início, mais rápido e offline.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={handleInstallClick}
            className="btn-primary"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)'
            }}
          >
            📲 Instalar
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '0.2rem 0.4rem',
              lineHeight: 1
            }}
            title="Fechar"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Modal Guia para iOS Safari */}
      {showIosGuide && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setShowIosGuide(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '360px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
            }}
          >
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>📱</span>
            <h3 style={{ color: 'var(--white)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Instalar no iPhone / iPad
            </h3>
            <p style={{ color: 'var(--gray-300)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              1. Toque no botão de <strong>Compartilhar</strong> <span style={{ fontSize: '1.2rem' }}>📤</span> na barra inferior do Safari.<br /><br />
              2. Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong> <span style={{ fontSize: '1.2rem' }}>➕</span>.<br /><br />
              3. Toque em <strong>"Adicionar"</strong> no canto superior direito.
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Entendi! 👍
            </button>
          </div>
        </div>
      )}
    </>
  );
}
