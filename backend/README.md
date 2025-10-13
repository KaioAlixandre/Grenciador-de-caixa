# Gestor de Caixa - Backend

API REST para sistema de gestão de caixa pessoal desenvolvida em Node.js com Prisma ORM e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **MySQL** - Banco de dados relacional
- **JWT** - Autenticação por tokens
- **bcryptjs** - Criptografia de senhas

## 📁 Estrutura do Projeto

```
backend/
├── config/           # Configurações (banco de dados)
├── controllers/      # Controladores das rotas
├── middleware/       # Middlewares (autenticação, erro)
├── models/          # Serviços de acesso aos dados
├── routes/          # Definição das rotas
├── utils/           # Utilitários
├── prisma/          # Schema e migrações do Prisma
├── .env             # Variáveis de ambiente
├── server.js        # Arquivo principal
└── package.json     # Dependências
```

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

1. Instale o MySQL em sua máquina ou use o MySQL Workbench
2. Execute o script `setup-database.sql` no MySQL Workbench para criar o banco:
   ```sql
   CREATE DATABASE IF NOT EXISTS gestor_caixa 
   CHARACTER SET utf8mb4 
   COLLATE utf8mb4_unicode_ci;
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:

```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados MySQL
DATABASE_URL="mysql://root:sua_senha@localhost:3306/gestor_caixa"

# JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 3. Executar Migrações

```bash
# Gerar o Prisma Client
npx prisma generate

# Sincronizar schema com banco (criar tabelas)
npx prisma db push

# (Opcional) Visualizar dados no Prisma Studio
npx prisma studio
```

### 4. Iniciar o Servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📊 Modelos de Dados

### Usuario
- **id**: String (CUID)
- **nome**: String (máx. 50 chars)
- **email**: String (único)
- **senha**: String (criptografada)
- **papel**: Enum (USUARIO, ADMIN)
- **avatar**: String (opcional)
- **ativo**: Boolean
- **ultimo_login**: DateTime
- **criado_em**: DateTime
- **atualizado_em**: DateTime

### Categoria
- **id**: String (CUID)
- **nome**: String (máx. 30 chars)
- **descricao**: String (máx. 100 chars)
- **tipo**: Enum (RECEITA, DESPESA)
- **cor**: String (hex color)
- **icone**: String
- **ativa**: Boolean
- **usuario_id**: String (FK)
- **criado_em**: DateTime
- **atualizado_em**: DateTime

### Transacao
- **id**: String (CUID)
- **descricao**: String (máx. 100 chars)
- **valor**: Decimal
- **tipo**: Enum (RECEITA, DESPESA)
- **categoria_id**: String (FK)
- **data**: DateTime
- **metodo_pagamento**: Enum
- **observacoes**: String (máx. 200 chars)
- **tags**: String[]
- **comprovante**: String (URL)
- **recorrente**: Boolean
- **frequencia**: Enum (DIARIA, SEMANAL, MENSAL, ANUAL)
- **data_fim**: DateTime
- **proxima_data**: DateTime
- **usuario_id**: String (FK)
- **criado_em**: DateTime
- **atualizado_em**: DateTime

### Saldo
- **id**: String (CUID)
- **usuario_id**: String (FK, único)
- **saldo_atual**: Decimal
- **receita_total**: Decimal
- **despesa_total**: Decimal
- **receita_mensal**: Decimal
- **despesa_mensal**: Decimal
- **ultima_atualizacao**: DateTime
- **criado_em**: DateTime
- **atualizado_em**: DateTime

## 🛣️ Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter dados do usuário logado

### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `GET /api/categories/:id` - Obter categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Deletar categoria

### Transações
- `GET /api/transactions` - Listar transações (com filtros)
- `POST /api/transactions` - Criar transação
- `GET /api/transactions/:id` - Obter transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação

### Dashboard
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/dashboard/resumo` - Resumo financeiro

### Usuários (Admin)
- `GET /api/users` - Listar usuários (apenas admin)

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer <token>
```

## 🧪 Testando a API

### Usando o Script PowerShell
Execute o script de teste automático:
```bash
.\test-api.ps1
```

### Testando Manualmente

### Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "123456"
  }'
```

### Criar Categoria
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "nome": "Alimentação",
    "tipo": "DESPESA",
    "cor": "#ff6b6b",
    "icone": "fas fa-utensils"
  }'
```

### Criar Transação
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{
    "descricao": "Almoço no restaurante",
    "valor": 25.50,
    "tipo": "DESPESA",
    "categoria_id": "<id_da_categoria>",
    "metodo_pagamento": "CARTAO_DEBITO"
  }'
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em desenvolvimento
- `npm test` - Executa os testes

## 🔧 Comandos Prisma Úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migração
npx prisma migrate dev

# Reset do banco de dados
npx prisma migrate reset

# Abrir Prisma Studio
npx prisma studio

# Enviar mudanças para produção
npx prisma migrate deploy
```

## 🚀 Deploy

Para deploy em produção, certifique-se de:

1. Configurar `NODE_ENV=production`
2. Usar uma URL de banco de dados segura
3. Configurar variáveis de ambiente no servidor
4. Executar `npx prisma migrate deploy`
5. Configurar HTTPS para cookies seguros

## 📄 Licença

ISC License