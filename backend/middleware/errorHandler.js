const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error(err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      message: message.join(', '),
      statusCode: 400
    };
  }

  // Erro de recurso não encontrado do Mongoose
  if (err.name === 'CastError') {
    error = {
      message: 'Recurso não encontrado',
      statusCode: 404
    };
  }

  // Erro de chave duplicada do MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} já existe`,
      statusCode: 400
    };
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Token inválido',
      statusCode: 401
    };
  }

  // Token JWT expirado
  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expirado',
      statusCode: 401
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;