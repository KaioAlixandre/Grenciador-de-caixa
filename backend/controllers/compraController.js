const { prisma } = require('../config/database');

// @desc    Listar compras
// @route   GET /api/compras
// @access  Private
const getCompras = async (req, res) => {
  try {
    const { status, fornecedor_id, data_inicio, data_fim, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;
    
    if (data_inicio && data_fim) {
      where.data_compra = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [compras, total] = await Promise.all([
      prisma.compra.findMany({
        where,
        include: {
          fornecedor: { select: { nome: true, telefone: true } },
          itens: {
            include: {
              produto: { select: { nome: true, unidade_medida: true } }
            }
          }
        },
        orderBy: { data_compra: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.compra.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: compras.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: compras
    });
  } catch (error) {
    console.error('Erro ao listar compras:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter compra por ID
// @route   GET /api/compras/:id
// @access  Private
const getCompra = async (req, res) => {
  try {
    const compra = await prisma.compra.findUnique({
      where: { id: req.params.id },
      include: {
        fornecedor: true,
        itens: {
          include: {
            produto: { select: { nome: true, unidade_medida: true, estoque_atual: true } }
          }
        }
      }
    });

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: 'Compra não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: compra
    });
  } catch (error) {
    console.error('Erro ao buscar compra:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar nova compra
// @route   POST /api/compras
// @access  Private
const createCompra = async (req, res) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const {
        fornecedor_id,
        itens, // [{ produto_id, quantidade, preco_unitario }]
        observacoes,
        numero_nota_fiscal,
        data_compra = new Date()
      } = req.body;

      // Validações
      if (!fornecedor_id || !itens || !Array.isArray(itens) || itens.length === 0) {
        throw new Error('Fornecedor e itens são obrigatórios');
      }

      // Verificar se o fornecedor existe
      const fornecedor = await prisma.fornecedor.findUnique({
        where: { id: fornecedor_id }
      });
      if (!fornecedor) {
        throw new Error('Fornecedor não encontrado');
      }

      // Gerar número da compra
      const ultimaCompra = await prisma.compra.findFirst({
        orderBy: { numero_compra: 'desc' }
      });
      const numeroCompra = ultimaCompra ? ultimaCompra.numero_compra + 1 : 1;

      // Validar produtos e calcular total
      let valorTotal = 0;
      const itensValidados = [];

      for (const item of itens) {
        const { produto_id, quantidade, preco_unitario } = item;

        if (!produto_id || !quantidade || !preco_unitario) {
          throw new Error('Produto, quantidade e preço unitário são obrigatórios para todos os itens');
        }

        const produto = await prisma.produto.findUnique({
          where: { id: produto_id }
        });
        if (!produto) {
          throw new Error(`Produto ${produto_id} não encontrado`);
        }

        const quantidadeNum = parseFloat(quantidade);
        const precoUnitarioNum = parseFloat(preco_unitario);
        const subtotal = quantidadeNum * precoUnitarioNum;

        itensValidados.push({
          produto_id,
          quantidade: quantidadeNum,
          preco_unitario: precoUnitarioNum,
          subtotal
        });

        valorTotal += subtotal;
      }

      // Criar a compra
      const compra = await prisma.compra.create({
        data: {
          numero_compra: numeroCompra,
          fornecedor_id,
          data_compra: new Date(data_compra),
          valor_total: valorTotal,
          numero_nota_fiscal,
          observacoes,
          status: 'PENDENTE'
        }
      });

      // Criar os itens da compra
      const itensCompra = await Promise.all(
        itensValidados.map(item =>
          prisma.itemCompra.create({
            data: {
              compra_id: compra.id,
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              subtotal: item.subtotal
            }
          })
        )
      );

      return { compra, itens: itensCompra };
    } catch (error) {
      throw error;
    }
  });

  try {
    // Buscar a compra completa com relacionamentos
    const compraCompleta = await prisma.compra.findUnique({
      where: { id: transaction.compra.id },
      include: {
        fornecedor: { select: { nome: true } },
        itens: {
          include: {
            produto: { select: { nome: true, unidade_medida: true } }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: compraCompleta
    });
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Confirmar compra (atualizar estoque)
// @route   POST /api/compras/:id/confirmar
// @access  Private
const confirmarCompra = async (req, res) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const compra = await prisma.compra.findUnique({
        where: { id: req.params.id },
        include: {
          itens: {
            include: { produto: true }
          }
        }
      });

      if (!compra) {
        throw new Error('Compra não encontrada');
      }

      if (compra.status !== 'PENDENTE') {
        throw new Error('Apenas compras pendentes podem ser confirmadas');
      }

      // Atualizar status da compra
      await prisma.compra.update({
        where: { id: req.params.id },
        data: { 
          status: 'CONCLUIDA',
          data_confirmacao: new Date()
        }
      });

      // Atualizar estoque dos produtos e preço de custo
      for (const item of compra.itens) {
        // Atualizar estoque
        await prisma.produto.update({
          where: { id: item.produto_id },
          data: {
            estoque_atual: {
              increment: item.quantidade
            },
            preco_custo: item.preco_unitario // Atualizar preço de custo com o último preço de compra
          }
        });

        // Criar movimentação de estoque
        await prisma.movimentoEstoque.create({
          data: {
            produto_id: item.produto_id,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            motivo: 'COMPRA',
            data_movimento: new Date(),
            observacoes: `Entrada por compra #${compra.numero_compra}`
          }
        });
      }

      return compra;
    } catch (error) {
      throw error;
    }
  });

  try {
    res.status(200).json({
      success: true,
      message: 'Compra confirmada e estoque atualizado com sucesso',
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao confirmar compra:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Cancelar compra
// @route   POST /api/compras/:id/cancelar
// @access  Private
const cancelarCompra = async (req, res) => {
  try {
    const { motivo } = req.body;

    const compra = await prisma.compra.findUnique({
      where: { id: req.params.id }
    });

    if (!compra) {
      return res.status(404).json({
        success: false,
        error: 'Compra não encontrada'
      });
    }

    if (compra.status === 'CANCELADA') {
      return res.status(400).json({
        success: false,
        error: 'Compra já foi cancelada'
      });
    }

    if (compra.status === 'CONCLUIDA') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível cancelar uma compra já confirmada'
      });
    }

    const compraAtualizada = await prisma.compra.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELADA',
        observacoes: motivo ? `${compra.observacoes || ''}\nCancelada: ${motivo}` : compra.observacoes
      }
    });

    res.status(200).json({
      success: true,
      message: 'Compra cancelada com sucesso',
      data: compraAtualizada
    });
  } catch (error) {
    console.error('Erro ao cancelar compra:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Relatório de compras
// @route   GET /api/compras/relatorio
// @access  Private
const relatorioCompras = async (req, res) => {
  try {
    const { data_inicio, data_fim, fornecedor_id } = req.query;

    // Filtros
    const where = { status: 'CONCLUIDA' };
    if (data_inicio && data_fim) {
      where.data_compra = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }
    if (fornecedor_id) {
      where.fornecedor_id = fornecedor_id;
    }

    // Resumo geral
    const resumoGeral = await prisma.compra.aggregate({
      where,
      _sum: { valor_total: true },
      _count: { id: true },
      _avg: { valor_total: true }
    });

    // Compras por fornecedor
    const comprasPorFornecedor = await prisma.compra.groupBy({
      by: ['fornecedor_id'],
      where,
      _sum: { valor_total: true },
      _count: { id: true }
    });

    const fornecedoresInfo = await Promise.all(
      comprasPorFornecedor.map(async (item) => {
        const fornecedor = await prisma.fornecedor.findUnique({
          where: { id: item.fornecedor_id },
          select: { nome: true }
        });
        return {
          fornecedor: fornecedor?.nome || 'N/A',
          total_compras: item._count.id,
          valor_total: item._sum.valor_total
        };
      })
    );

    // Produtos mais comprados
    const produtosMaisComprados = await prisma.itemCompra.groupBy({
      by: ['produto_id'],
      where: {
        compra: where
      },
      _sum: { quantidade: true, subtotal: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 10
    });

    const produtosInfo = await Promise.all(
      produtosMaisComprados.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produto_id },
          select: { nome: true, unidade_medida: true }
        });
        return {
          produto: produto?.nome || 'N/A',
          unidade_medida: produto?.unidade_medida || 'UN',
          quantidade_total: item._sum.quantidade,
          valor_total: item._sum.subtotal
        };
      })
    );

    // Compras por mês (últimos 12 meses)
    const comprasPorMes = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(data_compra, '%Y-%m') as mes,
        COUNT(*) as total_compras,
        SUM(valor_total) as valor_total
      FROM Compra 
      WHERE status = 'CONCLUIDA'
        AND data_compra >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(data_compra, '%Y-%m')
      ORDER BY mes DESC
    `;

    res.status(200).json({
      success: true,
      data: {
        resumo: {
          total_compras: resumoGeral._count.id || 0,
          valor_total: resumoGeral._sum.valor_total || 0,
          ticket_medio: resumoGeral._avg.valor_total || 0
        },
        compras_por_fornecedor: fornecedoresInfo,
        produtos_mais_comprados: produtosInfo,
        compras_por_mes: comprasPorMes,
        periodo: data_inicio && data_fim ? { data_inicio, data_fim } : 'Todos os períodos'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de compras:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getCompras,
  getCompra,
  createCompra,
  confirmarCompra,
  cancelarCompra,
  relatorioCompras
};