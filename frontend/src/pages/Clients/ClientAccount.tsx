import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { Card, PageTitle, Table, TableRow, TableHeader, TableCell, Button, Input } from '../../styles/components';
import { formatCurrency } from '../../utils/formatters';

interface Venda {
  id: string;
  numero_venda: string;
  data_venda: string;
  tipo_pagamento: string;
  valor_final: number;
  valor_total: number;
  valor_desconto: number;
  status: string;
  itens: Array<{
    produto: { nome: string };
    quantidade: number;
    preco_unitario: number;
    preco_total: number;
  }>;
  valor_pago?: number;
}

const ClientAccount: React.FC = () => {
  const { id } = useParams();
  const [comprasPrazo, setComprasPrazo] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pagamentoVendaId, setPagamentoVendaId] = useState<string | null>(null);
  const [valorPagamento, setValorPagamento] = useState('');
  const [pagando, setPagando] = useState(false);
  const [erroPagamento, setErroPagamento] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchComprasPrazo();
    }
  }, [id]);

  const fetchComprasPrazo = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vendas?cliente_id=${id}&tipo_pagamento=PRAZO`);
      setComprasPrazo(response.data.data || []);
    } catch (error) {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  const abrirModalPagamento = (vendaId: string) => {
    setPagamentoVendaId(vendaId);
    setShowModal(true);
    setValorPagamento('');
  };

  const fecharModalPagamento = () => {
    setShowModal(false);
    setPagamentoVendaId(null);
    setValorPagamento('');
  };

  const registrarPagamento = async () => {
    if (!pagamentoVendaId || !valorPagamento) return;
    setPagando(true);
    setErroPagamento(null);
    try {
      await api.post(`/vendas/${pagamentoVendaId}/receber`, { valor: parseFloat(valorPagamento) });
      fecharModalPagamento();
      await fetchComprasPrazo();
    } catch (error: any) {
      setErroPagamento(error?.response?.data?.error || 'Erro ao registrar pagamento');
    } finally {
      setPagando(false);
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <PageTitle>Compras a Prazo do Cliente</PageTitle>
      <Card>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Nº Venda</TableHeader>
              <TableHeader>Data</TableHeader>
              <TableHeader>Valor Total</TableHeader>
              <TableHeader>Desconto</TableHeader>
              <TableHeader>Valor Final</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Itens</TableHeader>
              <TableHeader>Recebimento</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {comprasPrazo.map(venda => (
              <TableRow key={venda.id}>
                <TableCell>{venda.numero_venda}</TableCell>
                <TableCell>{new Date(venda.data_venda).toLocaleDateString()}</TableCell>
                <TableCell>{formatCurrency(venda.valor_total)}</TableCell>
                <TableCell>{formatCurrency(venda.valor_desconto)}</TableCell>
                <TableCell>{formatCurrency(venda.valor_final)}</TableCell>
                <TableCell>{venda.status}</TableCell>
                <TableCell>
                  {venda.itens.map(item => (
                    <div key={item.produto.nome}>
                      {item.produto.nome} - {item.quantidade} x {formatCurrency(item.preco_unitario)} = {formatCurrency(item.preco_total)}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <div>
                    <div>Pago: {formatCurrency(venda.valor_pago || 0)}</div>
                    <div>A receber: {formatCurrency((venda.valor_final || 0) - (venda.valor_pago || 0))}</div>
                    <Button size="small" variant="primary" onClick={() => abrirModalPagamento(venda.id)}>
                      Receber Pagamento
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320 }}>
            <h3>Receber Pagamento</h3>
            <Input
              type="number"
              placeholder="Valor recebido"
              value={valorPagamento}
              onChange={e => setValorPagamento(e.target.value)}
              min={0}
            />
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <Button variant="primary" onClick={registrarPagamento} disabled={pagando || !valorPagamento}>Confirmar</Button>
              <Button variant="secondary" onClick={fecharModalPagamento} disabled={pagando}>Cancelar</Button>
            {erroPagamento && (
              <div style={{ color: 'red', marginTop: 8 }}>{erroPagamento}</div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAccount;
