const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Configuração das variáveis de ambiente
dotenv.config();

// Importar sistema de logs personalizado
const { customMorgan, logInfo, logSuccess } = require('./utils/logger');

// Importar configuração do banco de dados
const { connectDB, disconnectDB } = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const produtoRoutes = require('./routes/produtos');
const vendaRoutes = require('./routes/vendas');
const clienteRoutes = require('./routes/clientes');
const fornecedorRoutes = require('./routes/fornecedores');
const compraRoutes = require('./routes/compras');
const estoqueRoutes = require('./routes/estoque');

// Middlewares de erro
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Inicializar o app
const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares de segurança e logging
app.use(helmet());
app.use(customMorgan);

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Middleware para parsing do body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API do Gestor de Caixa funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/estoque', estoqueRoutes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware para tratamento de erros
app.use(errorHandler);

// Configuração da porta
const PORT = process.env.PORT || 3000;

// Iniciar o servidor
app.listen(PORT, () => {
  logSuccess('🚀', `Servidor rodando na porta ${PORT}`);
  logInfo('📱', `Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logInfo('🔗', `URL: http://localhost:${PORT}`);
});

module.exports = app;