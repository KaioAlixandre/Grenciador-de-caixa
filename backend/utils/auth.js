const jwt = require('jsonwebtoken');

// Gerar JWT token
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Enviar token na resposta
const sendTokenResponse = (user, statusCode, res) => {
  // Criar token
  const token = getSignedJwtToken(user.id);

  const options = {
    expires: new Date(
      Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user
    });
};

module.exports = {
  getSignedJwtToken,
  sendTokenResponse
};