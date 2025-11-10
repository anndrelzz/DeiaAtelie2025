const router = require('express').Router();
const { list, listAllAdmin, create, update, remove } = require('../controllers/servicoController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

router.get('/', list);

router.post('/', requireAuth, requireAdmin, create);
router.put('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);
router.get('/admin/all', requireAuth, requireAdmin, listAllAdmin);

module.exports = router;