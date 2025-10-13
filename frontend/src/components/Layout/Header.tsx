import React from 'react';
import styled from 'styled-components';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: white;
  height: 64px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const Logo = styled.h1`
  color: #007bff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <MenuButton onClick={onToggleSidebar}>
          <FiMenu size={20} />
        </MenuButton>
        <Logo>Gestor de Caixa MK</Logo>
      </div>
      
      <UserMenu>
        <UserInfo>
          <FiUser size={16} />
          <span>{user?.nome}</span>
        </UserInfo>
        <LogoutButton onClick={logout}>
          <FiLogOut size={16} />
          <span>Sair</span>
        </LogoutButton>
      </UserMenu>
    </HeaderContainer>
  );
};

export default Header;