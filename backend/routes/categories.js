const express = require('express');
const {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(protect);

router.route('/')
  .get(getCategorias)
  .post(createCategoria);

router.route('/:id')
  .get(getCategoria)
  .put(updateCategoria)
  .delete(deleteCategoria);

module.exports = router;