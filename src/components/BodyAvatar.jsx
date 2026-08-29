import React from 'react';
import { classificarPercentualGordura } from '../utils/healthCalculators';

/**
 * Avatar Antropométrico 3D Branco com Contorno Neon — NutriMi
 * Inspirado no icônico manequim 3D estilizado com cabeça esférica,
 * acabamento volumétrico branco perolado e contorno neon brilhante.
 * As proporções físicas (tórax, braços, cintura, quadril e pernas)
 * respondem dinamicamente às medidas reais do paciente.
 */
export default function BodyAvatar({
  medidas = {},
  paciente = {},
  consultaAnterior = null,
  compact = false
}) {
  const isFeminino = String(paciente?.sexo || 'Feminino').toLowerCase().startsWith('f');

  // Medidas reais com fallbacks razoáveis
  const peso = parseFloat(medidas?.peso || paciente?.peso_inicial || 70);
  const cintura = parseFloat(medidas?.cintura || (isFeminino ? 76 : 84));
  const quadril = parseFloat(medidas?.quadril || (isFeminino ? 98 : 94));
  const busto = parseFloat(medidas?.busto || (isFeminino ? 90 : 98));
  const braco = parseFloat(medidas?.braco || (isFeminino ? 28 : 33));
  const pescoco = parseFloat(medidas?.pescoco || (isFeminino ? 33 : 38));
  const gordura = parseFloat(medidas?.percentual_gordura || (isFeminino ? 25 : 18));

  // Normalizadores de proporção dinâmica para o SVG (Centro X = 150)
  // Cintura média: ~75cm (F) / 82cm (M)
  const cinturaRef = isFeminino ? 75 : 82;
  const cinturaDelta = Math.max(-20, Math.min(45, cintura - cinturaRef));
  const cinturaHalfW = (isFeminino ? 25 : 29) + (cinturaDelta * 0.45);

  // Quadril médio: ~98cm (F) / 95cm (M)
  const quadrilRef = isFeminino ? 98 : 95;
  const quadrilDelta = Math.max(-20, Math.min(50, quadril - quadrilRef));
  const quadrilHalfW = (isFeminino ? 36 : 33) + (quadrilDelta * 0.45);

  // Busto médio: ~90cm (F) / 98cm (M)
  const bustoRef = isFeminino ? 90 : 98;
  const bustoDelta = Math.max(-20, Math.min(45, busto - bustoRef));
  const bustoHalfW = (isFeminino ? 32 : 36) + (bustoDelta * 0.42);

  // Braço: Espessura anatômica dinâmica proporcional
  const bracoRef = isFeminino ? 28 : 33;
  const bracoDelta = medidas?.braco ? (braco - bracoRef) : ((peso - 70) * 0.18 + cinturaDelta * 0.2);
  // Espessura visual do braço (5px a 24px)
  const bracoThickness = Math.max(7, Math.min(24, (isFeminino ? 9.5 : 11.5) + (bracoDelta * 0.55)));

  // Ombro e Pescoço
  const ombroHalfW = isFeminino ? Math.max(35, bustoHalfW + 5) : Math.max(43, bustoHalfW + 9);
  const pescocoHalfW = Math.max(10, Math.min(18, 12 + (pescoco - 34) * 0.22));

  // Pernas e Coxas
  const coxaHalfW = Math.max(12, Math.min(26, 14 + (quadrilDelta * 0.22)));
  const panturrilhaHalfW = Math.max(9, Math.min(19, 11 + (quadrilDelta * 0.14)));

  // Braços: Afastamento lateral automático para evitar sobreposição ao tronco
  const bracoOffset = Math.max(ombroHalfW + bracoThickness / 2 + 5, cinturaHalfW + bracoThickness + 8);

  // Coordenadas Chave (ViewBox: 0 0 300 440, Centro X = 150)
  const cx = 150;
  const headY = 56;
  const headR = 34; // Cabeça esférica pronunciada do boneco 3D

  const pescocoY = headY + headR;   // ~90
  const ombroY = pescocoY + 16;      // ~106
  const bustoY = ombroY + 34;        // ~140
  const cinturaY = bustoY + 45;      // ~185
  const quadrilY = cinturaY + 45;    // ~230
  const virilhaY = quadrilY + 28;    // ~258
  const joelhoY = virilhaY + 72;     // ~330
  const tornozeloY = joelhoY + 65;   // ~395

  // Construção do Path do Tronco e Pernas 3D (Simétrico ao redor de cx)
  const pRight = [
    `M ${cx} ${pescocoY}`,
    `L ${cx + pescocoHalfW} ${pescocoY}`,
    `Q ${cx + ombroHalfW * 0.8} ${ombroY - 4}, ${cx + ombroHalfW} ${ombroY}`,
    `Q ${cx + bustoHalfW + 2} ${ombroY + 16}, ${cx + bustoHalfW} ${bustoY}`,
    `Q ${cx + (bustoHalfW + cinturaHalfW) / 2} ${bustoY + 22}, ${cx + cinturaHalfW} ${cinturaY}`,
    `Q ${cx + (cinturaHalfW + quadrilHalfW) / 2} ${cinturaY + 22}, ${cx + quadrilHalfW} ${quadrilY}`,
    // Perna direita
    `Q ${cx + quadrilHalfW - 2} ${virilhaY}, ${cx + 12 + coxaHalfW} ${virilhaY + 20}`,
    `L ${cx + 10 + coxaHalfW * 0.8} ${joelhoY}`,
    `L ${cx + 10 + panturrilhaHalfW} ${tornozeloY}`,
    `L ${cx + 4} ${tornozeloY}`,
    `L ${cx + 4} ${virilhaY + 10}`,
    `L ${cx} ${virilhaY}`
  ].join(' ');

  const pLeft = [
    `L ${cx - 4} ${virilhaY + 10}`,
    `L ${cx - 4} ${tornozeloY}`,
    `L ${cx - 10 - panturrilhaHalfW} ${tornozeloY}`,
    `L ${cx - 10 - coxaHalfW * 0.8} ${joelhoY}`,
    `Q ${cx - quadrilHalfW + 2} ${virilhaY}, ${cx - 12 - coxaHalfW} ${virilhaY + 20}`,
    `Q ${cx - quadrilHalfW} ${quadrilY - 10}, ${cx - quadrilHalfW} ${quadrilY}`,
    `Q ${cx - (cinturaHalfW + quadrilHalfW) / 2} ${cinturaY + 22}, ${cx - cinturaHalfW} ${cinturaY}`,
    `Q ${cx - (bustoHalfW + cinturaHalfW) / 2} ${bustoY + 22}, ${cx - bustoHalfW} ${bustoY}`,
    `Q ${cx - bustoHalfW - 2} ${ombroY + 16}, ${cx - ombroHalfW} ${ombroY}`,
    `Q ${cx - ombroHalfW * 0.8} ${ombroY - 4}, ${cx - pescocoHalfW} ${pescocoY}`,
    `Z`
  ].join(' ');

  const corpoPath = `${pRight} ${pLeft}`;

  // Braços com curvatura dinâmica
  const bracoDireito = `M ${cx + ombroHalfW - 2} ${ombroY + 4} Q ${cx + bracoOffset + 2} ${cinturaY - 20}, ${cx + bracoOffset - 4} ${quadrilY + 18}`;
  const bracoEsquerdo = `M ${cx - ombroHalfW + 2} ${ombroY + 4} Q ${cx - bracoOffset - 2} ${cinturaY - 20}, ${cx - bracoOffset + 4} ${quadrilY + 18}`;

  // Mãos 3D estilizadas nas pontas dos braços
  const maoDireitaX = cx + bracoOffset - 4;
  const maoDireitaY = quadrilY + 22;
  const maoEsquerdaX = cx - bracoOffset + 4;
  const maoEsquerdaY = quadrilY + 22;
  const maoR = Math.max(5.5, Math.min(11, bracoThickness * 0.65));

  // Pés 3D volumétricos e arredondados
  const peDireitoX = cx + 12 + panturrilhaHalfW * 0.5;
  const peEsquerdoX = cx - 12 - panturrilhaHalfW * 0.5;
  const peY = tornozeloY + 10;
  const peR = Math.max(13, Math.min(22, 14 + quadrilDelta * 0.12));

  const classifGordura = classificarPercentualGordura(gordura, paciente?.sexo);

  let statusSilhueta = 'Silhueta Eutrófica';
  if (gordura <= 16) statusSilhueta = 'Silhueta Atlética / Definida';
  else if (gordura <= 24) statusSilhueta = 'Silhueta Saudável / Proporcional';
  else if (gordura <= 32) statusSilhueta = 'Silhueta Curvilínea / Moderada';
  else statusSilhueta = 'Silhueta com Acúmulo de Tecido Adiposo';

  return (
    <div style={{
      background: 'radial-gradient(ellipse at 50% 30%, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '16px',
      padding: compact ? '1rem' : '1.25rem',
      position: 'relative',
      boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(56, 189, 248, 0.05)',
      overflow: 'hidden'
    }}>
      {/* Header do Avatar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.6rem'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8', fontWeight: 700 }}>
            Manequim Antropométrico 3D
          </div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--white)' }}>
            {paciente?.nome || 'Paciente'} ({isFeminino ? 'Feminino' : 'Masculino'})
          </h4>
        </div>

        {gordura > 0 && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: classifGordura?.cor || '#f59e0b',
            background: classifGordura?.badgeBg || 'rgba(245, 158, 11, 0.15)',
            border: `1px solid ${classifGordura?.badgeBorder || 'rgba(245, 158, 11, 0.35)'}`,
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            {classifGordura?.icone || '🔥'} {gordura}% Gordura
          </span>
        )}
      </div>

      {/* Ilustração SVG do Manequim 3D Branco com Contorno Neon */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
        <svg
          viewBox="0 0 300 440"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: compact ? '350px' : '410px',
            filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.6))',
            transition: 'all 0.5s ease-in-out'
          }}
        >
          <defs>
            {/* 1. Iluminação 3D da Cabeça (Esfera Branca com Highlight) */}
            <radialGradient id="head3DWhite" cx="38%" cy="30%" r="68%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#f8fafc" />
              <stop offset="78%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* 2. Iluminação 3D do Tronco (Porcelana Branca Volumétrica) */}
            <radialGradient id="body3DWhite" cx="42%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="82%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* 3. Iluminação 3D dos Membros (Braços e Pernas) */}
            <linearGradient id="limb3DWhite" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="35%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* 4. Iluminação 3D dos Pés Arredondados */}
            <radialGradient id="feet3DWhite" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* 5. Filtro do Contorno Neon Ciano Vibrante */}
            <filter id="neonContourGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
              <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#0284c7" floodOpacity="0.6" />
            </filter>

            {/* Filtro de Brilho dos Pontos Anatômicos */}
            <filter id="pinGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Sombra 3D realista no solo */}
          <ellipse
            cx={cx}
            cy={tornozeloY + 22}
            rx={quadrilHalfW + 28}
            ry="9"
            fill="radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 70%)"
            opacity="0.55"
          />

          {/* ======================================================== */}
          {/* CORPO DO BONECO 3D BRANCO COM CONTORNO NEON             */}
          {/* ======================================================== */}

          {/* 1. Tronco e Pernas 3D */}
          <path
            d={corpoPath}
            fill="url(#body3DWhite)"
            stroke="#38bdf8"
            strokeWidth="2.4"
            strokeLinejoin="round"
            filter="url(#neonContourGlow)"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Destaque sutil de iluminação central no tronco */}
          <path
            d={corpoPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* 2. Pés 3D Arredondados Estilizados */}
          <g style={{ transition: 'all 0.5s ease' }}>
            {/* Pé Direito */}
            <ellipse
              cx={peDireitoX}
              cy={peY}
              rx={peR}
              ry={peR * 0.75}
              fill="url(#feet3DWhite)"
              stroke="#38bdf8"
              strokeWidth="2.2"
              filter="url(#neonContourGlow)"
            />
            {/* Pé Esquerdo */}
            <ellipse
              cx={peEsquerdoX}
              cy={peY}
              rx={peR}
              ry={peR * 0.75}
              fill="url(#feet3DWhite)"
              stroke="#38bdf8"
              strokeWidth="2.2"
              filter="url(#neonContourGlow)"
            />
          </g>

          {/* 3. Braços 3D Cilíndricos Proporcionais */}
          <path
            d={bracoDireito}
            fill="none"
            stroke="url(#limb3DWhite)"
            strokeWidth={bracoThickness}
            strokeLinecap="round"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {/* Contorno Neon no Braço Direito */}
          <path
            d={bracoDireito}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={bracoThickness}
            strokeLinecap="round"
            filter="url(#neonContourGlow)"
            opacity="0.35"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          <path
            d={bracoEsquerdo}
            fill="none"
            stroke="url(#limb3DWhite)"
            strokeWidth={bracoThickness}
            strokeLinecap="round"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {/* Contorno Neon no Braço Esquerdo */}
          <path
            d={bracoEsquerdo}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={bracoThickness}
            strokeLinecap="round"
            filter="url(#neonContourGlow)"
            opacity="0.35"
            style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />

          {/* Mãozinhas 3D Arredondadas (com dedinho apontando para dentro) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            <ellipse
              cx={maoDireitaX}
              cy={maoDireitaY}
              rx={maoR}
              ry={maoR * 1.25}
              fill="url(#head3DWhite)"
              stroke="#38bdf8"
              strokeWidth="2"
              filter="url(#neonContourGlow)"
            />
            {/* Polegar direito */}
            <circle
              cx={maoDireitaX - maoR * 0.7}
              cy={maoDireitaY - 2}
              r={maoR * 0.45}
              fill="url(#head3DWhite)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            <ellipse
              cx={maoEsquerdaX}
              cy={maoEsquerdaY}
              rx={maoR}
              ry={maoR * 1.25}
              fill="url(#head3DWhite)"
              stroke="#38bdf8"
              strokeWidth="2"
              filter="url(#neonContourGlow)"
            />
            {/* Polegar esquerdo */}
            <circle
              cx={maoEsquerdaX + maoR * 0.7}
              cy={maoEsquerdaY - 2}
              r={maoR * 0.45}
              fill="url(#head3DWhite)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </g>

          {/* 4. Cabeça Esférica 3D Branca com Contorno Neon */}
          <circle
            cx={cx}
            cy={headY}
            r={headR}
            fill="url(#head3DWhite)"
            stroke="#38bdf8"
            strokeWidth="2.8"
            filter="url(#neonContourGlow)"
            style={{ transition: 'all 0.5s ease' }}
          />

          {/* Brilho especular realista 3D no topo da cabeça */}
          <ellipse
            cx={cx - 10}
            cy={headY - 12}
            rx={headR * 0.38}
            ry={headR * 0.22}
            fill="#ffffff"
            opacity="0.85"
            transform={`rotate(-22 ${cx - 10} ${headY - 12})`}
          />

          {/* ======================================================== */}
          {/* MARCADORES E LINHAS DE MEDIÇÃO ANATÔMICAS (CALLOUTS)     */}
          {/* ======================================================== */}

          {/* 1. BUSTO / TÓRAX (Linha para a Esquerda) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            <circle cx={cx - bustoHalfW} cy={bustoY} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" filter="url(#pinGlow)" />
            <line x1={cx - bustoHalfW} y1={bustoY} x2={25} y2={bustoY} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={25} cy={bustoY} r="2.5" fill="#38bdf8" />
          </g>

          {/* 2. BRAÇO (Linha para a Direita no Bíceps) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            <circle cx={cx + bracoOffset - 4} cy={ombroY + 30} r="4.5" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" filter="url(#pinGlow)" />
            <line x1={cx + bracoOffset - 4} y1={ombroY + 30} x2={275} y2={ombroY + 30} stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={275} cy={ombroY + 30} r="2.5" fill="#fbbf24" />
          </g>

          {/* 3. CINTURA (Linha para a Direita) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            <circle cx={cx + cinturaHalfW} cy={cinturaY} r="4.5" fill="#ec4899" stroke="#ffffff" strokeWidth="2" filter="url(#pinGlow)" />
            <line x1={cx + cinturaHalfW} y1={cinturaY} x2={275} y2={cinturaY} stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={275} cy={cinturaY} r="2.5" fill="#ec4899" />
          </g>

          {/* 4. QUADRIL (Linha para a Esquerda) */}
          <g style={{ transition: 'all 0.5s ease' }}>
            <circle cx={cx - quadrilHalfW} cy={quadrilY} r="4.5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" filter="url(#pinGlow)" />
            <line x1={cx - quadrilHalfW} y1={quadrilY} x2={25} y2={quadrilY} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx={25} cy={quadrilY} r="2.5" fill="#a855f7" />
          </g>

          {/* 5. PESCOÇO (Opcional - Linha para a Direita) */}
          {pescoco > 0 && (
            <g style={{ transition: 'all 0.5s ease' }}>
              <circle cx={cx + pescocoHalfW} cy={pescocoY + 6} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
              <line x1={cx + pescocoHalfW} y1={pescocoY + 6} x2={275} y2={pescocoY + 6} stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
            </g>
          )}
        </svg>

        {/* CALLOUT BADGES EM HTML SOBREPOSTAS */}
        {/* Callout Busto */}
        <div style={{
          position: 'absolute',
          left: '2px',
          top: '31%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid #38bdf8',
          borderRadius: '8px',
          padding: '0.25rem 0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 600 }}>Busto/Tórax</span>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 800 }}>
            {busto ? `${busto} cm` : '—'}
          </span>
        </div>

        {/* Callout Braço */}
        <div style={{
          position: 'absolute',
          right: '2px',
          top: '30%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid #fbbf24',
          borderRadius: '8px',
          padding: '0.25rem 0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(251, 191, 36, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', color: '#fde68a', fontWeight: 600 }}>Braço</span>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 800 }}>
            {medidas?.braco ? `${medidas.braco} cm` : (braco ? `~${braco} cm` : '—')}
          </span>
        </div>

        {/* Callout Cintura */}
        <div style={{
          position: 'absolute',
          right: '2px',
          top: '42%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid #ec4899',
          borderRadius: '8px',
          padding: '0.25rem 0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(236, 72, 153, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', color: '#f472b6', fontWeight: 600 }}>Cintura</span>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 800 }}>
            {cintura ? `${cintura} cm` : '—'}
          </span>
        </div>

        {/* Callout Quadril */}
        <div style={{
          position: 'absolute',
          left: '2px',
          top: '52%',
          transform: 'translateY(-50%)',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1.5px solid #a855f7',
          borderRadius: '8px',
          padding: '0.25rem 0.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(168, 85, 247, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', color: '#c084fc', fontWeight: 600 }}>Quadril</span>
          <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 800 }}>
            {quadril ? `${quadril} cm` : '—'}
          </span>
        </div>

        {/* Callout Pescoço */}
        {pescoco > 0 && (
          <div style={{
            position: 'absolute',
            right: '2px',
            top: '21%',
            transform: 'translateY(-50%)',
            background: 'rgba(15, 23, 42, 0.94)',
            border: '1.5px solid #10b981',
            borderRadius: '8px',
            padding: '0.2rem 0.45rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.62rem', color: '#6ee7b7', fontWeight: 600 }}>Pescoço</span>
            <span style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 800 }}>{pescoco} cm</span>
          </div>
        )}
      </div>

      {/* Rodapé com Informações da Consulta Selecionada */}
      <div style={{
        marginTop: '0.75rem',
        background: 'rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '0.6rem 0.8rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem'
      }}>
        <div>
          <span style={{ color: 'var(--gray-400)', display: 'block', fontSize: '0.7rem' }}>Peso Registrado</span>
          <strong style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{peso ? `${peso} kg` : '—'}</strong>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ color: 'var(--gray-400)', display: 'block', fontSize: '0.7rem' }}>Perfil Corporal</span>
          <strong style={{ color: '#38bdf8', fontSize: '0.8rem' }}>{statusSilhueta}</strong>
        </div>
      </div>
    </div>
  );
}
