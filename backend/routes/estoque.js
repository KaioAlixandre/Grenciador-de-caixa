const express = require('express');
const {
  getMovimentacoes,
  getMovimentacao,
  createMovimentacao,
  relatorioEstoque,
  inventarioEstoque
} = require('../controllers/estoqueController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/movimentacoes')
  .get(getMovimentacoes)
  .post(createMovimentacao);

router.route('/movimentacoes/:id')
  .get(getMovimentacao);

router.route('/relatorio')
  .get(relatorioEstoque);

router.route('/inventario')
  .get(inventarioEstoque);

module.exports = router;