import { neon } from '@neondatabase/serverless';

// Helper local para criar a conexão neon com o timezone configurado
function getDb() {
  const url = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_DATABASE_URL);
  return neon(url);
}

/**
 * Define o timezone local antes de executar uma query
 */
async function runWithTimezone(queryFn) {
  const sql = getDb();
  await sql`SET LOCAL timezone = 'America/Sao_Paulo'`;
  return await queryFn(sql);
}

/**
 * Salva/atualiza a nutricionista na tabela `nutricionistas`
 */
export async function saveNutricionista(nome, email) {
  try {
    await runWithTimezone(async (sql) => {
      await sql`
        INSERT INTO nutricionistas (nome, email)
        VALUES (${nome}, ${email})
        ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome
      `;
    });
  } catch (err) {
    console.error('Erro ao salvar nutricionista:', err);
  }
}

/**
 * Busca o ID da nutricionista baseada no email logado
 */
export async function getNutricionistaByEmail(email) {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, nome, email FROM nutricionistas WHERE email = ${email} LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error('Erro ao obter nutricionista:', err);
    return null;
  }
}

/**
 * Retorna todos os nutricionistas cadastrados no banco
 */
export async function getNutricionistas() {
  try {
    const sql = getDb();
    return await sql`SELECT id, nome, email, created_at FROM nutricionistas ORDER BY nome ASC`;
  } catch (err) {
    console.error('Erro ao listar nutricionistas:', err);
    return [];
  }
}

/**
 * CRUD de Pacientes
 */
export async function getPacientes(nutricionistaId) {
  try {
    const sql = getDb();
    return await sql`
      SELECT * FROM pacientes 
      WHERE nutricionista_id = ${nutricionistaId} 
      ORDER BY nome ASC
    `;
  } catch (err) {
    console.error('Erro ao buscar pacientes:', err);
    return [];
  }
}

export async function savePaciente(data) {
  try {
    return await runWithTimezone(async (sql) => {
      const rows = await sql`
        INSERT INTO pacientes (
          nutricionista_id, nome, data_nascimento, sexo, whatsapp, email, 
          peso_inicial, altura, objetivos, nivel_atividade, patologias, 
          restricoes_alimentares, alergias, medicamentos, suplementos, 
          refeicoes_por_dia, horario_acorda, horario_dorme, litros_agua, 
          atividade_fisica, atividade_fisica_descricao, observacoes
        ) VALUES (
          ${data.nutricionista_id}, ${data.nome}, ${data.data_nascimento || null}, 
          ${data.sexo || null}, ${data.whatsapp || null}, ${data.email || null}, 
          ${data.peso_inicial || null}, ${data.altura || null}, 
          ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null}::text[], ${data.nivel_atividade || null}, 
          ${data.patologias && data.patologias.length > 0 ? data.patologias : null}::text[], 
          ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null}::text[], 
          ${data.alergias && data.alergias.length > 0 ? data.alergias : null}::text[], ${data.medicamentos || null}, 
          ${data.suplementos || null}, ${data.refeicoes_por_dia || null}, 
          ${data.horario_acorda || null}, ${data.horario_dorme || null}, 
          ${data.litros_agua || null}, ${data.atividade_fisica || false}, 
          ${data.atividade_fisica_descricao || null}, ${data.observacoes || null}
        ) RETURNING *
      `;
      return rows[0];
    });
  } catch (err) {
    console.error('Erro ao salvar paciente:', err);
    throw err;
  }
}

export async function updatePaciente(id, data) {
  try {
    return await runWithTimezone(async (sql) => {
      const rows = await sql`
        UPDATE pacientes SET
          nome = ${data.nome},
          data_nascimento = ${data.data_nascimento || null},
          sexo = ${data.sexo || null},
          whatsapp = ${data.whatsapp || null},
          email = ${data.email || null},
          peso_inicial = ${data.peso_inicial || null},
          altura = ${data.altura || null},
          objetivos = ${data.objetivos && data.objetivos.length > 0 ? data.objetivos : null}::text[],
          nivel_atividade = ${data.nivel_atividade || null},
          patologias = ${data.patologias && data.patologias.length > 0 ? data.patologias : null}::text[],
          restricoes_alimentares = ${data.restricoes_alimentares && data.restricoes_alimentares.length > 0 ? data.restricoes_alimentares : null}::text[],
          alergias = ${data.alergias && data.alergias.length > 0 ? data.alergias : null}::text[],
          medicamentos = ${data.medicamentos || null},
          suplementos = ${data.suplementos || null},
          refeicoes_por_dia = ${data.refeicoes_por_dia || null},
          horario_acorda = ${data.horario_acorda || null},
          horario_dorme = ${data.horario_dorme || null},
          litros_agua = ${data.litros_agua || null},
          atividade_fisica = ${data.atividade_fisica || false},
          atividade_fisica_descricao = ${data.atividade_fisica_descricao || null},
          observacoes = ${data.observacoes || null}
        WHERE id = ${id}
        RETURNING *
      `;
      return rows[0];
    });
  } catch (err) {
    console.error('Erro ao atualizar paciente:', err);
    throw err;
  }
}

