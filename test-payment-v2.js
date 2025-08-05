// Teste local para pagamento com cartão - VERSÃO ATUALIZADA
const { MercadoPagoConfig, Payment } = require('mercadopago');
require('dotenv').config();

async function testCardPayment() {
  console.log('🧪 Iniciando teste de pagamento com cartão (VERSÃO CORRIGIDA)...');
  
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
  
  let client, payment;
  
  try {
    console.log('🔧 Inicializando MercadoPagoConfig...');
    client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      }
    });
    console.log('✅ MercadoPagoConfig inicializado com sucesso');
    
    console.log('🔧 Inicializando Payment...');
    payment = new Payment(client);
    console.log('✅ Payment inicializado com sucesso');
    
    // Verificar se os objetos estão corretos (como na API)
    if (!client || !payment) {
      console.error('❌ Objetos MercadoPago não inicializados corretamente');
      return;
    }
    
    if (!payment || typeof payment.create !== 'function') {
      console.error('❌ Payment object não está inicializado corretamente');
      return;
    }
    
    console.log('✅ Todas as verificações de inicialização passaram!');
    
    // Dados de teste com token ANTIGO (para simular erro)
    const paymentDataOldToken = {
      transaction_amount: 250,
      token: 'ca8672f4307686b87b875dc2ecb3831a', // Token antigo - deve gerar erro
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
    
    console.log('🎯 Testando com token EXPIRADO (deve falhar):');
    console.log(JSON.stringify(paymentDataOldToken, null, 2));
    
    try {
      const result = await payment.create({ body: paymentDataOldToken });
      console.log('❌ INESPERADO: Token antigo funcionou:', result);
    } catch (error) {
      console.log('✅ ESPERADO: Token expirado gerou erro');
      console.log('Error message:', error.message);
      console.log('Error status:', error.status);
      console.log('Error cause:', error.cause);
      
      // Verificar se é erro de token expirado/inválido (como na API corrigida)
      const isTokenError = error.message?.includes('Card Token not found') ||
                          error.message?.includes('token') ||
                          error.cause?.[0]?.code === 2006;
      
      console.log('🔍 É erro de token?', isTokenError);
      
      if (isTokenError) {
        console.log('✅ Sistema de detecção de token expirado funcionando!');
        console.log('💡 Mensagem amigável seria: "Token do cartão expirou. Por favor, tente novamente."');
      } else {
        console.log('❌ Erro não identificado como token expirado');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Agora testando com dados válidos de teste do Mercado Pago...');
    
    // Dados de teste VÁLIDOS do Mercado Pago
    const paymentDataValid = {
      transaction_amount: 100, // Valor menor para teste
      payment_method_id: 'visa',
      payer: {
        email: 'test_user_123@testuser.com',
        identification: {
          type: 'CPF',
          number: '12345678909'
        }
      },
      card: {
        number: '4509953566233704',
        security_code: '123',
        expiration_month: 11,
        expiration_year: 2025,
        cardholder: {
          name: 'APRO',
          identification: {
            type: 'CPF',
            number: '12345678909'
          }
        }
      }
    };
    
    console.log('🎯 Testando com dados de cartão diretos (sem token):');
    console.log(JSON.stringify(paymentDataValid, null, 2));
    
    try {
      const result = await payment.create({ body: paymentDataValid });
      console.log('✅ Pagamento de teste FUNCIONOU!');
      console.log('Payment ID:', result.id);
      console.log('Status:', result.status);
      console.log('Status Detail:', result.status_detail);
    } catch (validError) {
      console.log('❌ Erro com dados válidos:', validError.message);
      console.log('Status:', validError.status);
      console.log('Cause:', validError.cause);
    }
    
  } catch (initError) {
    console.error('❌ Erro na inicialização:', initError);
    console.error('Init Error Details:', {
      message: initError.message,
      stack: initError.stack,
      accessToken: accessToken ? 'PRESENTE' : 'AUSENTE'
    });
  }
}

testCardPayment();
