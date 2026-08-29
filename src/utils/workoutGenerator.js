/**
 * Gerador Dinâmico de Treinos Adaptado ao Perfil do Paciente
 * NutriMi — Nutrição Inteligente
 * Suporta:
 * - Reconhecimento de Idade e Faixas Etárias (Crianças, Adolescentes, Adultos, Idosos)
 * - Crianças: Atividades físicas adequadas à idade (Natação, Judô, Muay Thai, etc.) com frequência por dia e semana
 * - Adultos: Musculação + Atividade física complementar (X vezes por semana) diferenciada por sexo
 * - Mulheres: Protocolo e Treino Leve adaptado para o Período Menstrual
 */

import { calcularIdade, obterClassificacaoEtaria } from './healthCalculators.js';

export function gerarPlanoTreinos(paciente) {
  const idade = calcularIdade(paciente?.data_nascimento);
  const sexo = paciente?.sexo || 'Feminino';
  const nivelAtividade = paciente?.nivel_atividade || 'Leve';
  const objetivos = paciente?.objetivos || ['Saúde & Disposição'];

  const faixa = obterClassificacaoEtaria(idade);
  const isCrianca = faixa.tipo === 'crianca';
  const isAdolescente = faixa.tipo === 'adolescente';
  const isSenior = faixa.tipo === 'idoso' || idade >= 60;
  const isAdulto = !isCrianca && !isAdolescente && !isSenior;

  const isFeminino = String(sexo).toLowerCase().includes('fem');
  const isMasculino = !isFeminino;

  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isEmagrecimento = objetivos.includes('Emagrecimento');
  const isIniciante = String(nivelAtividade).toLowerCase().includes('sedent') || String(nivelAtividade).toLowerCase().includes('leve');

  let divisao = '';
  let frequenciaRecomendada = '';
  let modalidadePrincipal = '';
  let modalidadeComplementar = '';
  let rotina = [];
  let observacoes = '';
  let treinoMenstrual = null;

  // =========================================================================
  // 1. FAIXA ETÁRIA: CRIANÇA (0 A 12 ANOS)
  // Atividades físicas adequadas à infância (natação, lutas lúdicas, jogos motores)
  // Frequência: 1x por dia (45 a 60 min), 3 a 5 vezes por semana
  // =========================================================================
  if (isCrianca) {
    divisao = 'Atividades Físicas & Esportes Infantis (Natação, Judô, Muay Thai & Jogos Motores — Sem Musculação)';
    frequenciaRecomendada = '1 vez ao dia (45 a 60 minutos por sessão) — 3 a 5 vezes por semana';
    modalidadePrincipal = 'Natação, Judô Educativo ou Dança/Recreação (Sem Musculação)';
    modalidadeComplementar = 'Muay Thai Infantil Lúdico, Futebol, Capoeira & Brincadeiras Ativas (Sem Musculação)';

    rotina = [
      {
        nome: 'Sessão 1 — Judô & Artes Marciais Lúdicas (Coordenação, Equilíbrio & Disciplina)',
        foco: 'Desenvolvimento psicomotor, agilidade, postura e respeito esportivo',
        diasSugeridos: 'Segunda e Quarta-feira (ou 2x na semana)',
        exercicios: [
          {
            exercicio: 'Aquecimento Lúdico: Pega-pega funcional, Corrida do Saci e Polichinelos',
            series: 1,
            repeticoes: '8 a 10 minutos',
            descanso: '1-2 min',
            variacoes: ['Pular corda recreativa com música', 'Circuito de cones e zigue-zague', 'Dança do movimento articular']
          },
          {
            exercicio: 'Rolamentos & Quedas Educativas do Judô (Ukemi no tatame macio)',
            series: 3,
            repeticoes: '6 a 8 rolamentos',
            descanso: '60s',
            variacoes: ['Técnicas de amortecimento de queda lateral', 'Rolamento sobre blocos de espuma', 'Queda de costas com queixo no peito']
          },
          {
            exercicio: 'Muay Thai Infantil / Artes Marciais: Chutes e Esquivas no Saco Leve ou Manopla',
            series: 4,
            repeticoes: '45 segundos ativos',
            descanso: '60s',
            variacoes: ['Golpes em alvos infláveis / manoplas com o professor', 'Esquiva de bastão de espuma', 'Deslocamento lateral em guarda']
          },
          {
            exercicio: 'Desafio de Equilíbrio: Caminhada sobre a Linha / Fita com Braços Abertos',
            series: 3,
            repeticoes: '40 segundos',
            descanso: '45s',
            variacoes: ['Postura do Aviãozinho (equilíbrio unilateral)', 'Caminho do Urso (4 apoios no solo)', 'Salto com um pé só dentro de aros']
          },
          {
            exercicio: 'Volta à Calma: Postura da Tartaruga e Borboleta no Colchonete',
            series: 1,
            repeticoes: '5 a 8 minutos',
            descanso: '—',
            variacoes: ['Respiração conduzida "Cheirar a flor e apagar a vela"', 'Alongamento em roda com histórias lúdicas', 'Relaxamento guiado']
          }
        ]
      },
      {
        nome: 'Sessão 2 — Natação & Adaptação Aquática (Condicionamento Cardiorrespiratório & Postura)',
        foco: 'Capacidade pulmonar, nados crawl e costas, segurança aquática e resistência',
        diasSugeridos: 'Terça e Quinta-feira (ou 2x na semana)',
        exercicios: [
          {
            exercicio: 'Adaptação e Aquecimento Aquático com Prancha (Pernada de Crawl)',
            series: 4,
            repeticoes: '25 metros',
            descanso: '45s',
            variacoes: ['Pernada de costas com prancha no peito', 'Flutuação da Estrela-do-Mar', 'Caminhada rápida na água rasa com saltos']
          },
          {
            exercicio: 'Braçadas de Nado Crawl com Respiração Lateral Bilateral',
            series: 4,
            repeticoes: '25 metros',
            descanso: '60s',
            variacoes: ['Braçada unilateral alternada com flutuador', 'Nado costas completo com braço estendido', 'Nado peito educativo']
          },
          {
            exercicio: 'Ondulação Subaquática e Mergulho Recreativo de Precisão',
            series: 3,
            repeticoes: '15 metros',
            descanso: '45s',
            variacoes: ['Caça a argolas e objetos submersos na piscina rasa', 'Salto seguro da borda da piscina', 'Nado cachorrinho com velocidade']
          },
          {
            exercicio: 'Jogos Aquáticos Recreativos Supervisionados (Polo Aquático com Boia / Espaguete)',
            series: 1,
            repeticoes: '15 a 20 minutos',
            descanso: '—',
            variacoes: ['Circuito de revezamento de espaguetes aquáticos', 'Corrida aquática com bola leve', 'Nado recreativo livre']
          }
        ]
      },
      {
        nome: 'Sessão 3 — Recreação Psicomotora, Esportes Coletivos & Agilidade (Futebol / Capoeira)',
        foco: 'Reflexos rápidos, socialização, tomada de decisão e gasto energético saudável',
        diasSugeridos: 'Sexta-feira ou Fim de Semana',
        exercicios: [
          {
            exercicio: 'Condução de Bola de Futebol em Zigue-zague com Ambos os Pés',
            series: 4,
            repeticoes: '1 minuto por série',
            descanso: '45s',
            variacoes: ['Passes de bola em dupla com alvo em cones', 'Drible com bola de basquete / handebol', 'Chute a gol lúdico com obstáculos']
          },
          {
            exercicio: 'Ginga da Capoeira & Meia-Lua de Frente com Ritmo Musical',
            series: 3,
            repeticoes: '1 minuto ativo',
            descanso: '45s',
            variacoes: ['Cocada e esquiva baixa na capoeira', 'Pular corda em ritmo de cantigas', 'Amarelinha moderna com saltos alternados']
          },
          {
            exercicio: 'Pista de Obstáculos de Agilidade (Salto de cones, rastejo e corrida veloz)',
            series: 3,
            repeticoes: 'Voltas completas de 45s',
            descanso: '60s',
            variacoes: ['Pique-bandeira esportivo', 'Escadinha de agilidade no chão', 'Revezamento de bastão com colegas']
          },
          {
            exercicio: 'Alongamento Lúdico "Posturas dos Animais" (Gato, Cobra e Cachorro Olhando para Baixo)',
            series: 1,
            repeticoes: '8 minutos',
            descanso: '—',
            variacoes: ['Alongamento em círculo', 'Respiração diafragmática da bexiga', 'Relaxamento com música suave']
          }
        ]
      }
    ];

    observacoes = 'Diretriz Pediátrica: Crianças NÃO realizam musculação em academias, pois não possuem estatura, maturidade esquelética ou força para aparelhos de academia. A recomendação pediátrica oficial é de atividades físicas lúdicas e esportes para a idade (natação, lutas recreativas, jogos com bola) 1 vez ao dia (45 a 60 min), 3 a 5 vezes por semana, com hidratação generosa (35-40ml/kg).';
  }

  // =========================================================================
  // 2. FAIXA ETÁRIA: ADOLESCENTE (13 A 17 ANOS)
  // Transição: Fortalecimento com peso corporal (Calistenia) + Esporte
  // Frequência: 4x a 5x na semana (45 a 60 min)
  // =========================================================================
  else if (isAdolescente) {
    divisao = 'Condicionamento Juvenil, Calistenia & Iniciação Esportiva Funcional';
    frequenciaRecomendada = '4 a 5 vezes por semana (50 a 60 minutos por dia)';
    modalidadePrincipal = 'Calistenia com peso corporal e exercícios funcionais guiados';
    modalidadeComplementar = isMasculino
      ? 'Muay Thai / Artes Marciais, Futebol, Basquete ou Natação (2x a 3x/semana)'
      : 'Vôlei, Dança, Natação, Muay Thai Funcional ou Corrida (2x a 3x/semana)';

    rotina = [
      {
        nome: 'Treino A — Força Corporal & Membros Superiores (Calistenia + Peso Livre Leve)',
        foco: 'Peitoral, costas, deltoides e fortalecimento de core sem sobrecarga espinhal',
        diasSugeridos: 'Segunda e Quinta-feira',
        exercicios: [
          {
            exercicio: 'Flexão de Braços no Solo (ou Inclinada no Banco)',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            variacoes: ['Flexão com joelhos no apoio', 'Supino vertical na máquina leve', 'Flexão no TRX / fita de suspensão']
          },
          {
            exercicio: 'Puxada Frontal no Pulley com Carga Moderada',
            series: 3,
            repeticoes: '12',
            descanso: '60s',
            variacoes: ['Barra fixa assistida no Graviton', 'Remada curvada com halteres leves', 'Remada no TRX / suspensão']
          },
          {
            exercicio: 'Desenvolvimento de Ombros com Halteres Leves',
            series: 3,
            repeticoes: '12',
            descanso: '45s',
            variacoes: ['Elevação lateral com halteres', 'Desenvolvimento na máquina guiada', 'Face pull no cabo com corda']
          },
          {
            exercicio: 'Prancha Abdominal Isométrica no Colchonete',
            series: 3,
            repeticoes: '30 a 45 segundos',
            descanso: '45s',
            variacoes: ['Dead Bug no colchonete', 'Prancha lateral apoiada no cotovelo', 'Abdominal supra suave']
          }
        ]
      },
      {
        nome: 'Treino B — Membros Inferiores, Agilidade & Potência',
        foco: 'Quadríceps, glúteos, posteriores e pliometria moderada para esportes',
        diasSugeridos: 'Terça e Sexta-feira',
        exercicios: [
          {
            exercicio: 'Agachamento Livre (Peso Corporal ou Halter Goblet Leve)',
            series: 4,
            repeticoes: '12-15',
            descanso: '60s',
            variacoes: ['Leg Press 45º carga leve', 'Agachamento na caixa / banco', 'Agachamento sumô com halter']
          },
          {
            exercicio: 'Afundo Passada Alternada no Corredor',
            series: 3,
            repeticoes: '10 passos por perna',
            descanso: '60s',
            variacoes: ['Step-up subida no caixote', 'Agachamento búlgaro com apoio', 'Afundo estático']
          },
          {
            exercicio: 'Elevação Pélvica no Colchonete com Faixa Elástica',
            series: 3,
            repeticoes: '15',
            descanso: '45s',
            variacoes: ['Ponte unilateral para glúteos', 'Cadeira flexora na máquina leve', 'Stiff com halteres leves']
          },
          {
            exercicio: 'Salto em Caixa Baixa / Pliometria e Corrida Estacionária',
            series: 3,
            repeticoes: '10 saltos controlados',
            descanso: '60s',
            variacoes: ['Pular corda com intensidade moderada', 'Polichinelo acelerado', 'Deslocamento lateral em cones']
          }
        ]
      },
      {
        nome: 'Treino C — Atividade Física Esportiva Complementar (Prática de Modalidade)',
        foco: 'Vivência esportiva, integração aeróbica e desenvolvimento atlético',
        diasSugeridos: 'Quarta-feira ou Sábado',
        exercicios: [
          {
            exercicio: isMasculino
              ? 'Prática de Esporte: Muay Thai, Jiu-Jitsu, Natação ou Futebol'
              : 'Prática de Esporte: Natação, Muay Thai, Dança Contemporânea ou Vôlei',
            series: 1,
            repeticoes: '50 a 60 minutos',
            descanso: '—',
            variacoes: ['Ciclismo ao ar livre', 'Corrida contínua na pista', 'Circuito de treinamento funcional']
          }
        ]
      }
    ];

    observacoes = 'Adolescentes necessitam de descanso adequado (8-9h de sono) para liberação de GH e recuperação muscular. Evitar o uso de sobrecargas pesadas na coluna vertebral antes da consolidação óssea.';
  }

  // =========================================================================
  // 3. FAIXA ETÁRIA: ADULTO (18 A 59 ANOS)
  // REGRA SOLICITADA:
  // - Recomendar Musculação (x vezes por semana)
  // - Recomendar Outra Opção de Atividade Física (x vezes por semana)
  // - De acordo com o Sexo (Feminino ou Masculino)
  // - Sexo Feminino: Sugerir treinos mais leves para o Período Menstrual
  // =========================================================================
  else if (isAdulto) {
    if (isMasculino) {
      // ---------------------------------------------------------------------
      // ADULTO MASCULINO
      // Musculação (4x a 5x por semana) + Atividade Física Complementar (2x a 3x por semana)
      // ---------------------------------------------------------------------
      frequenciaRecomendada = 'Musculação: 4 a 5 vezes por semana (60 min) + Atividade Complementar: 2 a 3 vezes por semana (45 min)';
      modalidadePrincipal = 'Musculação com Foco em Força, Hipertrofia & Densidade Muscular';
      modalidadeComplementar = 'Muay Thai / Boxe, Corrida de Rua, Natação, Ciclismo ou Futebol (2x a 3x por semana)';

      divisao = isHipertrofia
        ? 'Musculação Hipertrofia Avançada Push/Pull/Legs (4-5x/sem) + Esporte Complementar (2x/sem)'
        : 'Musculação ABC Força & Definição (4x/sem) + Atividade Cardiovascular/Luta (2-3x/sem)';

      rotina = [
        {
          nome: 'Treino A — Peito, Ombros (Deltoides Anterior/Lateral) & Tríceps (Push)',
          foco: 'Hipertrofia de tronco superior empurrando com boa amplitude',
          diasSugeridos: 'Segunda-feira (ou dia 1)',
          exercicios: [
            {
              exercicio: 'Supino Reto com Barra ou Halteres',
              series: 4,
              repeticoes: isHipertrofia ? '8-10' : '10-12',
              descanso: '90s',
              variacoes: ['Supino na Máquina Articulada', 'Supino no Smith', 'Supino Reto com Halteres', 'Flexão com Carga']
            },
            {
              exercicio: 'Supino Inclinado com Halteres (30º a 45º)',
              series: 3,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Supino Inclinado na Barra', 'Crucifixo Inclinado com Halteres', 'Supino Inclinado Articulado']
            },
            {
              exercicio: 'Desenvolvimento Militar com Halteres Sentado',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Desenvolvimento no Smith Machine', 'Desenvolvimento na Máquina Articulada', 'Desenvolvimento com Barra em Pé']
            },
            {
              exercicio: 'Elevação Lateral com Halteres (Controle Excêntrico)',
              series: 4,
              repeticoes: '12-15',
              descanso: '45s',
              variacoes: ['Elevação Lateral no Cabo (Crossover)', 'Elevação Lateral na Máquina', 'Elevação Unilateral no Banco Inclinado']
            },
            {
              exercicio: 'Tríceps Pulley no Cabo com Corda',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Tríceps Testa com Barra W', 'Tríceps Francês com Halter', 'Tríceps Paralelas / Mergulho no Graviton']
            }
          ]
        },
        {
          nome: 'Treino B — Costas Completa, Deltoide Posterior & Bíceps (Pull)',
          foco: 'Largura e espessura das costas, antebraços e braços equilibrados',
          diasSugeridos: 'Terça-feira (ou dia 2)',
          exercicios: [
            {
              exercicio: 'Puxada Aberta no Pulley Frontal',
              series: 4,
              repeticoes: '8-12',
              descanso: '90s',
              variacoes: ['Barra Fixa Pronada (Pull-Up)', 'Puxada Triângulo no Pulley', 'Puxada Articulada Convergente']
            },
            {
              exercicio: 'Remada Curvada com Barra (Pegada Pronada/Supinada)',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Remada Cavalinho (T-Bar)', 'Remada Unilateral com Halter (Serrote)', 'Remada Baixa com Triângulo no Cabo']
            },
            {
              exercicio: 'Crucifixo Inverso no Peck Deck / Máquina',
              series: 3,
              repeticoes: '12-15',
              descanso: '45s',
              variacoes: ['Face Pull na Corda no Crossover', 'Crucifixo Inverso com Halteres no Banco Inclinado']
            },
            {
              exercicio: 'Rosca Direta com Barra W ou Halteres',
              series: 3,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Rosca Alternada com Halteres com Giro', 'Rosca Martelo com Halteres', 'Rosca no Pulley Baixo']
            },
            {
              exercicio: 'Abdominal Infra na Paralela / Barra Fixa',
              series: 3,
              repeticoes: '15-20',
              descanso: '45s',
              variacoes: ['Abdominal na Prancha Declinada', 'Abdominal na Roda (Ab Wheel)', 'Prancha Isométrica']
            }
          ]
        },
        {
          nome: 'Treino C — Pernas Completas, Glúteos & Panturrilha (Legs)',
          foco: 'Quadríceps, posteriores, glúteos e estabilidade de joelhos e quadril',
          diasSugeridos: 'Quinta ou Sexta-feira (ou dia 3)',
          exercicios: [
            {
              exercicio: 'Agachamento Livre com Barra (ou Smith Machine)',
              series: 4,
              repeticoes: '8-10',
              descanso: '90s',
              variacoes: ['Agachamento Hack Machine', 'Leg Press 45º Pesado', 'Agachamento Búlgaro com Halteres']
            },
            {
              exercicio: 'Leg Press 45º com Pés na Largura dos Ombros',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Cadeira Extensora Drop-Set', 'Afundo Passada com Halteres', 'Agachamento Goblet']
            },
            {
              exercicio: 'Mesa Flexora (ou Cadeira Flexora)',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Stiff com Barra ou Halteres', 'Levantamento Terra Romeno (RDL)', 'Flexão de Joelhos no Cabo']
            },
            {
              exercicio: 'Gêmeos Sentado na Máquina (Panturrilhas)',
              series: 4,
              repeticoes: '15-20',
              descanso: '45s',
              variacoes: ['Panturrilha em Pé no Smith / Degrau', 'Panturrilha no Leg Press 45º', 'Panturrilha Unilateral']
            }
          ]
        },
        {
          nome: 'Treino D — Atividade Física Complementar Obrigatória (2x a 3x por semana)',
          foco: 'Resistência aeróbica, mobilidade, gasto calórico e condicionamento cardiovascular',
          diasSugeridos: 'Quarta-feira e Sábado (dias intercalados com a musculação)',
          exercicios: [
            {
              exercicio: 'Modalidade 1: Muay Thai / Boxe / Lutas (Trabalho de Potência e Reflexo)',
              series: 1,
              repeticoes: '45 a 60 minutos',
              descanso: '—',
              variacoes: ['Natação (crawl contínuo)', 'Corrida de Rua (5km a 8km ritmo moderado)', 'Ciclismo / Spinning']
            },
            {
              exercicio: 'Modalidade 2: Natação ou Corrida Intercalada (Treino Regenerativo / HIIT)',
              series: 1,
              repeticoes: '30 a 45 minutos',
              descanso: '—',
              variacoes: ['Futebol recreativo com amigos', 'Remo Indoor (Rowing Machine)', 'Simulador de Escada (StairMaster)']
            }
          ]
        }
      ];

      observacoes = 'Protocolo Masculino: Manter a musculação pesada progressiva com sobrecarga controlada (RPE 8-9) 4 a 5 vezes por semana. Intercalar as 2 a 3 sessões de atividade complementar (Muay Thai, Corrida ou Natação) para não prejudicar a recuperação muscular.';
    } else {
      // ---------------------------------------------------------------------
      // ADULTO FEMININO
      // Musculação (3x a 5x por semana) + Atividade Física Complementar (2x a 3x por semana)
      // + PROTOCOLO DE TREINO LEVE PARA O PERÍODO MENSTRUAL
      // ---------------------------------------------------------------------
      frequenciaRecomendada = 'Musculação: 3 a 5 vezes por semana (50 a 60 min) + Atividade Complementar: 2 a 3 vezes por semana (45 min)';
      modalidadePrincipal = 'Musculação com Ênfase em Membros Inferiores, Glúteos, Abdômen & Tonificação de Superiores';
      modalidadeComplementar = 'Pilates, Dança, Natação, Spinning, Corrida Leve ou Muay Thai Funcional (2x a 3x por semana)';

      divisao = 'Musculação Feminina Modeladora (3-4x/sem) + Atividade Complementar (2-3x/sem) + Adaptação Menstrual';

      rotina = [
        {
          nome: 'Treino A — Foco Glúteos & Quadríceps (Membros Inferiores 1)',
          foco: 'Ativação glútea profunda, hipertrofia de coxas e alinhamento articular',
          diasSugeridos: 'Segunda-feira (ou dia 1)',
          exercicios: [
            {
              exercicio: 'Elevação Pélvica com Barra ou na Máquina (Hip Thrust)',
              series: 4,
              repeticoes: '10-12 (com 2s de isometria no topo)',
              descanso: '60s',
              variacoes: ['Elevação Pélvica Unilateral no Banco', 'Glúteo no Cabo no Crossover', 'Glúteo 4 Apoios com Caneleira Pesada']
            },
            {
              exercicio: 'Agachamento Búlgaro com Halteres no Banco',
              series: 3,
              repeticoes: '10 a 12 por perna',
              descanso: '60s',
              variacoes: ['Afundo Passada no Corredor', 'Agachamento Sumô no Step com Halter', 'Leg Press 45º com Pés Altos']
            },
            {
              exercicio: 'Leg Press 45º com Pés Abertos e Altos',
              series: 4,
              repeticoes: '12-15',
              descanso: '60s',
              variacoes: ['Agachamento Hack Machine', 'Agachamento Goblet com Halter', 'Agachamento no Smith']
            },
            {
              exercicio: 'Cadeira Extensora (Contração Contínua)',
              series: 3,
              repeticoes: '12-15',
              descanso: '45s',
              variacoes: ['Afundo Estático com Halteres', 'Agachamento Sissy no Solo', 'Leg Press Horizontal']
            },
            {
              exercicio: 'Abdução de Quadril na Cadeira Abdutora',
              series: 4,
              repeticoes: '15-20 (com tronco inclinado à frente)',
              descanso: '45s',
              variacoes: ['Abdução de Quadril no Cabo com Caneleira', 'Passada Lateral com Miniband']
            }
          ]
        },
        {
          nome: 'Treino B — Membros Superiores Harmônicos, Costas & Abdômen',
          foco: 'Postura elegante, costas definidas, deltoides tonificados e cintura afinada',
          diasSugeridos: 'Terça ou Quarta-feira (ou dia 2)',
          exercicios: [
            {
              exercicio: 'Puxada Frontal no Pulley com Triângulo',
              series: 3,
              repeticoes: '12',
              descanso: '60s',
              variacoes: ['Puxada Aberta no Pulley', 'Remada Baixa no Cabo', 'Remada Unilateral com Halter (Serrote)']
            },
            {
              exercicio: 'Desenvolvimento com Halteres Sentado (Ombros)',
              series: 3,
              repeticoes: '12',
              descanso: '45s',
              variacoes: ['Desenvolvimento na Máquina', 'Elevação Lateral com Halteres', 'Elevação Lateral no Crossover']
            },
            {
              exercicio: 'Supino Vertical na Máquina ou Flexão no Solo',
              series: 3,
              repeticoes: '12',
              descanso: '60s',
              variacoes: ['Crucifixo Reto no Cabo', 'Flexão de Braços Inclinada no Banco', 'Supino com Halteres']
            },
            {
              exercicio: 'Tríceps Pulley com Corda no Cabo',
              series: 3,
              repeticoes: '12-15',
              descanso: '45s',
              variacoes: ['Tríceps Francês com Halter', 'Tríceps Mergulho no Banco', 'Tríceps Testa na Polia']
            },
            {
              exercicio: 'Prancha Abdominal no Solo + Vácuo Abdominal (Stomach Vacuum)',
              series: 4,
              repeticoes: '30s de prancha + 3 ciclos de vácuo',
              descanso: '45s',
              variacoes: ['Abdominal Dead Bug no Colchonete', 'Abdominal Infra na Prancha', 'Abdominal Bicicleta']
            }
          ]
        },
        {
          nome: 'Treino C — Posteriores de Coxa, Glúteo Médio & Panturrilhas (Membros Inferiores 2)',
          foco: 'Isquiotibiais, firmeza posterior, contorno glúteo e vascularização',
          diasSugeridos: 'Quinta ou Sexta-feira (ou dia 3)',
          exercicios: [
            {
              exercicio: 'Stiff com Halteres ou Barra (Alongamento Posterior Guiado)',
              series: 4,
              repeticoes: '10-12',
              descanso: '60s',
              variacoes: ['Levantamento Terra Romeno (RDL)', 'Bom Dia (Good Morning) com Barra Leve', 'Stiff Unilateral no Cabo']
            },
            {
              exercicio: 'Mesa Flexora (ou Cadeira Flexora Sentada)',
              series: 4,
              repeticoes: '12-15',
              descanso: '60s',
              variacoes: ['Cadeira Flexora Unilateral', 'Flexão Nórdica Assistida', 'Flexão de Joelhos no Cabo']
            },
            {
              exercicio: 'Glúteo Kickback no Cabo com Caneleira (Extensão de Quadril)',
              series: 4,
              repeticoes: '12-15 por perna',
              descanso: '45s',
              variacoes: ['Glúteo na Máquina Multiquadril', 'Elevação Pélvica com Pés no Banco', 'Subida no Step Alto']
            },
            {
              exercicio: 'Panturrilha em Pé no Degrau / Smith',
              series: 4,
              repeticoes: '15-20',
              descanso: '45s',
              variacoes: ['Panturrilha no Leg Press 45º', 'Gêmeos Sentado na Máquina', 'Panturrilha Unilateral']
            }
          ]
        },
        {
          nome: 'Treino D — Atividade Física Complementar Obrigatória (2x a 3x por semana)',
          foco: 'Flexibilidade, alívio de estresse, tônus profundo e condicionamento',
          diasSugeridos: 'Dias alternados (ex: Quarta-feira e Sábado)',
          exercicios: [
            {
              exercicio: 'Opção 1: Pilates Clínico ou Funcional (Fortalecimento de Core & Coluna)',
              series: 1,
              repeticoes: '50 a 60 minutos',
              descanso: '—',
              variacoes: ['Natação (nado livre e costas)', 'Dança / Ritmos / Zumba', 'Spinning / Bike Indoor']
            },
            {
              exercicio: 'Opção 2: Cardio Moderado (Esteira Inclinada, Elíptico ou Corrida de Rua)',
              series: 1,
              repeticoes: '30 a 45 minutos contínuos',
              descanso: '—',
              variacoes: ['Muay Thai Feminino / Boxe Funcional', 'Caminhada Rápida ao Ar Livre', 'Circuito de Mobilidade']
            }
          ]
        }
      ];

      // PROTOCOLO DEDICADO PARA O PERÍODO MENSTRUAL (MULHERES)
      treinoMenstrual = {
        titulo: '🌸 Protocolo & Treino Adaptado para o Período Menstrual',
        subtitulo: 'Adaptação inteligente de intensidade e alívio de sintomas para os dias de sangramento e cólicas',
        descricao: 'Durante a fase menstrual (dias 1 a 5 do ciclo), ocorre a queda brusca dos hormônios estrogênio e progesterona. O corpo apresenta menor tolerância à fadiga, aumento na percepção de esforço e eventual retenção hídrica/desconforto pélvico. A recomendação médica e esportiva é reduzir a carga em 30% a 50%, priorizar a mobilidade pélvica, exercícios de respiração e treinos regenerativos suaves que estimulam a liberação de endorfinas sem esgotar o organismo.',
        fasesCiclo: [
          {
            fase: 'Fase Menstrual (Dias 1 a 5)',
            status: 'Estrogênio e Progesterona Baixos',
            energia: 'Baixa a Moderada',
            treinoRecomendado: 'Treino Leve/Regenerativo: Caminhada plana, alongamento profundo, mobilidade de quadril e yoga suave. Evitar cargas máximas e pressão intra-abdominal excessiva.'
          },
          {
            fase: 'Fase Folicular (Dias 6 a 12)',
            status: 'Estrogênio em Elevação',
            energia: 'Alta & Disposta',
            treinoRecomendado: 'Excelente fase para treinos de força, hipertrofia progressiva e novas metas de carga. Recuperação muscular mais veloz.'
          },
          {
            fase: 'Fase Ovulatória (Dias 13 a 16)',
            status: 'Pico Máximo de Estrogênio & LH',
            energia: 'Pico Máximo',
            treinoRecomendado: 'Momento de força máxima e alto rendimento. Treinos intensos, recordes pessoais (PRs) e treinos complementares de luta/corrida.'
          },
          {
            fase: 'Fase Lútea / TPM (Dias 17 a 28)',
            status: 'Progesterona Elevada (Queda no final)',
            energia: 'Moderada a Decrescente',
            treinoRecomendado: 'Manter ritmo constante, moderado a leve. Priorizar hidratação (combate à retenção) e atividades como Pilates, Natação e caminhadas.'
          }
        ],
        rotina: [
          {
            nome: 'Rotina Menstrual A — Alívio de Cólicas, Mobilidade Pélvica & Lombar',
            foco: 'Relaxamento da fáscia pélvica, alívio de tensão lombar e circulação sanguínea sem impacto',
            exercicios: [
              {
                exercicio: 'Alongamento Postura da Criança com Braços Estendidos (Balasana)',
                series: 3,
                repeticoes: '60 segundos mantendo respiração profunda',
                descanso: '30s',
                variacoes: ['Postura da Criança com joelhos afastados', 'Alongamento abraçando os dois joelhos no colchonete']
              },
              {
                exercicio: 'Mobilidade Gato-Camelo no Colchonete (Cat-Cow)',
                series: 3,
                repeticoes: '10 a 12 ciclos respiratórios lentos',
                descanso: '30s',
                variacoes: ['Ondulação pélvica no solo', 'Báscula de quadril com bola suíça']
              },
              {
                exercicio: 'Postura da Borboleta no Colchonete (Baddha Konasana)',
                series: 3,
                repeticoes: '45 a 60 segundos com tronco suavemente inclinado',
                descanso: '30s',
                variacoes: ['Borboleta deitada de costas', 'Abertura de quadril com apoio de almofada']
              },
              {
                exercicio: 'Ponte para Glúteos no Solo (Sem Peso Adicional — Foco em Circulação)',
                series: 3,
                repeticoes: '10 a 12 repetições suaves',
                descanso: '45s',
                variacoes: ['Ponte isométrica sustentada 20s', 'Ponte com pés sobre a bola suíça']
              },
              {
                exercicio: 'Caminhada Leve e Relaxante na Esteira Plana ou ao Ar Livre',
                series: 1,
                repeticoes: '20 a 30 minutos em ritmo confortável (sem inclinação)',
                descanso: '—',
                variacoes: ['Bicicleta ergométrica horizontal giro leve', 'Alongamento geral assistido', 'Yoga restaurativa']
              }
            ]
          },
          {
            nome: 'Rotina Menstrual B — Musculação Regenerativa & Suave (Cargas 40-50% Reduzidas)',
            foco: 'Manter a circulação e liberação de endorfinas sem gerar estresse inflamatório excessivo',
            exercicios: [
              {
                exercicio: 'Senta e Levanta do Banco (Agachamento Guiado Leve sem Barra)',
                series: 3,
                repeticoes: '10-12 repetições lentas',
                descanso: '60s',
                variacoes: ['Agachamento com apoio na bola suíça na parede', 'Leg press horizontal com carga mínima']
              },
              {
                exercicio: 'Puxada Frontal no Pulley (Carga 50% da habitual)',
                series: 3,
                repeticoes: '12 repetições sem falha',
                descanso: '60s',
                variacoes: ['Remada sentado na máquina com encosto confortável', 'Remada baixa com elástico']
              },
              {
                exercicio: 'Elevação Lateral com Halteres Leves (1kg ou 2kg)',
                series: 3,
                repeticoes: '12 repetições controladas',
                descanso: '45s',
                variacoes: ['Elevação frontal suave', 'Rotação externa com elástico leve']
              },
              {
                exercicio: 'Alongamento Guiado de Posteriores com Faixa Elástica',
                series: 3,
                repeticoes: '45 segundos por perna',
                descanso: '30s',
                variacoes: ['Alongamento em pé apoiado na parede', 'Alongamento sentado no solo com pernas estendidas']
              },
              {
                exercicio: 'Respiração Diafragmática Profunda & Relaxamento Muscular Progressivo',
                series: 1,
                repeticoes: '5 a 10 minutos de olhos fechados',
                descanso: '—',
                variacoes: ['Meditação guiada de relaxamento', 'Banho morno relaxante pós-treino']
              }
            ]
          }
        ],
        orientacoesCuidados: 'Dicas de Suporte no Período Menstrual: Aumente a ingestão de magnésio (sementes, banana, cacau 70%), consuma chás calmantes (camomila, gengibre para cólicas) e mantenha a hidratação generosa (35-40ml/kg). Escute os sinais do seu corpo: se as cólicas estiverem intensas no primeiro ou segundo dia, um dia completo de repouso é totalmente válido e faz parte do equilíbrio biológico.'
      };

      observacoes = 'Protocolo Feminino: Musculação modeladora focada em inferiores e postura 3 a 5 vezes por semana combinada com 2 a 3 sessões de atividades complementares (Pilates, Dança ou Natação). Nos dias de menstruação ou cólica, utilize a rotina de treino leve regenerativo disponibilizada no plano.';
    }
  }

  // =========================================================================
  // 4. FAIXA ETÁRIA: IDOSO / TERCEIRA IDADE (60+ ANOS)
  // =========================================================================
  else if (isSenior) {
    divisao = 'Full Body & Fortalecimento Articular (Melhor Idade / 3x na semana) + Caminhada/Hidroginástica';
    frequenciaRecomendada = 'Musculação/Funcional: 3 vezes por semana (45 min) + Hidroginástica/Caminhada: 2 vezes por semana (30 min)';
    modalidadePrincipal = 'Musculação Terapêutica & Fortalecimento de Quadríceps e Coluna';
    modalidadeComplementar = 'Hidroginástica, Caminhada ao Ar Livre ou Alongamento Guiado (2x a 3x por semana)';

    rotina = [
      {
        nome: 'Treino A — Fortalecimento Funcional & Membros Inferiores',
        foco: 'Prevenção de sarcopenia, autonomia nas atividades diárias e segurança ao caminhar',
        diasSugeridos: 'Segunda e Quarta-feira',
        exercicios: [
          {
            exercicio: 'Senta e Levanta da Cadeira com Apoio de Braços',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            variacoes: ['Leg Press Horizontal Leve com Encosto', 'Agachamento com Bola Suíça na Parede', 'Agachamento Parcial com Apoio na Barra']
          },
          {
            exercicio: 'Elevação Frontal com Halteres Leves (1kg ou 2kg)',
            series: 3,
            repeticoes: '12',
            descanso: '45s',
            variacoes: ['Elevação com Faixa Elástica (Theraband)', 'Desenvolvimento Sentado com Halter Leve', 'Elevação Lateral na Máquina']
          },
          {
            exercicio: 'Remada Sentado no Pulley com Apoio Peitoral',
            series: 3,
            repeticoes: '12',
            descanso: '60s',
            variacoes: ['Remada Baixa no Cabo', 'Remada Unilateral com Apoio no Banco', 'Puxada Frontal com Carga Leve']
          },
          {
            exercicio: 'Caminhada Moderada na Esteira Plana ou ao Ar Livre',
            series: 1,
            repeticoes: '20 a 25 minutos',
            descanso: '—',
            variacoes: ['Bicicleta Ergométrica Horizontal com Apoio Lombar', 'Elíptico / Transport Leve', 'Hidroginástica']
          }
        ]
      },
      {
        nome: 'Treino B — Equilíbrio, Postura & Membros Superiores',
        foco: 'Prevenção de quedas, mobilidade de ombros e flexibilidade articular',
        diasSugeridos: 'Sexta-feira',
        exercicios: [
          {
            exercicio: 'Cadeira Extensora com Carga Leve e Movimento Controlado',
            series: 3,
            repeticoes: '12',
            descanso: '60s',
            variacoes: ['Extensão de Perna Sentado com Caneleira', 'Ponte para Glúteos no Colchonete', 'Elevação de Panturrilha Apoiado na Parede']
          },
          {
            exercicio: 'Supino Vertical na Máquina com Encosto Anatômico',
            series: 3,
            repeticoes: '10-12',
            descanso: '60s',
            variacoes: ['Flexão de Braços Inclinada na Parede / Barra Alta', 'Crucifixo com Elástico', 'Supino com Halteres Leves']
          },
          {
            exercicio: 'Rosca Bíceps Sentado com Halteres Leves',
            series: 3,
            repeticoes: '12',
            descanso: '45s',
            variacoes: ['Rosca no Pulley Baixo', 'Rosca com Faixa Elástica', 'Rosca Martelo com Halteres']
          },
          {
            exercicio: 'Exercício de Equilíbrio: Ficar em 1 Pé Só Próximo à Parede',
            series: 3,
            repeticoes: '20 segundos por perna',
            descanso: '45s',
            variacoes: ['Caminhada em linha reta pé ante pé', 'Elevação de calcanhares apoiado na barra', 'Alongamento de panturrilhas']
          }
        ]
      }
    ];

    observacoes = 'Idosos: Foco em estabilidade, mobilidade e fortalecimento muscular global para prevenção de quedas e manutenção da independência motora. Monitorar pressão arterial e hidratação regular.';
  }

  return {
    divisao,
    idade,
    faixaEtaria: faixa,
    sexo,
    frequenciaRecomendada,
    modalidadePrincipal,
    modalidadeComplementar,
    rotina,
    observacoes,
    treinoMenstrual
  };
}
