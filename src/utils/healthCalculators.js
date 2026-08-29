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

/**
 * Classificação Clínica do Percentual de Gordura (ACSM / Jackson & Pollock)
 */
export function classificarPercentualGordura(percentual, sexo = 'Feminino') {
  const p = parseFloat(percentual);
  if (isNaN(p) || p <= 0) return null;

  const isFeminino = String(sexo).toLowerCase().startsWith('f');

  if (isFeminino) {
    if (p < 14) return { label: 'Gordura Essencial', cor: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)', badgeBorder: 'rgba(56, 189, 248, 0.35)', icone: '⚡' };
    if (p <= 20) return { label: 'Atleta / Excelente', cor: '#34d399', badgeBg: 'rgba(52, 211, 153, 0.15)', badgeBorder: 'rgba(52, 211, 153, 0.35)', icone: '🏆' };
    if (p <= 24) return { label: 'Fitness / Bom', cor: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)', badgeBorder: 'rgba(16, 185, 129, 0.35)', icone: '✨' };
    if (p <= 31) return { label: 'Ideal / Aceitável', cor: '#60a5fa', badgeBg: 'rgba(96, 165, 250, 0.15)', badgeBorder: 'rgba(96, 165, 250, 0.35)', icone: '👍' };
    return { label: 'Elevado / Atenção', cor: '#f43f5e', badgeBg: 'rgba(244, 63, 94, 0.15)', badgeBorder: 'rgba(244, 63, 94, 0.35)', icone: '⚠️' };
  } else {
    // Masculino
    if (p < 6) return { label: 'Gordura Essencial', cor: '#38bdf8', badgeBg: 'rgba(56, 189, 248, 0.15)', badgeBorder: 'rgba(56, 189, 248, 0.35)', icone: '⚡' };
    if (p <= 13) return { label: 'Atleta / Excelente', cor: '#34d399', badgeBg: 'rgba(52, 211, 153, 0.15)', badgeBorder: 'rgba(52, 211, 153, 0.35)', icone: '🏆' };
    if (p <= 17) return { label: 'Fitness / Bom', cor: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)', badgeBorder: 'rgba(16, 185, 129, 0.35)', icone: '✨' };
    if (p <= 24) return { label: 'Ideal / Aceitável', cor: '#60a5fa', badgeBg: 'rgba(96, 165, 250, 0.15)', badgeBorder: 'rgba(96, 165, 250, 0.35)', icone: '👍' };
    return { label: 'Elevado / Atenção', cor: '#f43f5e', badgeBg: 'rgba(244, 63, 94, 0.15)', badgeBorder: 'rgba(244, 63, 94, 0.35)', icone: '⚠️' };
  }
}

/**
 * Calcula o Percentual de Gordura Corporal (%)
 * Combina o padrão antropométrico U.S. Navy (Hodgdon-Beckett & Siri)
 * com inclusão das circunferências de Busto/Tórax, Cintura e Quadril.
 */
