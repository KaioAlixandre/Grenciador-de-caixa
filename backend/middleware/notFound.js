const notFound = (req, res, next) => {
  // Ignorar arquivos de hot-reload do React e outros arquivos estáticos
  const ignoredPaths = [
    /\.hot-update\.json$/,
    /\.js$/,
    /\.css$/,
    /\.map$/,
    /favicon\.ico$/,
    /manifest\.json$/
  ];
  
  const shouldIgnore = ignoredPaths.some(pattern => pattern.test(req.originalUrl));
  
  if (shouldIgnore) {
    return res.status(404).end();
  }
  
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = notFound;