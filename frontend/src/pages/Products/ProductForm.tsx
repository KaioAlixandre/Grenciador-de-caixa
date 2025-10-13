import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiSave, FiArrowLeft, FiPackage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { Button, Card, FormGroup, Label, Input, ErrorMessage } from '../../styles/components';

const FormContainer = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const BackButton = styled(Button)`
  padding: 8px;
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FormCard = styled(Card)`
  padding: 32px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #007bff;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
`;

interface ProductFormData {
  nome: string;
  descricao?: string;
  codigo_barras?: string;
  categoria_id: string;
  fornecedor_id?: string;
  unidade_medida: string;
  preco_compra: number;
  preco_venda: number;
  estoque_minimo: number;
  estoque_atual: number;
  tem_peso: boolean;
  ativo: boolean;
  observacoes?: string;
}

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProductFormData>({
    defaultValues: {
      ativo: true,
      tem_peso: false,
      unidade_medida: 'un',
      estoque_atual: 0,
      estoque_minimo: 1
    }
  });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setLoadingData(true);
      const response = await api.get(`/produtos/${id}`);
      const product = response.data.data;
      
      reset({
        nome: product.nome,
        descricao: product.descricao || '',
        codigo_barras: product.codigo_barras || '',
        categoria_id: product.categoria_id,
        fornecedor_id: product.fornecedor_id || '',
        unidade_medida: product.unidade_medida,
        preco_compra: product.preco_compra,
        preco_venda: product.preco_venda,
        estoque_minimo: product.estoque_minimo,
        estoque_atual: product.estoque_atual,
        tem_peso: product.tem_peso,
        ativo: product.ativo,
        observacoes: product.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar produto');
      navigate('/produtos');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);
      
      const productData = {
        ...data,
        preco_compra: Number(data.preco_compra),
        preco_venda: Number(data.preco_venda),
        estoque_minimo: Number(data.estoque_minimo),
        estoque_atual: Number(data.estoque_atual)
      };

      if (isEdit) {
        await api.put(`/produtos/${id}`, productData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', productData);
        toast.success('Produto criado com sucesso!');
      }
      
      navigate('/produtos');
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = () => {
    const precoCompra = Number(watch('preco_compra'));
    const precoVenda = Number(watch('preco_venda'));
    
    if (precoCompra > 0 && precoVenda > 0) {
      const margin = ((precoVenda - precoCompra) / precoCompra * 100);
      return margin.toFixed(2);
    }
    return '0.00';
  };

  if (loadingData) {
    return (
      <FormContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando dados do produto...
        </div>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <PageHeader>
        <BackButton variant="outline" onClick={() => navigate('/produtos')}>
          <FiArrowLeft size={16} />
        </BackButton>
        <PageTitle>
          <FiPackage size={28} />
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </PageTitle>
      </PageHeader>

      <FormCard>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGrid>
            <FullWidthGroup>
              <Label>Nome do produto *</Label>
              <Input
                type="text"
                placeholder="Ex: Ração Golden para Cães Adultos"
                className={errors.nome ? 'error' : ''}
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 3,
                    message: 'Nome deve ter pelo menos 3 caracteres'
                  }
                })}
              />
              {errors.nome && <ErrorMessage>{errors.nome.message}</ErrorMessage>}
            </FullWidthGroup>

            <FormRow>
              <FormGroup>
                <Label>Código de barras</Label>
                <Input
                  type="text"
                  placeholder="Ex: 7891000100103"
                  {...register('codigo_barras')}
                />
              </FormGroup>

              <FormGroup>
                <Label>Categoria *</Label>
                <Select
                  className={errors.categoria_id ? 'error' : ''}
                  {...register('categoria_id', {
                    required: 'Categoria é obrigatória'
                  })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.nome}
                    </option>
                  ))}
                </Select>
                {errors.categoria_id && <ErrorMessage>{errors.categoria_id.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Unidade de medida *</Label>
                <Select
                  {...register('unidade_medida', {
                    required: 'Unidade de medida é obrigatória'
                  })}
                >
                  <option value="un">Unidade</option>
                  <option value="kg">Quilograma</option>
                  <option value="g">Grama</option>
                  <option value="l">Litro</option>
                  <option value="ml">Mililitro</option>
                  <option value="m">Metro</option>
                  <option value="cm">Centímetro</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Preço de compra *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className={errors.preco_compra ? 'error' : ''}
                  {...register('preco_compra', {
                    required: 'Preço de compra é obrigatório',
                    min: {
                      value: 0,
                      message: 'Preço deve ser maior que zero'
                    }
                  })}
                />
                {errors.preco_compra && <ErrorMessage>{errors.preco_compra.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Preço de venda *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className={errors.preco_venda ? 'error' : ''}
                  {...register('preco_venda', {
                    required: 'Preço de venda é obrigatório',
                    min: {
                      value: 0,
                      message: 'Preço deve ser maior que zero'
                    }
                  })}
                />
                {errors.preco_venda && <ErrorMessage>{errors.preco_venda.message}</ErrorMessage>}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Margem de lucro: {calculateMargin()}%
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Estoque mínimo *</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="1"
                  className={errors.estoque_minimo ? 'error' : ''}
                  {...register('estoque_minimo', {
                    required: 'Estoque mínimo é obrigatório',
                    min: {
                      value: 0,
                      message: 'Estoque mínimo não pode ser negativo'
                    }
                  })}
                />
                {errors.estoque_minimo && <ErrorMessage>{errors.estoque_minimo.message}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Estoque atual *</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  className={errors.estoque_atual ? 'error' : ''}
                  {...register('estoque_atual', {
                    required: 'Estoque atual é obrigatório',
                    min: {
                      value: 0,
                      message: 'Estoque atual não pode ser negativo'
                    }
                  })}
                />
                {errors.estoque_atual && <ErrorMessage>{errors.estoque_atual.message}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Configurações</Label>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    id="tem_peso"
                    {...register('tem_peso')}
                  />
                  <CheckboxLabel htmlFor="tem_peso">
                    Produto vendido por peso
                  </CheckboxLabel>
                </CheckboxGroup>
                <CheckboxGroup>
                  <Checkbox
                    type="checkbox"
                    id="ativo"
                    {...register('ativo')}
                  />
                  <CheckboxLabel htmlFor="ativo">
                    Produto ativo
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>
            </FormRow>

            <FullWidthGroup>
              <Label>Descrição</Label>
              <TextArea
                placeholder="Descrição detalhada do produto..."
                {...register('descricao')}
              />
            </FullWidthGroup>

            <FullWidthGroup>
              <Label>Observações</Label>
              <TextArea
                placeholder="Observações adicionais..."
                {...register('observacoes')}
              />
            </FullWidthGroup>
          </FormGrid>

          <FormActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/produtos')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              <FiSave size={16} />
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </Button>
          </FormActions>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default ProductForm;