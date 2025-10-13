const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // 1. Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const usuario = await prisma.usuario.upsert({
      where: { email: 'admin@petshop.com' },
      update: {},
      create: {
        nome: 'Administrador',
        email: 'admin@petshop.com',
        senha: hashedPassword,
        papel: 'ADMIN'
      }
    });
    console.log('✅ Usuário admin criado');

    // 2. Criar categorias
    const categorias = await Promise.all([
      prisma.categoria.upsert({
        where: { nome_usuario_id: { nome: 'Ração para Cães', usuario_id: usuario.id } },
        update: {},
        create: {
          nome: 'Ração para Cães',
          descricao: 'Rações secas e úmidas para cães de todos os portes',
          tipo: 'PRODUTO',
          usuario_id: usuario.id
        }
      }),
      prisma.categoria.upsert({
        where: { nome_usuario_id: { nome: 'Ração para Gatos', usuario_id: usuario.id } },
        update: {},
        create: {
          nome: 'Ração para Gatos',
          descricao: 'Rações secas e úmidas para gatos',
          tipo: 'PRODUTO',
          usuario_id: usuario.id
        }
      }),
      prisma.categoria.upsert({
        where: { nome_usuario_id: { nome: 'Petiscos', usuario_id: usuario.id } },
        update: {},
        create: {
          nome: 'Petiscos',
          descricao: 'Petiscos e snacks para cães e gatos',
          tipo: 'PRODUTO',
          usuario_id: usuario.id
        }
      }),
      prisma.categoria.upsert({
        where: { nome_usuario_id: { nome: 'Acessórios', usuario_id: usuario.id } },
        update: {},
        create: {
          nome: 'Acessórios',
          descricao: 'Coleiras, brinquedos e outros acessórios',
          tipo: 'PRODUTO',
          usuario_id: usuario.id
        }
      })
    ]);
    console.log('✅ Categorias criadas');

    // 3. Criar fornecedores
    const fornecedor1 = await prisma.fornecedor.create({
      data: {
        nome: 'PetFood Distribuidor',
        cnpj: '11.111.111/0001-11',
        telefone: '(11) 1111-1111',
        email: 'contato@petfood.com.br',
        endereco: 'Rua das Rações, 123 - São Paulo/SP',
        observacoes: 'Contato principal: João Silva'
      }
    });
    
    const fornecedor2 = await prisma.fornecedor.create({
      data: {
        nome: 'Acessórios Pet Ltda',
        cnpj: '22.222.222/0001-22',
        telefone: '(11) 2222-2222',
        email: 'vendas@acessoriospet.com.br',
        endereco: 'Av. dos Pets, 456 - São Paulo/SP',
        observacoes: 'Contato principal: Maria Santos'
      }
    });
    
    const fornecedores = [fornecedor1, fornecedor2];
    console.log('✅ Fornecedores criados');

    // 4. Criar produtos
    const produto1 = await prisma.produto.create({
      data: {
        nome: 'Ração Premium Cães Adultos 15kg',
        descricao: 'Ração super premium para cães adultos de médio e grande porte',
        codigo_barras: '7891234567890',
        categoria_id: categorias[0].id,
        fornecedor_id: fornecedores[0].id,
        unidade_medida: 'KG',
        preco_compra: 85.00,
        preco_venda: 120.00,
        estoque_atual: 50,
        estoque_minimo: 10
      }
    });

    const produto2 = await prisma.produto.create({
      data: {
        nome: 'Ração Premium Filhotes 3kg',
        descricao: 'Ração especial para filhotes até 12 meses',
        codigo_barras: '7891234567891',
        categoria_id: categorias[0].id,
        fornecedor_id: fornecedores[0].id,
        unidade_medida: 'KG',
        preco_compra: 25.00,
        preco_venda: 35.00,
        estoque_atual: 30,
        estoque_minimo: 5
      }
    });

    const produto3 = await prisma.produto.create({
      data: {
        nome: 'Ração Gatos Adultos 10kg',
        descricao: 'Ração premium para gatos adultos castrados',
        codigo_barras: '7891234567892',
        categoria_id: categorias[1].id,
        fornecedor_id: fornecedores[0].id,
        unidade_medida: 'KG',
        preco_compra: 65.00,
        preco_venda: 95.00,
        estoque_atual: 25,
        estoque_minimo: 8
      }
    });

    const produto4 = await prisma.produto.create({
      data: {
        nome: 'Petisco Natural Cães 500g',
        descricao: 'Petisco natural desidratado para cães',
        codigo_barras: '7891234567893',
        categoria_id: categorias[2].id,
        fornecedor_id: fornecedores[0].id,
        unidade_medida: 'UN',
        preco_compra: 12.00,
        preco_venda: 18.00,
        estoque_atual: 40,
        estoque_minimo: 10
      }
    });

    const produto5 = await prisma.produto.create({
      data: {
        nome: 'Coleira Nylon Média',
        descricao: 'Coleira de nylon ajustável para cães médios',
        codigo_barras: '7891234567894',
        categoria_id: categorias[3].id,
        fornecedor_id: fornecedores[1].id,
        unidade_medida: 'UN',
        preco_compra: 8.00,
        preco_venda: 15.00,
        estoque_atual: 20,
        estoque_minimo: 5
      }
    });

    const produtos = [produto1, produto2, produto3, produto4, produto5];
    console.log('✅ Produtos criados');

    // 5. Criar alguns clientes
    const cliente1 = await prisma.cliente.create({
      data: {
        nome: 'José Silva',
        cpf: '111.111.111-11',
        telefone: '(11) 99999-1111',
        email: 'jose@email.com',
        endereco: 'Rua A, 123 - São Paulo/SP',
        limite_credito: 500.00
      }
    });

    const cliente2 = await prisma.cliente.create({
      data: {
        nome: 'Maria Oliveira',
        cpf: '222.222.222-22',
        telefone: '(11) 99999-2222',
        email: 'maria@email.com',
        endereco: 'Rua B, 456 - São Paulo/SP',
        limite_credito: 300.00
      }
    });

    const clientes = [cliente1, cliente2];
    console.log('✅ Clientes criados');

    // 6. Criar uma venda de exemplo
    const venda = await prisma.venda.create({
      data: {
        numero_venda: 1,
        cliente_id: clientes[0].id,
        data_venda: new Date(),
        valor_total: 53.00,
        valor_desconto: 0,
        valor_final: 53.00,
        metodo_pagamento: 'DINHEIRO',
        tipo_pagamento: 'AVISTA',
        status: 'CONCLUIDA',
        observacoes: 'Primeira venda de exemplo'
      }
    });

    // Itens da venda
    await Promise.all([
      prisma.itemVenda.create({
        data: {
          venda_id: venda.id,
          produto_id: produtos[1].id, // Ração Filhotes 3kg
          quantidade: 1,
          preco_unitario: 35.00,
          subtotal: 35.00
        }
      }),
      prisma.itemVenda.create({
        data: {
          venda_id: venda.id,
          produto_id: produtos[3].id, // Petisco 500g
          quantidade: 1,
          preco_unitario: 18.00,
          subtotal: 18.00
        }
      })
    ]);

    // Atualizar estoque após venda
    await prisma.produto.update({
      where: { id: produtos[1].id },
      data: { estoque_atual: { decrement: 1 } }
    });
    await prisma.produto.update({
      where: { id: produtos[3].id },
      data: { estoque_atual: { decrement: 1 } }
    });

    console.log('✅ Venda de exemplo criada');

    console.log('🎉 Seed concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`- 1 usuário admin (admin@petshop.com / admin123)`);
    console.log(`- ${categorias.length} categorias`);
    console.log(`- ${fornecedores.length} fornecedores`);
    console.log(`- ${produtos.length} produtos`);
    console.log(`- ${clientes.length} clientes`);
    console.log(`- 1 venda de exemplo`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });