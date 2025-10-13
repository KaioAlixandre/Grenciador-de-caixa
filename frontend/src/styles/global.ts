import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
    color: #333;
    line-height: 1.6;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }

  .mb-1 { margin-bottom: 0.25rem; }
  .mb-2 { margin-bottom: 0.5rem; }
  .mb-3 { margin-bottom: 1rem; }
  .mb-4 { margin-bottom: 1.5rem; }
  .mb-5 { margin-bottom: 3rem; }

  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-3 { margin-top: 1rem; }
  .mt-4 { margin-top: 1.5rem; }
  .mt-5 { margin-top: 3rem; }

  .p-1 { padding: 0.25rem; }
  .p-2 { padding: 0.5rem; }
  .p-3 { padding: 1rem; }
  .p-4 { padding: 1.5rem; }
  .p-5 { padding: 3rem; }

  .d-flex {
    display: flex;
  }

  .justify-content-between {
    justify-content: space-between;
  }

  .justify-content-center {
    justify-content: center;
  }

  .align-items-center {
    align-items: center;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .w-100 {
    width: 100%;
  }

  .h-100 {
    height: 100%;
  }

  .text-success {
    color: #28a745;
  }

  .text-danger {
    color: #dc3545;
  }

  .text-warning {
    color: #ffc107;
  }

  .text-info {
    color: #17a2b8;
  }

  .text-muted {
    color: #6c757d;
  }

  .font-weight-bold {
    font-weight: bold;
  }

  .font-weight-normal {
    font-weight: normal;
  }

  .small {
    font-size: 0.875rem;
  }

  .large {
    font-size: 1.125rem;
  }

  @media (max-width: 768px) {
    .container {
      padding: 0 15px;
    }
  }

  // Toast customization
  .Toastify__toast-container {
    z-index: 9999;
  }

  .Toastify__toast {
    border-radius: 8px;
  }
`;

export const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '3rem',
  },
  borderRadius: {
    small: '4px',
    medium: '6px',
    large: '8px',
    round: '50%',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12)',
    medium: '0 2px 4px rgba(0, 0, 0, 0.1)',
    large: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
};