const { prisma } = require('../config/database');

// @desc    Listar fornecedores
// @route   GET /api/fornecedores
// @access  Private
const getFornecedores = async (req, res) => {
  try {
    const { ativo } = req.query;
    
    const where = {};
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const fornecedores = await prisma.fornecedor.findMany({
      where,
      include: {
        produtos: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            preco_custo: true,
            preco_venda: true,
            estoque_atual: true
          }
        },
        compras: {
          where: { status: 'CONCLUIDA' },
          select: {
            id: true,
            numero_compra: true,
            data_compra: true,
            valor_total: true
          },
          orderBy: { data_compra: 'desc' },
          take: 5
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: fornecedores.length,
      data: fornecedores
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter fornecedor por ID
// @route   GET /api/fornecedores/:id
// @access  Private
const getFornecedor = async (req, res) => {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: req.params.id },
      include: {
        produtos: {
          where: { ativo: true },
          include: {
            categoria: { select: { nome: true } }
          }
        },
        compras: {
          where: { status: 'CONCLUIDA' },
          include: {
            itens: {
              include: {
                produto: { select: { nome: true, unidade_medida: true } }
              }
            }
          },
          orderBy: { data_compra: 'desc' }
        }
      }
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    // Calcular estatísticas do fornecedor
    const estatisticas = await prisma.compra.aggregate({
      where: {
        fornecedor_id: req.params.id,
        status: 'CONCLUIDA'
      },
      _sum: { valor_total: true },
      _count: { id: true }
    });

    const fornecedorComEstatisticas = {
      ...fornecedor,
      estatisticas: {
        total_compras: estatisticas._count.id || 0,
        valor_total_comprado: estatisticas._sum.valor_total || 0,
        produtos_fornecidos: fornecedor.produtos.length
      }
    };

    res.status(200).json({
      success: true,
      data: fornecedorComEstatisticas
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo fornecedor
// @route   POST /api/fornecedores
// @access  Private
const createFornecedor = async (req, res) => {
  try {
    const {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      contato_principal,
      observacoes
    } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    // Verificar se CNPJ já existe
    if (cnpj) {
      const fornecedorExistente = await prisma.fornecedor.findFirst({
        where: { cnpj }
      });
      if (fornecedorExistente) {
        return res.status(400).json({
          success: false,
          error: 'CNPJ já cadastrado'
        });
      }
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        contato_principal,
        observacoes
      }
    });

    res.status(201).json({
      success: true,
      data: fornecedor
    });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar fornecedor
// @route   PUT /api/fornecedores/:id
// @access  Private
const updateFornecedor = async (req, res) => {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: req.params.id }
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    const {
      nome,
      cnpj,
      telefone,
      email,
      endereco,
      contato_principal,
      observacoes,
      ativo
    } = req.body;

    // Verificar CNPJ duplicado
    if (cnpj && cnpj !== fornecedor.cnpj) {
      const fornecedorExistente = await prisma.fornecedor.findFirst({
        where: { cnpj }
      });
      if (fornecedorExistente) {
        return res.status(400).json({
          success: false,
          error: 'CNPJ já cadastrado'
        });
      }
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (cnpj !== undefined) dadosAtualizacao.cnpj = cnpj;
    if (telefone !== undefined) dadosAtualizacao.telefone = telefone;
    if (email !== undefined) dadosAtualizacao.email = email;
    if (endereco !== undefined) dadosAtualizacao.endereco = endereco;
    if (contato_principal !== undefined) dadosAtualizacao.contato_principal = contato_principal;
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (ativo !== undefined) dadosAtualizacao.ativo = Boolean(ativo);

    const fornecedorAtualizado = await prisma.fornecedor.update({
      where: { id: req.params.id },
      data: dadosAtualizacao
    });

    res.status(200).json({
      success: true,
      data: fornecedorAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter produtos do fornecedor
// @route   GET /api/fornecedores/:id/produtos
// @access  Private
const getProdutosFornecedor = async (req, res) => {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: req.params.id }
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    const produtos = await prisma.produto.findMany({
      where: {
        fornecedor_id: req.params.id,
        ativo: true
      },
      include: {
        categoria: { select: { nome: true } }
      },
      orderBy: { nome: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: produtos.length,
      data: produtos
    });
  } catch (error) {
    console.error('Erro ao buscar produtos do fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Relatório de fornecedores
// @route   GET /api/fornecedores/relatorio
// @access  Private
const relatorioFornecedores = async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Filtro de data para compras
    const whereCompras = { status: 'CONCLUIDA' };
    if (data_inicio && data_fim) {
      whereCompras.data_compra = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }

    // Total de fornecedores
    const totalFornecedores = await prisma.fornecedor.count({
      where: { ativo: true }
    });

    // Fornecedores com produtos cadastrados
    const fornecedoresComProdutos = await prisma.fornecedor.count({
      where: {
        ativo: true,
        produtos: { some: { ativo: true } }
      }
    });

    // Top fornecedores por valor de compras
    const topFornecedores = await prisma.fornecedor.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        telefone: true,
        compras: {
          where: whereCompras,
          select: { valor_total: true }
        }
      }
    });

    const topFornecedoresComTotal = topFornecedores
      .map(fornecedor => ({
        ...fornecedor,
        total_comprado: fornecedor.compras.reduce(
          (total, compra) => total + compra.valor_total,
          0
        ),
        quantidade_compras: fornecedor.compras.length
      }))
      .filter(fornecedor => fornecedor.total_comprado > 0)
      .sort((a, b) => b.total_comprado - a.total_comprado)
      .slice(0, 10);

    // Resumo de compras por fornecedor
    const resumoCompras = await prisma.compra.aggregate({
      where: whereCompras,
      _sum: { valor_total: true },
      _count: { id: true }
    });

    // Fornecedores por categoria de produtos
    const fornecedoresPorCategoria = await prisma.categoria.findMany({
      where: { ativa: true },
      select: {
        nome: true,
        produtos: {
          where: { ativo: true },
          select: {
            fornecedor: {
              select: { id: true, nome: true }
            }
          }
        }
      }
    });

    const categoriasFornecedores = fornecedoresPorCategoria.map(categoria => ({
      categoria: categoria.nome,
      fornecedores: [...new Set(categoria.produtos.map(p => p.fornecedor?.nome))].filter(Boolean),
      quantidade_fornecedores: [...new Set(categoria.produtos.map(p => p.fornecedor?.id))].filter(Boolean).length
    }));

    res.status(200).json({
      success: true,
      data: {
        resumo: {
          total_fornecedores: totalFornecedores,
          fornecedores_com_produtos: fornecedoresComProdutos,
          total_compras: resumoCompras._count.id || 0,
          valor_total_compras: resumoCompras._sum.valor_total || 0
        },
        top_fornecedores: topFornecedoresComTotal,
        fornecedores_por_categoria: categoriasFornecedores,
        periodo: data_inicio && data_fim ? { data_inicio, data_fim } : 'Todos os períodos'
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getFornecedores,
  getFornecedor,
  createFornecedor,
  updateFornecedor,
  getProdutosFornecedor,
  relatorioFornecedores
};