import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Button, FormGroup, Label, ErrorMessage } from '../../styles/components';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 8px;
  font-size: 2rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 32px;
  font-size: 1rem;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 16px;
`;

const ForgotPassword = styled.a`
  display: block;
  text-align: center;
  color: #007bff;
  font-size: 14px;
  margin-top: 16px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface LoginForm {
  email: string;
  senha: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.senha);
      toast.success('Login realizado com sucesso!');
      // O redirecionamento será feito pelo useEffect acima
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>Gestor de Caixa MK</Logo>
        <Subtitle>Sistema de Gestão para Pet Shop</Subtitle>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label>Email</Label>
            <InputContainer>
              <InputIcon>
                <FiUser size={20} />
              </InputIcon>
              <Input
                type="email"
                placeholder="Digite seu email"
                className={errors.email ? 'error' : ''}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
              />
            </InputContainer>
            {errors.email && (
              <ErrorMessage>{errors.email.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Senha</Label>
            <InputContainer>
              <InputIcon>
                <FiLock size={20} />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                className={errors.senha ? 'error' : ''}
                {...register('senha', {
                  required: 'Senha é obrigatória',
                  minLength: {
                    value: 6,
                    message: 'Senha deve ter pelo menos 6 caracteres'
                  }
                })}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </PasswordToggle>
            </InputContainer>
            {errors.senha && (
              <ErrorMessage>{errors.senha.message}</ErrorMessage>
            )}
          </FormGroup>

          <LoginButton
            type="submit"
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </LoginButton>
        </form>

        <ForgotPassword href="#forgot">
          Esqueceu sua senha?
        </ForgotPassword>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;