// api/test-payment.js - API de teste simplificada
import { MercadoPagoConfig, Payment } from 'mercadopago';

export default async function handler(req, res) {
  console.log('🧪 API de teste chamada:', req.method);
  
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Usar credenciais de teste fixas
    const accessToken = 'TEST-4447518579890126-080413-fe0dae2c4e3631f7a2249a34a2377c46-529105206';
    
    console.log('🔧 Inicializando MP com token de teste...');
    
    const client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      }
    });

    const payment = new Payment(client);
    console.log('✅ MP inicializado com sucesso');

    const { cardToken, valor } = req.body;
    
    console.log('💳 Dados recebidos:', { cardToken, valor });

    if (!cardToken) {
      return res.status(400).json({ error: 'Token do cartão obrigatório' });
    }

    // Dados mínimos para teste
    const paymentData = {
      transaction_amount: valor || 1, // Valor mínimo para teste
      token: cardToken,
      description: 'Teste de pagamento',
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

    console.log('🎯 Enviando para MP:', JSON.stringify(paymentData, null, 2));

    const result = await payment.create({ body: paymentData });
    
    console.log('✅ Resultado:', result);

    return res.status(200).json({
      success: true,
      payment_id: result.id,
      status: result.status,
      message: 'Pagamento processado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    console.error('Error message:', error.message);
    console.error('Error cause:', error.cause);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      cause: error.cause,
      details: 'Erro no teste de pagamento'
    });
  }
}
