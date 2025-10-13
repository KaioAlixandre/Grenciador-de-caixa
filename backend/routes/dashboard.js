const express = require('express');
const { getDashboard, getResumo } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(protect);

router.get('/', getDashboard);
router.get('/resumo', getResumo);

module.exports = router;