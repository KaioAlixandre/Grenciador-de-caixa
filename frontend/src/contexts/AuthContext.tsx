import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse } from '../types';
import api from '../services/api';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<void> => {
    try {
      console.log('🔄 Iniciando login...', { email });
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        senha,
      });

      const { token, data: userData } = response.data;
      console.log('✅ Login bem-sucedido!', { token: !!token, user: userData?.nome });

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log('✅ Estado atualizado, usuário logado:', userData?.nome);
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw new Error(
        error.response?.data?.error || 'Erro ao fazer login'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextData = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  console.log('🔍 AuthContext estado:', { 
    user: user?.nome || 'null', 
    isAuthenticated: !!user, 
    loading 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};