const db = require('../database/db');

//Verificação de conflito nos horarios
async function hasOverlap(id_servico, inicio, fim) {
  const { rows } = await db.query(
    `SELECT 1 FROM agendamentos
     WHERE id_servico = $1
       AND status IN ('pendente','confirmado')
       AND tstzrange(data_hora_inicio, data_hora_fim, '[)') && tstzrange($2, $3, '[)')
     LIMIT 1`,
    [id_servico, inicio, fim]
  );
  return !!rows[0];
}


async function isWithinAgenda(inicio, fim) {
  if (!inicio || !fim) return false;

  const start = new Date(inicio);
  const end = new Date(fim);
  if (isNaN(start) || isNaN(end)) return false;
  if (end <= start) return false;

  // Bloqueia agendamentos 
  if (
    start.getUTCFullYear() !== end.getUTCFullYear() ||
    start.getUTCMonth() !== end.getUTCMonth() ||
    start.getUTCDate() !== end.getUTCDate()
  ) {
    return false;
  }

  const dow = start.getUTCDay(); // 0..6
  const { rows } = await db.query(
    `SELECT hora_inicio, hora_fim
     FROM configuracao_agenda
     WHERE ativo = true AND dia_da_semana = $1`,
    [dow]
  );

  if (!rows.length) return false;

  const toMinutes = (d) => d.getUTCHours() * 60 + d.getUTCMinutes();
  const sMin = toMinutes(start);
  const eMin = toMinutes(end);

  for (const r of rows) {
    const [h1, m1] = String(r.hora_inicio).split(':').map(Number);
    const [h2, m2] = String(r.hora_fim).split(':').map(Number);
    const wStart = h1 * 60 + m1;
    const wEnd = h2 * 60 + m2;
    // Janela [wStart, wEnd)
    if (sMin >= wStart && eMin <= wEnd) {
      return true;
    }
  }
  return false;
}

async function create({ id_usuario, id_servico, data_hora_inicio, data_hora_fim, observacoes }) {
  // 1) Dentro do horário configurado
  const okAgenda = await isWithinAgenda(data_hora_inicio, data_hora_fim);
  if (!okAgenda) {
    const err = new Error('Fora do horário permitido na agenda ou intervalo inválido.');
    err.code = 'AGENDA_WINDOW';
    throw err;
  }

  // 2) Sem colisão para o mesmo serviço
  const overlap = await hasOverlap(id_servico, data_hora_inicio, data_hora_fim);
  if (overlap) {
    const err = new Error('Conflito de horário para este serviço.');
    err.code = 'OVERLAP';
    throw err;
  }

  const { rows } = await db.query(
    `INSERT INTO agendamentos (id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes)
     VALUES ($1, $2, $3, $4, 'pendente', $5)
     RETURNING id, id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes, data_criacao`,
    [id_usuario, id_servico, data_hora_inicio, data_hora_fim, observacoes || null]
  );
  return rows[0];
}

async function listByUser(id_usuario) {
  const { rows } = await db.query(
    `SELECT a.*, s.nome as servico_nome, s.duracao_estimada_minutos
     FROM agendamentos a
     JOIN servicos s ON s.id = a.id_servico
     WHERE a.id_usuario = $1
     ORDER BY a.data_hora_inicio DESC`,
    [id_usuario]
  );
  return rows;
}

module.exports = { create, listByUser };
