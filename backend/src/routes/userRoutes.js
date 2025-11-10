const router = require('express').Router();
const { list, get, create, update, remove } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

router.use(requireAuth, requireAdmin);

router.get('/', list);
router.post('/', create);
router.get('/:id', get);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;