const agService = require('../services/agendamentoService');

// (Cliente) Cria um novo agendamento
async function create(req, res) {
  try {
    const id_usuario = Number(req.user?.sub);
    const { id_servico, data_hora_inicio, data_hora_fim, observacoes } = req.body;
    if (!id_usuario || !id_servico || !data_hora_inicio || !data_hora_fim) {
      return res.status(400).json({ error: 'id_servico, data_hora_inicio e data_hora_fim são obrigatórios.' });
    }
    const item = await agService.create({
      id_usuario,
      id_servico,
      data_hora_inicio,
      data_hora_fim,
      observacoes,
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    if (e.code === 'OVERLAP') return res.status(409).json({ error: e.message });
    if (e.code === 'AGENDA_WINDOW') return res.status(400).json({ error: e.message });
    if (e.code === '23503') return res.status(400).json({ error: 'Usuário ou serviço inexistente.' });
    if (e.code === '23514') return res.status(400).json({ error: 'Status inválido.' });
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
}

// (Cliente) Lista os meus agendamentos
async function listMine(req, res) {
  try {
    const id_usuario = Number(req.user?.sub);
    if (!id_usuario) return res.status(401).json({ error: 'Não autenticado.' });
    const items = await agService.listByUser(id_usuario);
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar seus agendamentos.' });
  }
}

// (Admin) Lista TODOS os agendamentos
async function listAll(req, res) {
  try {
    const items = await agService.listAll();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
}

// (Admin) Busca um agendamento por ID
async function get(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await agService.getById(id);
    if (!item) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar agendamento.' });
  }
}

// (Admin) Atualiza um agendamento
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes } = req.body;
    
    if (!id_usuario || !id_servico || !data_hora_inicio || !data_hora_fim || !status) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }
    
    const item = await agService.update(id, { id_usuario, id_servico, data_hora_inicio, data_hora_fim, status, observacoes });
    if (!item) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.json(item);
  } catch (e) {
    console.error(e);
    if (e.code === '23503') return res.status(400).json({ error: 'Usuário ou serviço inexistente.' });
    if (e.code === '23514') return res.status(400).json({ error: 'Status inválido.' });
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
}

// (Admin) Apaga um agendamento
async function remove(req, res) {
  try {
    const id = Number(req.params.id);
    const item = await agService.deleteById(id);
    if (!item) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao apagar agendamento.' });
  }
}

async function adminCreate(req, res) {
  try {
    const { id_usuario, id_servico, data_hora_inicio, data_hora_fim, observacoes } = req.body; 

    if (!id_usuario || !id_servico || !data_hora_inicio || !data_hora_fim) {
      return res.status(400).json({ error: 'id_usuario, id_servico, data_hora_inicio e data_hora_fim são obrigatórios.' });
    }
    
    const item = await agService.create({ 
      id_usuario,
      id_servico,
      data_hora_inicio,
      data_hora_fim,
      observacoes,
    });
    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    if (e.code === 'OVERLAP') return res.status(409).json({ error: e.message });
    if (e.code === 'AGENDA_WINDOW') return res.status(400).json({ error: e.message });
    if (e.code === '23503') return res.status(400).json({ error: 'Usuário ou serviço inexistente.' });
    if (e.code === '23514') return res.status(400).json({ error: 'Status inválido.' });
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
}

module.exports = { 
  create, 
  listMine,
  listAll,
  get,
  update,
  remove,
  adminCreate
};