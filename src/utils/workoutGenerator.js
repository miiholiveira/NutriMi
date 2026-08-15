/**
 * Gerador Dinâmico de Treinos Adaptado ao Perfil do Paciente
 * NutriMi — Nutrição Inteligente
 */

import { calcularIdade } from './healthCalculators';

export function gerarPlanoTreinos(paciente) {
  const idade = calcularIdade(paciente?.data_nascimento);
  const sexo = paciente?.sexo || 'Feminino';
  const nivelAtividade = paciente?.nivel_atividade || 'Leve';
  const objetivos = paciente?.objetivos || ['Saúde & Disposição'];

  const isSenior = idade >= 60;
  const isJovem = idade < 18;
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isEmagrecimento = objetivos.includes('Emagrecimento');
  const isIniciante = String(nivelAtividade).toLowerCase().includes('sedent') || String(nivelAtividade).toLowerCase().includes('leve');

  let divisao = '';
  let treinoA = [];
  let treinoB = [];
  let treinoC = [];

  if (isSenior) {
    divisao = 'Full Body & Fortalecimento Articular (Idosos / 3x na semana)';
    treinoA = [
      { exercicio: 'Senta e Levanta da Cadeira com Apoio', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Elevação Frontal de Braços com Halteres Leves', series: 3, repeticoes: '12', descanso: '45s' },
      { exercicio: 'Remada Sentado com Elástico / Pulley', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Caminhada Moderada na Esteira / Plana', series: 1, repeticoes: '20 minutos', descanso: '—' }
    ];
    treinoB = treinoA;
    treinoC = treinoA;
  } else if (isIniciante) {
    divisao = 'ABC para Iniciantes (Adaptação Neuromuscular)';
    treinoA = [
      { exercicio: 'Leg Press Horizontal', series: 3, repeticoes: '12-15', descanso: '60s' },
      { exercicio: 'Supino Vertical na Máquina', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Puxada Frontal no Pulley', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Prancha Abdominal', series: 3, repeticoes: '30 segundos', descanso: '45s' }
    ];
    treinoB = [
      { exercicio: 'Agachamento Sumô no Crossover', series: 3, repeticoes: '12-15', descanso: '60s' },
      { exercicio: 'Desenvolvimento na Máquina', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Rosca Direta com Halteres', series: 3, repeticoes: '12', descanso: '45s' },
      { exercicio: 'Tríceps Pulley com Corda', series: 3, repeticoes: '12', descanso: '45s' }
    ];
    treinoC = treinoA;
  } else if (isHipertrofia) {
    divisao = 'Push / Pull / Legs (Hipertrofia Avançada 4x a 6x)';
    treinoA = [
      { exercicio: 'Supino Reto com Barra', series: 4, repeticoes: '8-10', descanso: '90s' },
      { exercicio: 'Desenvolvimento Militar com Halteres', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Supino Inclinado com Halteres', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Tríceps Testa com Barra W', series: 3, repeticoes: '10-12', descanso: '60s' }
    ];
    treinoB = [
      { exercicio: 'Puxada Aberta no Pulley', series: 4, repeticoes: '8-12', descanso: '90s' },
      { exercicio: 'Remada Curvada com Barra', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Rosca Direta com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Crucifixo Inverso no Peck Deck', series: 3, repeticoes: '12-15', descanso: '45s' }
    ];
    treinoC = [
      { exercicio: 'Agachamento Livre com Barra', series: 4, repeticoes: '8-10', descanso: '90s' },
      { exercicio: 'Stiff com Barra / Halteres', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Leg Press 45º', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Elevação Pélvica com Carga', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Gêmeos Sentado (Panturrilha)', series: 4, repeticoes: '15-20', descanso: '45s' }
    ];
  } else {
    // Emagrecimento / Definição
    divisao = 'ABC + HIIT (Definição & Gasto Calórico)';
    treinoA = [
      { exercicio: 'Agachamento Livre com Kettlebell', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Afundo Passada', series: 3, repeticoes: '12 por perna', descanso: '45s' },
      { exercicio: 'Cadeira Extensora', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Cardio: Esteira Inclinada', series: 1, repeticoes: '25 minutos', descanso: '—' }
    ];
    treinoB = [
      { exercicio: 'Remada Baixa Triângulo', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Supino Reto na Máquina', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Abdominal Infra na Prancha', series: 4, repeticoes: '20', descanso: '30s' },
      { exercicio: 'Cardio: Transport / Elíptico', series: 1, repeticoes: '25 minutos', descanso: '—' }
    ];
    treinoC = [
      { exercicio: 'Leg Press 45º Drop-set', series: 4, repeticoes: '15+10', descanso: '45s' },
      { exercicio: 'Mesa Flexora', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Cardio HIIT na Esteira', series: 1, repeticoes: '20min (1min tiro / 1min caminha)', descanso: '—' }
    ];
  }

  return {
    divisao,
    rotina: [
      { nome: 'Treino A — Foco Principal', exercicios: treinoA },
      { nome: 'Treino B — Foco Complementar', exercicios: treinoB },
      { nome: 'Treino C — Foco Membros Inferiores / Cardio', exercicios: treinoC }
    ],
    observacoes: 'Aquecer de 5 a 10 minutos antes de iniciar o treino. Respeitar o intervalo de descanso entre as séries.'
  };
}
