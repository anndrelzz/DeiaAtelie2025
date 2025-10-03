const agendaService = require('../services/agendaService');

async function list(req, res) {
  try {
    const items = await agendaService.listConfigsAtivas();
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao buscar configuração de agenda.' });
  }
}

module.exports = { list };
