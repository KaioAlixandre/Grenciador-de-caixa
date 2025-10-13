const express = require('express');
const {
  getCompras,
  getCompra,
  createCompra,
  confirmarCompra,
  cancelarCompra,
  relatorioCompras
} = require('../controllers/compraController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/')
  .get(getCompras)
  .post(createCompra);

router.route('/relatorio')
  .get(relatorioCompras);

router.route('/:id')
  .get(getCompra);

router.route('/:id/confirmar')
  .post(confirmarCompra);

router.route('/:id/cancelar')
  .post(cancelarCompra);

module.exports = router;