const db = require('../database/db');

async function listServicosAtivos() {
  const { rows } = await db.query(
    'SELECT id, nome, descricao, preco, duracao_estimada_minutos FROM servicos WHERE ativo = true ORDER BY nome ASC'
  );
  return rows;
}

async function create({ nome, descricao, preco, duracao_estimada_minutos }) {
  const { rows } = await db.query(
    `INSERT INTO servicos (nome, descricao, preco, duracao_estimada_minutos, ativo)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [nome, descricao, preco, duracao_estimada_minutos]
  );
  return rows[0];
}

async function update(id, { nome, descricao, preco, duracao_estimada_minutos, ativo }) {
  const { rows } = await db.query(
    `UPDATE servicos
     SET nome = $1, descricao = $2, preco = $3, duracao_estimada_minutos = $4, ativo = $5
     WHERE id = $6
     RETURNING *`,
    [nome, descricao, preco, duracao_estimada_minutos, ativo, id]
  );
  return rows[0];
}

async function deleteById(id) {
  const { rows } = await db.query(
    `UPDATE servicos SET ativo = false WHERE id = $1 RETURNING id`,
    [id]
  );
  return rows[0];
}

async function listAllAdmin() {
  const { rows } = await db.query(
    'SELECT * FROM servicos ORDER BY nome ASC'
  );
  return rows;
}

module.exports = { 
  listServicosAtivos,
  listAllAdmin,
  create,
  update,
  deleteById
};