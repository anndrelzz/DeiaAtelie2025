const servicoService = require('../services/servicoService');

async function list(req, res) {
  try {
    const items = await servicoService.listServicosAtivos();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar serviços.' });
  }
}

async function create(req, res) {
  try {
    const { nome, descricao, preco, duracao_estimada_minutos } = req.body;
    if (!nome || !preco || !duracao_estimada_minutos) {
      return res.status(400).json({ error: 'Nome, preço e duração são obrigatórios.' });
    }
    const item = await servicoService.create({ nome, descricao, preco, duracao_estimada_minutos });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Já existe um serviço com este nome.' });
    }
    res.status(500).json({ error: 'Erro ao criar serviço.' });
  }
}

async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { nome, descricao, preco, duracao_estimada_minutos, ativo } = req.body;

    if (!nome || !preco || !duracao_estimada_minutos || ativo === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }
    
    const item = await servicoService.update(id, { nome, descricao, preco, duracao_estimada_minutos, ativo });
    if (!item) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    res.json(item);
  } catch (e) {
    console.error(e);
     if (e.code === '23505') {
      return res.status(409).json({ error: 'Já existe um serviço com este nome.' });
    }
    res.status(500).json({ error: 'Erro ao atualizar serviço.' });
  }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await servicoService.deleteById(id);
    if (!item) {
      return res.status(404).json({ error: 'Serviço não encontrado.' });
    }
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao apagar serviço.' });
  }
}

module.exports = { 
  list,
  create,
  update,
  remove 
};