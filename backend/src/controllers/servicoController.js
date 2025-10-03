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

module.exports = { list };
