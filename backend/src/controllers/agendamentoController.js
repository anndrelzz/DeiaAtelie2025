const agService = require('../services/agendamentoService');

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

module.exports = { create, listMine };
