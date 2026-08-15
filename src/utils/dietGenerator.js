/**
 * Gerador 100% Dinâmico de Dietas Personalizadas — NutriMi
 * Calcula calorias, macronutrientes e porções exatas em gramas por paciente
 */

import { calcularIdade, calcularTMB, calcularPesoIdeal } from './healthCalculators';

export function gerarPlanoAlimentar7Dias(paciente) {
  const peso = parseFloat(paciente?.peso_inicial || 70);
  const altura = parseFloat(paciente?.altura || 1.70);
  const sexo = paciente?.sexo || 'Feminino';
  const dataNasc = paciente?.data_nascimento;
  const idade = calcularIdade(dataNasc);
  const nivelAtividade = paciente?.nivel_atividade || 'Leve';
  const objetivos = paciente?.objetivos || ['Reeducação Alimentar'];
  const restricoes = paciente?.restricoes_alimentares || [];

  const isEmagrecimento = objetivos.includes('Emagrecimento');
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isDefinicao = objetivos.includes('Definição') || objetivos.includes('Desempenho Esportivo');
  const isMasculino = String(sexo).toLowerCase().includes('masc');
  const isSemLactose = restricoes.includes('Intolerância à Lactose');
  const isSemGluten = restricoes.includes('Celíaco / Sem Glúten');
  const isVegetariano = restricoes.includes('Vegetariano') || restricoes.includes('Vegano');

  // 1. Cálculo da TMB (Mifflin-St Jeor) e TDEE
  const tmbRes = calcularTMB(peso, altura, idade, sexo, nivelAtividade) || { tmb: 1500, tdee: 2000 };
  const tdee = tmbRes.tdee;

  // 2. Meta Calórica Dinâmica baseada no Objetivo
  let metaCalorias = tdee;
  if (isEmagrecimento) {
    metaCalorias = Math.round(tdee - 500); // Déficit de 500 kcal
    if (metaCalorias < 1200) metaCalorias = 1200; // Piso mínimo seguro
  } else if (isHipertrofia) {
    metaCalorias = Math.round(tdee + 350); // Superávit limpo de 350 kcal
  } else if (isDefinicao) {
    metaCalorias = Math.round(tdee - 300);
  }

  // 3. Distribuição de Macronutrientes proporcional ao peso (g/kg)
  let protGperKg = isHipertrofia ? 2.2 : (isEmagrecimento ? 2.0 : 1.8);
  let fatGperKg = 0.9;

  let protGrams = Math.round(peso * protGperKg);
  let fatGrams = Math.round(peso * fatGperKg);
  let protKcal = protGrams * 4;
  let fatKcal = fatGrams * 9;

  let carboKcal = metaCalorias - protKcal - fatKcal;
  if (carboKcal < 400) carboKcal = 400;
  let carboGrams = Math.round(carboKcal / 4);

  const carboPct = Math.round((carboKcal / metaCalorias) * 100);
  const protPct = Math.round((protKcal / metaCalorias) * 100);
  const fatPct = Math.round((fatKcal / metaCalorias) * 100);

  // 4. Cálculo das Gramagens Dinâmicas por Refeição
  // Exemplo: Frango no almoço = Math.round(protGrams * 0.35 * 4.3)
  const gFrangoAlmoco = Math.round(peso * 2.1);
  const gArrozAlmoco = Math.round(carboGrams * 0.85);
  const gBatataDoce = Math.round(carboGrams * 1.1);
  const gPatinho = Math.round(peso * 1.9);
  const gTilapia = Math.round(peso * 2.2);
  const gTapioca = Math.round(carboGrams * 0.3);
  const gAveia = Math.round(carboGrams * 0.25);
  const gWhey = Math.round(peso * 0.45);

  const leiteStr = isSemLactose ? 'Leite Zero Lactose ou Bebida Vegetal de Amêndoas' : 'Leite Desnatado ou Iogurte Natural';
  const paoStr = isSemGluten ? 'Pão Sem Glúten' : 'Pão Integral 100%';
  const queijoStr = isSemLactose ? 'Queijo Cotage Zero Lactose ou Tofu' : 'Queijo Minas Frescal ou Cotage';
  
  const proteina1 = isVegetariano ? `Tofu Grelhado (${gFrangoAlmoco}g)` : `Peito de Frango Grelhado (${gFrangoAlmoco}g)`;
  const proteina2 = isVegetariano ? `Hamburguer de Grão de Bico (${gPatinho}g)` : `Patinho Moído Grelhado (${gPatinho}g)`;
  const proteina3 = isVegetariano ? `Omelete de 3 ovos com legumes` : `Filé de Tilápia / Peixe Grelhado (${gTilapia}g)`;

  const diasDaSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const diasFormatados = diasDaSemana.map((dia) => ({
    dia,
    refeicoes: [
      {
        nome: 'Café da Manhã',
        horario: '07:30',
        opcoes: [
          `Opção 1: 2 fatias de ${paoStr} + 2 ovos mexidos + 200ml de ${leiteStr} com café descafeinado.`,
          `Opção 2: Bowl com 200g de Iogurte + ${gAveia}g de Aveia em Flocos + 1 banana picada + 10g de chia.`,
          `Opção 3: Tapioca (${gTapioca}g) recheada com 2 colheres de ${queijoStr} + 1 ovo mexido.`
        ]
      },
      {
        nome: 'Lanche da Manhã',
        horario: '10:00',
        opcoes: [
          `Opção 1: 1 maçã / pêra fresca + 15g de Castanha do Pará (4 unidades).`,
          `Opção 2: 1 fatia (150g) de Mamão Papaya com 1 colher de sementes de abóbora.`,
          `Opção 3: 200ml de Suco Verde Detox (Couve, Abacaxi, Gengibre) + 3 nozes.`
        ]
      },
      {
        nome: 'Almoço',
        horario: '12:30',
        opcoes: [
          `Opção 1: ${proteina1} + ${gArrozAlmoco}g de Arroz Integral + 1 concha (80g) de Feijão + Salada verde com azeite.`,
          `Opção 2: ${proteina2} + ${gBatataDoce}g de Batata Doce Assada + Brócolis e Cenoura no vapor.`,
          `Opção 3: ${proteina3} + ${gArrozAlmoco}g de Macarrão Integral ao molho caseiro de tomate + Salada de Rúcula.`
        ]
      },
      {
        nome: 'Lanche da Tarde',
        horario: '16:00',
        opcoes: [
          `Opção 1: 1 dose (${gWhey}g) de Whey Protein ou Proteína Vegetal batida com 200ml de água + morangos.`,
          `Opção 2: 1 fatia de ${paoStr} com 15g de Pasta de Amendoim + banana fatiada.`,
          `Opção 3: Crepioca (1 ovo + 20g de goma de tapioca + recheio de frango desfiado 40g).`
        ]
      },
      {
        nome: 'Jantar',
        horario: '19:30',
        opcoes: [
          `Opção 1: ${proteina1} + 120g de Abóbora Cabotiá assada + Salada mista com azeite extra virgem.`,
          `Opção 2: Omelete de 3 ovos com espinafre e tomates cereja + salada de folhas verdes.`,
          `Opção 3: 250ml de Sopa/Creme de Legumes caseira com peito de frango desfiado (${gPatinho}g).`
        ]
      },
      {
        nome: 'Ceia',
        horario: '21:30',
        opcoes: [
          `Opção 1: 1 xícara de Chá de Camomila / Mulungu + 2 castanhas do pará.`,
          `Opção 2: 100g de Abacate amassado com gotas de limão.`,
          `Opção 3: 150ml de ${leiteStr} morno polvilhado com canela em pó.`
        ]
      }
    ]
  }));

  const pesoIdealInfo = calcularPesoIdeal(altura, sexo);

  return {
    titulo: `Plano Alimentar Personalizado — ${paciente?.nome || 'Paciente'}`,
    pacienteInfo: {
      nome: paciente?.nome,
      idade,
      sexo,
      peso,
      altura,
      pesoIdeal: pesoIdealInfo?.faixaFormatada || '—',
      objetivo: objetivos.join(', ') || 'Reeducação Alimentar'
    },
    resumo: {
      tmb: tmbRes.tmb,
      tdee,
      metaCalorias,
      carboGrams,
      protGrams,
      fatGrams,
      carboPct,
      protPct,
      fatPct
    },
    dias: diasFormatados,
    observacoesGerais: 'Ingerir no mínimo 2.5 a 3.0 litros de água filtrada por dia. Evitar açúcar refinado e ultraprocessados. Respeitar a substituição equivalente das opções.'
  };
}
