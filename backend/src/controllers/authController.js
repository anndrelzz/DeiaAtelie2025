const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

const mapTipo = (tipo_usuario) => {
  const allow = ['administrador', 'cliente'];
  if (allow.includes(tipo_usuario)) return tipo_usuario;
  return 'cliente';
};

const register = async (req, res) => {
  const { nome, email, senha, tipo_usuario, telefone } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos (nome, email, senha) são obrigatórios.' });
  }
  try {
    const existing = await userService.findUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'E-mail já cadastrado.' });

    const user = await userService.createUser(
      nome,
      email,
      senha,
      mapTipo(tipo_usuario),
      telefone || null
    );

    const payload = { sub: user.id, email: user.email, tipo_usuario: user.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

  try {
    const user = await userService.findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const ok = await userService.validatePassword(senha, user.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const payload = { sub: user.id, email: user.email, tipo_usuario: user.tipo_usuario };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario,
        telefone: user.telefone,
        data_criacao: user.data_criacao,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

module.exports = { register, login };
