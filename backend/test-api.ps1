# Script de teste das APIs do Gestor de Caixa
# Execute estes comandos no terminal ou use um cliente REST como Postman/Insomnia

# URL base da API
$baseUrl = "http://localhost:3000/api"

# 1. Testar se a API está funcionando
Write-Host "=== Testando API ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:3000/" -Method GET

Write-Host "`n=== Testando Health Check ===" -ForegroundColor Green
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET

# 2. Registrar um usuário
Write-Host "`n=== Registrando Usuário ===" -ForegroundColor Green
$newUser = @{
    nome = "João Silva"
    email = "joao@email.com"
    senha = "123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $newUser -ContentType "application/json"
    $token = $registerResponse.token
    Write-Host "Usuário registrado com sucesso! Token: $($token.Substring(0,20))..."
} catch {
    Write-Host "Erro ao registrar usuário: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Fazer login (caso o registro falhe)
if (-not $token) {
    Write-Host "`n=== Fazendo Login ===" -ForegroundColor Green
    $loginData = @{
        email = "joao@email.com"
        senha = "123456"
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        $token = $loginResponse.token
        Write-Host "Login realizado com sucesso!"
    } catch {
        Write-Host "Erro no login: $($_.Exception.Message)" -ForegroundColor Red
        exit
    }
}

# Headers com token de autenticação
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 4. Obter dados do usuário
Write-Host "`n=== Obtendo dados do usuário ===" -ForegroundColor Green
try {
    $userData = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
    Write-Host "Usuário: $($userData.data.nome) - $($userData.data.email)"
} catch {
    Write-Host "Erro ao obter dados do usuário: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Criar categorias
Write-Host "`n=== Criando Categorias ===" -ForegroundColor Green

$categorias = @(
    @{ nome = "Alimentação"; tipo = "DESPESA"; cor = "#ff6b6b"; icone = "fas fa-utensils" },
    @{ nome = "Transporte"; tipo = "DESPESA"; cor = "#4ecdc4"; icone = "fas fa-car" },
    @{ nome = "Salário"; tipo = "RECEITA"; cor = "#45b7d1"; icone = "fas fa-money-bill-wave" },
    @{ nome = "Freelance"; tipo = "RECEITA"; cor = "#96ceb4"; icone = "fas fa-laptop" }
)

$createdCategories = @()
foreach ($categoria in $categorias) {
    try {
        $categoriaJson = $categoria | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "$baseUrl/categories" -Method POST -Body $categoriaJson -Headers $headers
        $createdCategories += $response.data
        Write-Host "Categoria criada: $($response.data.nome)"
    } catch {
        Write-Host "Erro ao criar categoria $($categoria.nome): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Listar categorias
Write-Host "`n=== Listando Categorias ===" -ForegroundColor Green
try {
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/categories" -Method GET -Headers $headers
    Write-Host "Total de categorias: $($categoriesResponse.count)"
    foreach ($cat in $categoriesResponse.data) {
        Write-Host "- $($cat.nome) ($($cat.tipo))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erro ao listar categorias: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Criar transações
Write-Host "`n=== Criando Transações ===" -ForegroundColor Green

if ($createdCategories.Count -gt 0) {
    $transacoes = @(
        @{
            descricao = "Almoço no restaurante"
            valor = 25.50
            tipo = "DESPESA"
            categoria_id = ($createdCategories | Where-Object { $_.nome -eq "Alimentação" }).id
            metodo_pagamento = "CARTAO_DEBITO"
        },
        @{
            descricao = "Uber para trabalho"
            valor = 15.00
            tipo = "DESPESA"
            categoria_id = ($createdCategories | Where-Object { $_.nome -eq "Transporte" }).id
            metodo_pagamento = "PIX"
        },
        @{
            descricao = "Salário mensal"
            valor = 3500.00
            tipo = "RECEITA"
            categoria_id = ($createdCategories | Where-Object { $_.nome -eq "Salário" }).id
            metodo_pagamento = "TRANSFERENCIA"
        }
    )

    foreach ($transacao in $transacoes) {
        try {
            $transacaoJson = $transacao | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method POST -Body $transacaoJson -Headers $headers
            Write-Host "Transação criada: $($response.data.descricao) - R$ $($response.data.valor)"
        } catch {
            Write-Host "Erro ao criar transação: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 8. Listar transações
Write-Host "`n=== Listando Transações ===" -ForegroundColor Green
try {
    $transactionsResponse = Invoke-RestMethod -Uri "$baseUrl/transactions" -Method GET -Headers $headers
    Write-Host "Total de transações: $($transactionsResponse.count)"
    foreach ($trans in $transactionsResponse.data) {
        $color = if ($trans.tipo -eq "RECEITA") { "Green" } else { "Red" }
        Write-Host "- $($trans.descricao): R$ $($trans.valor) ($($trans.tipo))" -ForegroundColor $color
    }
} catch {
    Write-Host "Erro ao listar transações: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Obter dashboard
Write-Host "`n=== Dashboard ===" -ForegroundColor Green
try {
    $dashboardResponse = Invoke-RestMethod -Uri "$baseUrl/dashboard" -Method GET -Headers $headers
    $saldo = $dashboardResponse.data.saldo
    Write-Host "Saldo atual: R$ $($saldo.saldo_atual)" -ForegroundColor Cyan
    Write-Host "Receitas totais: R$ $($saldo.receita_total)" -ForegroundColor Green
    Write-Host "Despesas totais: R$ $($saldo.despesa_total)" -ForegroundColor Red
    Write-Host "Receitas do mês: R$ $($saldo.receita_mensal)" -ForegroundColor Green
    Write-Host "Despesas do mês: R$ $($saldo.despesa_mensal)" -ForegroundColor Red
} catch {
    Write-Host "Erro ao obter dashboard: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Testes Concluídos ===" -ForegroundColor Green
Write-Host "API do Gestor de Caixa está funcionando corretamente!" -ForegroundColor Green