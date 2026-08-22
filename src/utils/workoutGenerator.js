/**
 * Gerador Dinâmico de Treinos Adaptado ao Perfil do Paciente
 * NutriMi — Nutrição Inteligente
 * Inclui variações e exercícios substitutos caso o aparelho esteja ocupado
 */

import { calcularIdade } from './healthCalculators';

export function gerarPlanoTreinos(paciente) {
  const idade = calcularIdade(paciente?.data_nascimento);
  const sexo = paciente?.sexo || 'Feminino';
  const nivelAtividade = paciente?.nivel_atividade || 'Leve';
  const objetivos = paciente?.objetivos || ['Saúde & Disposição'];

  const isSenior = idade >= 60;
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isIniciante = String(nivelAtividade).toLowerCase().includes('sedent') || String(nivelAtividade).toLowerCase().includes('leve');

  let divisao = '';
  let treinoA = [];
  let treinoB = [];
  let treinoC = [];

  if (isSenior) {
    divisao = 'Full Body & Fortalecimento Articular (Idosos / 3x na semana)';
    treinoA = [
      {
        exercicio: 'Senta e Levanta da Cadeira com Apoio',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Leg Press Leve com Encosto', 'Agachamento com Bola na Parede', 'Agachamento Parcial com Apoio na Barra']
      },
      {
        exercicio: 'Elevação Frontal com Halteres Leves',
        series: 3,
        repeticoes: '12',
        descanso: '45s',
        variacoes: ['Elevação com Elástico (Theraband)', 'Desenvolvimento Sentado com Halter Leve', 'Elevação Lateral na Máquina']
      },
      {
        exercicio: 'Remada Sentado com Elástico / Pulley',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Remada Baixa no Cabo', 'Remada Unilateral com Apoio no Banco', 'Puxada Frontal com Carga Leve']
      },
      {
        exercicio: 'Caminhada Moderada na Esteira / Plana',
        series: 1,
        repeticoes: '20 minutos',
        descanso: '—',
        variacoes: ['Bicicleta Ergométrica Horizontal', 'Elíptico / Transport Leve', 'Caminhada ao Ar Livre']
      }
    ];
    treinoB = [
      {
        exercicio: 'Extensão de Joelhos na Cadeira Extensora (Carga Leve)',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Extensão de Perna Sentado com Caneleira', 'Ponte para Glúteos no Colchonete', 'Elevação de Panturrilha Apoiado na Parede']
      },
      {
        exercicio: 'Supino Vertical na Máquina (Leve)',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Flexão de Braços Inclinada na Parede / Barra Alta', 'Crucifixo com Elástico', 'Supino com Halteres Leves no Banco']
      },
      {
        exercicio: 'Rosca Bíceps Sentado com Halteres',
        series: 3,
        repeticoes: '12',
        descanso: '45s',
        variacoes: ['Rosca no Pulley Baixo', 'Rosca com Faixa Elástica', 'Rosca Martelo com Halteres']
      },
      {
        exercicio: 'Bicicleta Ergométrica com Apoio Lombar',
        series: 1,
        repeticoes: '20 minutos',
        descanso: '—',
        variacoes: ['Caminhada Contínua na Esteira', 'Transport / Elíptico', 'Hidroginástica']
      }
    ];
    treinoC = treinoA;
  } else if (isIniciante) {
    divisao = 'ABC para Iniciantes (Adaptação Neuromuscular & Aparelhos Guiados)';
    treinoA = [
      {
        exercicio: 'Leg Press Horizontal',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
        variacoes: ['Leg Press 45º', 'Agachamento Hack na Máquina', 'Agachamento Goblet com Halter', 'Agachamento no Smith']
      },
      {
        exercicio: 'Supino Vertical na Máquina',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Supino Reto com Halteres', 'Supino no Smith Machine', 'Crucifixo na Máquina (Peck Deck)', 'Flexão de Braços no Solo']
      },
      {
        exercicio: 'Puxada Frontal no Pulley',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Puxada com Triângulo', 'Graviton (Barra Fixa Assistida)', 'Puxada Articulada na Máquina', 'Remada Curvada com Halteres']
      },
      {
        exercicio: 'Prancha Abdominal no Colchonete',
        series: 3,
        repeticoes: '30 a 45 segundos',
        descanso: '45s',
        variacoes: ['Abdominal Supra no Solo', 'Abdominal na Máquina', 'Dead Bug no Colchonete', 'Prancha Lateral']
      }
    ];
    treinoB = [
      {
        exercicio: 'Agachamento Sumô no Crossover / Halter',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
        variacoes: ['Agachamento com Halter no Banco', 'Leg Press 45º com Pés Altos e Afastados', 'Agachamento Búlgaro', 'Afundo Passada']
      },
      {
        exercicio: 'Desenvolvimento de Ombros na Máquina',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Desenvolvimento com Halteres Sentado', 'Desenvolvimento no Smith', 'Elevação Lateral com Halteres', 'Desenvolvimento com Barra']
      },
      {
        exercicio: 'Rosca Direta com Halteres',
        series: 3,
        repeticoes: '12',
        descanso: '45s',
        variacoes: ['Rosca no Pulley Baixo com Barra Reta', 'Rosca Alternada com Giro', 'Rosca Martelo com Halteres', 'Rosca Scott na Máquina']
      },
      {
        exercicio: 'Tríceps Pulley com Corda',
        series: 3,
        repeticoes: '12',
        descanso: '45s',
        variacoes: ['Tríceps Pulley com Barra V / Reta', 'Tríceps Francês com Halter', 'Tríceps no Banco (Mergulho)', 'Tríceps Testa com Barra']
      }
    ];
    treinoC = [
      {
        exercicio: 'Cadeira Extensora',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
        variacoes: ['Afundo Estático com Halteres', 'Agachamento Hack', 'Agachamento Sissy no Solo', 'Leg Press Horizontal']
      },
      {
        exercicio: 'Mesa Flexora (ou Cadeira Flexora)',
        series: 3,
        repeticoes: '12-15',
        descanso: '60s',
        variacoes: ['Cadeira Flexora Sentada', 'Stiff com Halteres Leves', 'Flexão de Joelhos no Cabo com Caneleira', 'Elevação Pélvica']
      },
      {
        exercicio: 'Remada Sentado na Máquina / Cabo',
        series: 3,
        repeticoes: '12',
        descanso: '60s',
        variacoes: ['Remada Cavalinho (T-Bar)', 'Remada Unilateral com Halter (Serrote)', 'Remada Baixa com Triângulo']
      },
      {
        exercicio: 'Cardio: Esteira Inclinada',
        series: 1,
        repeticoes: '20 minutos',
        descanso: '—',
        variacoes: ['Bicicleta Ergométrica', 'Transport / Elíptico', 'Simulador de Escada']
      }
    ];
  } else if (isHipertrofia) {
    divisao = 'Push / Pull / Legs (Hipertrofia Avançada 4x a 6x)';
    treinoA = [
      {
        exercicio: 'Supino Reto com Barra',
        series: 4,
        repeticoes: '8-10',
        descanso: '90s',
        variacoes: ['Supino Reto com Halteres', 'Supino na Máquina Articulada', 'Supino no Smith', 'Flexão de Braços com Carga']
      },
      {
        exercicio: 'Desenvolvimento Militar com Halteres',
        series: 4,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Desenvolvimento com Barra em Pé / Sentado', 'Desenvolvimento na Máquina Articulada', 'Desenvolvimento no Smith Machine', 'Elevação Lateral no Cabo']
      },
      {
        exercicio: 'Supino Inclinado com Halteres',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Supino Inclinado com Barra', 'Supino Inclinado na Máquina', 'Crucifixo Inclinado com Halteres', 'Crossover de Baixo para Cima']
      },
      {
        exercicio: 'Tríceps Testa com Barra W',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Tríceps Francês Bilateral com Halter', 'Tríceps Corda no Pulley', 'Tríceps Coice no Cabo', 'Tríceps Paralelas / Mergulho']
      }
    ];
    treinoB = [
      {
        exercicio: 'Puxada Aberta no Pulley',
        series: 4,
        repeticoes: '8-12',
        descanso: '90s',
        variacoes: ['Barra Fixa Pronada (Pull-up)', 'Puxada no Pulley com Triângulo', 'Puxada Articulada Convergente', 'Puxada com Pegada Supinada']
      },
      {
        exercicio: 'Remada Curvada com Barra',
        series: 4,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Remada Cavalinho (T-Bar)', 'Remada Unilateral com Halter (Serrote)', 'Remada Baixa com Triângulo no Cabo', 'Remada na Máquina com Apoio no Peito']
      },
      {
        exercicio: 'Rosca Direta com Barra',
        series: 3,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Rosca Direta no Crossover com Barra Reta', 'Rosca Alternada com Halteres no Banco Inclinado', 'Rosca Scott na Máquina', 'Rosca Martelo com Halteres']
      },
      {
        exercicio: 'Crucifixo Inverso no Peck Deck',
        series: 3,
        repeticoes: '12-15',
        descanso: '45s',
        variacoes: ['Face Pull na Corda (Cabo)', 'Crucifixo Inverso com Halteres no Banco Inclinado', 'Puxada Alta com Corda no Crossover']
      }
    ];
    treinoC = [
      {
        exercicio: 'Agachamento Livre com Barra',
        series: 4,
        repeticoes: '8-10',
        descanso: '90s',
        variacoes: ['Agachamento no Smith Machine', 'Agachamento Hack na Máquina', 'Leg Press 45º Pesado', 'Agachamento Búlgaro com Halteres']
      },
      {
        exercicio: 'Stiff com Barra / Halteres',
        series: 4,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Levantamento Terra Romeno (RDL)', 'Mesa Flexora', 'Bom Dia (Good Morning) com Barra', 'Cadeira Flexora']
      },
      {
        exercicio: 'Leg Press 45º',
        series: 4,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Agachamento Hack Machine', 'Agachamento com Halteres (Goblet)', 'Agachamento Búlgaro no Banco', 'Afundo Passada com Halteres']
      },
      {
        exercicio: 'Elevação Pélvica com Carga',
        series: 4,
        repeticoes: '10-12',
        descanso: '60s',
        variacoes: ['Elevação Pélvica na Máquina', 'Glúteo no Cabo no Crossover', 'Glúteo 4 Apoios com Caneleira', 'Glute Kickback na Máquina']
      },
      {
        exercicio: 'Gêmeos Sentado (Panturrilha)',
        series: 4,
        repeticoes: '15-20',
        descanso: '45s',
        variacoes: ['Gêmeos em Pé no Degrau / Smith', 'Panturrilha no Leg Press 45º', 'Panturrilha Unilateral com Halter', 'Gêmeos na Máquina Burrinho']
      }
    ];
  } else {
    // Emagrecimento / Definição & Alto Gasto Calórico
    divisao = 'ABC + HIIT (Definição & Gasto Calórico)';
    treinoA = [
      {
        exercicio: 'Agachamento Livre com Kettlebell / Halter',
        series: 4,
        repeticoes: '15',
        descanso: '45s',
        variacoes: ['Agachamento no Smith', 'Agachamento Hack', 'Leg Press 45º', 'Agachamento com Salto (Jump Squat)']
      },
      {
        exercicio: 'Afundo Passada com Halteres',
        series: 3,
        repeticoes: '12 por perna',
        descanso: '45s',
        variacoes: ['Agachamento Búlgaro', 'Afundo Estático no Smith', 'Step-up no Banco com Carga', 'Leg Press Unilateral']
      },
      {
        exercicio: 'Cadeira Extensora',
        series: 4,
        repeticoes: '15',
        descanso: '45s',
        variacoes: ['Agachamento Sissy', 'Agachamento Frontal com Halter', 'Leg Press Pés Baixos', 'Afundo no Smith']
      },
      {
        exercicio: 'Cardio: Esteira Inclinada',
        series: 1,
        repeticoes: '25 minutos',
        descanso: '—',
        variacoes: ['Simulador de Escada (StairMaster)', 'Bicicleta Spinning', 'Transport / Elíptico', 'Pular Corda']
      }
    ];
    treinoB = [
      {
        exercicio: 'Remada Baixa com Triângulo',
        series: 4,
        repeticoes: '15',
        descanso: '45s',
        variacoes: ['Remada Sentado na Máquina', 'Remada Unilateral com Halter (Serrote)', 'Remada Curvada com Barra', 'Remada Cavalinho']
      },
      {
        exercicio: 'Supino Reto na Máquina Articulada',
        series: 4,
        repeticoes: '15',
        descanso: '45s',
        variacoes: ['Supino Reto com Halteres', 'Supino no Smith', 'Crucifixo Reto no Cabo (Crossover)', 'Flexão de Braços']
      },
      {
        exercicio: 'Abdominal Infra na Prancha Declinada',
        series: 4,
        repeticoes: '20',
        descanso: '30s',
        variacoes: ['Elevação de Pernas na Barra Fixa', 'Abdominal Tesoura no Colchonete', 'Abdominal Infra no Solo', 'Abdominal na Roda (Ab Wheel)']
      },
      {
        exercicio: 'Cardio: Transport / Elíptico',
        series: 1,
        repeticoes: '25 minutos',
        descanso: '—',
        variacoes: ['Esteira Inclinada', 'Bicicleta Ergométrica', 'Remo Seco (Rowing Machine)', 'Simulador de Escada']
      }
    ];
    treinoC = [
      {
        exercicio: 'Leg Press 45º Drop-set',
        series: 4,
        repeticoes: '15+10',
        descanso: '45s',
        variacoes: ['Agachamento Hack Machine', 'Agachamento Goblet com Halter', 'Agachamento Búlgaro', 'Leg Press Horizontal']
      },
      {
        exercicio: 'Mesa Flexora (ou Cadeira Flexora)',
        series: 4,
        repeticoes: '15',
        descanso: '45s',
        variacoes: ['Cadeira Flexora Sentada', 'Stiff com Barra ou Halteres', 'Flexão Nórdica com Apoio', 'Elevação Pélvica com Carga']
      },
      {
        exercicio: 'Cardio HIIT na Esteira',
        series: 1,
        repeticoes: '20min (1min tiro / 1min caminha)',
        descanso: '—',
        variacoes: ['HIIT na Bicicleta Spinning', 'HIIT no Simulador de Escada', 'HIIT no Remo Indoor', 'Circuito Funcional']
      }
    ];
  }

  return {
    divisao,
    rotina: [
      { nome: 'Treino A — Foco Principal', exercicios: treinoA },
      { nome: 'Treino B — Foco Complementar', exercicios: treinoB },
      { nome: 'Treino C — Foco Membros Inferiores / Cardio', exercicios: treinoC }
    ],
    observacoes: 'Aquecer de 5 a 10 minutos antes de iniciar o treino. Caso algum aparelho esteja ocupado ou indisponível, utilize uma das variações/substitutos indicados abaixo de cada exercício.'
  };
}
