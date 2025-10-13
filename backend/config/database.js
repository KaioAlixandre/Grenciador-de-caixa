const { PrismaClient } = require('@prisma/client');
const { logDatabase } = require('../utils/logger');

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Event listeners para logs customizados do Prisma
prisma.$on('query', (e) => {
  if (process.env.NODE_ENV === 'development') {
    logDatabase('query', `Query executada em ${e.duration}ms`, {
      query: e.query.substring(0, 100) + (e.query.length > 100 ? '...' : ''),
      params: e.params
    });
  }
});

prisma.$on('error', (e) => {
  logDatabase('error', 'Erro no banco de dados', e);
});

prisma.$on('info', (e) => {
  logDatabase('connected', e.message);
});

prisma.$on('warn', (e) => {
  logDatabase('disconnected', e.message);
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logDatabase('connected', 'Prisma conectado com MySQL');
  } catch (error) {
    logDatabase('error', 'Erro ao conectar com MySQL', error);
    process.exit(1);
  }
};

// Função para desconectar o Prisma
const disconnectDB = async () => {
  await prisma.$disconnect();
  logDatabase('disconnected', 'Prisma desconectado');
};

module.exports = { prisma, connectDB, disconnectDB };