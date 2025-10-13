# 📚 Exemplos de Uso da API - Gestor de Caixa MK

Este documento contém exemplos práticos de como usar a API do sistema.

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@petshop.com",
    "senha": "admin123"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clm123...",
    "nome": "Administrador",
    "email": "admin@petshop.com",
    "papel": "ADMIN"
  }
}
```

### Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@petshop.com",
    "senha": "senha123",
    "papel": "USER"
  }'
```

## 📦 Produtos

### Listar Produtos
```bash
curl -X GET http://localhost:3000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Criar Produto
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Ração Premium Cães Pequenos 2kg",
    "descricao": "Ração super premium para cães de pequeno porte",
    "codigo_barras": "7891234567895",
    "categoria_id": "CATEGORIA_ID_AQUI",
    "fornecedor_id": "FORNECEDOR_ID_AQUI",
    "unidade_medida": "KG",
    "preco_compra": 22.00,
    "preco_venda": 32.00,
    "estoque_atual": 40,
    "estoque_minimo": 8,
    "tem_peso": false
  }'
```

### Ajustar Estoque
```bash
curl -X POST http://localhost:3000/api/produtos/PRODUTO_ID/ajustar-estoque \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "operacao": "adicionar",
    "quantidade": 10,
    "motivo": "AJUSTE",
    "observacoes": "Recontagem de estoque"
  }'
```

## 🛒 Vendas

### Criar Venda
```bash
curl -X POST http://localhost:3000/api/vendas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "CLIENTE_ID_AQUI",
    "itens": [
      {
        "produto_id": "PRODUTO_ID_1",
        "quantidade": 2,
        "preco_unitario": 35.00
      },
      {
        "produto_id": "PRODUTO_ID_2",
        "quantidade": 1,
        "preco_unitario": 18.00
      }
    ],
    "valor_desconto": 5.00,
    "metodo_pagamento": "CARTAO_CREDITO",
    "tipo_pagamento": "AVISTA",
    "observacoes": "Cliente preferencial"
  }'
```

### Listar Vendas com Filtros
```bash
curl -X GET "http://localhost:3000/api/vendas?status=CONCLUIDA&data_inicio=2024-01-01&data_fim=2024-12-31&page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Cancelar Venda
```bash
curl -X POST http://localhost:3000/api/vendas/VENDA_ID/cancelar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "motivo": "Produto defeituoso"
  }'
```

### Relatório de Vendas
```bash
curl -X GET "http://localhost:3000/api/vendas/relatorio?data_inicio=2024-01-01&data_fim=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 👥 Clientes

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Carlos Mendes",
    "cpf": "333.333.333-33",
    "telefone": "(11) 99999-3333",
    "email": "carlos@email.com",
    "endereco": "Rua C, 789 - São Paulo/SP",
    "limite_credito": 800.00,
    "observacoes": "Cliente VIP"
  }'
```

### Ajustar Saldo Devedor
```bash
curl -X POST http://localhost:3000/api/clientes/CLIENTE_ID/ajustar-saldo \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 100.00,
    "operacao": "adicionar",
    "observacoes": "Compra a prazo"
  }'
```

## 🏢 Fornecedores

### Criar Fornecedor
```bash
curl -X POST http://localhost:3000/api/fornecedores \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Distribuidora ABC",
    "cnpj": "33.333.333/0001-33",
    "telefone": "(11) 3333-3333",
    "email": "contato@distribuidoraabc.com.br",
    "endereco": "Av. Industrial, 1000 - São Paulo/SP",
    "observacoes": "Contato principal: Roberto Santos"
  }'
```

### Produtos do Fornecedor
```bash
curl -X GET http://localhost:3000/api/fornecedores/FORNECEDOR_ID/produtos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Compras

### Criar Compra
```bash
curl -X POST http://localhost:3000/api/compras \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedor_id": "FORNECEDOR_ID_AQUI",
    "itens": [
      {
        "produto_id": "PRODUTO_ID_1",
        "quantidade": 20,
        "preco_unitario": 85.00
      },
      {
        "produto_id": "PRODUTO_ID_2",
        "quantidade": 30,
        "preco_unitario": 25.00
      }
    ],
    "numero_nota_fiscal": "000123456",
    "observacoes": "Pedido urgente"
  }'
```

### Confirmar Compra (Atualizar Estoque)
```bash
curl -X POST http://localhost:3000/api/compras/COMPRA_ID/confirmar \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📈 Estoque

### Criar Movimentação Manual
```bash
curl -X POST http://localhost:3000/api/estoque/movimentacoes \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "produto_id": "PRODUTO_ID_AQUI",
    "tipo": "ENTRADA",
    "quantidade": 5,
    "motivo": "ENCONTRADO",
    "observacoes": "Produto encontrado no estoque"
  }'
