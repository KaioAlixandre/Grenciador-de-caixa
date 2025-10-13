import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiFilter,
  FiPackage,
  FiAlertTriangle 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button, Card, Input } from '../../styles/components';

const ProductsContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FiltersCard = styled(Card)`
  padding: 20px;
  margin-bottom: 24px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const ProductCard = styled(Card)`
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ProductName = styled.h3`
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    color: #333;
  }
  
  &.edit:hover {
    background: #007bff;
    color: white;
  }
  
  &.delete:hover {
    background: #dc3545;
    color: white;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: #666;
`;

const InfoValue = styled.span`
  color: #333;
  font-weight: 500;
`;

const StockBadge = styled.span<{ status: 'low' | 'ok' | 'out' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.status) {
      case 'low':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'out':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      default:
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 16px;
`;

interface ProductsPageProps {}

const ProductsPage: React.FC<ProductsPageProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando produtos e categorias...');
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/produtos'),
        api.get('/categories')
      ]);
      
      console.log('📦 Products Response:', productsResponse);
      console.log('📦 Products Data:', productsResponse.data);
      console.log('🏷️ Categories Response:', categoriesResponse);
      console.log('🏷️ Categories Data:', categoriesResponse.data);
      
      const productsData = productsResponse.data.data || productsResponse.data || [];
      const categoriesData = categoriesResponse.data.data || categoriesResponse.data || [];
      
      console.log('📦 Produtos processados:', productsData);
      console.log('🏷️ Categorias processadas:', categoriesData);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      console.error('❌ Status do erro:', error.response?.status);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await api.delete(`/produtos/${id}`);
      toast.success('Produto excluído com sucesso!');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (current === 0) return 'out';
    if (current <= minimum) return 'low';
    return 'ok';
  };

  const getStockLabel = (status: string) => {
    switch (status) {
      case 'out': return 'Sem estoque';
      case 'low': return 'Estoque baixo';
      default: return 'Em estoque';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.categoria_id === selectedCategory;
    
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.estoque_atual <= product.estoque_minimo) ||
                        (stockFilter === 'out' && product.estoque_atual === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockFilter('all');
  };

  if (loading) {
    return (
      <ProductsContainer>
        <LoadingMessage>Carregando produtos...</LoadingMessage>
      </ProductsContainer>
    );
  }

  return (
    <ProductsContainer>
      <PageHeader>
        <PageTitle>
          <FiPackage size={28} />
          Produtos
        </PageTitle>
        <HeaderActions>
          <Link to="/produtos/novo">
            <Button variant="primary">
              <FiPlus size={16} />
              Novo Produto
            </Button>
          </Link>
        </HeaderActions>
      </PageHeader>

      <FiltersCard>
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Buscar produto</FilterLabel>
            <SearchContainer>
              <SearchIcon>
                <FiSearch size={16} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Nome ou código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Categoria</FilterLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status do estoque</FilterLabel>
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">Todos os produtos</option>
              <option value="low">Estoque baixo</option>
              <option value="out">Sem estoque</option>
            </Select>
          </FilterGroup>
        </FiltersGrid>

        <FilterButtons>
          <Button variant="outline" onClick={clearFilters}>
            Limpar filtros
          </Button>
          <Button variant="outline">
            <FiFilter size={16} />
            Filtros avançados
          </Button>
        </FilterButtons>
      </FiltersCard>

      {filteredProducts.length === 0 ? (
        <EmptyMessage>
          <EmptyIcon>
            <FiPackage />
          </EmptyIcon>
          <h3>Nenhum produto encontrado</h3>
          <p>Tente ajustar os filtros ou adicione um novo produto.</p>
        </EmptyMessage>
      ) : (
        <ProductsGrid>
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.estoque_atual, product.estoque_minimo);
            
            return (
              <ProductCard key={product.id}>
                <ProductHeader>
                  <ProductName>{product.nome}</ProductName>
                  <ProductActions>
                    <Link to={`/produtos/${product.id}/editar`}>
                      <ActionButton className="edit">
                        <FiEdit2 size={14} />
                      </ActionButton>
                    </Link>
                    <ActionButton 
                      className="delete"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <FiTrash2 size={14} />
                    </ActionButton>
                  </ProductActions>
                </ProductHeader>

                <ProductInfo>
                  {product.codigo_barras && (
                    <InfoRow>
                      <InfoLabel>Código:</InfoLabel>
                      <InfoValue>{product.codigo_barras}</InfoValue>
                    </InfoRow>
                  )}
                  
                  <InfoRow>
                    <InfoLabel>Preço de venda:</InfoLabel>
                    <InfoValue>{formatCurrency(product.preco_venda)}</InfoValue>
                  </InfoRow>
                  
                  <InfoRow>
                    <InfoLabel>Estoque atual:</InfoLabel>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <InfoValue>
                        {product.estoque_atual} {product.unidade_medida}
                      </InfoValue>
                      {stockStatus !== 'ok' && (
                        <FiAlertTriangle size={14} color="#f39c12" />
                      )}
                    </div>
                  </InfoRow>
                  
                  <InfoRow>
                    <InfoLabel>Status:</InfoLabel>
                    <StockBadge status={stockStatus}>
                      {getStockLabel(stockStatus)}
                    </StockBadge>
                  </InfoRow>
                </ProductInfo>
              </ProductCard>
            );
          })}
        </ProductsGrid>
      )}
    </ProductsContainer>
  );
};

export default ProductsPage;