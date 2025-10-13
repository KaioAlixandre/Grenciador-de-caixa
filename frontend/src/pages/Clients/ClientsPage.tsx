import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import { Button, Card, Table, TableRow, TableCell, TableHeader, PageTitle } from '../../styles/components';

interface Client {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  ativo: boolean;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clientes?ativo=true');
      setClients(response.data.data || []);
    } catch (error) {
      // Tratar erro
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/clientes/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este cliente?')) return;
    try {
      await api.delete(`/clientes/${id}`);
      loadClients();
    } catch (error) {
      // Tratar erro
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <PageTitle>
        <FiUserPlus size={28} /> Gestão de Clientes
      </PageTitle>
      <Button variant="primary" onClick={() => navigate('/clientes/novo')} style={{ marginBottom: 24 }}>
        <FiUserPlus /> Novo Cliente
      </Button>
      <Card>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Nome</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Telefone</TableHeader>
              <TableHeader>Documento</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Ações</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {clients.map(client => (
              <TableRow key={client.id}>
                <TableCell>{client.nome}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.telefone || '-'}</TableCell>
                <TableCell>{client.cpf || '-'}</TableCell>
                <TableCell>{client.ativo ? 'Ativo' : 'Inativo'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="small" onClick={() => handleEdit(client.id)}>
                    <FiEdit />
                  </Button>
                  <Button variant="danger" size="small" onClick={() => handleDelete(client.id)} style={{ marginLeft: 8 }}>
                    <FiTrash2 />
                  </Button>
                  <Button variant="secondary" size="small" onClick={() => navigate(`/clientes/${client.id}/conta`)} style={{ marginLeft: 8 }}>
                    Histórico a Prazo
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default ClientsPage;
