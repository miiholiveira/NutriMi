/**
 * Gerador 100% Dinâmico de Dietas Personalizadas — NutriMi
 * Refeições variadas para os 7 dias da semana com cálculo de calorias por opção
 */

import { calcularIdade, calcularTMB, calcularPesoIdeal, calcularConsumoAgua } from './healthCalculators';
import { analisarOpcaoAlimentar, BANCO_DE_ALIMENTOS } from '../data/tabelaAlimentos';

/**
 * Estima calorias de um texto de opção alimentar consultando o banco de alimentos TACO/TBCA
 */
export function estimarCaloriasOpcao(texto, fallbackKcal = 350) {
  const analise = analisarOpcaoAlimentar(texto, fallbackKcal);
  return analise.calorias;
}


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
  const isSemLactose = restricoes.includes('Intolerância à Lactose');
  const isSemGluten = restricoes.includes('Celíaco / Sem Glúten');
  const isVegetariano = restricoes.includes('Vegetariano') || restricoes.includes('Vegano');

  // 1. Cálculo da TMB (Mifflin-St Jeor) e TDEE
  const tmbRes = calcularTMB(peso, altura, idade, sexo, nivelAtividade) || { tmb: 1500, tdee: 2000 };
  const tdee = tmbRes.tdee;

  // 2. Meta Calórica Diária
  let metaCalorias = tdee;
  if (isEmagrecimento) {
    metaCalorias = Math.round(tdee - 500);
    if (metaCalorias < 1200) metaCalorias = 1200;
  } else if (isHipertrofia) {
    metaCalorias = Math.round(tdee + 350);
  } else if (isDefinicao) {
    metaCalorias = Math.round(tdee - 300);
  }

  // 3. Distribuição de Macronutrientes
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

  // 4. Porções base em gramas
  const gFrango = Math.round(peso * 2.1);
  const gCarne = Math.round(peso * 1.9);
  const gPeixe = Math.round(peso * 2.2);
  const gArroz = Math.round(carboGrams * 0.8);
  const gBatata = Math.round(carboGrams * 1.1);
  const gMandioca = Math.round(carboGrams * 0.75);
  const gTapioca = Math.round(carboGrams * 0.3);
  const gAveia = Math.round(carboGrams * 0.25);
  const gWhey = Math.round(peso * 0.45);

  // Substrings adaptadas a restrições
  const leiteStr = isSemLactose ? 'Leite Zero Lactose ou Bebida Vegetal' : 'Leite Desnatado ou Iogurte Natural';
  const iogurteStr = isSemLactose ? 'Iogurte Zero Lactose ou Vegetal' : 'Iogurte Natural / Grego';
  const paoStr = isSemGluten ? 'Pão Sem Glúten' : 'Pão Integral 100%';
  const queijoStr = isSemLactose ? 'Queijo Cottage Zero Lactose ou Tofu' : 'Queijo Minas Frescal ou Cottage';
  const macarraoStr = isSemGluten ? 'Macarrão de Arroz / Milho' : 'Macarrão Integral';

  // Proteínas adaptadas
  const pFrango = isVegetariano ? `Tofu Grelhado (${gFrango}g)` : `Peito de Frango Grelhado (${gFrango}g)`;
  const pCarne = isVegetariano ? `Hambúrguer de Grão de Bico (${gCarne}g)` : `Patinho Moído Grelhado (${gCarne}g)`;
  const pPeixe = isVegetariano ? `Omelete de 3 ovos com legumes` : `Filé de Tilápia / Peixe Grelhado (${gPeixe}g)`;
  const pSalmao = isVegetariano ? `Mix de Cogumelos Shimeji (${gFrango}g)` : `Filé de Salmão Grelhado (${Math.round(gPeixe * 0.9)}g)`;

  // Calorias por Refeição
  const kcalCafe = Math.round(metaCalorias * 0.22);
  const kcalLancheM = Math.round(metaCalorias * 0.08);
  const kcalAlmoco = Math.round(metaCalorias * 0.33);
  const kcalLancheT = Math.round(metaCalorias * 0.12);
  const kcalJantar = Math.round(metaCalorias * 0.20);
  const kcalCeia = Math.round(metaCalorias * 0.05);

  function createOpt(texto, baseKcal) {
    const estimated = estimarCaloriasOpcao(texto, baseKcal);
    return {
      texto,
      calorias: estimated
    };
  }

  // 5. Cardápio Completo e Diversificado para cada Dia da Semana
  const cardapioSemanal = [
    {
      dia: 'Segunda-feira',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`2 fatias de ${paoStr} + 2 ovos mexidos + 200ml de ${leiteStr} com café.`, kcalCafe),
            createOpt(`Bowl com 200g de ${iogurteStr} + ${gAveia}g de Aveia em Flocos + 1 banana picada + 10g de chia.`, kcalCafe),
            createOpt(`Tapioca (${gTapioca}g) recheada com 2 colheres de ${queijoStr} + 1 ovo mexido.`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`1 maçã fresca + 15g de Castanha do Pará (3 a 4 unidades).`, kcalLancheM),
            createOpt(`1 fatia (150g) de Mamão Papaya com 1 colher de sementes de abóbora.`, kcalLancheM),
            createOpt(`200ml de Suco Verde Detox (Couve, Abacaxi, Gengibre) + 3 nozes.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pFrango} + ${gArroz}g de Arroz Integral + 1 concha (80g) de Feijão + Salada verde com azeite.`, kcalAlmoco),
            createOpt(`${pCarne} + ${gBatata}g de Batata Doce Assada + Brócolis e Cenoura no vapor.`, kcalAlmoco),
            createOpt(`${pPeixe} + ${gArroz}g de ${macarraoStr} ao molho caseiro de tomate + Salada de Rúcula.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`1 dose (${gWhey}g) de Whey Protein batida com 200ml de água + 100g de morangos.`, kcalLancheT),
            createOpt(`1 fatia de ${paoStr} com 15g de Pasta de Amendoim + 1 banana fatiada.`, kcalLancheT),
            createOpt(`Crepioca (1 ovo + 20g de goma de tapioca + 40g de frango desfiado ou tofu).`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`${pFrango} + 120g de Abóbora Cabotiá assada + Salada mista com azeite.`, kcalJantar),
            createOpt(`Omelete de 3 ovos com espinafre, tomate cereja e orégano + salada de folhas.`, kcalJantar),
            createOpt(`250ml de Sopa/Creme caseiro de legumes com ${pFrango}.`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`1 xícara de Chá de Camomila ou Mulungu + 2 castanhas do Pará.`, kcalCeia),
            createOpt(`100g de Abacate amassado com gotas de limão e canela.`, kcalCeia),
            createOpt(`150ml de ${leiteStr} morno com canela em pó.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Terça-feira',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`Omelete de 2 ovos com ${queijoStr} + 1 fatia de ${paoStr} tostada + café sem açúcar.`, kcalCafe),
            createOpt(`Panqueca de banana (${gAveia}g de aveia + 1 ovo + 1 banana amassada + canela).`, kcalCafe),
            createOpt(`Smoothie proteico (${gWhey}g de Whey + 150ml de leite vegetal + 100g de frutas vermelhas).`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`1 pêra fatiada com 15g de amêndoas laminadas.`, kcalLancheM),
            createOpt(`1 pote (150g) de ${iogurteStr} com 1 colher de farelo de aveia.`, kcalLancheM),
            createOpt(`2 kiwis frescos com 1 colher de sementes de girassol.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pCarne} + ${gMandioca}g de Mandioca Cozida + 1 concha de Feijão Carioca + Salada verde.`, kcalAlmoco),
            createOpt(`Sobrecoxa de Frango sem pele (${gFrango}g) + ${gArroz}g de Arroz com Lentilha + Abobrinha.`, kcalAlmoco),
            createOpt(`Risoto fit de Arroz Integral (${gArroz}g) com cubos de peito de frango e cogumelos frescos.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`1 pote de ${iogurteStr} com 5 morangos picados e 1 colher de sementes de linhaça.`, kcalLancheT),
            createOpt(`Sanduíche natural em 1 fatia de ${paoStr} com patê de atum (40g) e cenoura ralada.`, kcalLancheT),
            createOpt(`Salada de frutas (${gAveia}g de aveia em flocos + 1 colher de pasta de amendoim).`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`Escondidinho fit de batata doce (${gBatata}g) com recheio de ${pCarne}.`, kcalJantar),
            createOpt(`Sopa cremosa de abóbora com gengibre e ${pFrango} desfiado.`, kcalJantar),
            createOpt(`Wrap em folha de couve recheado com ${pFrango}, tomate seco e ${queijoStr}.`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`1 xícara de Chá de Erva-Cidreira + 10g de sementes de abóbora tostadas.`, kcalCeia),
            createOpt(`1 kiwi fatiado com canela.`, kcalCeia),
            createOpt(`100g de Iogurte proteico zero lactose.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Quarta-feira',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`Waffle fit de aveia (${gAveia}g de aveia + 1 ovo + baunilha) com morangos frescos.`, kcalCafe),
            createOpt(`Cuscuz de milho (${gTapioca}g) com 2 ovos pochê e 1 fatia de ${queijoStr}.`, kcalCafe),
            createOpt(`2 fatias de ${paoStr} com abacate amassado e 1 ovo cozido fatiado.`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`Mix de 15g de Castanha de Caju com 1 colher de uvas passas.`, kcalLancheM),
            createOpt(`1 taça de salada de frutas com canela e raspas de limão.`, kcalLancheM),
            createOpt(`200ml de Água de Coco natural + 3 nozes inteiras.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pPeixe} ao forno com azeite e ervas finas + ${gArroz}g de Arroz 7 Grãos + Brócolis salteado.`, kcalAlmoco),
            createOpt(`Frango Xadrez fit (${gFrango}g) com pimentões coloridos e castanhas + ${gArroz}g de arroz.`, kcalAlmoco),
            createOpt(`Strogonoff fit de ${pFrango} com creme de ricota light + ${gBatata}g de batata rústica assada.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`Vitamina de 1 banana média + 200ml de ${leiteStr} + ${gAveia}g de aveia em flocos.`, kcalLancheT),
            createOpt(`2 torradas de ${paoStr} com pasta de ricota e 30g de peito de frango desfiado.`, kcalLancheT),
            createOpt(`Shake proteico (${gWhey}g de Whey batido com 200ml de água de coco e gelo).`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`${pPeixe} grelhado com purê de couve-flor ao azeite + salada verde colorida.`, kcalJantar),
            createOpt(`Frittata de 3 ovos com legumes ralados (abobrinha, cenoura) e cubos de ${pFrango}.`, kcalJantar),
            createOpt(`Sopa de legumes caseira com carne bovina magra desfiada (${gCarne}g).`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`Chá de Melissa quente + 1 colher de sementes de chia hidratadas.`, kcalCeia),
            createOpt(`1 fatia de Melão fresco em cubos.`, kcalCeia),
            createOpt(`150ml de ${leiteStr} morno com gotas de baunilha e canela.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Quinta-feira',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`Tapioca (${gTapioca}g) com 2 ovos mexidos, tomate picado e orégano + suco de laranja natural.`, kcalCafe),
            createOpt(`Mingau proteico de aveia (${gAveia}g de aveia cozida em ${leiteStr} com 1 scoop de Whey e cacau).`, kcalCafe),
            createOpt(`2 fatias de ${paoStr} tostadas com ${queijoStr} derretido e fatias de tomate fresco.`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`1 laranja inteira com o bagaço + 3 castanhas do Pará.`, kcalLancheM),
            createOpt(`Suco de maracujá com hortelã + 15g de amendoim torrado sem sal.`, kcalLancheM),
            createOpt(`2 ameixas frescas com 3 nozes.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pCarne} refogado com milho e cenoura + ${gArroz}g de Arroz Integral + 1 concha de Feijão Preto.`, kcalAlmoco),
            createOpt(`${pFrango} marinado no limão e alecrim + ${gBatata}g de Purê de Batata + Vagem no vapor.`, kcalAlmoco),
            createOpt(`Moqueca fit de ${pPeixe} com leite de coco light e azeite de dendê + ${gArroz}g de arroz integral.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`Muffin salgado fit de caneca (1 ovo + 2 colheres de farelo de aveia + 40g frango desfiado).`, kcalLancheT),
            createOpt(`200g de ${iogurteStr} com 1 colher de mel silvestre e granola sem açúcar.`, kcalLancheT),
            createOpt(`2 fatias de ${paoStr} com pasta de grão de bico (homus) e folhas de rúcula.`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`Omelete de forno com 3 ovos, tomate seco, rúcula e ${queijoStr}.`, kcalJantar),
            createOpt(`${pSalmao} ao molho de maracujá + 80g de Quinoa cozida + Legumes grelhados.`, kcalJantar),
            createOpt(`Salada Caesar fit (folhas verdes, tiras de ${pFrango}, molho de iogurte e croutons).`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`Chá de Maracujá quente + 15g de castanhas de caju.`, kcalCeia),
            createOpt(`100g de morangos frescos com canela.`, kcalCeia),
            createOpt(`2 colheres de queijo cottage ou tofu amassado com azeite e orégano.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Sexta-feira',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '07:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`2 fatias de ${paoStr} com pasta de ${queijoStr}, 40g de peito de frango desfiado + café preto.`, kcalCafe),
            createOpt(`Smoothie tropical (1/2 manga congelada + 1 dose de ${gWhey}g Whey + 150ml de água de coco).`, kcalCafe),
            createOpt(`Crepioca fit (1 ovo + 20g de tapioca + 1 colher de chia + recheio de ${queijoStr}).`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '10:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`2 fatias médias de Melancia com raspas de limão e hortelã.`, kcalLancheM),
            createOpt(`1 garrafinha de ${iogurteStr} líquido com 1 colher de farelo de aveia.`, kcalLancheM),
            createOpt(`1 goiaba vermelha fresca + 3 nozes inteiras.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '12:30',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pSalmao} grelhado + ${gMandioca}g de Purê de Mandioquinha + Salada de folhas com azeite.`, kcalAlmoco),
            createOpt(`${pFrango} com Arroz Integral à Grega (${gArroz}g) + Feijão Carioca + Vinagrete.`, kcalAlmoco),
            createOpt(`Quibe de forno de ${pCarne} recheado com ${queijoStr} + Tabule de quinoa e hortelã.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:00',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`Cappuccino proteico fit (1 dose de ${gWhey}g de Whey + café expresso + canela).`, kcalLancheT),
            createOpt(`Sanduíche em ${paoStr} com patê de atum caseiro ao azeite e cebolinha.`, kcalLancheT),
            createOpt(`1 porção (30g) de pipoca feita no ar quente com pitada de sal e ervas finas.`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '19:30',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`Hambúrguer artesanal de ${pCarne} no prato com 1 ovo poché e salada rústica.`, kcalJantar),
            createOpt(`${pPeixe} em papillote assado com tomate, cebola roxa e azeitonas + legumes.`, kcalJantar),
            createOpt(`Berinjela recheada com ${pCarne} e gratinada com ${queijoStr}.`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '21:30',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`Chá de Capim-Limão / Erva-Doce + 1 colher de sementes de girassol.`, kcalCeia),
            createOpt(`1/4 de Abacate com gotas de limão.`, kcalCeia),
            createOpt(`150ml de ${leiteStr} morno com canela.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Sábado',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '08:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`Panqueca americana fit (${gAveia}g de aveia + 1 banana + 1 ovo + 15g pasta de amendoim).`, kcalCafe),
            createOpt(`2 Ovos mexidos com tomate e manjericão + 2 fatias de ${paoStr} tostadas.`, kcalCafe),
            createOpt(`Bowl de Açaí puro batido com ${gWhey}g de Whey e morangos picados.`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '11:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`1 banana fatiada polvilhada com canela e 1 colher de chia.`, kcalLancheM),
            createOpt(`200ml de Água de Coco + 15g de castanhas de caju.`, kcalLancheM),
            createOpt(`1 maçã verde com 1 colher de pasta de amêndoas ou amendoim.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '13:00',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`Espetinhos caseiros de ${pFrango} com cebola e pimentão + ${gArroz}g de Arroz Integral + Vinagrete.`, kcalAlmoco),
            createOpt(`Bife de Alcatra magra grelhado (${gCarne}g) com Mandioca assada (${gMandioca}g) + Salada.`, kcalAlmoco),
            createOpt(`Risoto fit de ${pPeixe} com arroz integral e alho-poró.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:30',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`Pão de queijo de frigideira fit (1 ovo + 20g de polvilho + 2 colheres de ${queijoStr}).`, kcalLancheT),
            createOpt(`1 taça de ${iogurteStr} com mirtilos frescos e 15g nozes picadas.`, kcalLancheT),
            createOpt(`Wrap integral com tiras de frango grelhado (${gFrango}g) e guacamole caseira.`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '20:00',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`Pizza fit de frigideira (massa de aveia com molho caseiro, atum/frango e ${queijoStr}).`, kcalJantar),
            createOpt(`Tacos fit em folhas de alface americana recheadas com ${pCarne}, vinagrete e guacamole.`, kcalJantar),
            createOpt(`Omelete de 3 ovos com cogumelos salteados, espinafre e ${queijoStr}.`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '22:00',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`Chá de Valeriana com Camomila + 15g de amêndoas.`, kcalCeia),
            createOpt(`1 taça pequena com frutas vermelhas frescas.`, kcalCeia),
            createOpt(`150ml de suco de maracujá concentrado com água e gelo.`, kcalCeia)
          ]
        }
      ]
    },
    {
      dia: 'Domingo',
      refeicoes: [
        {
          nome: 'Café da Manhã',
          horario: '08:30',
          calorias: kcalCafe,
          opcoes: [
            createOpt(`Brunch fit: 2 ovos pochê sobre fatias de ${paoStr}, lâminas de abacate e suco natural de frutas.`, kcalCafe),
            createOpt(`Crepe doce de aveia (${gAveia}g) recheado com morangos frescos e calda de Whey protein.`, kcalCafe),
            createOpt(`Cuscuz quentinho (${gTapioca}g) com 2 ovos mexidos e café com leite desnatado.`, kcalCafe)
          ]
        },
        {
          nome: 'Lanche da Manhã',
          horario: '11:00',
          calorias: kcalLancheM,
          opcoes: [
            createOpt(`Salada de Frutas Tropicais (Abacaxi, Melão, Morango) com raspas de limão e hortelã.`, kcalLancheM),
            createOpt(`1 cacho pequeno de Uvas frescas + 4 castanhas do Pará.`, kcalLancheM),
            createOpt(`Suco refrescante de Melancia batida com gengibre e hortelã.`, kcalLancheM)
          ]
        },
        {
          nome: 'Almoço',
          horario: '13:00',
          calorias: kcalAlmoco,
          opcoes: [
            createOpt(`${pFrango} assado com alecrim e alho + ${gBatata}g de Batatas Rústicas douradas + Salada com manga.`, kcalAlmoco),
            createOpt(`${pPeixe} assado em crosta de castanhas + ${gBatata}g de Purê de Abóbora Cabotiá + Brócolis.`, kcalAlmoco),
            createOpt(`Nhoque fit de batata doce com molho caseiro de tomate fresco e cubos de ${pFrango}.`, kcalAlmoco)
          ]
        },
        {
          nome: 'Lanche da Tarde',
          horario: '16:30',
          calorias: kcalLancheT,
          opcoes: [
            createOpt(`Mousse de chocolate fit (100g de abacate batido com cacau 100% e ${gWhey}g de Whey).`, kcalLancheT),
            createOpt(`Sanduíche de ${paoStr} com pasta de 2 ovos cozidos amassados com azeite e cebolinha.`, kcalLancheT),
            createOpt(`Taça de ${iogurteStr} com morangos picados e 1 colher de chia.`, kcalLancheT)
          ]
        },
        {
          nome: 'Jantar',
          horario: '20:00',
          calorias: kcalJantar,
          opcoes: [
            createOpt(`Sopa leve de mandioquinha com ${pFrango} desfiado e couve fininha.`, kcalJantar),
            createOpt(`Carpaccio de carne bovina magra (${gCarne}g) com rúcula, alcaparras e torradas de ${paoStr}.`, kcalJantar),
            createOpt(`Omelete de 3 ovos com abobrinha ralada, tomate cereja e orégano fresco.`, kcalJantar)
          ]
        },
        {
          nome: 'Ceia',
          horario: '22:00',
          calorias: kcalCeia,
          opcoes: [
            createOpt(`Chá de Maçã com Canela em pau + 2 nozes.`, kcalCeia),
            createOpt(`1 fatia fina de queijo branco com chá de camomila.`, kcalCeia),
            createOpt(`150ml de ${leiteStr} morno polvilhado com cacau e canela.`, kcalCeia)
          ]
        }
      ]
    }
  ];

  const pesoIdealInfo = calcularPesoIdeal(altura, sexo);
  const consumoAguaInfo = calcularConsumoAgua(peso, nivelAtividade);

  return {
    titulo: `Plano Alimentar Personalizado — ${paciente?.nome || 'Paciente'}`,
    pacienteInfo: {
      nome: paciente?.nome,
      idade,
      sexo,
      peso,
      altura,
      pesoIdeal: pesoIdealInfo?.faixaFormatada || '—',
      consumoAgua: consumoAguaInfo,
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
      fatPct,
      consumoAgua: consumoAguaInfo
    },
    dias: cardapioSemanal,
    observacoesGerais: `💧 Meta Hídrica: Ingerir ${consumoAguaInfo.litrosFormatado} (${consumoAguaInfo.mlTotal.toLocaleString('pt-BR')} ml/dia, aprox. ${consumoAguaInfo.copos250ml} copos de 250ml) de água filtrada, distribuídos ao longo do dia. Evitar açúcar refinado e ultraprocessados. Respeitar a substituição equivalente das opções de cada dia.`
  };
}
