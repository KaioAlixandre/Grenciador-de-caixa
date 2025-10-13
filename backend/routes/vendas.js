const express = require('express');
const {
  getVendas,
  getVenda,
  createVenda,
  cancelarVenda,
  relatorioVendas,
  getDashboardStats
} = require('../controllers/vendaController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/')
  .get(getVendas)
  .post(createVenda);

router.route('/dashboard-stats')
  .get(getDashboardStats);

router.route('/relatorio')
  .get(relatorioVendas);

router.route('/:id')
  .get(getVenda);

router.route('/:id/cancelar')
  .post(cancelarVenda);

module.exports = router;