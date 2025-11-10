const db = require('../database/db');
const bcrypt = require('bcryptjs');

async function findUserByEmail(email) {
  const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0];
}

async function createUser(nome, email, senha, tipo_usuario = 'cliente', telefone = null) {
  const salt = await bcrypt.genSalt(10);
  const senha_hash = await bcrypt.hash(senha, salt);
  const { rows } = await db.query(
    `INSERT INTO usuarios (nome, email, senha_hash, telefone, tipo_usuario)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, email, tipo_usuario, telefone, data_criacao`,
    [nome, email, senha_hash, telefone, tipo_usuario]
  );
  return rows[0];
}

async function validatePassword(senha, senha_hash) {
  return bcrypt.compare(senha, senha_hash);
}

async function listClientes() {
  const { rows } = await db.query(
    `SELECT id, nome, email, telefone, tipo_usuario, data_criacao 
     FROM usuarios 
     WHERE tipo_usuario = 'cliente' 
     ORDER BY nome ASC`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await db.query(
    'SELECT id, nome, email, telefone, tipo_usuario, data_criacao FROM usuarios WHERE id = $1', 
    [id]
  );
  return rows[0];
}

async function update(id, { nome, email, telefone, tipo_usuario }) {
  const { rows } = await db.query(
    `UPDATE usuarios
     SET nome = $1, email = $2, telefone = $3, tipo_usuario = $4
     WHERE id = $5
     RETURNING id, nome, email, tipo_usuario, telefone, data_criacao`,
    [nome, email, telefone, tipo_usuario, id]
  );
  return rows[0];
}

async function deleteById(id) {
  const { rows } = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
  return rows[0];
}

module.exports = { 
  findUserByEmail, 
  createUser, 
  validatePassword,
  listClientes,
  getById,
  update,
  deleteById
};