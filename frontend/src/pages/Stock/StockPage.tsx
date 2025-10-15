import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../../services/api';

const Container = styled.div`
  padding: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const Button = styled.button`
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: #1565c0;
  }
`;

interface Product {
  id: string;
  nome: string;
  estoque_atual: number;
  estoque_minimo: number;
}

const StockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/produtos')
      .then((res: any) => setProducts(res.data.data || res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateStock = async (id: string, delta: number) => {
    try {
      await api.post(`/produtos/${id}/ajustar-estoque`, {
        quantidade: Math.abs(delta),
        tipo: delta > 0 ? 'ENTRADA' : 'SAIDA',
        motivo: delta > 0 ? 'AJUSTE' : 'AJUSTE',
        observacoes: ''
      });
      const res = await api.get('/produtos');
      setProducts(res.data.data || res.data);
    } catch (error: any) {
      alert(error?.response?.data?.error || 'Erro ao atualizar estoque');
    }
  };

  return (
    <Container>
      <Title>Controle de Estoque</Title>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Quantidade</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {products.map(prod => (
              <tr key={prod.id}>
                <Td>{prod.nome}</Td>
                <Td>{prod.estoque_atual}</Td>
                <Td>
                  <Button onClick={() => handleUpdateStock(prod.id, 1)}>Entrada</Button>
                  <Button onClick={() => handleUpdateStock(prod.id, -1)}>Saída</Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default StockPage;
