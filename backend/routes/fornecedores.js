const express = require('express');
const {
  getFornecedores,
  getFornecedor,
  createFornecedor,
  updateFornecedor,
  getProdutosFornecedor,
  relatorioFornecedores
} = require('../controllers/fornecedorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/')
  .get(getFornecedores)
  .post(createFornecedor);

router.route('/relatorio')
  .get(relatorioFornecedores);

router.route('/:id')
  .get(getFornecedor)
  .put(updateFornecedor);

router.route('/:id/produtos')
  .get(getProdutosFornecedor);

module.exports = router;