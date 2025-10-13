const { prisma } = require('../config/database');

// @desc    Listar categorias
// @route   GET /api/categories
// @access  Private
const getCategorias = async (req, res) => {
  try {
    const { ativa } = req.query;
    
    const where = {};
    if (ativa !== undefined) where.ativa = ativa === 'true';

    const categorias = await prisma.categoria.findMany({
      where,
      include: {
        produtos: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            preco_venda: true,
            estoque_atual: true
          }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: categorias.length,
      data: categorias
    });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter categoria por ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id },
      include: {
        produtos: {
          where: { ativo: true },
          include: {
            fornecedor: { select: { nome: true } }
          }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar nova categoria
// @route   POST /api/categories
// @access  Private
const createCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    // Verificar se categoria já existe
    const categoriaExistente = await prisma.categoria.findFirst({
      where: { nome }
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        error: 'Categoria já existe'
      });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
        descricao
      }
    });

    res.status(201).json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
// @access  Private
const updateCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    const { nome, descricao, ativa } = req.body;

    // Verificar nome duplicado
    if (nome && nome !== categoria.nome) {
      const categoriaExistente = await prisma.categoria.findFirst({
        where: { nome }
      });
      if (categoriaExistente) {
        return res.status(400).json({
          success: false,
          error: 'Já existe uma categoria com este nome'
        });
      }
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (ativa !== undefined) dadosAtualizacao.ativa = Boolean(ativa);

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id: req.params.id },
      data: dadosAtualizacao
    });

    res.status(200).json({
      success: true,
      data: categoriaAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategoria = async (req, res) => {
  try {
    const categoria = await prisma.categoria.findUnique({
      where: { id: req.params.id },
      include: {
        produtos: {
          where: { ativo: true }
        }
      }
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se há produtos ativos nesta categoria
    if (categoria.produtos.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível deletar categoria que possui produtos ativos'
      });
    }

    await prisma.categoria.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
};