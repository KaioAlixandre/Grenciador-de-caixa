import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTruck,
  FiBarChart,
  FiBox,
  FiDollarSign,
  FiTag,
} from 'react-icons/fi';

const SidebarContainer = styled.nav<{ isOpen: boolean }>`
  background: white;
  width: 280px;
  height: calc(100vh - 64px);
  position: fixed;
  top: 64px;
  left: 0;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  z-index: 999;
  overflow-y: auto;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  }
`;

const SidebarContent = styled.div`
  padding: 24px 0;
`;

const SidebarSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: #666;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 24px 8px;
  margin: 0;
`;

const SidebarItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-right: 3px solid transparent;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }

  &.active {
    background: #e3f2fd;
    color: #007bff;
    border-right-color: #007bff;
    font-weight: 500;
  }

  svg {
    flex-shrink: 0;
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarContent>
          <SidebarSection>
            <SidebarItem to="/dashboard" onClick={onClose}>
              <FiHome size={20} />
              Dashboard
            </SidebarItem>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Vendas</SectionTitle>
            <SidebarItem to="/vendas/nova" onClick={onClose}>
              <FiDollarSign size={20} />
              Nova Venda
            </SidebarItem>
            <SidebarItem to="/vendas" onClick={onClose}>
              <FiShoppingCart size={20} />
              Histórico de Vendas
            </SidebarItem>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Produtos</SectionTitle>
            <SidebarItem to="/produtos" onClick={onClose}>
              <FiPackage size={20} />
              Produtos
            </SidebarItem>
            <SidebarItem to="/categorias" onClick={onClose}>
              <FiTag size={20} />
              Categorias
            </SidebarItem>
            <SidebarItem to="/estoque" onClick={onClose}>
              <FiBox size={20} />
              Controle de Estoque
            </SidebarItem>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Pessoas</SectionTitle>
            <SidebarItem to="/clientes" onClick={onClose}>
              <FiUsers size={20} />
              Clientes
            </SidebarItem>
            <SidebarItem to="/fornecedores" onClick={onClose}>
              <FiTruck size={20} />
              Fornecedores
            </SidebarItem>
          </SidebarSection>

          <SidebarSection>
            <SectionTitle>Relatórios</SectionTitle>
            <SidebarItem to="/relatorios" onClick={onClose}>
              <FiBarChart size={20} />
              Relatórios
            </SidebarItem>
          </SidebarSection>
        </SidebarContent>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;