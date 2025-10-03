const router = require('express').Router();
const { list } = require('../controllers/agendaController');

router.get('/', list);

module.exports = router;
