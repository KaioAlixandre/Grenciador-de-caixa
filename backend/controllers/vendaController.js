const { prisma } = require('../config/database');
const { logSale, logError } = require('../utils/logger');

// @desc    Listar vendas
// @route   GET /api/vendas
// @access  Private
const getVendas = async (req, res) => {
  try {
    const { data_inicio, data_fim, cliente_id, vendedor_id, status } = req.query;
    
    const where = {};
    if (data_inicio && data_fim) {
      where.data_venda = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }
    if (cliente_id) where.cliente_id = cliente_id;
    if (vendedor_id) where.vendedor_id = vendedor_id;
    if (status) where.status = status.toUpperCase();

    const vendas = await prisma.venda.findMany({
      where,
      include: {
        cliente: true,
        vendedor: { select: { id: true, nome: true } },
        itens: {
          include: {
            produto: true
          }
        }
      },
      orderBy: { data_venda: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: vendas.length,
      data: vendas
    });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter venda por ID
// @route   GET /api/vendas/:id
// @access  Private
const getVenda = async (req, res) => {
  try {
    const venda = await prisma.venda.findUnique({
      where: { id: req.params.id },
      include: {
        cliente: true,
        vendedor: { select: { id: true, nome: true } },
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!venda) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: venda
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar nova venda
// @route   POST /api/vendas
// @access  Private
const createVenda = async (req, res) => {
  try {
    const {
      cliente_id,
      tipo_pagamento,
      valor_desconto = 0,
      observacoes,
      itens
    } = req.body;

    // Validações
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pelo menos um item deve ser informado'
      });
    }

    if (!tipo_pagamento) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de pagamento é obrigatório'
      });
    }

    // Gerar número da venda
    const ultimaVenda = await prisma.venda.findFirst({
      orderBy: { numero_venda: 'desc' }
    });
    
    const proximoNumero = ultimaVenda 
      ? (parseInt(ultimaVenda.numero_venda) + 1).toString().padStart(6, '0')
      : '000001';

    // Validar produtos e calcular valores
    let valorTotal = 0;
    const itensValidados = [];

    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produto_id }
      });

      if (!produto) {
        return res.status(404).json({
          success: false,
          error: `Produto ${item.produto_id} não encontrado`
        });
      }

      if (!produto.ativo) {
        return res.status(400).json({
          success: false,
          error: `Produto ${produto.nome} está inativo`
        });
      }

      // Verificar estoque
      const quantidadeVenda = parseFloat(item.quantidade);
      if (produto.estoque_atual < quantidadeVenda) {
        return res.status(400).json({
          success: false,
          error: `Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoque_atual}`
        });
      }

      const precoUnitario = item.preco_unitario || produto.preco_venda;
      const precoTotal = quantidadeVenda * precoUnitario;

      itensValidados.push({
        produto_id: produto.id,
        quantidade: quantidadeVenda,
        preco_unitario: precoUnitario,
        preco_total: precoTotal,
        peso_vendido: item.peso_vendido || null
      });

      valorTotal += precoTotal;
    }

    const valorFinal = valorTotal - parseFloat(valor_desconto);

    // Criar venda em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Criar a venda
      const venda = await tx.venda.create({
        data: {
          numero_venda: proximoNumero,
          cliente_id,
          vendedor_id: req.user.id,
          tipo_pagamento: tipo_pagamento.toUpperCase(),
          valor_total: valorTotal,
          valor_desconto: parseFloat(valor_desconto),
          valor_final: valorFinal,
          observacoes
        }
      });

      // Criar itens da venda
      for (const item of itensValidados) {
        await tx.itemVenda.create({
          data: {
            venda_id: venda.id,
            ...item
          }
        });

        // Atualizar estoque do produto
        await tx.produto.update({
          where: { id: item.produto_id },
          data: {
            estoque_atual: {
              decrement: item.quantidade
            }
          }
        });

        // Registrar movimento de estoque
        await tx.movimentoEstoque.create({
          data: {
            produto_id: item.produto_id,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: 'VENDA',
            observacoes: `Venda #${proximoNumero}`
          }
        });
      }

      return venda;
    });

    // Buscar venda completa para retorno
    const vendaCompleta = await prisma.venda.findUnique({
      where: { id: resultado.id },
      include: {
        cliente: true,
        vendedor: { select: { id: true, nome: true } },
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    // Log da criação da venda (ANTES da resposta)
    logSale('created', {
      numero: resultado.numero_venda,
      total: resultado.valor_final,
      itens_count: vendaCompleta.itens?.length || 0,
      cliente: vendaCompleta.cliente?.nome
    });

    res.status(201).json({
      success: true,
      data: vendaCompleta
    });

  } catch (error) {
    logError('❌', 'Erro ao criar venda', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Cancelar venda
// @route   PUT /api/vendas/:id/cancelar
// @access  Private
const cancelarVenda = async (req, res) => {
  try {
    const { motivo } = req.body;

    const venda = await prisma.venda.findUnique({
      where: { id: req.params.id },
      include: {
        itens: {
          include: {
            produto: true
          }
        }
      }
    });

    if (!venda) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    if (venda.status === 'CANCELADA') {
      return res.status(400).json({
        success: false,
        error: 'Venda já está cancelada'
      });
    }

    // Cancelar venda em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar status da venda
      const vendaCancelada = await tx.venda.update({
        where: { id: req.params.id },
        data: {
          status: 'CANCELADA',
          observacoes: venda.observacoes 
            ? `${venda.observacoes}\n\nCANCELADA: ${motivo || 'Sem motivo informado'}`
            : `CANCELADA: ${motivo || 'Sem motivo informado'}`
        }
      });

      // Devolver produtos ao estoque
      for (const item of venda.itens) {
        await tx.produto.update({
          where: { id: item.produto_id },
          data: {
            estoque_atual: {
              increment: item.quantidade
            }
          }
        });

        // Registrar movimento de estoque
        await tx.movimentoEstoque.create({
          data: {
            produto_id: item.produto_id,
            tipo: 'ENTRADA',
            quantidade: item.quantidade,
            motivo: 'DEVOLUCAO',
            observacoes: `Cancelamento da venda #${venda.numero_venda}`
          }
        });
      }

      return vendaCancelada;
    });

    res.status(200).json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao cancelar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Relatório de vendas
// @route   GET /api/vendas/relatorio
// @access  Private
const relatorioVendas = async (req, res) => {
  try {
    const { data_inicio, data_fim, vendedor_id } = req.query;

    const where = { status: 'CONCLUIDA' };
    
    if (data_inicio && data_fim) {
      where.data_venda = {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      };
    }
    
    if (vendedor_id) where.vendedor_id = vendedor_id;

    // Totais gerais
    const totais = await prisma.venda.aggregate({
      where,
      _sum: {
        valor_total: true,
        valor_desconto: true,
        valor_final: true
      },
      _count: {
        id: true
      }
    });

    // Vendas por vendedor
    const vendasPorVendedor = await prisma.venda.groupBy({
      by: ['vendedor_id'],
      where,
      _sum: {
        valor_final: true
      },
      _count: {
        id: true
      }
    });

    // Buscar nomes dos vendedores
    const vendedores = await prisma.usuario.findMany({
      where: {
        id: { in: vendasPorVendedor.map(v => v.vendedor_id) }
      },
      select: { id: true, nome: true }
    });

    const vendasComNomes = vendasPorVendedor.map(venda => ({
      ...venda,
      vendedor_nome: vendedores.find(v => v.id === venda.vendedor_id)?.nome
    }));

    // Produtos mais vendidos
    const produtosMaisVendidos = await prisma.itemVenda.groupBy({
      by: ['produto_id'],
      where: {
        venda: { ...where }
      },
      _sum: {
        quantidade: true,
        preco_total: true
      },
      orderBy: {
        _sum: {
          quantidade: 'desc'
        }
      },
      take: 10
    });

    // Buscar dados dos produtos
    const produtos = await prisma.produto.findMany({
      where: {
        id: { in: produtosMaisVendidos.map(p => p.produto_id) }
      },
      select: { id: true, nome: true, unidade_medida: true }
    });

    const produtosComNomes = produtosMaisVendidos.map(produto => ({
      ...produto,
      produto_nome: produtos.find(p => p.id === produto.produto_id)?.nome,
      unidade_medida: produtos.find(p => p.id === produto.produto_id)?.unidade_medida
    }));

    res.status(200).json({
      success: true,
      data: {
        periodo: { data_inicio, data_fim },
        totais: {
          quantidade_vendas: totais._count.id,
          valor_total: totais._sum.valor_total || 0,
          valor_desconto: totais._sum.valor_desconto || 0,
          valor_final: totais._sum.valor_final || 0,
          ticket_medio: totais._count.id > 0 
            ? (totais._sum.valor_final / totais._count.id).toFixed(2)
            : 0
        },
        vendas_por_vendedor: vendasComNomes,
        produtos_mais_vendidos: produtosComNomes
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Estatísticas para dashboard
// @route   GET /api/vendas/dashboard-stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Vendas de hoje
    const vendasHoje = await prisma.venda.aggregate({
      where: {
        data_venda: {
          gte: hoje,
          lt: amanha
        },
        status: 'CONCLUIDA'
      },
      _sum: {
        valor_final: true
      }
    });
    
    // Vendas do mês
    const vendasMes = await prisma.venda.aggregate({
      where: {
        data_venda: {
          gte: inicioMes
        },
        status: 'CONCLUIDA'
      },
      _sum: {
        valor_final: true
      }
    });
    
    // Produtos em estoque
    const produtosEstoque = await prisma.produto.count({
      where: {
        ativo: true,
        estoque_atual: {
          gt: 0
        }
      }
    });
    
    // Total de clientes
    const clientesTotal = await prisma.cliente.count({
      where: {
        ativo: true
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        vendas_hoje: vendasHoje._sum.valor_final || 0,
        vendas_mes: vendasMes._sum.valor_final || 0,
        produtos_estoque: produtosEstoque,
        clientes_total: clientesTotal
      }
    });
  } catch (error) {
    logError('❌', 'Erro ao buscar estatísticas do dashboard', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getVendas,
  getVenda,
  createVenda,
  cancelarVenda,
  relatorioVendas,
  getDashboardStats
};