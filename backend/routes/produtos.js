const express = require('express');
const {
  getProdutos,
  getProduto,
  createProduto,
  updateProduto,
  ajustarEstoque,
  getProdutosBaixoEstoque,
  deleteProduto
} = require('../controllers/produtoController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/')
  .get(getProdutos)
  .post(createProduto);

router.route('/baixo-estoque')
  .get(getProdutosBaixoEstoque);

router.route('/:id')
  .get(getProduto)
  .put(updateProduto)
  .delete(deleteProduto);

router.route('/:id/ajustar-estoque')
  .post(ajustarEstoque);

module.exports = router;