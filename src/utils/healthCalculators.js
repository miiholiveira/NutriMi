/**
 * Calculadora de Saúde — NutriMi
 * Realiza os cálculos de Idade, IMC, Peso Ideal e TMB (Mifflin-St Jeor) em tempo real
 */

export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 30; // valor padrão para estimativa se não informado
  const hoje = new Date();
  const nasc = new Date(dataNascimento);
  if (isNaN(nasc.getTime())) return 30;

  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade >= 0 ? idade : 30;
}

/**
 * Classificação da Faixa Etária
 * - Criança: 0 a 12 anos
 * - Adolescente: 13 a 17 anos
 * - Adulto: 18 a 59 anos
 * - Idoso: 60+ anos
 */
export function obterClassificacaoEtaria(idade) {
  const numIdade = typeof idade === 'number' ? idade : parseInt(idade, 10);
  if (isNaN(numIdade)) {
    return {
      tipo: 'adulto',
      label: 'Adulto',
      faixa: '18 a 59 anos',
      icone: '🧑',
      badgeCor: 'rgba(59, 130, 246, 0.15)',
      badgeBorder: 'rgba(59, 130, 246, 0.3)',
      badgeTexto: '#60a5fa'
    };
  }

  if (numIdade <= 12) {
    return {
      tipo: 'crianca',
      label: 'Criança / Infantil',
      faixa: '0 a 12 anos',
      icone: '🧒',
      badgeCor: 'rgba(234, 179, 8, 0.15)',
      badgeBorder: 'rgba(234, 179, 8, 0.35)',
      badgeTexto: '#facc15'
    };
  }

  if (numIdade <= 17) {
    return {
      tipo: 'adolescente',
      label: 'Adolescente / Jovem',
      faixa: '13 a 17 anos',
      icone: '👦',
      badgeCor: 'rgba(168, 85, 247, 0.15)',
      badgeBorder: 'rgba(168, 85, 247, 0.35)',
      badgeTexto: '#c084fc'
    };
  }

  if (numIdade >= 60) {
    return {
      tipo: 'idoso',
      label: 'Melhor Idade / Idoso',
      faixa: '60+ anos',
      icone: '🧓',
      badgeCor: 'rgba(16, 185, 129, 0.15)',
      badgeBorder: 'rgba(16, 185, 129, 0.35)',
      badgeTexto: '#34d399'
    };
  }

  return {
    tipo: 'adulto',
    label: 'Adulto',
    faixa: '18 a 59 anos',
    icone: '🧑',
    badgeCor: 'rgba(59, 130, 246, 0.15)',
    badgeBorder: 'rgba(59, 130, 246, 0.3)',
    badgeTexto: '#60a5fa'
  };
}

export function calcularIMC(pesoKg, alturaCmOrM) {
  const peso = parseFloat(pesoKg);
  let altura = parseFloat(alturaCmOrM);

  if (!peso || !altura || peso <= 0 || altura <= 0) {
    return null;
  }

  // Converte cm para metros se necessário
  if (altura > 3) {
    altura = altura / 100;
  }

  const imc = peso / (altura * altura);
  const imcFormatado = imc.toFixed(1);
  const numericImc = parseFloat(imcFormatado);

  let classificacao = '';
  let cor = '';
  let alerta = false;
  let nivelAlerta = 'normal';

  if (numericImc < 18.5) {
    classificacao = 'Abaixo do Peso';
    cor = '#f59e0b'; // Amarelo/Laranja
    alerta = false;
  } else if (numericImc <= 24.9) {
    classificacao = 'Peso Ideal / Normal (Eutrofia)';
    cor = '#10b981'; // Verde Destaque
    alerta = false;
  } else if (numericImc <= 29.9) {
    classificacao = 'Sobrepeso — Alerta de Risco Cardíaco';
    cor = '#f97316'; // Laranja/Vermelho Claro
    alerta = true;
    nivelAlerta = 'alerta';
  } else if (numericImc <= 34.9) {
    classificacao = 'Obesidade Grau I — Risco Moderado';
    cor = '#ef4444'; // Vermelho
    alerta = true;
    nivelAlerta = 'perigo';
  } else if (numericImc <= 39.9) {
    classificacao = 'Obesidade Grau II — Severa (Risco Alto)';
    cor = '#be123c'; // Vermelho Escuro
    alerta = true;
    nivelAlerta = 'perigo-alto';
  } else {
    classificacao = 'Obesidade Grau III — Mórbida (Risco Extremo)';
    cor = '#881337'; // Vermelho Forte / Alerta Máximo
    alerta = true;
    nivelAlerta = 'perigo-maximo';
  }

  return {
    valor: imcFormatado,
    numeric: numericImc,
    classificacao,
    cor,
    alerta,
    nivelAlerta
  };
}

