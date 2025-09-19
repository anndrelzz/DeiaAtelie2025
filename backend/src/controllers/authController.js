const userService = require('../services/userService');
const jwt = require('jsonwebtoken');

// Cadastro
const register = async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }

    const newUser = await userService.createUser(nome, email, senha, tipo_usuario || 'cliente');
    
    // Gera token para o novo usuário
    const token = jwt.sign({ id: newUser.id, tipo_usuario: newUser.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso!', 
      token,
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        tipo_usuario: newUser.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// login
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const isPasswordValid = await userService.validatePassword(senha, user.senha_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    // Gera token para usuário logado
    const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ 
      message: 'Login bem-sucedido!', 
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = {
  register,
  login,
};