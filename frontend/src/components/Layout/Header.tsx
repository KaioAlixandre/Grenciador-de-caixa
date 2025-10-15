import React from 'react';
// ...existing code...
import styled from 'styled-components';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: #111;
  height: 70px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const Logo = styled.h1`
  color: #FF5C00;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 2px;
  text-shadow: 1px 1px 0 #222, 2px 2px 0 #222;
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #FF5C00;
  font-weight: 500;
`;

const LogoutButton = styled.button`
  background: #FF5C00;
  border: none;
  color: #111;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #ff9800;
    color: #fff;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #FF5C00;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  transition: background 0.2s;

  &:hover {
    background: #222;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;
const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FF5C00;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

interface HeaderProps {
  onToggleSidebar: () => void;
}

// ...existing code...

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
// ...existing code...

  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <MenuButton onClick={onToggleSidebar}>
          <FiMenu size={24} />
        </MenuButton>
        <Logo>Gestor de Caixa MK</Logo>
      </div>

      <UserMenu>
        <UserInfo>
          <Avatar>{user?.nome ? user.nome[0].toUpperCase() : <FiUser size={18} />}</Avatar>
          <span>{user?.nome}</span>
        </UserInfo>
        <LogoutButton onClick={logout}>
          <FiLogOut size={18} />
          <span>Sair</span>
        </LogoutButton>
      </UserMenu>
    </HeaderContainer>
  );
};

export default Header;