export function calcularPercentualGordura({
  sexo = 'Feminino',
  altura,  // cm ou m
  peso,    // kg
  cintura, // cm
  quadril, // cm
  busto,   // cm (tórax/busto)
  pescoco, // cm
  idade = 30
}) {
  const pPeso = parseFloat(peso);
  let pAltura = parseFloat(altura);
  const pCintura = parseFloat(cintura);
  const pQuadril = parseFloat(quadril);
  const pBusto = parseFloat(busto);
  let pPescoco = parseFloat(pescoco);
  const pIdade = parseInt(idade, 10) || 30;

  if (!pAltura || pAltura <= 0) return null;

  // Normaliza altura para centímetros
  const alturaCm = pAltura > 3 ? pAltura : pAltura * 100;
  const alturaM = alturaCm / 100;
  const isFeminino = String(sexo).toLowerCase().startsWith('f');

  // 1. Método Antropométrico baseado em Circunferências (U.S. Navy / Siri + Busto)
  if (pCintura && pCintura > 30) {
    // Estimativa anatômica do pescoço caso não informado diretamente
    if (!pPescoco || pPescoco <= 0) {
      if (pBusto && pBusto > 40) {
        pPescoco = isFeminino ? (pBusto * 0.36) : (pBusto * 0.40);
      } else {
        pPescoco = isFeminino ? (alturaCm * 0.22) : (alturaCm * 0.23);
      }
    }

    if (isFeminino) {
      // Para mulheres: Cintura, Quadril e Pescoço (com calibração de Busto)
      const quad = pQuadril && pQuadril > 30 ? pQuadril : (pCintura * 1.25);
      const circFator = (pCintura + quad) - pPescoco;

      if (circFator > 0) {
        // Densidade corporal de Siri / U.S. Navy
        const densidade = 1.29579 - (0.35004 * Math.log10(circFator)) + (0.22100 * Math.log10(alturaCm));
        let bf = (495 / densidade) - 450;

        // Calibração sutil com Busto/Tórax se preenchido
        if (pBusto && pBusto > 50) {
          const ratioBusto = pBusto / quad;
          bf += (ratioBusto - 0.92) * 2;
        }

        bf = Math.max(8, Math.min(58, bf));
        const bfFinal = parseFloat(bf.toFixed(1));
        const classif = classificarPercentualGordura(bfFinal, sexo);

        return {
          percentual: bfFinal,
          classificacao: classif?.label || 'Ideal',
          classifObj: classif,
          metodo: 'Antropometria (Cintura, Quadril, Busto e Altura)',
          massaGordaKg: pPeso ? parseFloat(((pPeso * bfFinal) / 100).toFixed(1)) : null,
          massaMagraKg: pPeso ? parseFloat((pPeso - (pPeso * bfFinal) / 100).toFixed(1)) : null
        };
      }
    } else {
      // Para homens: Cintura e Pescoço (com calibração de Busto/Tórax)
      const circFator = pCintura - pPescoco;

      if (circFator > 0) {
        const densidade = 1.0324 - (0.19077 * Math.log10(circFator)) + (0.15456 * Math.log10(alturaCm));
        let bf = (495 / densidade) - 450;

        if (pBusto && pBusto > 50) {
          const ratioTorax = pBusto / pCintura;
          if (ratioTorax > 1.15) {
            bf -= (ratioTorax - 1.15) * 3;
          }
        }

        bf = Math.max(4, Math.min(52, bf));
        const bfFinal = parseFloat(bf.toFixed(1));
        const classif = classificarPercentualGordura(bfFinal, sexo);

        return {
          percentual: bfFinal,
          classificacao: classif?.label || 'Ideal',
          classifObj: classif,
          metodo: 'Antropometria (Cintura, Tórax e Altura)',
          massaGordaKg: pPeso ? parseFloat(((pPeso * bfFinal) / 100).toFixed(1)) : null,
          massaMagraKg: pPeso ? parseFloat((pPeso - (pPeso * bfFinal) / 100).toFixed(1)) : null
        };
      }
    }
  }

  // 2. Fallback: Fórmula de Deurenberg (IMC, Idade e Sexo)
  if (pPeso && pPeso > 0) {
    const imc = pPeso / (alturaM * alturaM);
    const sexoValor = isFeminino ? 0 : 1;
    let bf = (1.20 * imc) + (0.23 * pIdade) - (10.8 * sexoValor) - 5.4;
    bf = Math.max(5, Math.min(55, bf));
    const bfFinal = parseFloat(bf.toFixed(1));
    const classif = classificarPercentualGordura(bfFinal, sexo);

    return {
      percentual: bfFinal,
      classificacao: classif?.label || 'Ideal',
      classifObj: classif,
      metodo: 'Estimativa Deurenberg (IMC & Idade)',
      massaGordaKg: parseFloat(((pPeso * bfFinal) / 100).toFixed(1)),
      massaMagraKg: parseFloat((pPeso - (pPeso * bfFinal) / 100).toFixed(1))
    };
  }

  return null;
}


