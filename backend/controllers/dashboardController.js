const { SaldoService, TransacaoService } = require('../models');
const { prisma } = require('../config/database');

// @desc    Obter dados do dashboard
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // Obter saldo atualizado
    const saldo = await SaldoService.atualizar(req.user.id);

    // Obter transações recentes (últimas 5)
    const transacoesRecentes = await TransacaoService.listarPorUsuario(req.user.id);
    const ultimasTransacoes = transacoesRecentes.slice(0, 5);

    // Obter estatísticas por categoria (mês atual)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const estatisticasCategorias = await prisma.transacao.groupBy({
      by: ['categoria_id', 'tipo'],
      where: {
        usuario_id: req.user.id,
        data: { gte: inicioMes }
      },
      _sum: {
        valor: true
      },
      _count: {
        id: true
      }
    });

    // Buscar dados das categorias
    const categoriasIds = [...new Set(estatisticasCategorias.map(e => e.categoria_id))];
    const categorias = await prisma.categoria.findMany({
      where: {
        id: { in: categoriasIds }
      }
    });

    // Combinar dados das categorias com estatísticas
    const estatisticasComCategorias = estatisticasCategorias.map(stat => {
      const categoria = categorias.find(c => c.id === stat.categoria_id);
      return {
        categoria: categoria,
        tipo: stat.tipo,
        valor_total: stat._sum.valor,
        quantidade_transacoes: stat._count.id
      };
    });

    // Calcular evolução dos últimos 6 meses
    const seisMetesAtras = new Date();
    seisMetesAtras.setMonth(seisMetesAtras.getMonth() - 6);
    seisMetesAtras.setDate(1);
    seisMetesAtras.setHours(0, 0, 0, 0);

    const evolucaoMensal = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', data) as mes,
        tipo,
        SUM(valor) as total
      FROM transacoes 
      WHERE usuario_id = ${req.user.id} 
        AND data >= ${seisMetesAtras}
      GROUP BY DATE_TRUNC('month', data), tipo
      ORDER BY mes ASC
    `;

    res.status(200).json({
      success: true,
      data: {
        saldo,
        ultimas_transacoes: ultimasTransacoes,
        estatisticas_categorias: estatisticasComCategorias,
        evolucao_mensal: evolucaoMensal
      }
    });
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter resumo financeiro
// @route   GET /api/dashboard/resumo
// @access  Private
const getResumo = async (req, res) => {
  try {
    const { periodo } = req.query; // 'mes', 'trimestre', 'ano'

    let dataInicio = new Date();
    
    switch (periodo) {
      case 'trimestre':
        dataInicio.setMonth(dataInicio.getMonth() - 3);
        break;
      case 'ano':
        dataInicio.setFullYear(dataInicio.getFullYear() - 1);
        break;
      default: // 'mes'
        dataInicio.setMonth(dataInicio.getMonth() - 1);
    }

    dataInicio.setHours(0, 0, 0, 0);

    // Calcular totais do período
    const resumo = await prisma.transacao.groupBy({
      by: ['tipo'],
      where: {
        usuario_id: req.user.id,
        data: { gte: dataInicio }
      },
      _sum: {
        valor: true
      },
      _count: {
        id: true
      }
    });

    const receitas = resumo.find(r => r.tipo === 'RECEITA');
    const despesas = resumo.find(r => r.tipo === 'DESPESA');

    const totalReceitas = receitas?._sum.valor || 0;
    const totalDespesas = despesas?._sum.valor || 0;
    const saldoPeriodo = totalReceitas - totalDespesas;

    res.status(200).json({
      success: true,
      data: {
        periodo,
        data_inicio: dataInicio,
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo_periodo: saldoPeriodo,
        quantidade_receitas: receitas?._count.id || 0,
        quantidade_despesas: despesas?._count.id || 0
      }
    });
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  getResumo
};