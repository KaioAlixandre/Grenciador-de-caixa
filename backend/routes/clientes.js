const express = require('express');
const {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  ajustarSaldoDevedor,
  relatorioClientes,
  deleteCliente
} = require('../controllers/clienteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Proteger todas as rotas
router.use(protect);

router.route('/')
  .get(getClientes)
  .post(createCliente);

router.route('/relatorio')
  .get(relatorioClientes);

router.route('/:id')
  .get(getCliente)
  .put(updateCliente)
  .delete(deleteCliente);

router.route('/:id/ajustar-saldo')
  .post(ajustarSaldoDevedor);

module.exports = router;