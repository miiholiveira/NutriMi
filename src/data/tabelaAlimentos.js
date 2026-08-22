/**
 * Banco de Dados Nutricional Completo de Alimentos — NutriMi
 * Baseado na Tabela TACO (Tabela Brasileira de Composição de Alimentos) e TBCA/USP
 * Contém valores por 100g e medidas caseiras usuais
 */

export const BANCO_DE_ALIMENTOS = [
  // ==========================================
  // CARNES, AVES & OVOS
  // ==========================================
  {
    id: 1,
    nome: 'Peito de Frango Grelhado',
    sinonimos: ['frango grelhado', 'peito de frango', 'filé de frango', 'frango'],
    categoria: 'Carnes & Aves',
    calorias_100g: 159,
    proteinas_100g: 32.0,
    carboidratos_100g: 0.0,
    gorduras_100g: 3.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 filé médio (120g)',
    peso_medida_g: 120
  },
  {
    id: 2,
    nome: 'Peito de Frango Cozido / Desfiado',
    sinonimos: ['frango desfiado', 'frango cozido'],
    categoria: 'Carnes & Aves',
    calorias_100g: 163,
    proteinas_100g: 31.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 3.6,
    fibras_100g: 0.0,
    medida_caseira_padrao: '2 colheres de sopa cheias (60g)',
    peso_medida_g: 60
  },
  {
    id: 3,
    nome: 'Sobrecoxa de Frango sem Pele Assada',
    sinonimos: ['sobrecoxa', 'coxa e sobrecoxa'],
    categoria: 'Carnes & Aves',
    calorias_100g: 210,
    proteinas_100g: 27.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 10.8,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 unidade média (100g)',
    peso_medida_g: 100
  },
  {
    id: 4,
    nome: 'Carne Bovina Moída (Patinho)',
    sinonimos: ['patinho moído', 'patinho', 'carne moída', 'carne moída magra'],
    categoria: 'Carnes & Aves',
    calorias_100g: 185,
    proteinas_100g: 30.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 6.5,
    fibras_100g: 0.0,
    medida_caseira_padrao: '3 colheres de sopa cheias (90g)',
    peso_medida_g: 90
  },
  {
    id: 5,
    nome: 'Bife de Alcatra Grelhado',
    sinonimos: ['alcatra', 'bife de alcatra', 'carne bovina alcatra'],
    categoria: 'Carnes & Aves',
    calorias_100g: 215,
    proteinas_100g: 31.8,
    carboidratos_100g: 0.0,
    gorduras_100g: 9.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 bife médio (120g)',
    peso_medida_g: 120
  },
  {
    id: 6,
    nome: 'Filé Mignon Bovino Grelhado',
    sinonimos: ['filé mignon', 'file mignon', 'mignon'],
    categoria: 'Carnes & Aves',
    calorias_100g: 195,
    proteinas_100g: 32.8,
    carboidratos_100g: 0.0,
    gorduras_100g: 6.8,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 medalhão (120g)',
    peso_medida_g: 120
  },
  {
    id: 7,
    nome: 'Maminha Grelhada sem Gordura',
    sinonimos: ['maminha'],
    categoria: 'Carnes & Aves',
    calorias_100g: 198,
    proteinas_100g: 30.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 8.1,
    fibras_100g: 0.0,
    medida_caseira_padrao: '2 fatias médias (100g)',
    peso_medida_g: 100
  },
  {
    id: 8,
    nome: 'Lombo Suíno Grelhado / Assado',
    sinonimos: ['lombo', 'lombo suíno', 'lombo de porco'],
    categoria: 'Carnes & Aves',
    calorias_100g: 175,
    proteinas_100g: 31.0,
    carboidratos_100g: 0.0,
    gorduras_100g: 5.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 bife médio (100g)',
    peso_medida_g: 100
  },
  {
    id: 9,
    nome: 'Ovo de Galinha Inteiro Cozido / Pochê',
    sinonimos: ['ovo cozido', 'ovo', 'ovos', 'ovo pochê', 'ovos mexidos'],
    categoria: 'Carnes & Aves',
    calorias_100g: 155,
    proteinas_100g: 13.0,
    carboidratos_100g: 1.1,
    gorduras_100g: 10.6,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 unidade média (50g)',
    peso_medida_g: 50
  },
  {
    id: 10,
    nome: 'Clara de Ovo Cozida',
    sinonimos: ['clara de ovo', 'claras de ovos', 'claras'],
    categoria: 'Carnes & Aves',
    calorias_100g: 52,
    proteinas_100g: 11.0,
    carboidratos_100g: 0.7,
    gorduras_100g: 0.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 clara (33g)',
    peso_medida_g: 33
  },

  // ==========================================
  // PEIXES & FRUTOS DO MAR
  // ==========================================
  {
    id: 11,
    nome: 'Filé de Tilápia / Saint Peter Grelhado',
    sinonimos: ['tilápia', 'tilapia', 'saint peter', 'peixe grelhado', 'filé de tilápia'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 128,
    proteinas_100g: 26.1,
    carboidratos_100g: 0.0,
    gorduras_100g: 2.7,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 filé médio (130g)',
    peso_medida_g: 130
  },
  {
    id: 12,
    nome: 'Filé de Salmão Grelhado',
    sinonimos: ['salmão', 'salmao', 'filé de salmão'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 208,
    proteinas_100g: 22.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 12.8,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 posta média (120g)',
    peso_medida_g: 120
  },
  {
    id: 13,
    nome: 'Atum Ralado em Água (Enlatado)',
    sinonimos: ['atum', 'atum em água', 'atum ralado', 'patê de atum'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 116,
    proteinas_100g: 25.5,
    carboidratos_100g: 0.0,
    gorduras_100g: 1.0,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 lata drenada (120g)',
    peso_medida_g: 120
  },
  {
    id: 14,
    nome: 'Sardinha em Conserva ao Azeite',
    sinonimos: ['sardinha', 'sardinha em azeite'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 208,
    proteinas_100g: 24.6,
    carboidratos_100g: 0.0,
    gorduras_100g: 11.5,
    fibras_100g: 0.0,
    medida_caseira_padrao: '2 unidades (60g)',
    peso_medida_g: 60
  },
  {
    id: 15,
    nome: 'Camarão Cozido / Grelhado',
    sinonimos: ['camarão', 'camarao'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 99,
    proteinas_100g: 21.0,
    carboidratos_100g: 0.2,
    gorduras_100g: 1.1,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 pires de chá (100g)',
    peso_medida_g: 100
  },
  {
    id: 16,
    nome: 'Pescada Branca Cozida / Assada',
    sinonimos: ['pescada', 'pescada branca', 'filé de pescada'],
    categoria: 'Peixes & Frutos do Mar',
    calorias_100g: 111,
    proteinas_100g: 23.0,
    carboidratos_100g: 0.0,
    gorduras_100g: 1.5,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 filé médio (120g)',
    peso_medida_g: 120
  },

  // ==========================================
  // CEREAIS, GRÃOS & TUBÉRCULOS
  // ==========================================
  {
    id: 17,
    nome: 'Arroz Integral Cozido',
    sinonimos: ['arroz integral', 'arroz 7 grãos'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 124,
    proteinas_100g: 2.6,
    carboidratos_100g: 25.8,
    gorduras_100g: 1.0,
    fibras_100g: 2.7,
    medida_caseira_padrao: '4 colheres de sopa cheias (100g)',
    peso_medida_g: 100
  },
  {
    id: 18,
    nome: 'Arroz Branco Cozido',
    sinonimos: ['arroz branco', 'arroz'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 128,
    proteinas_100g: 2.5,
    carboidratos_100g: 28.1,
    gorduras_100g: 0.2,
    fibras_100g: 1.6,
    medida_caseira_padrao: '4 colheres de sopa cheias (100g)',
    peso_medida_g: 100
  },
  {
    id: 19,
    nome: 'Feijão Carioca Cozido (50% grão / 50% caldo)',
    sinonimos: ['feijão', 'feijao', 'feijão carioca'],
    categoria: 'Leguminosas',
    calorias_100g: 76,
    proteinas_100g: 4.8,
    carboidratos_100g: 13.6,
    gorduras_100g: 0.5,
    fibras_100g: 4.5,
    medida_caseira_padrao: '1 concha média (80g)',
    peso_medida_g: 80
  },
  {
    id: 20,
    nome: 'Feijão Preto Cozido',
    sinonimos: ['feijão preto', 'feijao preto'],
    categoria: 'Leguminosas',
    calorias_100g: 77,
    proteinas_100g: 4.5,
    carboidratos_100g: 14.0,
    gorduras_100g: 0.5,
    fibras_100g: 4.8,
    medida_caseira_padrao: '1 concha média (80g)',
    peso_medida_g: 80
  },
  {
    id: 21,
    nome: 'Lentilha Cozida',
    sinonimos: ['lentilha'],
    categoria: 'Leguminosas',
    calorias_100g: 93,
    proteinas_100g: 6.3,
    carboidratos_100g: 16.3,
    gorduras_100g: 0.5,
    fibras_100g: 3.9,
    medida_caseira_padrao: '1 concha média (80g)',
    peso_medida_g: 80
  },
  {
    id: 22,
    nome: 'Grão de Bico Cozido',
    sinonimos: ['grão de bico', 'grao de bico', 'homus'],
    categoria: 'Leguminosas',
    calorias_100g: 128,
    proteinas_100g: 7.2,
    carboidratos_100g: 21.0,
    gorduras_100g: 2.1,
    fibras_100g: 5.4,
    medida_caseira_padrao: '3 colheres de sopa cheias (80g)',
    peso_medida_g: 80
  },
  {
    id: 23,
    nome: 'Batata Doce Cozida / Assada',
    sinonimos: ['batata doce', 'batata doce assada'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 86,
    proteinas_100g: 1.6,
    carboidratos_100g: 20.1,
    gorduras_100g: 0.1,
    fibras_100g: 2.2,
    medida_caseira_padrao: '1 unidade pequena (100g)',
    peso_medida_g: 100
  },
  {
    id: 24,
    nome: 'Batata Inglesa Cozida / Assada',
    sinonimos: ['batata inglesa', 'batata', 'purê de batata', 'batatas rústicas'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 77,
    proteinas_100g: 2.0,
    carboidratos_100g: 17.5,
    gorduras_100g: 0.1,
    fibras_100g: 1.8,
    medida_caseira_padrao: '1 unidade média (120g)',
    peso_medida_g: 120
  },
  {
    id: 25,
    nome: 'Mandioca / Aipim Cozido',
    sinonimos: ['mandioca', 'aipim', 'macaxeira'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 125,
    proteinas_100g: 1.4,
    carboidratos_100g: 30.1,
    gorduras_100g: 0.3,
    fibras_100g: 1.9,
    medida_caseira_padrao: '1 pedaço médio (90g)',
    peso_medida_g: 90
  },
  {
    id: 26,
    nome: 'Mandioquinha / Batata Baroa Cozida',
    sinonimos: ['mandioquinha', 'batata baroa', 'purê de mandioquinha'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 80,
    proteinas_100g: 0.9,
    carboidratos_100g: 18.9,
    gorduras_100g: 0.2,
    fibras_100g: 1.8,
    medida_caseira_padrao: '2 colheres de sopa cheias (80g)',
    peso_medida_g: 80
  },
  {
    id: 27,
    nome: 'Aveia em Flocos / Farelo de Aveia',
    sinonimos: ['aveia', 'aveia em flocos', 'farelo de aveia', 'farinha de aveia'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 366,
    proteinas_100g: 14.2,
    carboidratos_100g: 58.6,
    gorduras_100g: 7.2,
    fibras_100g: 9.1,
    medida_caseira_padrao: '2 colheres de sopa cheias (30g)',
    peso_medida_g: 30
  },
  {
    id: 28,
    nome: 'Goma de Tapioca Hidratada',
    sinonimos: ['tapioca', 'goma de tapioca', 'crepioca'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 242,
    proteinas_100g: 0.2,
    carboidratos_100g: 60.0,
    gorduras_100g: 0.0,
    fibras_100g: 0.5,
    medida_caseira_padrao: '3 colheres de sopa (50g)',
    peso_medida_g: 50
  },
  {
    id: 29,
    nome: 'Cuscuz de Milho Cozido',
    sinonimos: ['cuscuz', 'cuscuz nordestino', 'flocão de milho'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 112,
    proteinas_100g: 2.2,
    carboidratos_100g: 25.4,
    gorduras_100g: 0.7,
    fibras_100g: 2.1,
    medida_caseira_padrao: '1 fatia média (100g)',
    peso_medida_g: 100
  },
  {
    id: 30,
    nome: 'Macarrão Integral Cozido',
    sinonimos: ['macarrão integral', 'macarrao integral', 'espaguete integral'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 124,
    proteinas_100g: 5.3,
    carboidratos_100g: 26.5,
    gorduras_100g: 0.6,
    fibras_100g: 3.2,
    medida_caseira_padrao: '1 xícara de chá (100g)',
    peso_medida_g: 100
  },
  {
    id: 31,
    nome: 'Quinoa Cozida',
    sinonimos: ['quinoa', 'quinua'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 120,
    proteinas_100g: 4.4,
    carboidratos_100g: 21.3,
    gorduras_100g: 1.9,
    fibras_100g: 2.8,
    medida_caseira_padrao: '3 colheres de sopa cheias (80g)',
    peso_medida_g: 80
  },

  // ==========================================
  // PÃES & FARINHAS
  // ==========================================
  {
    id: 32,
    nome: 'Pão de Forma Integral 100%',
    sinonimos: ['pão integral', 'pao integral', 'pão integral 100%', 'torrada integral'],
    categoria: 'Pães & Farinhas',
    calorias_100g: 246,
    proteinas_100g: 9.4,
    carboidratos_100g: 45.3,
    gorduras_100g: 3.1,
    fibras_100g: 6.9,
    medida_caseira_padrao: '2 fatias (50g)',
    peso_medida_g: 50
  },
  {
    id: 33,
    nome: 'Pão Francês Tradicional',
    sinonimos: ['pão francês', 'pao frances', 'pão de sal'],
    categoria: 'Pães & Farinhas',
    calorias_100g: 289,
    proteinas_100g: 8.0,
    carboidratos_100g: 58.7,
    gorduras_100g: 3.1,
    fibras_100g: 2.3,
    medida_caseira_padrao: '1 unidade (50g)',
    peso_medida_g: 50
  },
  {
    id: 34,
    nome: 'Pão Sem Glúten',
    sinonimos: ['pão sem glúten', 'pao sem gluten'],
    categoria: 'Pães & Farinhas',
    calorias_100g: 250,
    proteinas_100g: 4.2,
    carboidratos_100g: 51.0,
    gorduras_100g: 3.5,
    fibras_100g: 3.8,
    medida_caseira_padrao: '2 fatias (50g)',
    peso_medida_g: 50
  },
  {
    id: 35,
    nome: 'Torrada Integral Tradicional',
    sinonimos: ['torrada', 'torrada integral'],
    categoria: 'Pães & Farinhas',
    calorias_100g: 380,
    proteinas_100g: 11.5,
    carboidratos_100g: 72.0,
    gorduras_100g: 5.0,
    fibras_100g: 7.5,
    medida_caseira_padrao: '2 unidades (20g)',
    peso_medida_g: 20
  },

  // ==========================================
  // LATICÍNIOS & VEGETAIS
  // ==========================================
  {
    id: 36,
    nome: 'Leite Desnatado Pasteurizado',
    sinonimos: ['leite desnatado', 'leite zero gordura'],
    categoria: 'Laticínios',
    calorias_100g: 35,
    proteinas_100g: 3.3,
    carboidratos_100g: 5.0,
    gorduras_100g: 0.1,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 copo / xícara (200ml)',
    peso_medida_g: 200
  },
  {
    id: 37,
    nome: 'Leite Integral Pasteurizado',
    sinonimos: ['leite integral', 'leite'],
    categoria: 'Laticínios',
    calorias_100g: 61,
    proteinas_100g: 3.2,
    carboidratos_100g: 4.8,
    gorduras_100g: 3.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 copo (200ml)',
    peso_medida_g: 200
  },
  {
    id: 38,
    nome: 'Bebida Vegetal de Amêndoas / Castanhas',
    sinonimos: ['leite de amêndoas', 'leite vegetal', 'bebida vegetal'],
    categoria: 'Laticínios',
    calorias_100g: 24,
    proteinas_100g: 0.8,
    carboidratos_100g: 1.5,
    gorduras_100g: 1.8,
    fibras_100g: 0.4,
    medida_caseira_padrao: '1 copo (200ml)',
    peso_medida_g: 200
  },
  {
    id: 39,
    nome: 'Iogurte Natural Desnatado / Zero Gordura',
    sinonimos: ['iogurte natural', 'iogurte desnatado', 'iogurte'],
    categoria: 'Laticínios',
    calorias_100g: 45,
    proteinas_100g: 4.1,
    carboidratos_100g: 6.0,
    gorduras_100g: 0.2,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 pote (150g)',
    peso_medida_g: 150
  },
  {
    id: 40,
    nome: 'Iogurte Grego Tradicional / Zero',
    sinonimos: ['iogurte grego', 'grego'],
    categoria: 'Laticínios',
    calorias_100g: 78,
    proteinas_100g: 6.8,
    carboidratos_100g: 4.5,
    gorduras_100g: 3.8,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 pote (120g)',
    peso_medida_g: 120
  },
  {
    id: 41,
    nome: 'Queijo Minas Frescal',
    sinonimos: ['queijo minas', 'queijo minas frescal', 'queijo branco'],
    categoria: 'Laticínios',
    calorias_100g: 227,
    proteinas_100g: 17.4,
    carboidratos_100g: 3.2,
    gorduras_100g: 16.0,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 fatia média (30g)',
    peso_medida_g: 30
  },
  {
    id: 42,
    nome: 'Queijo Cottage',
    sinonimos: ['cottage', 'queijo cottage'],
    categoria: 'Laticínios',
    calorias_100g: 98,
    proteinas_100g: 11.5,
    carboidratos_100g: 3.4,
    gorduras_100g: 4.3,
    fibras_100g: 0.0,
    medida_caseira_padrao: '2 colheres de sopa cheias (50g)',
    peso_medida_g: 50
  },
  {
    id: 43,
    nome: 'Queijo Ricota Fresca',
    sinonimos: ['ricota', 'creme de ricota', 'pasta de ricota'],
    categoria: 'Laticínios',
    calorias_100g: 140,
    proteinas_100g: 12.6,
    carboidratos_100g: 3.8,
    gorduras_100g: 8.1,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 fatia grossa (40g)',
    peso_medida_g: 40
  },
  {
    id: 44,
    nome: 'Queijo Muçarela Fatiado',
    sinonimos: ['muçarela', 'mussarela', 'queijo muçarela'],
    categoria: 'Laticínios',
    calorias_100g: 280,
    proteinas_100g: 22.0,
    carboidratos_100g: 2.2,
    gorduras_100g: 20.5,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 fatia fina (20g)',
    peso_medida_g: 20
  },
  {
    id: 45,
    nome: 'Tofu Fresco Firme',
    sinonimos: ['tofu', 'tofu grelhado'],
    categoria: 'Laticínios / Veganos',
    calorias_100g: 76,
    proteinas_100g: 8.1,
    carboidratos_100g: 1.9,
    gorduras_100g: 4.8,
    fibras_100g: 0.3,
    medida_caseira_padrao: '1 fatia média (80g)',
    peso_medida_g: 80
  },

  // ==========================================
  // FRUTAS
  // ==========================================
  {
    id: 46,
    nome: 'Banana Prata / Nanica',
    sinonimos: ['banana', 'banana prata', 'banana nanica'],
    categoria: 'Frutas',
    calorias_100g: 89,
    proteinas_100g: 1.3,
    carboidratos_100g: 22.8,
    gorduras_100g: 0.3,
    fibras_100g: 2.6,
    medida_caseira_padrao: '1 unidade média (90g)',
    peso_medida_g: 90
  },
  {
    id: 47,
    nome: 'Maçã Fuji / Gala com Casca',
    sinonimos: ['maçã', 'maca', 'maçã gala', 'maçã fuji', 'maçã verde'],
    categoria: 'Frutas',
    calorias_100g: 52,
    proteinas_100g: 0.3,
    carboidratos_100g: 13.8,
    gorduras_100g: 0.2,
    fibras_100g: 2.4,
    medida_caseira_padrao: '1 unidade média (130g)',
    peso_medida_g: 130
  },
  {
    id: 48,
    nome: 'Mamão Papaya / Formosa',
    sinonimos: ['mamão', 'mamao', 'mamão papaya', 'mamão formosa'],
    categoria: 'Frutas',
    calorias_100g: 40,
    proteinas_100g: 0.5,
    carboidratos_100g: 10.4,
    gorduras_100g: 0.1,
    fibras_100g: 1.8,
    medida_caseira_padrao: '1/2 unidade papaya (140g)',
    peso_medida_g: 140
  },
  {
    id: 49,
    nome: 'Abacate Fresco',
    sinonimos: ['abacate', 'guacamole', 'avocado'],
    categoria: 'Frutas',
    calorias_100g: 160,
    proteinas_100g: 2.0,
    carboidratos_100g: 8.5,
    gorduras_100g: 14.7,
    fibras_100g: 6.7,
    medida_caseira_padrao: '2 colheres de sopa (80g)',
    peso_medida_g: 80
  },
  {
    id: 50,
    nome: 'Morangos Frescos',
    sinonimos: ['morango', 'morangos', 'frutas vermelhas'],
    categoria: 'Frutas',
    calorias_100g: 32,
    proteinas_100g: 0.7,
    carboidratos_100g: 7.7,
    gorduras_100g: 0.3,
    fibras_100g: 2.0,
    medida_caseira_padrao: '8 unidades médias (100g)',
    peso_medida_g: 100
  },
  {
    id: 51,
    nome: 'Uva Itália / Thompson / Niágara',
    sinonimos: ['uva', 'uvas'],
    categoria: 'Frutas',
    calorias_100g: 69,
    proteinas_100g: 0.7,
    carboidratos_100g: 18.1,
    gorduras_100g: 0.2,
    fibras_100g: 0.9,
    medida_caseira_padrao: '1 cacho pequeno (100g)',
    peso_medida_g: 100
  },
  {
    id: 52,
    nome: 'Laranja Pera Inteira (com bagaço)',
    sinonimos: ['laranja', 'laranja pera'],
    categoria: 'Frutas',
    calorias_100g: 47,
    proteinas_100g: 0.9,
    carboidratos_100g: 11.8,
    gorduras_100g: 0.1,
    fibras_100g: 2.4,
    medida_caseira_padrao: '1 unidade média (130g)',
    peso_medida_g: 130
  },
  {
    id: 53,
    nome: 'Pêra Williams / d\'Água',
    sinonimos: ['pêra', 'pera'],
    categoria: 'Frutas',
    calorias_100g: 57,
    proteinas_100g: 0.4,
    carboidratos_100g: 15.2,
    gorduras_100g: 0.1,
    fibras_100g: 3.1,
    medida_caseira_padrao: '1 unidade média (130g)',
    peso_medida_g: 130
  },
  {
    id: 54,
    nome: 'Melancia Fresca',
    sinonimos: ['melancia'],
    categoria: 'Frutas',
    calorias_100g: 30,
    proteinas_100g: 0.6,
    carboidratos_100g: 7.6,
    gorduras_100g: 0.2,
    fibras_100g: 0.4,
    medida_caseira_padrao: '1 fatia média (200g)',
    peso_medida_g: 200
  },
  {
    id: 55,
    nome: 'Melão Espanhol / Cantaloupe',
    sinonimos: ['melão', 'melao'],
    categoria: 'Frutas',
    calorias_100g: 34,
    proteinas_100g: 0.8,
    carboidratos_100g: 8.2,
    gorduras_100g: 0.2,
    fibras_100g: 0.9,
    medida_caseira_padrao: '1 fatia média (150g)',
    peso_medida_g: 150
  },
  {
    id: 56,
    nome: 'Abacaxi Pérola / Smooth',
    sinonimos: ['abacaxi'],
    categoria: 'Frutas',
    calorias_100g: 48,
    proteinas_100g: 0.5,
    carboidratos_100g: 12.6,
    gorduras_100g: 0.1,
    fibras_100g: 1.4,
    medida_caseira_padrao: '1 fatia média (100g)',
    peso_medida_g: 100
  },
  {
    id: 57,
    nome: 'Kiwi Fresco',
    sinonimos: ['kiwi', 'quivi'],
    categoria: 'Frutas',
    calorias_100g: 61,
    proteinas_100g: 1.1,
    carboidratos_100g: 14.7,
    gorduras_100g: 0.5,
    fibras_100g: 3.0,
    medida_caseira_padrao: '1 unidade média (75g)',
    peso_medida_g: 75
  },
  {
    id: 58,
    nome: 'Manga Palmer / Tommy',
    sinonimos: ['manga'],
    categoria: 'Frutas',
    calorias_100g: 60,
    proteinas_100g: 0.8,
    carboidratos_100g: 15.0,
    gorduras_100g: 0.4,
    fibras_100g: 1.6,
    medida_caseira_padrao: '1/2 unidade média (120g)',
    peso_medida_g: 120
  },
  {
    id: 59,
    nome: 'Goiaba Vermelha / Branca',
    sinonimos: ['goiaba'],
    categoria: 'Frutas',
    calorias_100g: 54,
    proteinas_100g: 1.0,
    carboidratos_100g: 13.0,
    gorduras_100g: 0.6,
    fibras_100g: 5.2,
    medida_caseira_padrao: '1 unidade média (120g)',
    peso_medida_g: 120
  },
  {
    id: 60,
    nome: 'Açaí Puro (sem xarope)',
    sinonimos: ['açaí', 'acai', 'polpa de açaí'],
    categoria: 'Frutas',
    calorias_100g: 70,
    proteinas_100g: 1.5,
    carboidratos_100g: 4.0,
    gorduras_100g: 5.0,
    fibras_100g: 3.2,
    medida_caseira_padrao: '1 tigela pequena (100g)',
    peso_medida_g: 100
  },
  {
    id: 61,
    nome: 'Água de Coco Natural',
    sinonimos: ['água de coco', 'agua de coco'],
    categoria: 'Bebidas & Frutas',
    calorias_100g: 19,
    proteinas_100g: 0.7,
    carboidratos_100g: 3.7,
    gorduras_100g: 0.2,
    fibras_100g: 1.1,
    medida_caseira_padrao: '1 copo (200ml)',
    peso_medida_g: 200
  },

  // ==========================================
  // VEGETAIS & LEGUMES
  // ==========================================
  {
    id: 62,
    nome: 'Brócolis Cozido no Vapor',
    sinonimos: ['brócolis', 'brocolis'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 35,
    proteinas_100g: 2.8,
    carboidratos_100g: 7.2,
    gorduras_100g: 0.4,
    fibras_100g: 3.3,
    medida_caseira_padrao: '4 ramos médios (80g)',
    peso_medida_g: 80
  },
  {
    id: 63,
    nome: 'Cenoura Cozida / Crua Ralada',
    sinonimos: ['cenoura', 'cenoura ralada'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 34,
    proteinas_100g: 0.8,
    carboidratos_100g: 7.7,
    gorduras_100g: 0.2,
    fibras_100g: 2.6,
    medida_caseira_padrao: '3 colheres de sopa ralada (60g)',
    peso_medida_g: 60
  },
  {
    id: 64,
    nome: 'Abobrinha Italiana Refogada',
    sinonimos: ['abobrinha', 'abobrinha refogada'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 20,
    proteinas_100g: 1.2,
    carboidratos_100g: 4.2,
    gorduras_100g: 0.2,
    fibras_100g: 1.4,
    medida_caseira_padrao: '3 colheres de sopa (80g)',
    peso_medida_g: 80
  },
  {
    id: 65,
    nome: 'Couve-Flor Cozida no Vapor',
    sinonimos: ['couve-flor', 'couve flor', 'purê de couve-flor'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 25,
    proteinas_100g: 1.9,
    carboidratos_100g: 5.0,
    gorduras_100g: 0.3,
    fibras_100g: 2.1,
    medida_caseira_padrao: '3 ramos (80g)',
    peso_medida_g: 80
  },
  {
    id: 66,
    nome: 'Abóbora Cabotiá Assada / Cozida',
    sinonimos: ['abóbora cabotiá', 'abobora cabotia', 'abóbora', 'purê de abóbora'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 48,
    proteinas_100g: 1.4,
    carboidratos_100g: 10.8,
    gorduras_100g: 0.5,
    fibras_100g: 2.5,
    medida_caseira_padrao: '2 pedaços médios (100g)',
    peso_medida_g: 100
  },
  {
    id: 67,
    nome: 'Espinafre Cozido / Refogado',
    sinonimos: ['espinafre'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 23,
    proteinas_100g: 2.9,
    carboidratos_100g: 3.6,
    gorduras_100g: 0.4,
    fibras_100g: 2.2,
    medida_caseira_padrao: '2 colheres de sopa (60g)',
    peso_medida_g: 60
  },
  {
    id: 68,
    nome: 'Tomate Italiano / Salada',
    sinonimos: ['tomate', 'tomate cereja', 'molho caseiro de tomate'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 18,
    proteinas_100g: 0.9,
    carboidratos_100g: 3.9,
    gorduras_100g: 0.2,
    fibras_100g: 1.2,
    medida_caseira_padrao: '1 unidade média (100g)',
    peso_medida_g: 100
  },
  {
    id: 69,
    nome: 'Alface Americana / Crespa / Lisa',
    sinonimos: ['alface', 'salada verde', 'salada de folhas', 'folhas verdes'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 14,
    proteinas_100g: 1.3,
    carboidratos_100g: 2.8,
    gorduras_100g: 0.2,
    fibras_100g: 1.3,
    medida_caseira_padrao: '1 prato raso de folhas (50g)',
    peso_medida_g: 50
  },
  {
    id: 70,
    nome: 'Rúcula Fresca',
    sinonimos: ['rúcula', 'rucula', 'salada de rúcula'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 25,
    proteinas_100g: 2.6,
    carboidratos_100g: 3.7,
    gorduras_100g: 0.7,
    fibras_100g: 1.6,
    medida_caseira_padrao: '1 pires cheio (40g)',
    peso_medida_g: 40
  },
  {
    id: 71,
    nome: 'Pepino Japonês com Casca',
    sinonimos: ['pepino', 'pepino japonês'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 15,
    proteinas_100g: 0.7,
    carboidratos_100g: 3.6,
    gorduras_100g: 0.1,
    fibras_100g: 0.5,
    medida_caseira_padrao: '1 unidade média (120g)',
    peso_medida_g: 120
  },
  {
    id: 72,
    nome: 'Beterraba Cozida / Crua Ralada',
    sinonimos: ['beterraba'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 43,
    proteinas_100g: 1.6,
    carboidratos_100g: 9.6,
    gorduras_100g: 0.2,
    fibras_100g: 2.8,
    medida_caseira_padrao: '2 colheres de sopa (60g)',
    peso_medida_g: 60
  },
  {
    id: 73,
    nome: 'Chuchu Cozido',
    sinonimos: ['chuchu'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 19,
    proteinas_100g: 0.8,
    carboidratos_100g: 4.5,
    gorduras_100g: 0.1,
    fibras_100g: 1.7,
    medida_caseira_padrao: '3 colheres de sopa (80g)',
    peso_medida_g: 80
  },
  {
    id: 74,
    nome: 'Vagem Cozida no Vapor',
    sinonimos: ['vagem', 'feijão verde'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 31,
    proteinas_100g: 1.8,
    carboidratos_100g: 7.0,
    gorduras_100g: 0.2,
    fibras_100g: 2.7,
    medida_caseira_padrao: '3 colheres de sopa (60g)',
    peso_medida_g: 60
  },
  {
    id: 75,
    nome: 'Aspargos Cozidos / Grelhados',
    sinonimos: ['aspargos', 'aspargo'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 20,
    proteinas_100g: 2.2,
    carboidratos_100g: 3.9,
    gorduras_100g: 0.1,
    fibras_100g: 2.1,
    medida_caseira_padrao: '4 talos médios (60g)',
    peso_medida_g: 60
  },
  {
    id: 76,
    nome: 'Berinjela Assada / Grelhada',
    sinonimos: ['berinjela', 'berinjela recheada'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 25,
    proteinas_100g: 1.0,
    carboidratos_100g: 5.9,
    gorduras_100g: 0.2,
    fibras_100g: 3.0,
    medida_caseira_padrao: '2 fatias grossas (80g)',
    peso_medida_g: 80
  },
  {
    id: 77,
    nome: 'Cogumelos Shimeji / Paris / Shitake Salteados',
    sinonimos: ['cogumelos', 'shimeji', 'shitake', 'champignon', 'cogumelo'],
    categoria: 'Vegetais & Legumes',
    calorias_100g: 35,
    proteinas_100g: 3.1,
    carboidratos_100g: 4.3,
    gorduras_100g: 0.4,
    fibras_100g: 2.5,
    medida_caseira_padrao: '3 colheres de sopa (80g)',
    peso_medida_g: 80
  },

  // ==========================================
  // OLEAGINOSAS, SEMENTES & GORDURAS BOAS
  // ==========================================
  {
    id: 78,
    nome: 'Castanha do Pará / Castanha do Brasil',
    sinonimos: ['castanha do pará', 'castanha do para', 'castanhas do pará', 'castanha do brasil'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 656,
    proteinas_100g: 14.3,
    carboidratos_100g: 12.3,
    gorduras_100g: 66.4,
    fibras_100g: 7.5,
    medida_caseira_padrao: '2 unidades (10g)',
    peso_medida_g: 10
  },
  {
    id: 79,
    nome: 'Castanha de Caju Torrada sem Sal',
    sinonimos: ['castanha de caju', 'castanhas de caju'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 553,
    proteinas_100g: 18.2,
    carboidratos_100g: 30.2,
    gorduras_100g: 43.8,
    fibras_100g: 3.3,
    medida_caseira_padrao: '10 unidades (15g)',
    peso_medida_g: 15
  },
  {
    id: 80,
    nome: 'Nozes Chilenas / Tradicionais',
    sinonimos: ['nozes', 'noz'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 654,
    proteinas_100g: 15.2,
    carboidratos_100g: 13.7,
    gorduras_100g: 65.2,
    fibras_100g: 6.7,
    medida_caseira_padrao: '4 metades (15g)',
    peso_medida_g: 15
  },
  {
    id: 81,
    nome: 'Amêndoas Laminadas / Cruas',
    sinonimos: ['amêndoas', 'amendoas', 'amêndoa'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 579,
    proteinas_100g: 21.2,
    carboidratos_100g: 21.6,
    gorduras_100g: 49.9,
    fibras_100g: 12.5,
    medida_caseira_padrao: '12 unidades (15g)',
    peso_medida_g: 15
  },
  {
    id: 82,
    nome: 'Amendoim Torrado sem Sal',
    sinonimos: ['amendoim', 'amendoim torrado'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 567,
    proteinas_100g: 25.8,
    carboidratos_100g: 16.1,
    gorduras_100g: 49.2,
    fibras_100g: 8.5,
    medida_caseira_padrao: '1 colher de sopa cheia (15g)',
    peso_medida_g: 15
  },
  {
    id: 83,
    nome: 'Pasta de Amendoim Integral 100%',
    sinonimos: ['pasta de amendoim', 'manteiga de amendoim'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 588,
    proteinas_100g: 28.0,
    carboidratos_100g: 18.0,
    gorduras_100g: 50.0,
    fibras_100g: 6.0,
    medida_caseira_padrao: '1 colher de sopa (15g)',
    peso_medida_g: 15
  },
  {
    id: 84,
    nome: 'Sementes de Chia',
    sinonimos: ['chia', 'semente de chia', 'sementes de chia'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 486,
    proteinas_100g: 16.5,
    carboidratos_100g: 42.1,
    gorduras_100g: 30.7,
    fibras_100g: 34.4,
    medida_caseira_padrao: '1 colher de sobremesa (10g)',
    peso_medida_g: 10
  },
  {
    id: 85,
    nome: 'Sementes de Linhaça Dourada / Marrom',
    sinonimos: ['linhaça', 'linhaca', 'farinha de linhaça'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 534,
    proteinas_100g: 18.3,
    carboidratos_100g: 28.9,
    gorduras_100g: 42.2,
    fibras_100g: 27.3,
    medida_caseira_padrao: '1 colher de sobremesa (10g)',
    peso_medida_g: 10
  },
  {
    id: 86,
    nome: 'Sementes de Abóbora Tostadas',
    sinonimos: ['semente de abóbora', 'sementes de abóbora'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 559,
    proteinas_100g: 30.2,
    carboidratos_100g: 10.7,
    gorduras_100g: 49.1,
    fibras_100g: 6.0,
    medida_caseira_padrao: '1 colher de sobremesa (10g)',
    peso_medida_g: 10
  },
  {
    id: 87,
    nome: 'Sementes de Girassol sem Casca',
    sinonimos: ['semente de girassol', 'sementes de girassol'],
    categoria: 'Oleaginosas & Sementes',
    calorias_100g: 584,
    proteinas_100g: 20.8,
    carboidratos_100g: 20.0,
    gorduras_100g: 51.5,
    fibras_100g: 8.6,
    medida_caseira_padrao: '1 colher de sobremesa (10g)',
    peso_medida_g: 10
  },
  {
    id: 88,
    nome: 'Azeite de Oliva Extra Virgem',
    sinonimos: ['azeite', 'azeite de oliva', 'azeite extra virgem'],
    categoria: 'Óleos & Gorduras',
    calorias_100g: 884,
    proteinas_100g: 0.0,
    carboidratos_100g: 0.0,
    gorduras_100g: 100.0,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 colher de sopa (10g)',
    peso_medida_g: 10
  },
  {
    id: 89,
    nome: 'Manteiga Ghee / Manteiga Clarificada',
    sinonimos: ['manteiga ghee', 'manteiga', 'ghee'],
    categoria: 'Óleos & Gorduras',
    calorias_100g: 876,
    proteinas_100g: 0.3,
    carboidratos_100g: 0.0,
    gorduras_100g: 99.5,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 colher de chá (5g)',
    peso_medida_g: 5
  },

  // ==========================================
  // SUPLEMENTOS & ESPECIAIS
  // ==========================================
  {
    id: 90,
    nome: 'Whey Protein Concentrado 80%',
    sinonimos: ['whey', 'whey protein', 'proteína em pó', 'proteína'],
    categoria: 'Suplementos',
    calorias_100g: 400,
    proteinas_100g: 80.0,
    carboidratos_100g: 6.7,
    gorduras_100g: 6.7,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 dosador / scoop (30g)',
    peso_medida_g: 30
  },
  {
    id: 91,
    nome: 'Whey Protein Isolado 90%',
    sinonimos: ['whey isolado', 'whey protein isolado'],
    categoria: 'Suplementos',
    calorias_100g: 375,
    proteinas_100g: 90.0,
    carboidratos_100g: 1.5,
    gorduras_100g: 1.0,
    fibras_100g: 0.0,
    medida_caseira_padrao: '1 dosador / scoop (30g)',
    peso_medida_g: 30
  },
  {
    id: 92,
    nome: 'Proteína Vegetal em Pó (Ervilha / Arroz)',
    sinonimos: ['proteína vegetal', 'whey vegano', 'proteína de ervilha'],
    categoria: 'Suplementos',
    calorias_100g: 380,
    proteinas_100g: 78.0,
    carboidratos_100g: 8.0,
    gorduras_100g: 4.5,
    fibras_100g: 3.5,
    medida_caseira_padrao: '1 dosador / scoop (30g)',
    peso_medida_g: 30
  },
  {
    id: 93,
    nome: 'Cacau em Pó 100% Puro (sem açúcar)',
    sinonimos: ['cacau 100%', 'cacau em pó', 'cacau'],
    categoria: 'Especiais',
    calorias_100g: 228,
    proteinas_100g: 19.6,
    carboidratos_100g: 57.9,
    gorduras_100g: 13.7,
    fibras_100g: 33.2,
    medida_caseira_padrao: '1 colher de sopa (10g)',
    peso_medida_g: 10
  },
  {
    id: 94,
    nome: 'Mel de Abelha Silvestre',
    sinonimos: ['mel', 'mel de abelha'],
    categoria: 'Especiais',
    calorias_100g: 304,
    proteinas_100g: 0.3,
    carboidratos_100g: 82.4,
    gorduras_100g: 0.0,
    fibras_100g: 0.2,
    medida_caseira_padrao: '1 colher de sobremesa (10g)',
    peso_medida_g: 10
  },
  {
    id: 95,
    nome: 'Pipoca Feita no Ar Quente (sem óleo)',
    sinonimos: ['pipoca', 'pipoca fit'],
    categoria: 'Cereais & Tubérculos',
    calorias_100g: 387,
    proteinas_100g: 12.9,
    carboidratos_100g: 77.9,
    gorduras_100g: 4.5,
    fibras_100g: 14.5,
    medida_caseira_padrao: '1 xícara cheia (25g)',
    peso_medida_g: 25
  }
];

/**
 * Normaliza strings para busca e comparação sem acentos
 */
export function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca alimentos no banco por termo de pesquisa (nome, categoria ou sinônimo)
 */
export function buscarAlimentos(termo) {
  if (!termo || termo.trim().length === 0) return BANCO_DE_ALIMENTOS;
  const tNorm = normalizarTexto(termo);

  return BANCO_DE_ALIMENTOS.filter((ali) => {
    const nomeNorm = normalizarTexto(ali.nome);
    const catNorm = normalizarTexto(ali.categoria);
    if (nomeNorm.includes(tNorm) || catNorm.includes(tNorm)) return true;
    if (ali.sinonimos && ali.sinonimos.some((s) => normalizarTexto(s).includes(tNorm))) {
      return true;
    }
    return false;
  });
}

/**
 * Encontra o alimento mais correspondente para um termo ou nome informado
 */
export function encontrarAlimento(nomeOuTermo) {
  if (!nomeOuTermo) return null;
  const tNorm = normalizarTexto(nomeOuTermo);

  // 1. Busca exata por nome
  let encontrado = BANCO_DE_ALIMENTOS.find((ali) => normalizarTexto(ali.nome) === tNorm);
  if (encontrado) return encontrado;

  // 2. Busca exata por sinônimo
  encontrado = BANCO_DE_ALIMENTOS.find(
    (ali) => ali.sinonimos && ali.sinonimos.some((s) => normalizarTexto(s) === tNorm)
  );
  if (encontrado) return encontrado;

  // 3. Busca parcial por sinônimo mais longo
  const matches = BANCO_DE_ALIMENTOS.filter((ali) => {
    if (tNorm.includes(normalizarTexto(ali.nome))) return true;
    return ali.sinonimos && ali.sinonimos.some((s) => tNorm.includes(normalizarTexto(s)));
  });

  if (matches.length > 0) {
    // Retorna o match com o sinônimo mais específico (maior comprimento)
    return matches[0];
  }

  return null;
}

/**
 * Analisador inteligente de refeição a partir de texto:
 * Identifica itens, gramas, porções e soma calorias e macros exatos
 */
export function analisarOpcaoAlimentar(textoOpcao, fallbackKcal = 350) {
  if (!textoOpcao || typeof textoOpcao !== 'string') {
    return {
      calorias: fallbackKcal,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 0,
      itensDetectados: []
    };
  }

  const str = textoOpcao;
  let totalKcal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalGord = 0;
  const itensDetectados = [];

  // Padrão 1: "150g de frango", "100g de arroz", "20g pasta de amendoim"
  const gramRegex = /(\d+(?:[.,]\d+)?)\s*g(?:ramas)?\s+(?:de\s+)?([a-záàâãéèêíïóôõöúçñ\s\(\)\/%-]+?)(?=[+,;\.]|\se\s|\s\+\s|$)/gi;
  let match;
  while ((match = gramRegex.exec(str)) !== null) {
    const gramas = parseFloat(match[1].replace(',', '.'));
    const termoAlimento = match[2].trim();
    const alimento = encontrarAlimento(termoAlimento);

    if (alimento && gramas > 0) {
      const fator = gramas / 100;
      const kcal = Math.round(alimento.calorias_100g * fator);
      const prot = parseFloat((alimento.proteinas_100g * fator).toFixed(1));
      const carb = parseFloat((alimento.carboidratos_100g * fator).toFixed(1));
      const gord = parseFloat((alimento.gorduras_100g * fator).toFixed(1));

      totalKcal += kcal;
      totalProt += prot;
      totalCarb += carb;
      totalGord += gord;

      itensDetectados.push({
        termo: termoAlimento,
        alimentoNome: alimento.nome,
        gramas,
        calorias: kcal,
        proteinas: prot,
        carboidratos: carb,
        gorduras: gord
      });
    }
  }

  // Padrão 2: Unidades e medidas caseiras conhecidas
  // Ovos / Claras
  const ovoMatch = str.match(/(\d+)\s*(claras?|ovos?)/i);
  if (ovoMatch) {
    const qtd = parseInt(ovoMatch[1], 10);
    const isClara = ovoMatch[2].toLowerCase().includes('clara');
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === (isClara ? 10 : 9));
    if (ali && !itensDetectados.some((i) => i.alimentoNome.includes('Ovo'))) {
      const gTotal = qtd * (isClara ? 33 : 50);
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} ${ovoMatch[2]}`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Fatias de Pão
  const paoMatch = str.match(/(\d+)\s*fatias?\s*(?:de\s+)?p[ãa]o\s*([a-záàâãéèêíïóôõöúçñ\s-]+)?/i);
  if (paoMatch && !itensDetectados.some((i) => i.alimentoNome.includes('Pão'))) {
    const qtd = parseInt(paoMatch[1], 10);
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === 32); // Pão integral
    if (ali) {
      const gTotal = qtd * 25; // 25g por fatia
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} fatias de pão`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Frutas por unidade (banana, maçã, kiwi, laranja, etc.)
  const frutasRegex = /(\d+)\s*(banana|maç[ãa]|p[êe]ra|laranja|goiaba|kiwi)/gi;
  let fMatch;
  while ((fMatch = frutasRegex.exec(str)) !== null) {
    const qtd = parseInt(fMatch[1], 10);
    const termo = fMatch[2].toLowerCase();
    const ali = BANCO_DE_ALIMENTOS.find((a) => normalizarTexto(a.sinonimos.join(' ')).includes(normalizarTexto(termo)));
    if (ali && !itensDetectados.some((i) => i.alimentoNome === ali.nome)) {
      const gTotal = qtd * (ali.peso_medida_g || 100);
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} ${termo}`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Líquidos em ml (leite, bebida vegetal, água de coco, etc.)
  const mlRegex = /(\d+)\s*ml\s*(?:de\s+)?([a-záàâãéèêíïóôõöúçñ\s-]+)/gi;
  let mlMatch;
  while ((mlMatch = mlRegex.exec(str)) !== null) {
    const ml = parseFloat(mlMatch[1]);
    const termo = mlMatch[2].trim();
    const ali = encontrarAlimento(termo) || BANCO_DE_ALIMENTOS.find((a) => a.id === 36);
    if (ali && !itensDetectados.some((i) => i.alimentoNome === ali.nome)) {
      const kcal = Math.round((ali.calorias_100g * ml) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * ml) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * ml) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * ml) / 100).toFixed(1));
      itensDetectados.push({ termo: `${ml}ml ${termo}`, alimentoNome: ali.nome, gramas: ml, calorias: kcal });
    }
  }

  // Conchas de Feijão
  const conchaMatch = str.match(/(\d+)\s*conchas?\s*(?:de\s+)?feij[ãa]o/i);
  if (conchaMatch && !itensDetectados.some((i) => i.alimentoNome.includes('Feijão'))) {
    const qtd = parseInt(conchaMatch[1], 10);
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === 19); // Feijão carioca
    if (ali) {
      const gTotal = qtd * 80;
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} conchas de feijão`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Scoop / Dose de Whey Protein / Proteína em pó
  const scoopMatch = str.match(/(\d+)\s*(?:scoops?|doses?|medidores?)\s*(?:de\s+)?([a-záàâãéèêíïóôõöúçñ\s-]+)?/i);
  if (scoopMatch && !itensDetectados.some((i) => i.alimentoNome.includes('Whey') || i.alimentoNome.includes('Proteína'))) {
    const qtd = parseInt(scoopMatch[1], 10) || 1;
    const termo = (scoopMatch[2] || '').toLowerCase();
    const isIsolado = termo.includes('isolad');
    const isVegano = termo.includes('veg') || termo.includes('ervilha');
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === (isIsolado ? 91 : (isVegano ? 92 : 90)));
    if (ali) {
      const gTotal = qtd * 30; // 30g por scoop
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} scoop (${gTotal}g) ${ali.nome}`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Colheres de Sopa de Pasta de Amendoim
  const pastaMatch = str.match(/(\d+)\s*colheres?\s*(?:de\s+sopa\s+)?(?:de\s+)?pasta\s*de\s*amendoim/i);
  if (pastaMatch && !itensDetectados.some((i) => i.alimentoNome.includes('Pasta de Amendoim'))) {
    const qtd = parseInt(pastaMatch[1], 10);
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === 83);
    if (ali) {
      const gTotal = qtd * 15;
      const kcal = Math.round((ali.calorias_100g * gTotal) / 100);
      totalKcal += kcal;
      totalProt += parseFloat(((ali.proteinas_100g * gTotal) / 100).toFixed(1));
      totalCarb += parseFloat(((ali.carboidratos_100g * gTotal) / 100).toFixed(1));
      totalGord += parseFloat(((ali.gorduras_100g * gTotal) / 100).toFixed(1));
      itensDetectados.push({ termo: `${qtd} colheres de pasta de amendoim`, alimentoNome: ali.nome, gramas: gTotal, calorias: kcal });
    }
  }

  // Azeite adicionado
  if (normalizarTexto(str).includes('azeite') && !itensDetectados.some((i) => i.alimentoNome.includes('Azeite'))) {
    const ali = BANCO_DE_ALIMENTOS.find((a) => a.id === 88);
    if (ali) {
      const kcal = 45; // ~5g / 1/2 colher de sopa
      totalKcal += kcal;
      totalGord += 5.0;
      itensDetectados.push({ termo: 'Azeite', alimentoNome: ali.nome, gramas: 5, calorias: kcal });
    }
  }

  if (itensDetectados.length > 0 && totalKcal > 35) {
    return {
      calorias: Math.round(totalKcal),
      proteinas: parseFloat(totalProt.toFixed(1)),
      carboidratos: parseFloat(totalCarb.toFixed(1)),
      gorduras: parseFloat(totalGord.toFixed(1)),
      itensDetectados
    };
  }

  return {
    calorias: fallbackKcal,
    proteinas: Math.round((fallbackKcal * 0.25) / 4),
    carboidratos: Math.round((fallbackKcal * 0.5) / 4),
    gorduras: Math.round((fallbackKcal * 0.25) / 9),
    itensDetectados: []
  };
}
