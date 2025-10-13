# Gestor de Caixa MK - Sistema Completo

Sistema completo de gestão para Pet Shop desenvolvido com React + TypeScript no frontend e Node.js + Express + Prisma no backend.

## 🎯 **Funcionalidades Implementadas**

### ✅ **Sistema de Autenticação**
- Login seguro com JWT
- Proteção de rotas
- Persistência de sessão
- Redirecionamento automático

### ✅ **Dashboard Inteligente**
- Métricas em tempo real (vendas do dia, mês, estoque, clientes)
- Alertas de estoque baixo
- Interface responsiva
- Cards informativos

### ✅ **Gestão de Produtos**
- **Listagem completa** com filtros avançados
- **Busca** por nome ou código de barras
- **Filtros** por categoria e status de estoque
- **Formulário completo** para criar/editar produtos
- **Validações** de dados
- **Cálculo automático** de margem de lucro
- **Controle de estoque** com alertas visuais
- **Suporte** a produtos por peso ou unidade

### ✅ **Sistema de Vendas (PDV)**
- **Interface de ponto de venda** completa
- **Busca de produtos** em tempo real
- **Carrinho de compras** interativo
- **Controle de quantidade** com validação de estoque
- **Seleção de cliente** (opcional)
- **Múltiplas formas de pagamento** (Dinheiro, Cartão, PIX, A Prazo)
- **Cálculo automático** de totais
- **Finalização de venda** com atualização de estoque

### ✅ **Backend Robusto**
- **API REST** completa
- **Autenticação JWT**
- **Banco de dados MySQL** com Prisma ORM
- **Validações** de dados
- **Tratamento de erros**
- **Endpoints otimizados** para dashboard e vendas

## 🏗️ **Arquitetura**

### **Frontend (React + TypeScript)**
```
frontend/src/
├── components/Layout/    # Header, Sidebar, Layout principal
├── contexts/            # AuthContext para autenticação
├── pages/              # Páginas da aplicação
│   ├── Login/          # Tela de login
│   ├── Dashboard/      # Dashboard principal
│   ├── Products/       # Gestão de produtos
│   └── Sales/          # Sistema de vendas (PDV)
├── services/           # Integração com API (Axios)
├── styles/             # Styled Components globais
├── types/              # Tipos TypeScript
└── utils/              # Utilitários (formatadores)
```

### **Backend (Node.js + Express + Prisma)**
```
backend/
├── controllers/        # Lógica de negócio
├── routes/            # Rotas da API
├── middleware/        # Autenticação e tratamento de erros
├── prisma/           # Schema e migrations
├── utils/            # Utilitários e helpers
└── config/           # Configurações do banco
```

## 🚀 **Como Executar**

### **Pré-requisitos**
- Node.js 18+
- MySQL
- npm ou yarn

### **Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm start
```

### **Frontend**
```bash
cd frontend
npm install
PORT=3001 npm start
```

### **Credenciais de Teste**
- **Email:** admin@petshop.com
- **Senha:** admin123

## 🎨 **Design System**

### **Componentes Reutilizáveis**
- **Button** - 4 variantes (primary, secondary, danger, outline)
- **Input** - Campos de entrada padronizados
- **Card** - Containers com shadow e bordas arredondadas
- **FormGroup** - Agrupamento de elementos de formulário

### **Paleta de Cores**
- **Primary:** #007bff (Azul)
- **Success:** #28a745 (Verde)
- **Warning:** #ffc107 (Amarelo)
- **Danger:** #dc3545 (Vermelho)
- **Secondary:** #6c757d (Cinza)

### **Tipografia**
- **Fonte:** System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Hierarquia:** h1 (2rem), h2 (1.5rem), h3 (1.25rem)

## 📱 **Funcionalidades por Página**

### **Dashboard (/dashboard)**
- Cards com métricas principais
- Alertas de estoque baixo
- Links rápidos para outras seções

### **Produtos (/produtos)**
- Listagem em grid responsivo
- Filtros por categoria e estoque
- Busca em tempo real
- Ações de editar/excluir

### **Novo Produto (/produtos/novo)**
- Formulário completo com validações
- Cálculo automático de margem
- Upload de imagens (preparado)
- Configurações avançadas

### **PDV (/vendas/nova)**
- Interface de duas colunas
- Busca de produtos
- Carrinho interativo
- Seleção de cliente
- Finalização de venda

## 🔧 **Tecnologias Utilizadas**

### **Frontend**
- React 19
- TypeScript
- Styled Components
- React Router Dom
- React Hook Form
- React Icons
- React Toastify
- Axios

### **Backend**
- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT
- bcryptjs
- CORS
- Helmet

## 📊 **Próximas Funcionalidades**

### **Em Desenvolvimento**
- [ ] Gestão de clientes
- [ ] Relatórios e analytics
- [ ] Gestão de fornecedores
- [ ] Controle de estoque avançado
- [ ] Histórico de vendas
- [ ] Backup e restauração

### **Futuras Melhorias**
- [ ] PWA (Progressive Web App)
- [ ] Impressão de cupons
- [ ] Integração com TEF
- [ ] Sistema de comissões
- [ ] Múltiplas lojas
- [ ] API mobile

## 🎉 **Status do Projeto**

**✅ FUNCIONAL E PRONTO PARA USO!**

O sistema está completo nas funcionalidades principais:
- ✅ Autenticação segura
- ✅ Dashboard informativo
- ✅ Gestão completa de produtos
- ✅ Sistema de vendas (PDV) funcional
- ✅ Integração backend/frontend
- ✅ Design responsivo

**Ideal para:** Pet shops, lojas de ração, pequenos comércios que precisam de um sistema simples e eficiente de gestão.