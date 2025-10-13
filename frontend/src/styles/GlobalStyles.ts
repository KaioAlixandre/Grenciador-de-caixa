import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8f9fa;
    color: #333;
  }

  #root {
    height: 100%;
  }

  button {
    cursor: pointer;
    border: none;
    background: transparent;
    font-family: inherit;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  /* Scrollbar personalizada */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* Toast customization */
  .Toastify__toast {
    border-radius: 8px;
  }

  .Toastify__toast--success {
    background: #28a745;
  }

  .Toastify__toast--error {
    background: #dc3545;
  }

  .Toastify__toast--warning {
    background: #ffc107;
    color: #212529;
  }

  .Toastify__toast--info {
    background: #17a2b8;
  }
`;

export default GlobalStyles;