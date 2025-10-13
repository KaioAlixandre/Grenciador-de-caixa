const { TransacaoService, CategoriaService, SaldoService } = require('../models');

// @desc    Listar transações do usuário
// @route   GET /api/transactions
// @access  Private
const getTransacoes = async (req, res) => {
  try {
    const { tipo, categoria_id, data_inicio, data_fim } = req.query;
    
    const filtros = {};
    if (tipo) filtros.tipo = tipo.toUpperCase();
    if (categoria_id) filtros.categoria_id = categoria_id;
    if (data_inicio) filtros.data_inicio = data_inicio;
    if (data_fim) filtros.data_fim = data_fim;

    const transacoes = await TransacaoService.listarPorUsuario(req.user.id, filtros);

    res.status(200).json({
      success: true,
      count: transacoes.length,
      data: transacoes
    });
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter transação por ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransacao = async (req, res) => {
  try {
    const transacao = await TransacaoService.buscarPorId(req.params.id, req.user.id);

    if (!transacao) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: transacao
    });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar nova transação
// @route   POST /api/transactions
// @access  Private
const createTransacao = async (req, res) => {
  try {
    const { descricao, valor, tipo, categoria_id, data, metodo_pagamento, observacoes, tags } = req.body;

    // Validações
    if (!descricao || !valor || !tipo || !categoria_id) {
      return res.status(400).json({
        success: false,
        error: 'Descrição, valor, tipo e categoria são obrigatórios'
      });
    }

    if (valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor deve ser maior que zero'
      });
    }

    // Verificar se a categoria existe e pertence ao usuário
    const categoria = await CategoriaService.buscarPorId(categoria_id, req.user.id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se o tipo da transação bate com o tipo da categoria
    if (categoria.tipo !== tipo.toUpperCase()) {
      return res.status(400).json({
        success: false,
        error: 'Tipo da transação não corresponde ao tipo da categoria'
      });
    }

    const dadosTransacao = {
      descricao,
      valor: parseFloat(valor),
      tipo: tipo.toUpperCase(),
      categoria_id,
      data: data ? new Date(data) : new Date(),
      metodo_pagamento: metodo_pagamento?.toUpperCase() || 'DINHEIRO',
      observacoes,
      tags: tags || [],
      usuario_id: req.user.id
    };

    const transacao = await TransacaoService.criar(dadosTransacao);

    // Atualizar saldo do usuário
    await SaldoService.atualizar(req.user.id);

    res.status(201).json({
      success: true,
      data: transacao
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar transação
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransacao = async (req, res) => {
  try {
    const transacao = await TransacaoService.buscarPorId(req.params.id, req.user.id);

    if (!transacao) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    const { descricao, valor, tipo, categoria_id, data, metodo_pagamento, observacoes, tags } = req.body;

    // Se categoria foi alterada, verificar se existe e pertence ao usuário
    if (categoria_id && categoria_id !== transacao.categoria_id) {
      const categoria = await CategoriaService.buscarPorId(categoria_id, req.user.id);
      if (!categoria) {
        return res.status(404).json({
          success: false,
          error: 'Categoria não encontrada'
        });
      }

      // Verificar se o tipo da transação bate com o tipo da categoria
      if (tipo && categoria.tipo !== tipo.toUpperCase()) {
        return res.status(400).json({
          success: false,
          error: 'Tipo da transação não corresponde ao tipo da categoria'
        });
      }
    }

    const dadosAtualizacao = {};
    if (descricao) dadosAtualizacao.descricao = descricao;
    if (valor) dadosAtualizacao.valor = parseFloat(valor);
    if (tipo) dadosAtualizacao.tipo = tipo.toUpperCase();
    if (categoria_id) dadosAtualizacao.categoria_id = categoria_id;
    if (data) dadosAtualizacao.data = new Date(data);
    if (metodo_pagamento) dadosAtualizacao.metodo_pagamento = metodo_pagamento.toUpperCase();
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    if (tags) dadosAtualizacao.tags = tags;

    const transacaoAtualizada = await TransacaoService.atualizar(req.params.id, req.user.id, dadosAtualizacao);

    // Atualizar saldo do usuário
    await SaldoService.atualizar(req.user.id);

    res.status(200).json({
      success: true,
      data: transacaoAtualizada
    });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar transação
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransacao = async (req, res) => {
  try {
    const transacao = await TransacaoService.buscarPorId(req.params.id, req.user.id);

    if (!transacao) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }

    await TransacaoService.deletar(req.params.id, req.user.id);

    // Atualizar saldo do usuário
    await SaldoService.atualizar(req.user.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getTransacoes,
  getTransacao,
  createTransacao,
  updateTransacao,
  deleteTransacao
};