export async function deletePaciente(id) {
  try {
    const sql = getDb();
    // Exclui em cascata manual (se necessário dependendo das chaves estrangeiras)
    await sql`DELETE FROM planos_alimentares WHERE paciente_id = ${id}`;
    await sql`DELETE FROM consultas WHERE paciente_id = ${id}`;
    await sql`DELETE FROM pacientes WHERE id = ${id}`;
    return true;
  } catch (err) {
    console.error('Erro ao deletar paciente:', err);
    throw err;
  }
}

/**
 * CRUD de Consultas
 */
export async function getConsultas(pacienteId) {
  try {
    const sql = getDb();
    return await sql`
      SELECT * FROM consultas 
      WHERE paciente_id = ${pacienteId} 
      ORDER BY data_consulta DESC
    `;
  } catch (err) {
    console.error('Erro ao buscar consultas:', err);
    return [];
  }
}

export async function saveConsulta(data) {
  try {
    return await runWithTimezone(async (sql) => {
      const rows = await sql`
        INSERT INTO consultas (
          paciente_id, data_consulta, peso, cintura, quadril, 
          percentual_gordura, observacoes, proximo_retorno
        ) VALUES (
          ${data.paciente_id}, ${data.data_consulta}, ${data.peso || null}, 
          ${data.cintura || null}, ${data.quadril || null}, 
          ${data.percentual_gordura || null}, ${data.observacoes || null}, 
          ${data.proximo_retorno || null}
        ) RETURNING *
      `;
      return rows[0];
    });
  } catch (err) {
    console.error('Erro ao salvar consulta:', err);
    throw err;
  }
}

export async function updateConsulta(id, data) {
  try {
    return await runWithTimezone(async (sql) => {
      const rows = await sql`
        UPDATE consultas SET
          data_consulta = ${data.data_consulta},
          peso = ${data.peso || null},
          cintura = ${data.cintura || null},
          quadril = ${data.quadril || null},
          percentual_gordura = ${data.percentual_gordura || null},
          observacoes = ${data.observacoes || null},
          proximo_retorno = ${data.proximo_retorno || null}
        WHERE id = ${id}
        RETURNING *
      `;
      return rows[0];
    });
  } catch (err) {
    console.error('Erro ao atualizar consulta:', err);
    throw err;
  }
}

export async function deleteConsulta(id) {
  try {
    const sql = getDb();
    await sql`DELETE FROM consultas WHERE id = ${id}`;
    return true;
  } catch (err) {
    console.error('Erro ao deletar consulta:', err);
    throw err;
  }
}

/**
 * CRUD de Planos Alimentares
 */
export async function getPlanos(pacienteId) {
  try {
    const sql = getDb();
    return await sql`
      SELECT * FROM planos_alimentares 
      WHERE paciente_id = ${pacienteId} 
      ORDER BY created_at DESC
    `;
  } catch (err) {
    console.error('Erro ao obter planos alimentares:', err);
    return [];
  }
}

export async function savePlano(data) {
  try {
    return await runWithTimezone(async (sql) => {
      const rows = await sql`
        INSERT INTO planos_alimentares (paciente_id, conteudo)
        VALUES (${data.paciente_id}, ${JSON.stringify(data.conteudo)})
        RETURNING *
      `;
      return rows[0];
    });
  } catch (err) {
    console.error('Erro ao salvar plano alimentar:', err);
    throw err;
  }
}

export async function deletePlano(id) {
  try {
    const sql = getDb();
    await sql`DELETE FROM planos_alimentares WHERE id = ${id}`;
    return true;
  } catch (err) {
    console.error('Erro ao deletar plano alimentar:', err);
    throw err;
  }
}

/**
 * Carrega estatísticas globais para a visão geral
 */
export async function getGlobalStats(nutricionistaId) {
  try {
    const sql = getDb();
    
    // Obter quantidade de pacientes
    const pacCountRes = await sql`
      SELECT COUNT(*) as count FROM pacientes WHERE nutricionista_id = ${nutricionistaId}
    `;
    const pacCount = parseInt(pacCountRes[0]?.count || 0);

    // Obter quantidade de nutricionistas cadastrados no sistema
    const nutCountRes = await sql`
      SELECT COUNT(*) as count FROM nutricionistas
    `;
    const nutCount = parseInt(nutCountRes[0]?.count || 0);

    // Obter quantidade de consultas das nutricionistas
    const consCountRes = await sql`
      SELECT COUNT(*) as count FROM consultas 
      WHERE paciente_id IN (SELECT id FROM pacientes WHERE nutricionista_id = ${nutricionistaId})
    `;
    const consCount = parseInt(consCountRes[0]?.count || 0);

    // Obter quantidade de planos alimentares criados
    const planCountRes = await sql`
      SELECT COUNT(*) as count FROM planos_alimentares
      WHERE paciente_id IN (SELECT id FROM pacientes WHERE nutricionista_id = ${nutricionistaId})
    `;
    const planCount = parseInt(planCountRes[0]?.count || 0);

    return {
      pacientes: pacCount,
      nutricionistas: nutCount,
      consultas: consCount,
      planos: planCount
    };
  } catch (err) {
    console.error('Erro ao carregar estatísticas:', err);
    return { pacientes: 0, nutricionistas: 0, consultas: 0, planos: 0 };
  }
}
