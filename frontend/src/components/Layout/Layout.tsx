import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  margin-top: 64px;
  padding: 24px;
  min-height: calc(100vh - 64px);
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <MainContent>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;