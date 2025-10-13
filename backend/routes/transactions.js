const express = require('express');
const {
  getTransacoes,
  getTransacao,
  createTransacao,
  updateTransacao,
  deleteTransacao
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(protect);

router.route('/')
  .get(getTransacoes)
  .post(createTransacao);

router.route('/:id')
  .get(getTransacao)
  .put(updateTransacao)
  .delete(deleteTransacao);

module.exports = router;