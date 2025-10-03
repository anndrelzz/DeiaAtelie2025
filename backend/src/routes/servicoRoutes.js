const router = require('express').Router();
const { list } = require('../controllers/servicoController');

router.get('/', list);

module.exports = router;
