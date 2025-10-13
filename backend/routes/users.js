const express = require('express');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Rota para listar usuários (apenas admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const { UsuarioService } = require('../models');
    // Implementar lógica para listar usuários se necessário
    res.status(200).json({
      success: true,
      message: 'Rota de usuários em desenvolvimento'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;