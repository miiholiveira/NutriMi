import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

/**
 * Serverless Function: /api/gerar-plano
 * Gera plano alimentar semanal estruturado via Google Gemini AI
 */
export default async function handler(req, res) {
  // Garantir apenas método POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Método não permitido. Utilize POST.' });
  }

  // Obter chave estritamente do ambiente backend
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('Erro de configuração: GOOGLE_API_KEY não definida no ambiente backend.');
    return res.status(500).json({
      ok: false,
      error: 'Chave da API do Google Gemini não configurada no servidor.'
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'Payload JSON inválido.' });
    }
  }

  const paciente = body?.paciente;
  if (!paciente) {
    return res.status(400).json({ ok: false, error: 'Dados do paciente não informados no corpo da requisição.' });
  }

  // Formatar dados do paciente para o prompt clínico
  const dadosFormatados = `
- Nome: ${paciente.nome || 'Paciente'}
- Idade: ${paciente.idade || 'Não informada'} anos
- Sexo / Gênero: ${paciente.sexo || 'Não informado'}
- Peso Atual: ${paciente.peso_inicial || '—'} kg
- Altura: ${paciente.altura || '—'} m
- Nível de Atividade Física: ${paciente.nivel_atividade || 'Leve'}
- Metas e Objetivos: ${Array.isArray(paciente.objetivos) ? paciente.objetivos.join(', ') : (paciente.objetivos || 'Saúde & Reeducação Alimentar')}
- Alergias Alimentares: ${Array.isArray(paciente.alergias) && paciente.alergias.length > 0 ? paciente.alergias.join(', ') : 'Nenhuma alergia relatada'}
- Restrições Alimentares / Intolerâncias: ${Array.isArray(paciente.restricoes_alimentares) && paciente.restricoes_alimentares.length > 0 ? paciente.restricoes_alimentares.join(', ') : 'Nenhuma restrição relatada'}
- Histórico / Observações: ${paciente.observacoes || paciente.objetivo_texto || 'Sem observações adicionais'}
  `.trim();

  // Prompt clínico oficial especializado com exigência de refeições completas
  const promptOficial = `
Você é um nutricionista clínico profissional especialista na culinária e rotina brasileira.
Gere um plano alimentar semanal completo, saudável e diversificado com base nos dados do paciente fornecidos abaixo.

Dados do Paciente (Metas, Alergias, Restrições e Histórico):
${dadosFormatados}

# REGRA FUNDAMENTAL E OBRIGATÓRIA DE PRESCRIÇÃO:
- CADA UMA DAS 5 OPÇÕES DE UMA REFEIÇÃO DEVE SER UMA REFEIÇÃO COMPLETA E BALANCEADA, E NUNCA UM INGREDIENTE ISOLADO!
- NUNCA retorne apenas "3 ovos mexidos" ou apenas "1 fatia de mamão" como uma opção inteira de café da manhã.
- Toda opção deve ser um prato / menu completo que uma pessoa come na refeição inteira, combinando carboidrato, proteína e acompanhamentos (frutas, vegetais, bebida).
- Use o sinal "+" para unir os alimentos que formam a refeição completa.

EXEMPLOS CLÍNICOS DO PADRÃO OBRIGATÓRIO PARA CADA OPÇÃO:
* Café da Manhã (Exemplos de opções completas equivalentes):
  - Opção 1: "2 fatias de pão integral (50g) + 2 ovos mexidos (100g) com orégano + 1 fatia de mamão papaia (100g) + 1 xícara de café preto sem açúcar"
  - Opção 2: "Tapioca (60g) com 2 ovos mexidos e queijo branco (30g) + 1 copo de suco de laranja natural (200ml)"
  - Opção 3: "Cuscuz de milho (100g) com 2 ovos cozidos e 1 colher de sobremesa de azeite + 1 fatia de queijo minas + 1 xícara de café com leite"
  - Opção 4: "Bowl de iogurte natural (170g) com 30g de aveia em flocos + 1 banana prata fatiada + 1 colher de sopa de chia"
  - Opção 5: "Crepioca (1 ovo + 2 colheres de sopa de goma de tapioca) recheada com queijo cottage + 1 maçã picada"

* Almoço (Exemplos de opções completas equivalentes):
  - Opção 1: "120g de arroz integral + 1 concha de feijão carioca (80g) + 130g de peito de frango grelhado + salada crua à vontade com 1 colher de azeite"
  - Opção 2: "150g de batata doce cozida + 130g de patinho moído grelhado + legumes no vapor (brócolis e cenoura) + salada de folhas"
  - Opção 3: "120g de purê de abóbora cabotiá + 140g de filé de tilápia grelhado + 1 concha de feijão preto + salada de tomate e rúcula"
  - Opção 4: "130g de macarrão integral com molho caseiro de tomate + 130g de carne moída magra + salada verde com azeite"
  - Opção 5: "150g de mandioca cozida + 130g de peito de frango desfiado com legumes + mix de salada com azeite de oliva"

* Lanches (Exemplos de opções completas equivalentes):
  - "1 banana prata + 1 colher de sopa de pasta de amendoim (15g) + 200ml de leite ou bebida vegetal"
  - "1 maçã fatiada + 20g de castanhas de caju + 1 iogurte natural (170g)"
  - "Sanduíche natural de 2 fatias de pão integral com pasta de atum ou ricota + 1 copo de suco natural"

* Jantar (Exemplos de opções completas equivalentes):
  - "Omelete com 3 ovos, tomate, cebola e espinafre + salada verde grande com 1 colher de azeite + 2 torradas integrais"
  - "1 prato fundo de sopa nutritiva de legumes com frango desfiado (120g) e mandioquinha + salada crua"
  - "130g de filé de peixe grelhado + 150g de legumes assados (abobrinha, cenoura, tomate) + salada de folhas"

# OUTRAS REGRAS:
- Você deve responder APENAS e estritamente o objeto JSON solicitado.
- Adapte rigorosamente a quaisquer alergias ou restrições descritas nos dados (${paciente?.restricoes_alimentares?.join(', ') || 'Nenhuma'} | Alergias: ${paciente?.alergias?.join(', ') || 'Nenhuma'}).
- Utilize alimentos comuns, acessíveis e culturalmente aceitos no Brasil.
- Evite repetições monótonas de alimentos nos dias seguidos.

O formato do JSON retornado deve seguir exatamente esta estrutura:
{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["Opção 1 completa...", "Opção 2 completa...", "Opção 3 completa...", "Opção 4 completa...", "Opção 5 completa..."],
        "lanche_manha": ["Opção 1 completa...", "Opção 2 completa...", "Opção 3 completa...", "Opção 4 completa...", "Opção 5 completa..."],
        "almoco": ["Opção 1 completa...", "Opção 2 completa...", "Opção 3 completa...", "Opção 4 completa...", "Opção 5 completa..."],
        "lanche_tarde": ["Opção 1 completa...", "Opção 2 completa...", "Opção 3 completa...", "Opção 4 completa...", "Opção 5 completa..."],
        "jantar": ["Opção 1 completa...", "Opção 2 completa...", "Opção 3 completa...", "Opção 4 completa...", "Opção 5 completa..."]
      }
    }
  ]
}
`.trim();

  // Schema formal para garantir Structured Outputs estritos
  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      plano_semanal: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            dia: { type: SchemaType.STRING },
            refeicoes: {
              type: SchemaType.OBJECT,
              properties: {
                cafe_da_manha: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                lanche_manha: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                almoco: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                lanche_tarde: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                jantar: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              },
              required: ['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar']
            }
          },
          required: ['dia', 'refeicoes']
        }
      }
    },
    required: ['plano_semanal']
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];

    let lastError = null;
    let rawText = null;

    for (const modelName of candidateModels) {
      // Tenta até 2 vezes por modelo em caso de 503 (sobrecarga temporária da API Google)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[API Gerar Plano] Tentando gerar com modelo: ${modelName} (tentativa ${attempt})...`);
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: schema,
              temperature: 0.6
            }
          });

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('TIMEOUT_GEMINI')), 45000);
          });

          const result = await Promise.race([
            model.generateContent(promptOficial),
            timeoutPromise
          ]);

          rawText = result?.response?.text();
          if (rawText) {
            console.log(`[API Gerar Plano] Sucesso com ${modelName}! Tamanho: ${rawText.length} caracteres.`);
            break;
          }
        } catch (err) {
          lastError = err;
          console.warn(`[API Gerar Plano] Erro com ${modelName} (tentativa ${attempt}):`, err.message);
          const is503 = String(err.message || '').includes('503') || err.status === 503 || String(err.message || '').includes('high demand');
          const is429 = String(err.message || '').includes('429') || err.status === 429;

          if ((is503 || is429) && attempt === 1) {
            await new Promise(r => setTimeout(r, 1200));
          } else {
            break;
          }
        }
      }

      if (rawText) break;
    }

    if (!rawText) {
      throw (lastError || new Error('Não foi possível obter resposta dos modelos do Google Gemini.'));
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Erro no JSON.parse da resposta do Gemini:', parseErr, rawText);
      throw new Error('Falha ao processar o formato JSON retornado pela IA.');
    }

    if (!parsed.plano_semanal || !Array.isArray(parsed.plano_semanal)) {
      throw new Error('Estrutura de plano semanal ausente no retorno da IA.');
    }

    return res.status(200).json({
      ok: true,
      data: parsed
    });
  } catch (error) {
    console.error('Erro na Serverless Function /api/gerar-plano:', error);
    const isTimeout = error.message === 'TIMEOUT_GEMINI';
    return res.status(500).json({
      ok: false,
      isTimeout,
      error: isTimeout
        ? 'O tempo limite para geração com IA foi atingido.'
        : (error.message || 'Falha interna ao gerar plano alimentar com IA.')
    });
  }
}
