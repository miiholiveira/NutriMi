/**
 * Gerador Automático de Plano de Treinos
 * NutriMi — Nutrição Inteligente
 */

export function gerarPlanoTreinos(paciente) {
  const objetivos = paciente?.objetivos || ['Saúde & Disposição'];
  const nivel = paciente?.nivel_atividade || 'Leve';
  const sexo = paciente?.sexo || 'Feminino';
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isEmagrecimento = objetivos.includes('Emagrecimento');

  let divisao = 'ABC (3x a 5x por semana)';
  let treinoA = [];
  let treinoB = [];
  let treinoC = [];

  if (isHipertrofia) {
    divisão = 'ABC (Hipertrofia & Força)';
    treinoA = [
      { exercicio: 'Supino Reto com Barra / Halteres', series: 4, repeticoes: '8-12', descanso: '60s' },
      { exercicio: 'Desenvolvimento de Ombros com Halteres', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Tríceps Pulley na Corda', series: 3, repeticoes: '12-15', descanso: '45s' },
      { exercicio: 'Elevação Lateral de Ombros', series: 4, repeticoes: '12-15', descanso: '45s' }
    ];
    treinoB = [
      { exercicio: 'Puxada Frontal no Pulley', series: 4, repeticoes: '8-12', descanso: '60s' },
      { exercicio: 'Remada Curvada com Barra', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Rosca Direta na Barra W', series: 3, repeticoes: '10-12', descanso: '45s' },
      { exercicio: 'Crucifixo Inverso', series: 3, repeticoes: '12-15', descanso: '45s' }
    ];
    treinoC = [
      { exercicio: 'Agachamento Livre / Leg Press 45', series: 4, repeticoes: '8-12', descanso: '90s' },
      { exercicio: 'Cadeira Extensora', series: 3, repeticoes: '12-15', descanso: '60s' },
      { exercicio: 'Mesa / Cadeira Flexora', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Elevação Pélvica', series: 4, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Gêmeos em Pé (Panturrilhas)', series: 4, repeticoes: '15-20', descanso: '45s' }
    ];
  } else if (isEmagrecimento) {
    divisao = 'ABC + Cardio (Queima Calórica & Tônus)';
    treinoA = [
      { exercicio: 'Agachamento Sumô com Kettlebell', series: 4, repeticoes: '12-15', descanso: '45s' },
      { exercicio: 'Afundo Guiado ou Livre', series: 3, repeticoes: '12 por perna', descanso: '45s' },
      { exercicio: 'Stiff com Halteres', series: 3, repeticoes: '12-15', descanso: '45s' },
      { exercicio: 'Cardio: Esteira Inclinada ou Transport', series: 1, repeticoes: '25 minutos', descanso: '—' }
    ];
    treinoB = [
      { exercicio: 'Puxada Alta Aberta', series: 3, repeticoes: '12-15', descanso: '45s' },
      { exercicio: 'Supino Vertical na Máquina', series: 3, repeticoes: '12-15', descanso: '45s' },
      { exercicio: 'Prancha Abdominal Isométrica', series: 3, repeticoes: '45 segundos', descanso: '30s' },
      { exercicio: 'Abdominal Infra na Prancha', series: 3, repeticoes: '15-20', descanso: '30s' }
    ];
    treinoC = [
      { exercicio: 'Leg Press Horizontal', series: 4, repeticoes: '15', descanso: '45s' },
      { exercicio: 'Cadeira Extensora Drop-set', series: 3, repeticoes: '12+10', descanso: '45s' },
      { exercicio: 'Cardio HIIT: Tiros de Corrida na Esteira', series: 1, repeticoes: '20 minutos (1min tiro / 1min caminha)', descanso: '—' }
    ];
  } else {
    divisao = 'Full Body & Condicionamento Geral';
    treinoA = [
      { exercicio: 'Agachamento Livre', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Flexão de Braços / Supino Reto', series: 3, repeticoes: '10-12', descanso: '60s' },
      { exercicio: 'Remada Baixa Triângulo', series: 3, repeticoes: '12', descanso: '60s' },
      { exercicio: 'Caminhada Acelerada / Bike', series: 1, repeticoes: '30 minutos', descanso: '—' }
    ];
    treinoB = treinoA;
    treinoC = treinoA;
  }

  return {
    divisao,
    rotina: [
      { nome: 'Treino A — Membros Inferiores / Peito & Ombros', exercicios: treinoA },
      { nome: 'Treino B — Membros Superiores / Costas & Bíceps', exercicios: treinoB },
      { nome: 'Treino C — Pernas Completo / Glúteos & Core', exercicios: treinoC }
    ],
    observacoes: 'Aquecer 5 a 10 minutos de aeróbico leve antes de cada treino. Manter a execução controlada e priorizar a técnica correta em relação às cargas.'
  };
}
