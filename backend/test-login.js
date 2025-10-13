// Script para testar login
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔄 Testando login...');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@petshop.com',
      senha: 'admin123'
    });
    
    console.log('✅ Login bem-sucedido!');
    console.log('📝 Token:', response.data.token ? 'Recebido' : 'Não recebido');
    console.log('👤 Usuário:', response.data.user?.nome || 'Não encontrado');
    console.log('📧 Email:', response.data.user?.email || 'Não encontrado');
    
  } catch (error) {
    console.log('❌ Erro no login:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data);
    } else {
      console.log('Erro de rede:', error.message);
    }
  }
}

testLogin();