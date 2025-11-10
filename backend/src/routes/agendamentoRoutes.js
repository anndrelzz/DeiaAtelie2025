const router = require('express').Router();
const { 
  create, 
  listMine,
  listAll,
  get,
  update,
  remove 
} = require('../controllers/agendamentoController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

// --- Rotas do Cliente ---
router.post('/', requireAuth, create);
router.get('/me', requireAuth, listMine);

// --- Rotas do Admin ---
router.get('/', requireAuth, requireAdmin, listAll);
router.get('/:id', requireAuth, requireAdmin, get);
router.put('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);

module.exports = router;