```

### Relatório de Estoque
```bash
curl -X GET "http://localhost:3000/api/estoque/relatorio?data_inicio=2024-01-01&data_fim=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Inventário
```bash
curl -X GET "http://localhost:3000/api/estoque/inventario?baixo_estoque=true" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📋 Categorias

### Criar Categoria
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Medicamentos",
    "descricao": "Medicamentos e suplementos para pets"
  }'
```

### Listar Categorias Ativas
```bash
curl -X GET "http://localhost:3000/api/categories?ativa=true" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Exemplos de Respostas

### Produto Completo
```json
{
  "success": true,
  "data": {
    "id": "clm123456789",
    "nome": "Ração Premium Cães Adultos 15kg",
    "descricao": "Ração super premium para cães adultos de médio e grande porte",
    "codigo_barras": "7891234567890",
    "categoria_id": "clm987654321",
    "fornecedor_id": "clm555666777",
    "unidade_medida": "KG",
    "preco_compra": 85.00,
    "preco_venda": 120.00,
    "margem_lucro": 29.17,
    "estoque_minimo": 10,
    "estoque_atual": 50,
    "ativo": true,
    "tem_peso": false,
    "criado_em": "2024-01-01T10:00:00.000Z",
    "atualizado_em": "2024-01-01T10:00:00.000Z",
    "categoria": {
      "nome": "Ração para Cães"
    },
    "fornecedor": {
      "nome": "PetFood Distribuidor"
    }
  }
}
```

### Venda Completa
```json
{
  "success": true,
  "data": {
    "id": "clm789123456",
    "numero_venda": 1,
    "cliente_id": "clm444555666",
    "data_venda": "2024-01-01T14:30:00.000Z",
    "valor_total": 158.00,
    "valor_desconto": 8.00,
    "valor_final": 150.00,
    "metodo_pagamento": "CARTAO_CREDITO",
    "tipo_pagamento": "AVISTA",
    "status": "CONCLUIDA",
    "observacoes": "Cliente preferencial",
    "cliente": {
      "nome": "José Silva",
      "telefone": "(11) 99999-1111"
    },
    "itens": [
      {
        "id": "clm111222333",
        "produto_id": "clm123456789",
        "quantidade": 1,
        "preco_unitario": 120.00,
        "subtotal": 120.00,
        "produto": {
          "nome": "Ração Premium Cães Adultos 15kg",
          "unidade_medida": "KG"
        }
      },
      {
        "id": "clm444555666",
        "produto_id": "clm987654321",
        "quantidade": 2,
        "preco_unitario": 19.00,
        "subtotal": 38.00,
        "produto": {
          "nome": "Petisco Natural Cães 500g",
          "unidade_medida": "UN"
        }
      }
    ]
  }
}
```

### Relatório de Vendas
```json
{
  "success": true,
  "data": {
    "resumo": {
      "total_vendas": 45,
      "valor_total": 12500.50,
      "ticket_medio": 277.79,
      "produtos_vendidos": 123
    },
    "vendas_por_dia": [
      {
        "data": "2024-01-01",
        "quantidade": 8,
        "valor_total": 1850.00
      }
    ],
    "produtos_mais_vendidos": [
      {
        "produto": "Ração Premium Cães Adultos 15kg",
        "quantidade_vendida": 25,
        "valor_total": 3000.00
      }
    ],
    "vendas_por_metodo_pagamento": [
      {
        "metodo": "CARTAO_CREDITO",
        "quantidade": 28,
        "valor_total": 7800.30
      }
    ],
    "periodo": {
      "data_inicio": "2024-01-01",
      "data_fim": "2024-12-31"
    }
  }
}
```

## 🔧 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 📝 Observações Importantes

1. **Token JWT**: Sempre incluir o token no header `Authorization: Bearer SEU_TOKEN`
2. **Content-Type**: Para requisições POST/PUT, usar `Content-Type: application/json`
3. **Datas**: Usar formato ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
4. **IDs**: Todos os IDs são strings no formato CUID
5. **Paginação**: Use os parâmetros `page` e `limit` para controlar a paginação
6. **Filtros**: A maioria dos endpoints suporta filtros via query parameters

## 🧪 Testando com Postman

1. Importe a collection do Postman (se disponível)
2. Configure a variável de ambiente `base_url` como `http://localhost:3000`
3. Configure a variável `token` após fazer login
4. Use `{{token}}` nos headers de autorização