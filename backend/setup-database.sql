-- Script para criar o banco de dados no MySQL Workbench
-- Execute este script antes de rodar as migrações do Prisma

-- Criar o banco de dados
CREATE DATABASE IF NOT EXISTS gestor_caixa 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco criado
USE gestor_caixa;

-- Verificar se o banco foi criado
SHOW DATABASES;