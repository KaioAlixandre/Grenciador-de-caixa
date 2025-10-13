const jwt = require('jsonwebtoken');
const { UsuarioService } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token está no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acesso negado. Token não fornecido.'
      });
    }

    try {
      // Verificar se o token é válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar o usuário pelo ID do token
      const user = await UsuarioService.buscarPorId(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido. Usuário não encontrado.'
        });
      }

      if (!user.ativo) {
        return res.status(401).json({
          success: false,
          error: 'Usuário inativo.'
        });
      }

      // Adicionar o usuário à requisição
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido.'
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é administrador
const admin = (req, res, next) => {
  if (req.user && req.user.papel === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Acesso negado. Permissão de administrador necessária.'
    });
  }
};

module.exports = { protect, admin };