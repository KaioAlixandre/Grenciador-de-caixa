import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GlobalStyles from './styles/GlobalStyles';
import Layout from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage, ProductForm } from './pages/Products';
import { POSPage } from './pages/Sales';
import ClientsPage from './pages/Clients/ClientsPage';
import ClientForm from './pages/Clients/ClientForm';
import ClientAccount from './pages/Clients/ClientAccount';

// Componente para proteger rotas que precisam de autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Componente para redirecionar usuários logados da página de login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rota pública - Login */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Produtos */}
      <Route 
        path="/produtos" 
        element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/produtos/novo" 
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/produtos/:id/editar" 
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        } 
      />
      
      {/* Vendas */}
      <Route 
        path="/vendas/nova" 
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/pos" 
        element={
          <ProtectedRoute>
            <POSPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Clientes */}
      <Route 
        path="/clientes" 
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clientes/novo" 
        element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clientes/:id" 
        element={
          <ProtectedRoute>
            <ClientForm />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clientes/:id/conta" 
        element={
          <ProtectedRoute>
            <ClientAccount />
          </ProtectedRoute>
        } 
      />
      
      {/* Rota padrão - redireciona para dashboard se logado, senão para login */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Rota para páginas não encontradas */}
      <Route 
        path="*" 
        element={<Navigate to="/dashboard" replace />} 
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyles />
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