export function calcularPesoIdeal(alturaCmOrM, sexo = 'Feminino') {
  let altura = parseFloat(alturaCmOrM);
  if (!altura || altura <= 0) return null;

  let alturaCm = altura <= 3 ? altura * 100 : altura;
  let alturaM = altura <= 3 ? altura : altura / 100;

  // Faixa de IMC eutrófico (18.5 a 24.9 kg/m²)
  const minPeso = (18.5 * alturaM * alturaM).toFixed(1);
  const maxPeso = (24.9 * alturaM * alturaM).toFixed(1);

  // Fórmula de Devine
  let pesoDevine = 0;
  const isMasculino = String(sexo).toLowerCase().includes('masc');

  if (alturaCm >= 152.4) {
    const polegadasAcima5Pes = (alturaCm - 152.4) / 2.54;
    if (isMasculino) {
      pesoDevine = 50 + 2.3 * polegadasAcima5Pes;
    } else {
      pesoDevine = 45.5 + 2.3 * polegadasAcima5Pes;
    }
  } else {
    pesoDevine = isMasculino ? 50 : 45.5;
  }

  return {
    minPeso: parseFloat(minPeso),
    maxPeso: parseFloat(maxPeso),
    estimadoDevine: parseFloat(pesoDevine.toFixed(1)),
    faixaFormatada: `${minPeso} kg – ${maxPeso} kg`
  };
}

/**
 * Cálculo da TMB (Mifflin-St Jeor) e Gasto Energético Total (TDEE / GET)
 */
export function calcularTMB(pesoKg, alturaCmOrM, idade = 30, sexo = 'Feminino', nivelAtividade = 'Leve') {
  const peso = parseFloat(pesoKg);
  let altura = parseFloat(alturaCmOrM);

  if (!peso || !altura || peso <= 0 || altura <= 0) return null;
  const alturaCm = altura <= 3 ? altura * 100 : altura;
  const isMasculino = String(sexo).toLowerCase().includes('masc');

  // Fórmula de Mifflin-St Jeor
  let tmb = isMasculino
    ? (10 * peso) + (6.25 * alturaCm) - (5 * idade) + 5
    : (10 * peso) + (6.25 * alturaCm) - (5 * idade) - 161;

  tmb = Math.round(tmb);

  // Fator de Atividade Física
  let fator = 1.375; // Leve
  const niv = String(nivelAtividade).toLowerCase();
  if (niv.includes('sedent')) fator = 1.2;
  else if (niv.includes('moderat')) fator = 1.55;
  else if (niv.includes('intens')) fator = 1.725;

  const tdee = Math.round(tmb * fator);

  return {
    tmb,
    tdee,
    fator
  };
}

/**
 * Cálculo do Consumo Hídrico Diário Ideal
 * Base clínica recomendada: 35ml por kg de peso corporal
 */
export function calcularConsumoAgua(pesoKg, nivelAtividade = 'Leve') {
  const peso = parseFloat(pesoKg) || 70;
  
  let mlPorKg = 35;
  const niv = String(nivelAtividade).toLowerCase();
  if (niv.includes('intens') || niv.includes('alto')) {
    mlPorKg = 40;
  } else if (niv.includes('moderat')) {
    mlPorKg = 38;
  }

  const mlTotal = Math.round(peso * mlPorKg);
  const litrosTotal = (mlTotal / 1000).toFixed(1);
  const copos250ml = Math.round(mlTotal / 250);
  const garrafas500ml = (mlTotal / 500).toFixed(1);

  return {
    mlTotal,
    litrosTotal: parseFloat(litrosTotal),
    litrosFormatado: `${litrosTotal} L`,
    copos250ml,
    garrafas500ml,
    mlPorKg,
    recomendacao: `${litrosTotal}L por dia (~${mlTotal.toLocaleString('pt-BR')} ml)`
  };
}

