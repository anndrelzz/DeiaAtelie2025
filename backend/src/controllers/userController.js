const userService = require('../services/userService');

async function list(req, res) {
  try {
    const items = await userService.listClientes();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar clientes.' });
  }
}

async function get(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await userService.getById(id);
    if (!item) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
}

async function create(req, res) {
  try {
    const { nome, email, senha, telefone, tipo_usuario } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }
    const item = await userService.createUser(nome, email, senha, tipo_usuario || 'cliente', telefone);
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    if (e.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado.' });
    res.status(500).json({ error: 'Erro ao criar cliente.' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nome, email, telefone, tipo_usuario } = req.body;
    if (!nome || !email || !tipo_usuario) {
      return res.status(400).json({ error: 'Nome, email e tipo de usuário são obrigatórios.' });
    }
    const item = await userService.update(id, { nome, email, telefone, tipo_usuario });
    if (!item) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.json(item);
  } catch (e) {
    console.error(e);
    if (e.code === '23505') return res.status(409).json({ error: 'E-mail já cadastrado por outro usuário.' });
    res.status(500).json({ error: 'Erro ao atualizar cliente.' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await userService.deleteById(id);
    if (!item) return res.status(404).json({ error: 'Cliente não encontrado.' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    if (e.code === '23503') return res.status(409).json({ error: 'Não é possível apagar. Cliente possui agendamentos.' });
    res.status(500).json({ error: 'Erro ao apagar cliente.' });
  }
}

module.exports = { list, get, create, update, remove };