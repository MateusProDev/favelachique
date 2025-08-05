// Teste local para pagamento com cartão
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

async function testCardPayment() {
  console.log('🧪 Iniciando teste de pagamento com cartão...');
  
  // Verificar variáveis de ambiente
  console.log('ACCESS_TOKEN_TEST exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST);
  console.log('ACCESS_TOKEN_PROD exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
  console.log('REACT_APP_ACCESS_TOKEN exists:', !!process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN);
  
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || 
                     process.env.MERCADO_PAGO_ACCESS_TOKEN ||
                     process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN;
                     
  console.log('🎯 Usando credenciais:', accessToken?.startsWith('TEST-') ? 'TESTE (seguro)' : 'PRODUÇÃO (cuidado!)');
  console.log('🔑 Access Token (primeiros 20 chars):', accessToken?.substring(0, 20) + '...');
  
  if (!accessToken) {
    console.error('❌ Access Token não encontrado!');
    return;
  }
  
  try {
    console.log('🔧 Inicializando MercadoPagoConfig...');
    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      }
    });
    console.log('✅ MercadoPagoConfig inicializado');
    
    console.log('🔧 Inicializando Payment...');
    const payment = new Payment(client);
    console.log('✅ Payment inicializado');
    
    // Dados de teste
    const paymentData = {
      transaction_amount: 250,
      token: 'ca8672f4307686b87b875dc2ecb3831a', // Token do último teste
      description: 'Teste - Beach Park para Águas Belas',
      installments: 1,
      payer: {
        email: 'test_user_123@testuser.com',
        first_name: 'APRO',
        last_name: 'APRO',
        identification: {
          type: 'CPF',
          number: '12345678909'
        }
      }
    };
    
    console.log('🎯 Criando pagamento de teste:', JSON.stringify(paymentData, null, 2));
    
    const result = await payment.create({ body: paymentData });
    
    console.log('✅ Resultado do teste:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error cause:', error.cause);
    console.error('Error api_response:', error.api_response);
    console.error('Error response:', error.response?.data);
    console.error('Error details:', error.details);
    console.error('Error stack:', error.stack);
  }
}

testCardPayment();
