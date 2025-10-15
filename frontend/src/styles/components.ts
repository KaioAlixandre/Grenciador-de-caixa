import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  color: #181a1b;
`;

export const Card = styled.div`
  background: #fff;
  color: #181a1b;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  margin-bottom: 24px;
`;

export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
}>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 32px';
      default: return '12px 24px';
    }
  }};
  border: ${props => props.variant === 'outline' ? '2px solid #007bff' : 'none'};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  background: ${props => {
    switch (props.variant) {
      case 'secondary': return '#f8f9fa';
      case 'danger': return '#dc3545';
      case 'outline': return 'transparent';
      default: return '#007bff';
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'secondary': return '#333';
      case 'outline': return '#007bff';
      default: return 'white';
    }
  }};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    
    background: ${props => {
      switch (props.variant) {
        case 'secondary': return '#e9ecef';
        case 'danger': return '#c82333';
        case 'outline': return '#007bff';
        default: return '#0056b3';
      }
    }};
    
    color: ${props => {
      switch (props.variant) {
        case 'outline': return 'white';
        default: return props.variant === 'secondary' ? '#333' : 'white';
      }
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  &:invalid {
    border-color: #dc3545;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

export const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  display: block;
`;

export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap || '20px'};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FlexContainer = styled.div<{
  justify?: string;
  align?: string;
  direction?: string;
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  flex-direction: ${props => props.direction || 'row'};
  gap: ${props => props.gap || '0'};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

export const TableHeader = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #dee2e6;
`;

export const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
`;

export const TableRow = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

export const Badge = styled.span<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  background: ${props => {
    switch (props.variant) {
      case 'success': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'danger': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#e9ecef';
    }
  }};
  
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#155724';
      case 'warning': return '#856404';
      case 'danger': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#333';
    }
  }};
`;

export const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

export const PageSubtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 16px;
`;