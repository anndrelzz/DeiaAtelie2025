const db = require('../database/db');
const bcrypt = require('bcryptjs');

// encontrar um usuário por e-mail
const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return result.rows[0];
};

// criar novo usuário
const createUser = async (nome, email, senha, tipoUsuario) => {
  const senhaHash = await bcrypt.hash(senha, 10);
  const result = await db.query(
    'INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING *',
    [nome, email, senhaHash, tipoUsuario]
  );
  return result.rows[0];
};

//validar a senha
const validatePassword = async (senha, senhaHash) => {
  return await bcrypt.compare(senha, senhaHash);
};

module.exports = {
  findUserByEmail,
  createUser,
  validatePassword,
};