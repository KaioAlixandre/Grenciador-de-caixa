// Middleware para logs personalizados
const morgan = require('morgan');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Função para colorir logs
const colorize = (color, text) => `${colors[color]}${text}${colors.reset}`;

// Log customizado para o sistema
const logInfo = (icon, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colorize('cyan', icon)} ${colorize('bright', `[${timestamp}]`)} ${message}`);
  if (data) {
    console.log(`   ${colorize('dim', JSON.stringify(data, null, 2))}`);
  }
};

const logError = (icon, message, error = null) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colorize('red', icon)} ${colorize('bright', `[${timestamp}]`)} ${colorize('red', message)}`);
  if (error) {
    console.log(`   ${colorize('red', error.message || error)}`);
  }
};

const logSuccess = (icon, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colorize('green', icon)} ${colorize('bright', `[${timestamp}]`)} ${colorize('green', message)}`);
  if (data) {
    console.log(`   ${colorize('dim', JSON.stringify(data, null, 2))}`);
  }
};

const logWarning = (icon, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colorize('yellow', icon)} ${colorize('bright', `[${timestamp}]`)} ${colorize('yellow', message)}`);
  if (data) {
    console.log(`   ${colorize('dim', JSON.stringify(data, null, 2))}`);
  }
};

// Morgan customizado para requests HTTP
const customMorgan = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = tokens['response-time'](req, res);
  
  let statusColor = 'white';
  let icon = '📄';
  
  if (status >= 500) {
    statusColor = 'red';
    icon = '❌';
  } else if (status >= 400) {
    statusColor = 'yellow';
    icon = '⚠️';
  } else if (status >= 300) {
    statusColor = 'cyan';
    icon = '🔄';
  } else if (status >= 200) {
    statusColor = 'green';
    icon = '✅';
  }
  
  let methodColor = 'white';
  switch (method) {
    case 'GET': methodColor = 'blue'; break;
    case 'POST': methodColor = 'green'; break;
    case 'PUT': methodColor = 'yellow'; break;
    case 'DELETE': methodColor = 'red'; break;
    default: methodColor = 'white';
  }
  
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  
  return `${icon} ${colorize('bright', `[${timestamp}]`)} ${colorize(methodColor, method)} ${url} ${colorize(statusColor, status)} - ${responseTime}ms`;
});

// Middleware para logs de autenticação
const logAuth = (type, user, ip) => {
  const icons = {
    login: '🔑',
    logout: '🚪',
    failed: '🚫',
    register: '👤'
  };
  
  const messages = {
    login: `Login bem-sucedido: ${user}`,
    logout: `Logout: ${user}`,
    failed: `Tentativa de login falhada: ${user}`,
    register: `Novo usuário registrado: ${user}`
  };
  
  logInfo(icons[type], messages[type], { ip });
};

// Middleware para logs de vendas
const logSale = (type, data) => {
  const icons = {
    created: '🛒',
    cancelled: '❌',
    updated: '📝'
  };
  
  switch (type) {
    case 'created':
      logSuccess(icons[type], `Nova venda criada #${data.numero}`, {
        total: `R$ ${data.total}`,
        itens: data.itens_count,
        cliente: data.cliente || 'Cliente não identificado'
      });
      break;
    case 'cancelled':
      logWarning(icons[type], `Venda cancelada #${data.numero}`);
      break;
  }
};

// Middleware para logs de produtos
const logProduct = (type, data) => {
  const icons = {
    created: '📦',
    updated: '✏️',
    deleted: '🗑️',
    stock_low: '⚠️',
    stock_updated: '📊'
  };
  
  switch (type) {
    case 'created':
      logSuccess(icons[type], `Produto criado: ${data.nome}`);
      break;
    case 'updated':
      logInfo(icons[type], `Produto atualizado: ${data.nome}`);
      break;
    case 'deleted':
      logWarning(icons[type], `Produto excluído: ${data.nome}`);
      break;
    case 'stock_low':
      logWarning(icons[type], `Estoque baixo: ${data.nome} (${data.estoque} restantes)`);
      break;
    case 'stock_updated':
      logInfo(icons[type], `Estoque atualizado: ${data.nome} (${data.estoque_anterior} → ${data.estoque_atual})`);
      break;
  }
};

// Middleware para logs de database
const logDatabase = (type, message, data = null) => {
  const icons = {
    connected: '🍃',
    disconnected: '📴',
    error: '🚨',
    query: '🔍',
    migration: '🔄'
  };
  
  switch (type) {
    case 'connected':
      logSuccess(icons[type], message);
      break;
    case 'disconnected':
      logWarning(icons[type], message);
      break;
    case 'error':
      logError(icons[type], message, data);
      break;
    case 'query':
      logInfo(icons[type], message, data);
      break;
    case 'migration':
      logInfo(icons[type], message);
      break;
  }
};

module.exports = {
  logInfo,
  logError,
  logSuccess,
  logWarning,
  logAuth,
  logSale,
  logProduct,
  logDatabase,
  customMorgan,
  colorize
};