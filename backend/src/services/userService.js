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

module.exports = { findUserByEmail, createUser, validatePassword };
