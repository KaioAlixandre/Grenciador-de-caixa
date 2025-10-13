import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiPackage, 
  FiUsers,
  FiAlertTriangle 
} from 'react-icons/fi';
import { Card } from '../../styles/components';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 32px;
  font-size: 2rem;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled(Card)`
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 4px 0;
`;

const StatValue = styled.h3`
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`;

const AlertsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin-bottom: 16px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const AlertCard = styled(Card)`
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #f39c12;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AlertIcon = styled.div`
  color: #f39c12;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
`;

const AlertText = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const ChartCard = styled(Card)`
  padding: 24px;
`;

const ChartTitle = styled.h3`
  color: #333;
  margin-bottom: 16px;
  font-size: 1.25rem;
  font-weight: 600;
`;

interface DashboardStats {
  vendas_hoje: number;
  vendas_mes: number;
  produtos_estoque: number;
  clientes_total: number;
  produtos_baixo_estoque: number;
}

interface ProdutoBaixoEstoque {
  id: number;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState<ProdutoBaixoEstoque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carregamento dos dados do dashboard...');
      
      // Verificar se há token de autenticação
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', !!token);
      
      // Carregar estatísticas do dashboard
      console.log('Fazendo requisições para:', '/vendas/dashboard-stats', '/produtos/baixo-estoque');
      
      const [statsResponse, baixoEstoqueResponse] = await Promise.all([
        api.get('/vendas/dashboard-stats'),
        api.get('/produtos/baixo-estoque')
      ]);

      console.log('Stats Response:', statsResponse);
      console.log('Stats Data:', statsResponse.data);
      console.log('Baixo Estoque Response:', baixoEstoqueResponse);
      console.log('Baixo Estoque Data:', baixoEstoqueResponse.data);

      // Verificar se a resposta tem a estrutura correta
      if (statsResponse.data && statsResponse.data.success) {
        console.log('Usando stats.data.data:', statsResponse.data.data);
        setStats(statsResponse.data.data);
      } else {
        console.log('Usando stats.data diretamente:', statsResponse.data);
        setStats(statsResponse.data);
      }
      
      if (baixoEstoqueResponse.data && baixoEstoqueResponse.data.success) {
        console.log('Usando baixoEstoque.data.data:', baixoEstoqueResponse.data.data);
        setProdutosBaixoEstoque(baixoEstoqueResponse.data.data);
      } else {
        console.log('Usando baixoEstoque.data diretamente:', baixoEstoqueResponse.data);
        setProdutosBaixoEstoque(baixoEstoqueResponse.data);
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados do dashboard:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <PageTitle>Dashboard</PageTitle>
        <p>Carregando dados...</p>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageTitle>Dashboard</PageTitle>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#28a745">
            <FiDollarSign size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Vendas Hoje</StatLabel>
            <StatValue>{formatCurrency(stats?.vendas_hoje || 0)}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#007bff">
            <FiTrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Vendas do Mês</StatLabel>
            <StatValue>{formatCurrency(stats?.vendas_mes || 0)}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#6f42c1">
            <FiPackage size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Produtos em Estoque</StatLabel>
            <StatValue>{stats?.produtos_estoque || 0}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#17a2b8">
            <FiUsers size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Total de Clientes</StatLabel>
            <StatValue>{stats?.clientes_total || 0}</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      {produtosBaixoEstoque.length > 0 && (
        <AlertsSection>
          <SectionTitle>Alertas de Estoque</SectionTitle>
          {produtosBaixoEstoque.map((produto) => (
            <AlertCard key={produto.id}>
              <AlertIcon>
                <FiAlertTriangle size={20} />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Estoque Baixo</AlertTitle>
                <AlertText>
                  {produto.nome} - Estoque atual: {produto.estoque_atual} 
                  (Mínimo: {produto.estoque_minimo})
                </AlertText>
              </AlertContent>
            </AlertCard>
          ))}
        </AlertsSection>
      )}

      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Vendas dos Últimos 7 Dias</ChartTitle>
          <p style={{ color: '#666' }}>
            Gráfico será implementado com biblioteca de charts
          </p>
        </ChartCard>

        <ChartCard>
          <ChartTitle>Produtos Mais Vendidos</ChartTitle>
          <p style={{ color: '#666' }}>
            Gráfico será implementado com biblioteca de charts
          </p>
        </ChartCard>
      </ChartsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;