import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { Button, Card, FormGroup, Label, Input, ErrorMessage } from '../../styles/components';

interface ClientFormData {
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  ativo: boolean;
}

const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ClientFormData>({
    defaultValues: {
      ativo: true
    }
  });

  React.useEffect(() => {
    if (isEdit) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    try {
      const response = await api.get(`/clientes/${id}`);
      const client = response.data.data;
      reset({
        nome: client.nome,
        email: client.email || '',
        telefone: client.telefone || '',
        cpf: client.cpf || '',
        ativo: client.ativo
      });
    } catch (error) {
      navigate('/clientes');
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (isEdit) {
        await api.put(`/clientes/${id}`, data);
      } else {
        await api.post('/clientes', data);
      }
      navigate('/clientes');
    } catch (error) {
      // Tratar erro
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <Button variant="outline" onClick={() => navigate('/clientes')} style={{ marginBottom: 24 }}>
        <FiArrowLeft /> Voltar
      </Button>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Nome *</Label>
            <Input
              type="text"
              placeholder="Nome do cliente"
              {...register('nome', { required: 'Nome é obrigatório' })}
              className={errors.nome ? 'error' : ''}
            />
            {errors.nome && <ErrorMessage>{errors.nome.message}</ErrorMessage>}
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input type="email" placeholder="Email" {...register('email')} />
          </FormGroup>
          <FormGroup>
            <Label>Telefone</Label>
            <Input type="text" placeholder="Telefone" {...register('telefone')} />
          </FormGroup>
          <FormGroup>
            <Label>CPF</Label>
            <Input type="text" placeholder="CPF" {...register('cpf')} />
          </FormGroup>
          <FormGroup>
            <Label>
              <input type="checkbox" {...register('ativo')} /> Cliente ativo
            </Label>
          </FormGroup>
          <Button type="submit" variant="primary" style={{ marginTop: 16 }}>
            <FiSave /> {isEdit ? 'Salvar alterações' : 'Cadastrar Cliente'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ClientForm;
