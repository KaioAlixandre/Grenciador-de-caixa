const { prisma } = require('../config/database');
const { logProduct, logError } = require('../utils/logger');

// @desc    Listar produtos
// @route   GET /api/produtos
// @access  Private
const getProdutos = async (req, res) => {
  try {
    const { categoria_id, fornecedor_id, ativo, estoque_baixo } = req.query;
    
    const where = {};
    if (categoria_id) where.categoria_id = categoria_id;
    if (fornecedor_id) where.fornecedor_id = fornecedor_id;
    if (ativo !== undefined) where.ativo = ativo === 'true';
    
    // Filtro para produtos com estoque baixo
    if (estoque_baixo === 'true') {
      where.estoque_atual = { lte: prisma.produto.fields.estoque_minimo };
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        categoria: true,
        fornecedor: true
      },
      orderBy: { nome: 'asc' }
    });

    // Calcular margem de lucro
    const produtosComMargem = produtos.map(produto => ({
      ...produto,
      margem_lucro: produto.preco_compra > 0 
        ? ((produto.preco_venda - produto.preco_compra) / produto.preco_compra * 100).toFixed(2)
        : 0,
      estoque_status: produto.estoque_atual <= produto.estoque_minimo ? 'BAIXO' : 'OK'
    }));

    res.status(200).json({
      success: true,
      count: produtosComMargem.length,
      data: produtosComMargem
    });
  } catch (error) {
    logError('❌', 'Erro ao listar produtos', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter produto por ID
// @route   GET /api/produtos/:id
// @access  Private
const getProduto = async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id },
      include: {
        categoria: true,
        fornecedor: true,
        movimentos_estoque: {
          orderBy: { data_movimento: 'desc' },
          take: 10
        }
      }
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Calcular margem de lucro
    produto.margem_lucro = produto.preco_compra > 0 
      ? ((produto.preco_venda - produto.preco_compra) / produto.preco_compra * 100).toFixed(2)
      : 0;

    res.status(200).json({
      success: true,
      data: produto
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo produto
// @route   POST /api/produtos
// @access  Private
const createProduto = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      codigo_barras,
      categoria_id,
      fornecedor_id,
      unidade_medida,
      preco_compra,
      preco_venda,
      estoque_minimo,
      estoque_atual,
      tem_peso,
      observacoes
    } = req.body;

    // Validações
    if (!nome || !categoria_id || !unidade_medida || !preco_venda) {
      return res.status(400).json({
        success: false,
        error: 'Nome, categoria, unidade de medida e preço de venda são obrigatórios'
      });
    }

    if (preco_venda <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Preço de venda deve ser maior que zero'
      });
    }

    // Verificar se categoria existe
    const categoriaExiste = await prisma.categoria.findUnique({
      where: { id: categoria_id }
    });
    if (!categoriaExiste) {
      return res.status(400).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se fornecedor existe (se fornecido)
    if (fornecedor_id && fornecedor_id !== null && fornecedor_id !== '') {
      const fornecedorExiste = await prisma.fornecedor.findUnique({
        where: { id: fornecedor_id }
      });
      if (!fornecedorExiste) {
        return res.status(400).json({
          success: false,
          error: 'Fornecedor não encontrado'
        });
      }
    }

    // Verificar se código de barras já existe
    if (codigo_barras) {
      const produtoExistente = await prisma.produto.findUnique({
        where: { codigo_barras }
      });
      if (produtoExistente) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras já existe'
        });
      }
    }

    // Calcular margem de lucro
    const margemLucro = preco_compra > 0 
      ? ((preco_venda - preco_compra) / preco_compra * 100).toFixed(2)
      : 0;

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        codigo_barras,
        categoria_id,
        fornecedor_id: (fornecedor_id && fornecedor_id !== '') ? fornecedor_id : null,
        unidade_medida: unidade_medida.toUpperCase(),
        preco_compra: parseFloat(preco_compra || 0),
        preco_venda: parseFloat(preco_venda),
        margem_lucro: parseFloat(margemLucro),
        estoque_minimo: parseFloat(estoque_minimo || 0),
        estoque_atual: parseFloat(estoque_atual || 0),
        tem_peso: Boolean(tem_peso),
        observacoes
      },
      include: {
        categoria: true,
        fornecedor: true
      }
    });

    // Registrar movimento inicial de estoque se houver
    if (estoque_atual && estoque_atual > 0) {
      await prisma.movimentoEstoque.create({
        data: {
          produto_id: produto.id,
          tipo: 'ENTRADA',
          quantidade: parseFloat(estoque_atual),
          motivo: 'ESTOQUE_INICIAL',
          observacoes: 'Estoque inicial do produto'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: produto
    });

    // Log da criação do produto
    logProduct('created', { nome: produto.nome, id: produto.id });

  } catch (error) {
    logError('❌', 'Erro ao criar produto', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar produto
// @route   PUT /api/produtos/:id
// @access  Private
const updateProduto = async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id }
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const {
  nome,
  descricao,
  codigo_barras,
  categoria_id,
  fornecedor_id,
  unidade_medida,
  preco_compra,
  preco_venda,
  estoque_minimo,
  estoque_atual,
  tem_peso,
  observacoes,
  ativo
    } = req.body;

    // Verificar código de barras duplicado
    if (codigo_barras && codigo_barras !== produto.codigo_barras) {
      const produtoExistente = await prisma.produto.findUnique({
        where: { codigo_barras }
      });
      if (produtoExistente) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras já existe'
        });
      }
    }

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (codigo_barras !== undefined) dadosAtualizacao.codigo_barras = codigo_barras;
    
    // Validar categoria_id se fornecido
    if (categoria_id) {
      const categoriaExiste = await prisma.categoria.findUnique({
        where: { id: categoria_id }
      });
      if (!categoriaExiste) {
        return res.status(400).json({
          success: false,
          error: 'Categoria não encontrada'
        });
      }
      dadosAtualizacao.categoria_id = categoria_id;
    }
    
    // Validar fornecedor_id se fornecido
    if (fornecedor_id !== undefined) {
      if (fornecedor_id === null || fornecedor_id === '') {
        dadosAtualizacao.fornecedor_id = null;
      } else {
        // Verificar se o fornecedor existe
        const fornecedorExiste = await prisma.fornecedor.findUnique({
          where: { id: fornecedor_id }
        });
        if (!fornecedorExiste) {
          return res.status(400).json({
            success: false,
            error: 'Fornecedor não encontrado'
          });
        }
        dadosAtualizacao.fornecedor_id = fornecedor_id;
      }
    }
    if (unidade_medida) dadosAtualizacao.unidade_medida = unidade_medida.toUpperCase();
    if (preco_compra !== undefined) dadosAtualizacao.preco_compra = parseFloat(preco_compra);
    if (preco_venda !== undefined) dadosAtualizacao.preco_venda = parseFloat(preco_venda);
    if (estoque_minimo !== undefined) dadosAtualizacao.estoque_minimo = parseFloat(estoque_minimo);
    if (tem_peso !== undefined) dadosAtualizacao.tem_peso = Boolean(tem_peso);
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (ativo !== undefined) dadosAtualizacao.ativo = Boolean(ativo);
  if (estoque_atual !== undefined) dadosAtualizacao.estoque_atual = parseFloat(estoque_atual);

    // Recalcular margem de lucro se preços foram alterados
    if (preco_compra !== undefined || preco_venda !== undefined) {
      const novoPrecoCompra = preco_compra !== undefined ? parseFloat(preco_compra) : produto.preco_compra;
      const novoPrecoVenda = preco_venda !== undefined ? parseFloat(preco_venda) : produto.preco_venda;
      
      dadosAtualizacao.margem_lucro = novoPrecoCompra > 0 
        ? parseFloat(((novoPrecoVenda - novoPrecoCompra) / novoPrecoCompra * 100).toFixed(2))
        : 0;
    }

    const produtoAtualizado = await prisma.produto.update({
      where: { id: req.params.id },
      data: dadosAtualizacao,
      include: {
        categoria: true,
        fornecedor: true
      }
    });

    res.status(200).json({
      success: true,
      data: produtoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Ajustar estoque do produto
// @route   POST /api/produtos/:id/ajustar-estoque
// @access  Private
const ajustarEstoque = async (req, res) => {
  try {
    const { quantidade, motivo, observacoes } = req.body;

    if (!quantidade || !motivo) {
      return res.status(400).json({
        success: false,
        error: 'Quantidade e motivo são obrigatórios'
      });
    }

    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id }
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const novaQuantidade = parseFloat(quantidade);
    const estoqueAtual = produto.estoque_atual;
    const diferenca = novaQuantidade - estoqueAtual;
    
    // Atualizar estoque do produto
    const produtoAtualizado = await prisma.produto.update({
      where: { id: req.params.id },
      data: { estoque_atual: novaQuantidade }
    });

    // Registrar movimento de estoque
    await prisma.movimentoEstoque.create({
      data: {
        produto_id: req.params.id,
        tipo: diferenca > 0 ? 'ENTRADA' : 'SAIDA',
        quantidade: Math.abs(diferenca),
        motivo: motivo.toUpperCase(),
        observacoes: observacoes || `Ajuste de estoque: ${estoqueAtual} → ${novaQuantidade}`
      }
    });

    res.status(200).json({
      success: true,
      data: {
        produto: produtoAtualizado,
        estoque_anterior: estoqueAtual,
        estoque_atual: novaQuantidade,
        diferenca
      }
    });
  } catch (error) {
    console.error('Erro ao ajustar estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Produtos com baixo estoque
// @route   GET /api/produtos/baixo-estoque
// @access  Private
const getProdutosBaixoEstoque = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ativo: true,
        OR: [
          { estoque_atual: { lte: prisma.produto.fields.estoque_minimo } },
          { estoque_atual: 0 }
        ]
      },
      select: {
        id: true,
        nome: true,
        estoque_atual: true,
        estoque_minimo: true
      },
      orderBy: { nome: 'asc' }
    });

    // Filtrar manualmente produtos com estoque baixo (Prisma não suporta comparação entre campos diretamente)
    const produtosBaixoEstoque = produtos.filter(produto => 
      produto.estoque_atual <= produto.estoque_minimo
    );

    res.status(200).json({
      success: true,
      count: produtosBaixoEstoque.length,
      data: produtosBaixoEstoque
    });
  } catch (error) {
    console.error('🚨 Erro ao buscar produtos com baixo estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar produto
// @route   DELETE /api/produtos/:id
// @access  Private
const deleteProduto = async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: req.params.id }
    });
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    await prisma.produto.delete({
      where: { id: req.params.id }
    });
    res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
    logProduct('deleted', { nome: produto.nome, id: produto.id });
  } catch (error) {
    logError('❌', 'Erro ao deletar produto', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getProdutos,
  getProduto,
  createProduto,
  updateProduto,
  ajustarEstoque,
  getProdutosBaixoEstoque,
  deleteProduto
};