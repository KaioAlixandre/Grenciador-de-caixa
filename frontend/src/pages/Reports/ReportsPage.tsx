import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
`;

const Th = styled.th`
  border-bottom: 2px solid #eee;
  padding: 0.75rem;
  text-align: left;
`;

const Td = styled.td`
  border-bottom: 1px solid #eee;
  padding: 0.75rem;
`;

const Subtitle = styled.h3`
  margin-bottom: 1rem;
`;

const Loading = styled.div`
  padding: 2rem;
  text-align: center;
`;

const ErrorMsg = styled.div`
  color: #c00;
  margin-bottom: 1rem;
`;

const ReportsPage: React.FC = () => {
  const [stockReport, setStockReport] = useState<any[]>([]);
  const [salesReport, setSalesReport] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const [estoqueRes, vendasRes, baixoEstoqueRes] = await Promise.all([
          api.get('/estoque/relatorio'),
          api.get('/vendas/relatorio'),
          api.get('/produtos/baixo-estoque')
        ]);
        setStockReport(estoqueRes.data.data || []);
        setSalesReport(vendasRes.data.data || []);
        setLowStock(baixoEstoqueRes.data.data || []);
      } catch (err: any) {
        setError('Erro ao carregar relatórios');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <Container>
      <Title>Relatórios</Title>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {loading ? (
        <Loading>Carregando relatórios...</Loading>
      ) : (
        <>
          <Section>
            <Subtitle>Relatório de Estoque</Subtitle>
            <Table>
              <thead>
                <tr>
                  <Th>Produto</Th>
                  <Th>Quantidade Atual</Th>
                  <Th>Estoque Mínimo</Th>
                </tr>
              </thead>
              <tbody>
                {stockReport.map((item: any) => (
                  <tr key={item.id}>
                    <Td>{item.nome}</Td>
                    <Td>{item.estoque_atual}</Td>
                    <Td>{item.estoque_minimo}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section>
            <Subtitle>Produtos com Estoque Baixo</Subtitle>
            <Table>
              <thead>
                <tr>
                  <Th>Produto</Th>
                  <Th>Quantidade Atual</Th>
                  <Th>Estoque Mínimo</Th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item: any) => (
                  <tr key={item.id}>
                    <Td>{item.nome}</Td>
                    <Td>{item.estoque_atual}</Td>
                    <Td>{item.estoque_minimo}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>

          <Section>
            <Subtitle>Relatório de Vendas</Subtitle>
            <Table>
              <thead>
                <tr>
                  <Th>Produto</Th>
                  <Th>Quantidade Vendida</Th>
                  <Th>Valor Total</Th>
                </tr>
              </thead>
              <tbody>
                {salesReport.map((item: any) => (
                  <tr key={item.id}>
                    <Td>{item.produto_nome || item.nome}</Td>
                    <Td>{item.quantidade_vendida || item.quantidade}</Td>
                    <Td>{item.valor_total ? `R$ ${item.valor_total}` : '-'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </>
      )}
    </Container>
  );
};

export default ReportsPage;
