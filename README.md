# 🏪 Gestor de Caixa MK - Sistema de Gestão para Pet Shop

Sistema completo de gestão para loja de rações e produtos pet, desenvolvido com Node.js, Express.js, Prisma ORM e MySQL.

## 📋 Funcionalidades

### 🔐 Autenticação e Usuários
- Login seguro com JWT
- Controle de acesso baseado em papéis (Admin/User)
- Hash de senhas com bcryptjs
- Middleware de autenticação

### 📦 Gestão de Produtos
- Cadastro completo de produtos
- Controle de estoque automático
- Categorização de produtos
- Código de barras único
- Produtos por peso ou unidade
- Margem de lucro automática
- Estoque mínimo com alertas

### 🛒 Sistema de Vendas
- Vendas com múltiplos itens
- Cálculo automático de totais
- Suporte a descontos
- Métodos de pagamento variados
- Atualização automática de estoque
- Cancelamento de vendas com estorno

### 👥 Gestão de Clientes
- Cadastro completo de clientes
- Controle de limite de crédito
- Histórico de compras
- Saldo devedor
- Relatórios de clientes

### 🏢 Gestão de Fornecedores
- Cadastro de fornecedores
- Histórico de compras
- Produtos por fornecedor
- Relatórios de performance

### 📊 Sistema de Compras
- Compras com múltiplos itens
- Confirmação e atualização de estoque
- Controle de notas fiscais
- Relatórios de compras

### 📈 Controle de Estoque
- Movimentações de entrada/saída
- Histórico detalhado
- Inventário completo
- Alertas de baixo estoque
- Relatórios de movimentação

### 📊 Relatórios e Dashboard
- Vendas por período
- Produtos mais vendidos
- Margem de lucro
- Estoque atual
- Performance de fornecedores
- Análise de clientes

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **ORM**: Prisma
- **Banco de Dados**: MySQL
- **Autenticação**: JWT + bcryptjs
- **Validação**: express-validator
- **Segurança**: helmet, cors
- **Logs**: morgan

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── database.js         # Configuração do Prisma
├── controllers/
│   ├── authController.js   # Autenticação
│   ├── categoryController.js # Categorias
│   ├── clienteController.js # Clientes
│   ├── compraController.js # Compras
│   ├── estoqueController.js # Estoque
│   ├── fornecedorController.js # Fornecedores
│   ├── produtoController.js # Produtos
│   ├── transactionController.js # Transações
│   └── vendaController.js  # Vendas
├── middleware/
│   ├── auth.js            # Autenticação JWT
│   ├── errorHandler.js    # Tratamento de erros
│   └── notFound.js        # 404 handler
├── models/
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.js           # Dados iniciais
├── routes/
│   ├── auth.js           # Rotas de autenticação
│   ├── categories.js     # Rotas de categorias
│   ├── clientes.js       # Rotas de clientes
│   ├── compras.js        # Rotas de compras
│   ├── estoque.js        # Rotas de estoque
│   ├── fornecedores.js   # Rotas de fornecedores
│   ├── produtos.js       # Rotas de produtos
│   ├── transactions.js   # Rotas de transações
│   └── vendas.js         # Rotas de vendas
├── .env                  # Variáveis de ambiente
├── package.json          # Dependências
└── server.js            # Arquivo principal
```

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos
- Node.js (v16 ou superior)
- MySQL (v8 ou superior)
- npm ou yarn

### 2. Instalação

```bash
# Clone o repositório
git clone [url-do-repositório]

# Entre na pasta do backend
cd backend

# Instale as dependências
npm install
```

### 3. Configuração do Banco de Dados

1. Crie um banco MySQL chamado `gestor_caixa`
2. Configure as credenciais no arquivo `.env`:

```env
# Database
DATABASE_URL="mysql://usuario:senha@localhost:3306/gestor_caixa"

# JWT
JWT_SECRET="seu_jwt_secret_aqui"
JWT_EXPIRE="30d"

