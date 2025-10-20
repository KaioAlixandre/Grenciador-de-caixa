-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `papel` VARCHAR(191) NOT NULL DEFAULT 'USUARIO',
    `avatar` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ultimo_login` DATETIME(3) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `cor` VARCHAR(191) NOT NULL DEFAULT '#007bff',
    `icone` VARCHAR(191) NOT NULL DEFAULT 'fas fa-tag',
    `ativa` BOOLEAN NOT NULL DEFAULT true,
    `usuario_id` VARCHAR(191) NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categorias_nome_usuario_id_key`(`nome`, `usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `codigo_barras` VARCHAR(191) NULL,
    `categoria_id` VARCHAR(191) NOT NULL,
    `fornecedor_id` VARCHAR(191) NULL,
    `unidade_medida` VARCHAR(191) NOT NULL,
    `preco_compra` DOUBLE NOT NULL DEFAULT 0,
    `preco_venda` DOUBLE NOT NULL,
    `margem_lucro` DOUBLE NULL,
    `estoque_minimo` DOUBLE NOT NULL DEFAULT 0,
    `estoque_atual` DOUBLE NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `tem_peso` BOOLEAN NOT NULL DEFAULT false,
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `produtos_codigo_barras_key`(`codigo_barras`),
    INDEX `produtos_categoria_id_idx`(`categoria_id`),
    INDEX `produtos_fornecedor_id_idx`(`fornecedor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `limite_credito` DOUBLE NOT NULL DEFAULT 0,
    `saldo_devedor` DOUBLE NOT NULL DEFAULT 0,
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `id` VARCHAR(191) NOT NULL,
    `numero_venda` VARCHAR(191) NOT NULL,
    `cliente_id` VARCHAR(191) NULL,
    `vendedor_id` VARCHAR(191) NOT NULL,
    `data_venda` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tipo_pagamento` VARCHAR(191) NOT NULL,
    `valor_total` DOUBLE NOT NULL,
    `valor_desconto` DOUBLE NOT NULL DEFAULT 0,
    `valor_final` DOUBLE NOT NULL,
    `valor_pago` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONCLUIDA',
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `vendas_numero_venda_key`(`numero_venda`),
    INDEX `vendas_data_venda_idx`(`data_venda`),
    INDEX `vendas_vendedor_id_idx`(`vendedor_id`),
    INDEX `vendas_cliente_id_idx`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_venda` (
    `id` VARCHAR(191) NOT NULL,
    `venda_id` VARCHAR(191) NOT NULL,
    `produto_id` VARCHAR(191) NOT NULL,
    `quantidade` DOUBLE NOT NULL,
    `preco_unitario` DOUBLE NOT NULL,
    `preco_total` DOUBLE NOT NULL,
    `peso_vendido` DOUBLE NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `itens_venda_venda_id_idx`(`venda_id`),
    INDEX `itens_venda_produto_id_idx`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` VARCHAR(191) NOT NULL,
    `numero_compra` VARCHAR(191) NOT NULL,
    `fornecedor_id` VARCHAR(191) NOT NULL,
    `comprador_id` VARCHAR(191) NOT NULL,
    `data_compra` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `valor_total` DOUBLE NOT NULL,
    `valor_frete` DOUBLE NOT NULL DEFAULT 0,
    `valor_final` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'CONCLUIDA',
    `observacoes` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `compras_numero_compra_key`(`numero_compra`),
    INDEX `compras_data_compra_idx`(`data_compra`),
    INDEX `compras_fornecedor_id_idx`(`fornecedor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_compra` (
    `id` VARCHAR(191) NOT NULL,
    `compra_id` VARCHAR(191) NOT NULL,
    `produto_id` VARCHAR(191) NOT NULL,
    `quantidade` DOUBLE NOT NULL,
    `preco_unitario` DOUBLE NOT NULL,
    `preco_total` DOUBLE NOT NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `itens_compra_compra_id_idx`(`compra_id`),
    INDEX `itens_compra_produto_id_idx`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimentos_estoque` (
    `id` VARCHAR(191) NOT NULL,
    `produto_id` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `quantidade` DOUBLE NOT NULL,
    `motivo` VARCHAR(191) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `data_movimento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `movimentos_estoque_produto_id_idx`(`produto_id`),
    INDEX `movimentos_estoque_data_movimento_idx`(`data_movimento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transacoes` (
    `id` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `categoria_id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo_pagamento` VARCHAR(191) NOT NULL DEFAULT 'DINHEIRO',
    `observacoes` VARCHAR(191) NULL,
    `tags` VARCHAR(191) NOT NULL DEFAULT '[]',
    `comprovante` VARCHAR(191) NULL,
    `recorrente` BOOLEAN NOT NULL DEFAULT false,
    `frequencia` VARCHAR(191) NULL,
    `data_fim` DATETIME(3) NULL,
    `proxima_data` DATETIME(3) NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `venda_id` VARCHAR(191) NULL,
    `compra_id` VARCHAR(191) NULL,
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    INDEX `transacoes_usuario_id_data_idx`(`usuario_id`, `data`),
    INDEX `transacoes_usuario_id_tipo_idx`(`usuario_id`, `tipo`),
    INDEX `transacoes_usuario_id_categoria_id_idx`(`usuario_id`, `categoria_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saldos` (
    `id` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NOT NULL,
    `saldo_atual` DOUBLE NOT NULL DEFAULT 0,
    `receita_total` DOUBLE NOT NULL DEFAULT 0,
    `despesa_total` DOUBLE NOT NULL DEFAULT 0,
    `receita_mensal` DOUBLE NOT NULL DEFAULT 0,
    `despesa_mensal` DOUBLE NOT NULL DEFAULT 0,
    `vendas_total` DOUBLE NOT NULL DEFAULT 0,
    `vendas_mensal` DOUBLE NOT NULL DEFAULT 0,
    `compras_total` DOUBLE NOT NULL DEFAULT 0,
    `compras_mensal` DOUBLE NOT NULL DEFAULT 0,
    `ultima_atualizacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `saldos_usuario_id_key`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `vendas_vendedor_id_fkey` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_venda_id_fkey` FOREIGN KEY (`venda_id`) REFERENCES `vendas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_venda` ADD CONSTRAINT `itens_venda_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_fornecedor_id_fkey` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_comprador_id_fkey` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_compra` ADD CONSTRAINT `itens_compra_compra_id_fkey` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_compra` ADD CONSTRAINT `itens_compra_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimentos_estoque` ADD CONSTRAINT `movimentos_estoque_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacoes` ADD CONSTRAINT `transacoes_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transacoes` ADD CONSTRAINT `transacoes_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saldos` ADD CONSTRAINT `saldos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
