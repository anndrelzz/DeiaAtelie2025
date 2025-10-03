const router = require('express').Router();
const { create, listMine } = require('../controllers/agendamentoController');
const { requireAuth } = require('../middlewares/auth');

router.post('/', requireAuth, create);
router.get('/me', requireAuth, listMine);

module.exports = router;
