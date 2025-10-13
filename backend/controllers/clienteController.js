const { prisma } = require('../config/database');

// @desc    Listar clientes
// @route   GET /api/clientes
// @access  Private
const getClientes = async (req, res) => {
  try {
    const { ativo, com_debito } = req.query;
    
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';
    if (com_debito === 'true') {
      where.saldo_devedor = { gt: 0 };
    }

    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        vendas: {
          where: { status: 'CONCLUIDA' },
          select: {
            id: true,
            numero_venda: true,
            data_venda: true,
            valor_final: true
          },
          orderBy: { data_venda: 'desc' },
          take: 5
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: clientes.length,
      data: clientes
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
const getCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id },
      include: {
        vendas: {
          where: { status: 'CONCLUIDA' },
          include: {
            itens: {
              include: {
                produto: { select: { nome: true, unidade_medida: true } }
              }
            }
          },
          orderBy: { data_venda: 'desc' }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    // Calcular estatísticas do cliente
    const estatisticas = await prisma.venda.aggregate({
      where: {
        cliente_id: req.params.id,
        status: 'CONCLUIDA'
      },
      _sum: { valor_final: true },
      _count: { id: true }
    });

    const clienteComEstatisticas = {
      ...cliente,
      estatisticas: {
        total_compras: estatisticas._count.id || 0,
        valor_total_comprado: estatisticas._sum.valor_final || 0,
        ticket_medio: estatisticas._count.id > 0 
          ? (estatisticas._sum.valor_final / estatisticas._count.id).toFixed(2)
          : 0
      }
    };

    res.status(200).json({
      success: true,
      data: clienteComEstatisticas
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo cliente
// @route   POST /api/clientes
// @access  Private
const createCliente = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      telefone,
      email,
      endereco,
      limite_credito = 0,
      observacoes
    } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    // Verificar se CPF já existe
    if (cpf) {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { cpf }
      });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          error: 'CPF já cadastrado'
        });
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpf,
        telefone,
        email,
        endereco,
        limite_credito: parseFloat(limite_credito),
        observacoes
      }
    });

    res.status(201).json({
      success: true,
      data: cliente
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
const updateCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    const {
      nome,
      cpf,
      telefone,
      email,
      endereco,
      limite_credito,
      observacoes,
      ativo
    } = req.body;

    // Verificar CPF duplicado
    if (cpf && cpf !== cliente.cpf) {
      const clienteExistente = await prisma.cliente.findFirst({
        where: { cpf }
      });
      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          error: 'CPF já cadastrado'
        });
      }
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (cpf !== undefined) dadosAtualizacao.cpf = cpf;
    if (telefone !== undefined) dadosAtualizacao.telefone = telefone;
    if (email !== undefined) dadosAtualizacao.email = email;
    if (endereco !== undefined) dadosAtualizacao.endereco = endereco;
    if (limite_credito !== undefined) dadosAtualizacao.limite_credito = parseFloat(limite_credito);
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (ativo !== undefined) dadosAtualizacao.ativo = Boolean(ativo);

    const clienteAtualizado = await prisma.cliente.update({
      where: { id: req.params.id },
      data: dadosAtualizacao
    });

    res.status(200).json({
      success: true,
      data: clienteAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Ajustar saldo devedor do cliente
// @route   POST /api/clientes/:id/ajustar-saldo
// @access  Private
const ajustarSaldoDevedor = async (req, res) => {
  try {
    const { valor, operacao, observacoes } = req.body; // operacao: 'adicionar' ou 'subtrair'

    if (!valor || !operacao) {
      return res.status(400).json({
        success: false,
        error: 'Valor e operação são obrigatórios'
      });
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }

    const valorAjuste = parseFloat(valor);
    let novoSaldo = cliente.saldo_devedor;

    if (operacao === 'adicionar') {
      novoSaldo += valorAjuste;
    } else if (operacao === 'subtrair') {
      novoSaldo -= valorAjuste;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Operação deve ser "adicionar" ou "subtrair"'
      });
    }

    // Não permitir saldo negativo
    if (novoSaldo < 0) {
      novoSaldo = 0;
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id: req.params.id },
      data: { saldo_devedor: novoSaldo }
    });

    res.status(200).json({
      success: true,
      data: {
        cliente: clienteAtualizado,
        saldo_anterior: cliente.saldo_devedor,
        ajuste: {
          operacao,
          valor: valorAjuste,
          observacoes
        }
      }
    });
  } catch (error) {
    console.error('Erro ao ajustar saldo devedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Relatório de clientes
// @route   GET /api/clientes/relatorio
// @access  Private
const relatorioClientes = async (req, res) => {
  try {
    // Total de clientes
    const totalClientes = await prisma.cliente.count({
      where: { ativo: true }
    });

    // Clientes com débito
    const clientesComDebito = await prisma.cliente.findMany({
      where: {
        ativo: true,
        saldo_devedor: { gt: 0 }
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        saldo_devedor: true
      },
      orderBy: { saldo_devedor: 'desc' }
    });

    // Soma total dos débitos
    const totalDebitos = clientesComDebito.reduce(
      (total, cliente) => total + cliente.saldo_devedor, 
      0
    );

    // Top 10 clientes por valor comprado
    const topClientes = await prisma.cliente.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        telefone: true,
        vendas: {
          where: { status: 'CONCLUIDA' },
          select: { valor_final: true }
        }
      }
    });

    const topClientesComTotal = topClientes
      .map(cliente => ({
        ...cliente,
        total_comprado: cliente.vendas.reduce(
          (total, venda) => total + venda.valor_final,
          0
        ),
        quantidade_compras: cliente.vendas.length
      }))
      .filter(cliente => cliente.total_comprado > 0)
      .sort((a, b) => b.total_comprado - a.total_comprado)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        resumo: {
          total_clientes: totalClientes,
          clientes_com_debito: clientesComDebito.length,
          total_debitos: totalDebitos
        },
        clientes_com_debito: clientesComDebito,
        top_clientes: topClientesComTotal
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar cliente
// @route   DELETE /api/clientes/:id
// @access  Private
const deleteCliente = async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.params.id }
    });
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: 'Cliente não encontrado'
      });
    }
    await prisma.cliente.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getClientes,
  getCliente,
  createCliente,
  updateCliente,
  ajustarSaldoDevedor,
  relatorioClientes,
  deleteCliente
};