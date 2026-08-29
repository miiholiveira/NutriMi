import { estimarCaloriasOpcao } from './dietGenerator';
import { calcularIdade, calcularTMB } from './healthCalculators';

/**
 * Converte a resposta estruturada do Gemini AI ({ plano_semanal: [...] })
 * para o formato completo dietPlan consumido pela aplicação NutriMi.
 */
export function converterPlanoIAparaDietPlan(planoIASemanal, paciente) {
  const peso = parseFloat(paciente?.peso_inicial || 70);
  const altura = parseFloat(paciente?.altura || 1.70);
  const sexo = paciente?.sexo || 'Feminino';
  const dataNasc = paciente?.data_nascimento;
  const idade = dataNasc ? calcularIdade(dataNasc) : 30;
  const nivelAtividade = paciente?.nivel_atividade || 'Leve';
  const objetivos = Array.isArray(paciente?.objetivos) ? paciente.objetivos : ['Reeducação Alimentar'];
  const restricoes = Array.isArray(paciente?.restricoes_alimentares) ? paciente.restricoes_alimentares : [];
  const alergias = Array.isArray(paciente?.alergias) ? paciente.alergias : [];

  const isEmagrecimento = objetivos.includes('Emagrecimento');
  const isHipertrofia = objetivos.includes('Hipertrofia');
  const isDefinicao = objetivos.includes('Definição') || objetivos.includes('Desempenho Esportivo');

  // Cálculo da TMB (Mifflin-St Jeor) e TDEE
  const tmbRes = calcularTMB(peso, altura, idade, sexo, nivelAtividade) || { tmb: 1500, tdee: 2000 };
  const tdee = tmbRes.tdee;

  let metaCalorias = tdee;
  if (isEmagrecimento) {
    metaCalorias = Math.round(tdee - 500);
    if (metaCalorias < 1200) metaCalorias = 1200;
  } else if (isHipertrofia) {
    metaCalorias = Math.round(tdee + 350);
  } else if (isDefinicao) {
    metaCalorias = Math.round(tdee - 300);
  }

  // Distribuição de Macronutrientes
  const protGperKg = isHipertrofia ? 2.2 : (isEmagrecimento ? 2.0 : 1.8);
  const fatGperKg = 0.9;

  const protGrams = Math.round(peso * protGperKg);
  const fatGrams = Math.round(peso * fatGperKg);
  const protKcal = protGrams * 4;
  const fatKcal = fatGrams * 9;

  let carboKcal = metaCalorias - protKcal - fatKcal;
  if (carboKcal < 400) carboKcal = 400;
  const carboGrams = Math.round(carboKcal / 4);

  const carboPct = Math.round((carboKcal / metaCalorias) * 100);
  const protPct = Math.round((protKcal / metaCalorias) * 100);
  const fatPct = Math.round((fatKcal / metaCalorias) * 100);

  // Calorias estimadas por refeição
  const kcalCafe = Math.round(metaCalorias * 0.22);
  const kcalLancheM = Math.round(metaCalorias * 0.08);
  const kcalAlmoco = Math.round(metaCalorias * 0.33);
  const kcalLancheT = Math.round(metaCalorias * 0.12);
  const kcalJantar = Math.round(metaCalorias * 0.25);

  const diasPadrao = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  // Mapear dias do plano da IA
  const dias = diasPadrao.map((diaNome, diaIdx) => {
    // Localizar no plano gerado pela IA
    const diaEncontrado = planoIASemanal.find(d => {
      const nomeLimpo = String(d.dia || '').toLowerCase();
      const refLimpa = diaNome.toLowerCase();
      return nomeLimpo.includes(refLimpa) || refLimpa.includes(nomeLimpo);
    }) || planoIASemanal[diaIdx] || {};

    const refsIA = diaEncontrado.refeicoes || {};

    function extrair5Opcoes(listaOpcoes, refBaseKcal, placeholderNome) {
      const arr = Array.isArray(listaOpcoes) ? [...listaOpcoes] : [];
      // Garantir estritamente 5 opções por refeição
      while (arr.length < 5) {
        arr.push(`Opção ${arr.length + 1}: ${placeholderNome} leve e nutritivo.`);
      }
      return arr.slice(0, 5).map(texto => ({
        texto: String(texto).trim(),
        calorias: estimarCaloriasOpcao(String(texto), refBaseKcal)
      }));
    }

    return {
      dia: diaNome,
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: extrair5Opcoes(refsIA.cafe_da_manha, kcalCafe, 'Café da Manhã balanceado')
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: extrair5Opcoes(refsIA.lanche_manha, kcalLancheM, 'Fruta com sementes')
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: extrair5Opcoes(refsIA.almoco, kcalAlmoco, 'Prato completo com vegetais e proteína')
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: extrair5Opcoes(refsIA.lanche_tarde, kcalLancheT, 'Lanche proteico intermediário')
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: extrair5Opcoes(refsIA.jantar, kcalJantar, 'Jantar leve e nutritivo')
        }
      ]
    };
  });

  return {
    tipoGeracao: 'ia',
    geradoEm: new Date().toISOString(),
    resumo: {
      metaCalorias,
      tmb: tmbRes.tmb,
      tdee,
      consumoAgua: {
        mlTotal: Math.round(peso * 35),
        litrosFormatado: ((peso * 35) / 1000).toFixed(1) + ' L/dia'
      },
      macronutrientes: {
        carboidratos: { gramas: carboGrams, calorias: carboKcal, percentual: carboPct },
        proteinas: { gramas: protGrams, calorias: protKcal, percentual: protPct },
        gorduras: { gramas: fatGrams, calorias: fatKcal, percentual: fatPct }
      },
      orientacoesGerais: [
        'Plano gerado com Inteligência Artificial (Google Gemini) adaptado aos seus objetivos e preferências.',
        restricoes.length > 0 ? `Restrições rigorosamente respeitadas: ${restricoes.join(', ')}.` : 'Alimentação equilibrada e variada.',
        alergias.length > 0 ? `Alergias excluídas: ${alergias.join(', ')}.` : 'Segurança alimentar garantida.',
        `Meta hídrica de ${((peso * 35) / 1000).toFixed(1)} L de água ao longo do dia para otimizar o metabolismo.`,
        'Cada refeição possui 5 opções equivalentes para maior flexibilidade e adesão ao plano.'
      ]
    },
    dias
  };
}
