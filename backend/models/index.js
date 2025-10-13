const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

class UsuarioService {
  // Criar usuário
  static async criarUsuario(dados) {
    const { nome, email, senha, papel = 'USUARIO' } = dados;
    
    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 12);
    
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        papel
      },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        avatar: true,
        ativo: true,
        ultimo_login: true,
        criado_em: true
      }
    });

    return usuario;
  }

  // Buscar usuário por email (incluindo senha para autenticação)
  static async buscarPorEmail(email) {
    return await prisma.usuario.findUnique({
      where: { email },
      include: {
        saldos: true
      }
    });
  }

  // Buscar usuário por ID
  static async buscarPorId(id) {
    return await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        avatar: true,
        ativo: true,
        ultimo_login: true,
        criado_em: true
      }
    });
  }

  // Comparar senha
  static async compararSenha(senhaInformada, senhaHash) {
    return await bcrypt.compare(senhaInformada, senhaHash);
  }

  // Atualizar último login
  static async atualizarUltimoLogin(id) {
    return await prisma.usuario.update({
      where: { id },
      data: { ultimo_login: new Date() }
    });
  }
}

class CategoriaService {
  // Listar categorias do usuário
  static async listarPorUsuario(usuarioId) {
    return await prisma.categoria.findMany({
      where: { 
        usuario_id: usuarioId,
        ativa: true 
      },
      orderBy: { nome: 'asc' }
    });
  }

  // Criar categoria
  static async criar(dados) {
    return await prisma.categoria.create({
      data: dados
    });
  }

  // Buscar categoria por ID
  static async buscarPorId(id, usuarioId) {
    return await prisma.categoria.findFirst({
      where: { 
        id,
        usuario_id: usuarioId 
      }
    });
  }

  // Atualizar categoria
  static async atualizar(id, usuarioId, dados) {
    return await prisma.categoria.update({
      where: { id },
      data: dados
    });
  }

  // Deletar categoria (soft delete)
  static async deletar(id, usuarioId) {
    return await prisma.categoria.update({
      where: { id },
      data: { ativa: false }
    });
  }
}

class TransacaoService {
  // Listar transações do usuário
  static async listarPorUsuario(usuarioId, filtros = {}) {
    const where = { usuario_id: usuarioId };

    if (filtros.tipo) where.tipo = filtros.tipo;
    if (filtros.categoria_id) where.categoria_id = filtros.categoria_id;
    if (filtros.data_inicio && filtros.data_fim) {
      where.data = {
        gte: new Date(filtros.data_inicio),
        lte: new Date(filtros.data_fim)
      };
    }

    const transacoes = await prisma.transacao.findMany({
      where,
      include: {
        categoria: true
      },
      orderBy: { data: 'desc' }
    });

    // Converter tags de string JSON para array
    return transacoes.map(transacao => ({
      ...transacao,
      tags: transacao.tags ? JSON.parse(transacao.tags || '[]') : []
    }));
  }

  // Criar transação
  static async criar(dados) {
    // Converter tags array para string JSON se necessário
    if (dados.tags && Array.isArray(dados.tags)) {
      dados.tags = JSON.stringify(dados.tags);
    }
    
    const transacao = await prisma.transacao.create({
      data: dados,
      include: {
        categoria: true
      }
    });

    // Converter tags de volta para array na resposta
    if (transacao.tags) {
      try {
        transacao.tags = JSON.parse(transacao.tags);
      } catch (e) {
        transacao.tags = [];
      }
    }

    return transacao;
  }

  // Buscar transação por ID
  static async buscarPorId(id, usuarioId) {
    return await prisma.transacao.findFirst({
      where: { 
        id,
        usuario_id: usuarioId 
      },
      include: {
        categoria: true
      }
    });
  }

  // Atualizar transação
  static async atualizar(id, usuarioId, dados) {
    return await prisma.transacao.update({
      where: { id },
      data: dados,
      include: {
        categoria: true
      }
    });
  }

  // Deletar transação
  static async deletar(id, usuarioId) {
    return await prisma.transacao.delete({
      where: { id }
    });
  }
}

class SaldoService {
  // Buscar ou criar saldo do usuário
  static async buscarOuCriar(usuarioId) {
    let saldo = await prisma.saldo.findUnique({
      where: { usuario_id: usuarioId }
    });

    if (!saldo) {
      saldo = await prisma.saldo.create({
        data: { usuario_id: usuarioId }
      });
    }

    return saldo;
  }

  // Atualizar saldo baseado nas transações
  static async atualizar(usuarioId) {
    // Calcular totais gerais
    const receitas = await prisma.transacao.aggregate({
      where: { 
        usuario_id: usuarioId, 
        tipo: 'RECEITA' 
      },
      _sum: { valor: true }
    });

    const despesas = await prisma.transacao.aggregate({
      where: { 
        usuario_id: usuarioId, 
        tipo: 'DESPESA' 
      },
      _sum: { valor: true }
    });

    // Calcular totais do mês atual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const receitasMensais = await prisma.transacao.aggregate({
      where: { 
        usuario_id: usuarioId, 
        tipo: 'RECEITA',
        data: { gte: inicioMes }
      },
      _sum: { valor: true }
    });

    const despesasMensais = await prisma.transacao.aggregate({
      where: { 
        usuario_id: usuarioId, 
        tipo: 'DESPESA',
        data: { gte: inicioMes }
      },
      _sum: { valor: true }
    });

    const receitaTotal = receitas._sum.valor || 0;
    const despesaTotal = despesas._sum.valor || 0;
    const receitaMensal = receitasMensais._sum.valor || 0;
    const despesaMensal = despesasMensais._sum.valor || 0;

    return await prisma.saldo.upsert({
      where: { usuario_id: usuarioId },
      update: {
        saldo_atual: receitaTotal - despesaTotal,
        receita_total: receitaTotal,
        despesa_total: despesaTotal,
        receita_mensal: receitaMensal,
        despesa_mensal: despesaMensal,
        ultima_atualizacao: new Date()
      },
      create: {
        usuario_id: usuarioId,
        saldo_atual: receitaTotal - despesaTotal,
        receita_total: receitaTotal,
        despesa_total: despesaTotal,
        receita_mensal: receitaMensal,
        despesa_mensal: despesaMensal
      }
    });
  }
}

module.exports = {
  UsuarioService,
  CategoriaService,
  TransacaoService,
  SaldoService
};