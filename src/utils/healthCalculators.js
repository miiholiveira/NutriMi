/**
 * Calculadora de Saúde — NutriMi
 * Realiza os cálculos de IMC e Peso Ideal em tempo real
 */

export function calcularIMC(pesoKg, alturaCmOrM) {
  const peso = parseFloat(pesoKg);
  let altura = parseFloat(alturaCmOrM);

  if (!peso || !altura || peso <= 0 || altura <= 0) {
    return null;
  }

  // Se a altura for informada em cm (ex: 175), converte para metros (1.75)
  if (altura > 3) {
    altura = altura / 100;
  }

  const imc = peso / (altura * altura);
  const imcFormatado = imc.toFixed(1);

  let classificacao = '';
  let cor = '';

  if (imc < 18.5) {
    classificacao = 'Abaixo do peso';
    cor = '#3b82f6'; // azul
  } else if (imc <= 24.9) {
    classificacao = 'Peso normal (Eutrofia)';
    cor = '#10b981'; // verde
  } else if (imc <= 29.9) {
    classificacao = 'Sobrepeso';
    cor = '#f59e0b'; // amarelo
  } else if (imc <= 34.9) {
    classificacao = 'Obesidade Grau I';
    cor = '#f97316'; // laranja
  } else if (imc <= 39.9) {
    classificacao = 'Obesidade Grau II';
    cor = '#ef4444'; // vermelho
  } else {
    classificacao = 'Obesidade Grau III (Mórbida)';
    cor = '#881337'; // bordô escuro
  }

  return {
    valor: imcFormatado,
    numeric: parseFloat(imcFormatado),
    classificacao,
    cor
  };
}

export function calcularPesoIdeal(alturaCmOrM, sexo = 'Feminino') {
  let altura = parseFloat(alturaCmOrM);
  if (!altura || altura <= 0) return null;

  let alturaCm = altura;
  let alturaM = altura;

  if (altura <= 3) {
    alturaCm = altura * 100;
  } else {
    alturaM = altura / 100;
  }

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
