/**
 * Gerador Automático de Dietas Semanal (7 dias) com 3 Opções por Refeição
 * NutriMi — Nutrição Inteligente
 */

export function gerarPlanoAlimentar7Dias(paciente) {
  const peso = parseFloat(paciente?.peso_inicial || 70);
  const altura = parseFloat(paciente?.altura || 1.70);
  const sexo = paciente?.sexo || 'Feminino';
  const objetivos = paciente?.objetivos || ['Reeducação Alimentar'];
  const restricoes = paciente?.restricoes_alimentares || [];
  const alergias = paciente?.alergias || [];

  const isEmagrecimento = objetivos.includes('Emagrecimento');
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isMasculino = String(sexo).toLowerCase().includes('masc');
  const isSemLactose = restricoes.includes('Intolerância à Lactose');
  const isSemGluten = restricoes.includes('Celíaco / Sem Glúten');
  const isVegetariano = restricoes.includes('Vegetariano') || restricoes.includes('Vegano');

  // Estimativa de TDEE simples
  const alturaCm = altura > 3 ? altura : altura * 100;
  let tdee = isMasculino
    ? 10 * peso + 6.25 * alturaCm - 5 * 30 + 5
    : 10 * peso + 6.25 * alturaCm - 5 * 30 - 161;

  tdee = tdee * 1.35; // Fator de atividade leve

  let metaCalorias = Math.round(tdee);
  if (isEmagrecimento) metaCalorias = Math.round(tdee * 0.8);
  else if (isHipertrofia) metaCalorias = Math.round(tdee * 1.15);

  const carboPct = isEmagrecimento ? 0.4 : (isHipertrofia ? 0.5 : 0.45);
  const protPct = isHipertrofia ? 0.3 : 0.25;
  const fatPct = 1 - carboPct - protPct;

  const carboGrams = Math.round((metaCalorias * carboPct) / 4);
  const protGrams = Math.round((metaCalorias * protPct) / 4);
  const fatGrams = Math.round((metaCalorias * fatPct) / 9);

  const leiteStr = isSemLactose ? 'Leite Zero Lactose ou Bebida Vegetal de Amêndoas' : 'Leite Desnatado ou Iogurte Natural';
  const paoStr = isSemGluten ? 'Pão Sem Glúten ou Tapioca' : 'Pão Integral 100%';
  const queijoStr = isSemLactose ? 'Queijo Cotage Zero Lactose ou Tofu' : 'Queijo Minas Frescal ou Cotage';
  const proteinaAlmoco1 = isVegetariano ? 'Tofu Grelhado (150g) ou Ovos' : 'Peito de Frango Grelhado (140g)';
  const proteinaAlmoco2 = isVegetariano ? 'Hamburguer de Grão de Bico (2 un)' : 'Patinho Moído / Carne Magra (130g)';
  const proteinaAlmoco3 = isVegetariano ? 'Lentilha temperada (1,5 concha) + Ovos' : 'Filé de Tilápia / Peixe Grelhado (150g)';

  const diasDaSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const diasFormatados = diasDaSemana.map((dia, idx) => {
    return {
      dia,
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          opcoes: [
            `Opção 1: 2 fatias de ${paoStr} + 2 ovos mexidos com azeite + 200ml de ${leiteStr} com café.`,
            `Opção 2: 1 bowl de Iogurte (200g) com 30g de Aveia em Flocos + 1 maçã picada + 1 colher de chia.`,
            `Opção 3: Tapioca (40g) recheada com 2 colheres de ${queijoStr} e 1 ovo mexido + 1 xícara de chá verde.`
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          opcoes: [
            `Opção 1: 1 banana nanica + 15g de Castanha do Pará / Amêndoas (4 unidades).`,
            `Opção 2: 1 fatia de mamão papaya com 1 colher de semente de girassol ou gergelim.`,
            `Opção 3: 1 copo (250ml) de suco verde (Couve, Abacaxi, Gengibre) + 3 nozes.`
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          opcoes: [
            `Opção 1: ${proteinaAlmoco1} + 100g de Arroz Integral + 1 concha de Feijão + Salada verde (Alface, Tomate, Pepino) à vontade com azeite extra virgem.`,
            `Opção 2: ${proteinaAlmoco2} + 120g de Batata Doce / Mandioca assada + Brócolis e Cenoura no vapor.`,
            `Opção 3: ${proteinaAlmoco3} + 100g de Macarrão Integral com molho caseiro de tomate + Salada de Rúcula com Laranja.`
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          opcoes: [
            `Opção 1: 1 dose (30g) de Whey Protein / Proteína Vegetal batida com 200ml de água + 1 fruta (Morango/Pêra).`,
            `Opção 2: 1 fatia de ${paoStr} com 1 colher de Pasta de Amendoim integral + morangos fatiados.`,
            `Opção 3: Omelete doce (2 claras + 1 ovo + 1 banana amassada + canela).`
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          opcoes: [
            `Opção 1: 140g de Peito de Frango / Salmão grelhado + 100g de Abóbora Cabotiá assada + Salada mista colorida.`,
            `Opção 2: Omelete de 3 ovos com espinafre, tomate e ralar de abobrinha + salada de folhas.`,
            `Opção 3: Sopa/Creme de Legumes caseira com peito de frango desfiado (250ml) + 1 fatia de pão torrado.`
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          opcoes: [
            `Opção 1: 1 xícara de Chá de Camomila / Mulungu + 2 castanhas.`,
            `Opção 2: 100g de Abacate amassado com gotas de limão e adoçante natural.`,
            `Opção 3: 150ml de ${leiteStr} morno com canela em pó.`
          ]
        }
      ]
    };
  });

  return {
    titulo: `Plano Alimentar Personalizado — ${paciente?.nome || 'Paciente'}`,
    resumo: {
      metaCalorias,
      carboGrams,
      protGrams,
      fatGrams,
      carboPct: Math.round(carboPct * 100),
      protPct: Math.round(protPct * 100),
      fatPct: Math.round(fatPct * 100)
    },
    dias: diasFormatados,
    observacoesGerais: 'Ingerir no mínimo 2.5 litros de água ao longo do dia. Respeitar os horários das refeições e optar por temperos naturais (alho, cebola, ervas finas, limão e azeite de oliva).'
  };
}
