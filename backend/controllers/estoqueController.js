const { prisma } = require('../config/database');

// @desc    Listar movimentações de estoque
// @route   GET /api/estoque/movimentacoes
// @access  Private
const getMovimentacoes = async (req, res) => {
  try {
    const { produto_id, tipo, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (produto_id) where.produto_id = produto_id;
    if (tipo) where.tipo = tipo;
    
    if (data_inicio && data_fim) {
      where.data_movimento = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [movimentacoes, total] = await Promise.all([
      prisma.movimentoEstoque.findMany({
        where,
        include: {
          produto: { 
            select: { 
              nome: true, 
              unidade_medida: true,
              estoque_atual: true
            } 
          }
        },
        orderBy: { data_movimento: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.movimentoEstoque.count({ where })
    ]);

    res.status(200).json({
      success: true,
      count: movimentacoes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: movimentacoes
    });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter movimentação por ID
// @route   GET /api/estoque/movimentacoes/:id
// @access  Private
const getMovimentacao = async (req, res) => {
  try {
    const movimentacao = await prisma.movimentoEstoque.findUnique({
      where: { id: req.params.id },
      include: {
        produto: {
          select: {
            nome: true,
            unidade_medida: true,
            estoque_atual: true,
            estoque_minimo: true
          }
        }
      }
    });

    if (!movimentacao) {
      return res.status(404).json({
        success: false,
        error: 'Movimentação não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: movimentacao
    });
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar movimentação manual de estoque
// @route   POST /api/estoque/movimentacoes
// @access  Private
const createMovimentacao = async (req, res) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    try {
      const {
        produto_id,
        tipo, // ENTRADA ou SAIDA
        quantidade,
        motivo, // AJUSTE, PERDA, ENCONTRADO, etc.
        observacoes
      } = req.body;

      // Validações
      if (!produto_id || !tipo || !quantidade || !motivo) {
        throw new Error('Produto, tipo, quantidade e motivo são obrigatórios');
      }

      if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
        throw new Error('Tipo deve ser ENTRADA ou SAIDA');
      }

      const quantidadeNum = parseFloat(quantidade);
      if (quantidadeNum <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      // Verificar se o produto existe
      const produto = await prisma.produto.findUnique({
        where: { id: produto_id }
      });

      if (!produto) {
        throw new Error('Produto não encontrado');
      }

      // Para saída, verificar se há estoque suficiente
      if (tipo === 'SAIDA' && produto.estoque_atual < quantidadeNum) {
        throw new Error('Estoque insuficiente para esta operação');
      }

      // Criar a movimentação
      const movimentacao = await prisma.movimentoEstoque.create({
        data: {
          produto_id,
          tipo,
          quantidade: quantidadeNum,
          motivo,
          observacoes,
          data_movimento: new Date()
        }
      });

      // Atualizar estoque do produto
      const novoEstoque = tipo === 'ENTRADA' 
        ? produto.estoque_atual + quantidadeNum
        : produto.estoque_atual - quantidadeNum;

      await prisma.produto.update({
        where: { id: produto_id },
        data: { estoque_atual: novoEstoque }
      });

      return { movimentacao, produto: { ...produto, estoque_atual: novoEstoque } };
    } catch (error) {
      throw error;
    }
  });

  try {
    res.status(201).json({
      success: true,
      data: transaction.movimentacao,
      produto_atualizado: transaction.produto
    });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Relatório de movimentações
// @route   GET /api/estoque/relatorio
// @access  Private
const relatorioEstoque = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Filtro de data
    const whereMovimentos = {};
    if (data_inicio && data_fim) {
      whereMovimentos.data_movimento = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }

    // Resumo geral de movimentações
    const resumoMovimentacoes = await prisma.movimentoEstoque.groupBy({
      by: ['tipo'],
      where: whereMovimentos,
      _sum: { quantidade: true },
      _count: { id: true }
    });

    // Produtos com baixo estoque
    const produtosBaixoEstoque = await prisma.produto.findMany({
      where: {
        ativo: true,
        estoque_atual: { lte: prisma.produto.fields.estoque_minimo }
      },
      select: {
        id: true,
        nome: true,
        estoque_atual: true,
        estoque_minimo: true,
        unidade_medida: true,
        categoria: { select: { nome: true } },
        fornecedor: { select: { nome: true } }
      },
      orderBy: { nome: 'asc' }
    });

    // Produtos sem estoque
    const produtosSemEstoque = await prisma.produto.count({
      where: {
        ativo: true,
        estoque_atual: { lte: 0 }
      }
    });

    // Valor total do estoque
    const valorTotalEstoque = await prisma.produto.aggregate({
      where: { ativo: true },
      _sum: {
        // Calcular valor do estoque multiplicando preço de custo pelo estoque atual
        // Como não podemos fazer essa operação diretamente no Prisma, buscaremos os dados
      }
    });

    // Buscar produtos para calcular valor do estoque
    const produtosParaCalculo = await prisma.produto.findMany({
      where: { ativo: true },
      select: {
        preco_custo: true,
        estoque_atual: true
      }
    });

    const valorEstoqueCalculado = produtosParaCalculo.reduce(
      (total, produto) => total + (produto.preco_custo * produto.estoque_atual),
      0
    );

    // Top produtos com mais movimentações
    const topProdutosMovimentados = await prisma.movimentoEstoque.groupBy({
      by: ['produto_id'],
      where: whereMovimentos,
      _sum: { quantidade: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const produtosInfo = await Promise.all(
      topProdutosMovimentados.map(async (item) => {
        const produto = await prisma.produto.findUnique({
          where: { id: item.produto_id },
          select: { nome: true, unidade_medida: true, estoque_atual: true }
        });
        return {
          produto: produto?.nome || 'N/A',
          unidade_medida: produto?.unidade_medida || 'UN',
          estoque_atual: produto?.estoque_atual || 0,
          total_movimentacoes: item._count.id,
          quantidade_movimentada: item._sum.quantidade
        };
      })
    );

    // Movimentações por motivo
    const movimentacoesPorMotivo = await prisma.movimentoEstoque.groupBy({
      by: ['motivo'],
      where: whereMovimentos,
      _sum: { quantidade: true },
      _count: { id: true }
    });

    res.status(200).json({
      success: true,
      data: {
        resumo: {
          total_produtos: await prisma.produto.count({ where: { ativo: true } }),
          produtos_baixo_estoque: produtosBaixoEstoque.length,
          produtos_sem_estoque: produtosSemEstoque,
          valor_total_estoque: valorEstoqueCalculado
        },
        movimentacoes: {
          resumo: resumoMovimentacoes,
          por_motivo: movimentacoesPorMotivo
        },
        produtos_baixo_estoque: produtosBaixoEstoque,
        top_produtos_movimentados: produtosInfo,
        periodo: data_inicio && data_fim ? { data_inicio, data_fim } : 'Todos os períodos'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Inventário de estoque
// @route   GET /api/estoque/inventario
// @access  Private
const inventarioEstoque = async (req, res) => {
  try {
    const { categoria_id, fornecedor_id, baixo_estoque } = req.query;

    const where = { ativo: true };
    if (categoria_id) where.categoria_id = categoria_id;
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;
    
    // Filtro para produtos com baixo estoque
    if (baixo_estoque === 'true') {
      where.estoque_atual = { lte: prisma.produto.fields.estoque_minimo };
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categoria: { select: { nome: true } },
        fornecedor: { select: { nome: true } }
      },
      orderBy: [
        { categoria: { nome: 'asc' } },
        { nome: 'asc' }
      ]
    });

    // Agrupar por categoria
    const inventarioPorCategoria = produtos.reduce((acc, produto) => {
      const categoria = produto.categoria?.nome || 'Sem categoria';
      if (!acc[categoria]) {
        acc[categoria] = [];
      }
      acc[categoria].push({
        id: produto.id,
        nome: produto.nome,
        estoque_atual: produto.estoque_atual,
        estoque_minimo: produto.estoque_minimo,
        unidade_medida: produto.unidade_medida,
        preco_custo: produto.preco_custo,
        preco_venda: produto.preco_venda,
        valor_estoque: produto.preco_custo * produto.estoque_atual,
        status_estoque: produto.estoque_atual <= produto.estoque_minimo ? 'BAIXO' : 'OK',
        fornecedor: produto.fornecedor?.nome || 'N/A'
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        total_produtos: produtos.length,
        inventario_por_categoria: inventarioPorCategoria
      }
    });
  } catch (error) {
    console.error('Erro ao gerar inventário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getMovimentacoes,
  getMovimentacao,
  createMovimentacao,
  relatorioEstoque,
  inventarioEstoque
};