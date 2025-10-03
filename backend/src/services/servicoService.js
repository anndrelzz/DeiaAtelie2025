const db = require('../database/db');

async function listServicosAtivos() {
  const { rows } = await db.query(
    'SELECT id, nome, descricao, preco, duracao_estimada_minutos FROM servicos WHERE ativo = true ORDER BY nome ASC'
  );
  return rows;
}

module.exports = { listServicosAtivos };
