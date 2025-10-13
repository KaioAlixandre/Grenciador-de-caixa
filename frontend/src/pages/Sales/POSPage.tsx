import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiSearch, 
  FiPlus, 
  FiMinus, 
  FiTrash2, 
  FiShoppingCart,
  FiUser,
  FiCreditCard,
  FiDollarSign,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Product, Customer } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Button, Card, Input } from '../../styles/components';

const POSContainer = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  height: calc(100vh - 120px);
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageTitle = styled.h1`
  color: #333;
  font-size: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
`;

const SearchCard = styled(Card)`
  padding: 20px;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  font-size: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
`;

const ProductCard = styled(Card)`
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ProductName = styled.h4`
  color: #333;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
`;

const ProductPrice = styled.div`
  color: #007bff;
  font-weight: 600;
  font-size: 16px;
`;

const ProductStock = styled.div`
  color: #666;
  font-size: 12px;
  margin-top: 4px;
`;

const CartCard = styled(Card)`
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CartTitle = styled.h3`
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CartItems = styled.div`
  flex: 1;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const CartItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const ItemPrice = styled.div`
  color: #666;
  font-size: 12px;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #f8f9fa;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #e9ecef;
    color: #333;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
`;

const RemoveButton = styled.button`
  padding: 4px;
  border: none;
  border-radius: 4px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

const CartSummary = styled.div`
  border-top: 2px solid #e9ecef;
  padding-top: 16px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &.total {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    border-top: 1px solid #e9ecef;
    padding-top: 8px;
    margin-top: 8px;
  }
`;

const CustomerCard = styled(Card)`
  padding: 20px;
`;

const CustomerTitle = styled.h3`
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CustomerSelect = styled.select`
  width: 100%;
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

const PaymentCard = styled(Card)`
  padding: 20px;
`;

const PaymentTitle = styled.h3`
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const PaymentButton = styled.button<{ active?: boolean }>`
  padding: 12px;
  border: 2px solid ${props => props.active ? '#007bff' : '#e9ecef'};
  border-radius: 8px;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    border-color: #007bff;
  }
`;

const CheckoutButton = styled(Button)`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

const POSPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsResponse, customersResponse] = await Promise.all([
        api.get('/produtos?ativo=true'),
        api.get('/clientes?ativo=true')
      ]);
      
      setProducts(productsResponse.data.data || []);
      setCustomers(customersResponse.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const addToCart = (product: Product) => {
    if (product.estoque_atual <= 0) {
      toast.warning('Produto sem estoque');
      return;
    }

    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        subtotal: product.preco_venda
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.estoque_atual) {
      toast.warning('Quantidade maior que estoque disponível');
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.preco_venda }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.warning('Carrinho está vazio');
      return;
    }

    // Validação obrigatória do cliente para pagamento "A prazo"
    if (paymentMethod === 'prazo' && !selectedCustomer) {
      toast.error('Selecione um cliente para vendas a prazo!');
      return;
    }

    try {
      setLoading(true);
      const saleData = {
        cliente_id: selectedCustomer || null,
        tipo_pagamento: paymentMethod.toUpperCase(),
        valor_desconto: 0,
        observacoes: '',
        itens: cart.map(item => ({
          produto_id: item.product.id,
          quantidade: item.quantity,
          preco_unitario: item.product.preco_venda,
          subtotal: item.subtotal
        }))
      };

      await api.post('/vendas', saleData);

      toast.success('Venda realizada com sucesso!');
      setCart([]);
      setSelectedCustomer('');
      setPaymentMethod('dinheiro');

      // Recarregar produtos para atualizar estoque
      loadData();
    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);
      toast.error(error.response?.data?.error || 'Erro ao finalizar venda');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <POSContainer>
      <LeftPanel>
        <PageTitle>
          <FiShoppingCart size={28} />
          Ponto de Venda
        </PageTitle>

        <SearchCard>
          <SearchContainer>
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar produtos por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </SearchCard>

        <ProductsGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} onClick={() => addToCart(product)}>
              <ProductName>{product.nome}</ProductName>
              <ProductPrice>{formatCurrency(product.preco_venda)}</ProductPrice>
              <ProductStock>
                Estoque: {product.estoque_atual} {product.unidade_medida}
              </ProductStock>
            </ProductCard>
          ))}
        </ProductsGrid>
      </LeftPanel>

      <RightPanel>
        <CartCard>
          <CartTitle>
            <FiShoppingCart size={20} />
            Carrinho ({getCartItemsCount()} itens)
          </CartTitle>

          <CartItems>
            {cart.length === 0 ? (
              <EmptyCart>
                <div>Carrinho vazio</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>
                  Clique nos produtos para adicionar
                </div>
              </EmptyCart>
            ) : (
              cart.map(item => (
                <CartItem key={item.product.id}>
                  <ItemInfo>
                    <ItemName>{item.product.nome}</ItemName>
                    <ItemPrice>{formatCurrency(item.product.preco_venda)}</ItemPrice>
                  </ItemInfo>
                  
                  <QuantityControls>
                    <QuantityButton 
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <FiMinus size={12} />
                    </QuantityButton>
                    
                    <QuantityInput
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    />
                    
                    <QuantityButton 
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <FiPlus size={12} />
                    </QuantityButton>
                  </QuantityControls>

                  <div style={{ fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>
                    {formatCurrency(item.subtotal)}
                  </div>

                  <RemoveButton onClick={() => removeFromCart(item.product.id)}>
                    <FiTrash2 size={12} />
                  </RemoveButton>
                </CartItem>
              ))
            )}
          </CartItems>

          <CartSummary>
            <SummaryRow>
              <span>Subtotal:</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </SummaryRow>
            <SummaryRow className="total">
              <span>Total:</span>
              <span>{formatCurrency(getCartTotal())}</span>
            </SummaryRow>
          </CartSummary>
        </CartCard>

        <CustomerCard>
          <CustomerTitle>
            <FiUser size={20} />
            Cliente (Opcional)
          </CustomerTitle>
          <CustomerSelect
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">Cliente não identificado</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.nome} - {customer.email}
              </option>
            ))}
          </CustomerSelect>
        </CustomerCard>

        <PaymentCard>
          <PaymentTitle>
            <FiCreditCard size={20} />
            Forma de Pagamento
          </PaymentTitle>
          
          <PaymentMethods>
            <PaymentButton
              active={paymentMethod === 'dinheiro'}
              onClick={() => setPaymentMethod('dinheiro')}
            >
              <FiDollarSign size={16} />
              Dinheiro
            </PaymentButton>
            <PaymentButton
              active={paymentMethod === 'cartao'}
              onClick={() => setPaymentMethod('cartao')}
            >
              <FiCreditCard size={16} />
              Cartão
            </PaymentButton>
            <PaymentButton
              active={paymentMethod === 'pix'}
              onClick={() => setPaymentMethod('pix')}
            >
              PIX
            </PaymentButton>
            <PaymentButton
              active={paymentMethod === 'prazo'}
              onClick={() => setPaymentMethod('prazo')}
            >
              A Prazo
            </PaymentButton>
          </PaymentMethods>

          <CheckoutButton
            variant="primary"
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
          >
            <FiCheck size={16} />
            {loading ? 'Finalizando...' : `Finalizar Venda - ${formatCurrency(getCartTotal())}`}
          </CheckoutButton>
        </PaymentCard>
      </RightPanel>
    </POSContainer>
  );
};

export default POSPage;