# Servidor
NODE_ENV="development"
PORT=3000

# CORS
CORS_ORIGIN="http://localhost:3000"
```

### 4. Executar Migrações

```bash
# Aplicar schema no banco
npx prisma db push

# Gerar cliente Prisma
npx prisma generate
```

### 5. Popular Banco com Dados de Exemplo

```bash
npm run seed
```

### 6. Iniciar o Servidor

```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Produtos
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `GET /api/produtos/:id` - Obter produto
- `PUT /api/produtos/:id` - Atualizar produto
- `POST /api/produtos/:id/ajustar-estoque` - Ajustar estoque

### Vendas
- `GET /api/vendas` - Listar vendas
- `POST /api/vendas` - Criar venda
- `GET /api/vendas/:id` - Obter venda
- `POST /api/vendas/:id/cancelar` - Cancelar venda
- `GET /api/vendas/relatorio` - Relatório de vendas

### Clientes
- `GET /api/clientes` - Listar clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes/:id` - Obter cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `POST /api/clientes/:id/ajustar-saldo` - Ajustar saldo devedor
- `GET /api/clientes/relatorio` - Relatório de clientes

### Fornecedores
- `GET /api/fornecedores` - Listar fornecedores
- `POST /api/fornecedores` - Criar fornecedor
- `GET /api/fornecedores/:id` - Obter fornecedor
- `PUT /api/fornecedores/:id` - Atualizar fornecedor
- `GET /api/fornecedores/:id/produtos` - Produtos do fornecedor
- `GET /api/fornecedores/relatorio` - Relatório de fornecedores

### Compras
- `GET /api/compras` - Listar compras
- `POST /api/compras` - Criar compra
- `GET /api/compras/:id` - Obter compra
- `POST /api/compras/:id/confirmar` - Confirmar compra
- `POST /api/compras/:id/cancelar` - Cancelar compra
- `GET /api/compras/relatorio` - Relatório de compras

### Estoque
- `GET /api/estoque/movimentacoes` - Listar movimentações
- `POST /api/estoque/movimentacoes` - Criar movimentação
- `GET /api/estoque/movimentacoes/:id` - Obter movimentação
- `GET /api/estoque/relatorio` - Relatório de estoque
- `GET /api/estoque/inventario` - Inventário

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/categories/:id` - Obter categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

## 🔍 Dados de Exemplo

Após executar o seed, você terá:

### Usuário Admin
- **Email**: admin@petshop.com
- **Senha**: admin123

### Produtos de Exemplo
- Ração Premium Cães Adultos 15kg
- Ração Premium Filhotes 3kg
- Ração Gatos Adultos 10kg
- Petisco Natural Cães 500g
- Coleira Nylon Média

### Categorias
- Ração para Cães
- Ração para Gatos
- Petiscos
- Acessórios

### Fornecedores
- PetFood Distribuidor
- Acessórios Pet Ltda

### Clientes
- José Silva
- Maria Oliveira

## 🛠️ Scripts Disponíveis

```bash
npm start          # Iniciar servidor em produção
npm run dev        # Iniciar servidor em desenvolvimento
npm run seed       # Popular banco com dados de exemplo
npm test           # Executar testes
```

## 🚦 Status do Projeto

✅ **Concluído**
- Sistema de autenticação
- CRUD completo de produtos
- Sistema de vendas
- Gestão de clientes
- Gestão de fornecedores
- Sistema de compras
- Controle de estoque
- Relatórios básicos
- API RESTful completa

## 📝 Próximas Funcionalidades

- [ ] Dashboard com gráficos
- [ ] Backup automático
- [ ] Integração com código de barras
- [ ] Sistema de comissões
- [ ] Relatórios avançados
- [ ] Exportação para Excel/PDF
- [ ] Sistema de caixa (abertura/fechamento)
- [ ] Integração com NFe

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através do email: [seu-email@exemplo.com]

---

Desenvolvido com ❤️ para gestão eficiente de pet shops e lojas de ração.