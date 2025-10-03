const db = require('../database/db');

async function listConfigsAtivas() {
  const { rows } = await db.query(
    'SELECT id, dia_da_semana, hora_inicio, hora_fim, ativo FROM configuracao_agenda WHERE ativo = true ORDER BY dia_da_semana asc, hora_inicio asc'
  );
  return rows;
}

module.exports = { listConfigsAtivas };
