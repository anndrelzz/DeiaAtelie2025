const db = require('../database/db');

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
  if (
    start.getUTCFullYear() !== end.getUTCFullYear() ||
    start.getUTCMonth() !== end.getUTCMonth() ||
    start.getUTCDate() !== end.getUTCDate()
  ) {
    return false;
  }
  const dow = start.getUTCDay();
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
    if (sMin >= wStart && eMin <= wEnd) {
      return true;
    }
  }
  return false;
}

async function create({ id_usuario, id_servico, data_hora_inicio, data_hora_fim, observacoes }) {
  const okAgenda = await isWithinAgenda(data_hora_inicio, data_hora_fim);
  if (!okAgenda) {
    const err = new Error('Fora do horário permitido na agenda ou intervalo inválido.');
    err.code = 'AGENDA_WINDOW';
    throw err;
  }
  const overlap = await hasOverlap(id_servico, data_hora_inicio, data_hora_fim);
  if (overlap) {
    const err = new Error('Conflito de horário para este serviço.');
    err.code = 'OVERLAP';
    throw err;
  }
  const { rows } = await db.query(
    `INSERT INTO agendamentos (id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes)
     VALUES ($1, $2, $3, $4, 'pendente', $5)
     RETURNING *`,
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

async function listAll() {
  const { rows } = await db.query(
    `SELECT a.*, u.nome as usuario_nome, s.nome as servico_nome
     FROM agendamentos a
     JOIN usuarios u ON u.id = a.id_usuario
     JOIN servicos s ON s.id = a.id_servico
     ORDER BY a.data_hora_inicio DESC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    `SELECT a.*, u.nome as usuario_nome, s.nome as servico_nome
     FROM agendamentos a
     JOIN usuarios u ON u.id = a.id_usuario
     JOIN servicos s ON s.id = a.id_servico
     WHERE a.id = $1`,
    [id]
  );
  return rows[0];
}

async function update(id, { id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes }) {
  const { rows } = await db.query(
    `UPDATE agendamentos
     SET id_usuario = $1, id_servico = $2, data_hora_inicio = $3, data_hora_fim = $4, status = $5, observacoes = $6
     WHERE id = $7
     RETURNING *`,
    [id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes, id]
  );
  return rows[0];
}

async function deleteById(id) {
  const { rows } = await db.query('DELETE FROM agendamentos WHERE id = $1 RETURNING id', [id]);
  return rows[0];
}

module.exports = {
  create,
  listByUser,
  listAll,
  getById,
  update,
  deleteById
};