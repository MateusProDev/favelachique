// api/mercadopago.js - Vercel Function para Mercado Pago
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

console.log('🔧 Verificando variáveis de ambiente...');
console.log('ACCESS_TOKEN_TEST exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST);
console.log('ACCESS_TOKEN_PROD exists:', !!process.env.MERCADO_PAGO_ACCESS_TOKEN);
console.log('REACT_APP_ACCESS_TOKEN exists:', !!process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN);

// Usar credenciais de TESTE por padrão para segurança
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST || 
                   process.env.MERCADO_PAGO_ACCESS_TOKEN || 
                   process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN;

console.log('🎯 Usando credenciais:', accessToken?.startsWith('TEST-') ? 'TESTE (seguro)' : 'PRODUÇÃO (cuidado!)');

if (!accessToken) {
  console.error('❌ Access Token do Mercado Pago não encontrado!');
}

const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

export default async function handler(req, res) {
  console.log('🎯 API Mercado Pago chamada:', req.method);
  console.log('🔍 Debug das variáveis de ambiente:');
  console.log('MERCADO_PAGO_ACCESS_TOKEN_TEST:', process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST ? 'EXISTE' : 'NÃO EXISTE');
  console.log('MERCADO_PAGO_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN ? 'EXISTE' : 'NÃO EXISTE');
  console.log('REACT_APP_MERCADO_PAGO_ACCESS_TOKEN:', process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN ? 'EXISTE' : 'NÃO EXISTE');
  console.log('Access Token escolhido:', accessToken?.substring(0, 10) + '...');
  
  // Verificar se access token está disponível
  if (!accessToken) {
    console.error('❌ Access Token não configurado');
    return res.status(500).json({ 
      error: 'Configuração do Mercado Pago não encontrada',
      details: 'Access token não configurado no servidor'
    });
  }
  // Configurar CORS para permitir seu domínio
  const allowedOrigins = [
    'http://localhost:3000',
    'https://20buscarvacationbeach.com.br',
    'https://favelachique-2b35b.vercel.app',
    'https://favelachique.vercel.app',
    'https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app',
    'https://favelachique-gwshfv3t9-mateus-ferreiras-projects.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { valor, metodoPagamento, packageData, reservaData, cardToken, installments, payerData } = req.body;

    if (!valor || !metodoPagamento) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Calcular valor com desconto PIX e garantir 2 casas decimais
    const valorFinal = metodoPagamento === 'pix' ? 
      Math.round((valor * 0.95) * 100) / 100 : 
      Math.round(valor * 100) / 100;

    console.log('💰 Valor original:', valor, 'Valor final:', valorFinal);

    // Validar se o valor é válido
    if (!valorFinal || valorFinal <= 0) {
      return res.status(400).json({ 
        error: 'Valor inválido', 
        details: `Valor deve ser maior que zero. Recebido: ${valorFinal}` 
      });
    }

    // Para PIX: Criar pagamento direto
    if (metodoPagamento === 'pix') {
      const paymentData = {
        transaction_amount: valorFinal,
        description: `Sinal - ${packageData?.titulo || 'Viagem'}`,
        payment_method_id: 'pix',
        payer: {
          email: payerData?.email || reservaData?.emailPassageiro || 'test@test.com',
          first_name: payerData?.first_name || reservaData?.nomePassageiro?.split(' ')[0] || 'Cliente',
          last_name: payerData?.last_name || reservaData?.nomePassageiro?.split(' ').slice(1).join(' ') || 'Test',
          identification: {
            type: 'CPF',
            number: payerData?.identification?.number || '11111111111'
          }
        },
        notification_url: 'https://20buscarvacationbeach.com.br/api/webhook/mercadopago',
        metadata: {
          reserva_data: JSON.stringify(reservaData),
          package_data: JSON.stringify(packageData),
          metodo_pagamento: metodoPagamento,
          valor_original: valor,
          valor_final: valorFinal
        }
      };

      console.log('🎯 Criando pagamento PIX:', paymentData);

      const result = await payment.create({ body: paymentData });
      
      console.log('✅ Resultado PIX:', result);
      
      return res.status(200).json({
        success: true,
        payment_id: result.id,
        status: result.status,
        qr_code: result.point_of_interaction?.transaction_data?.qr_code || '',
        qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64 || '',
        ticket_url: result.point_of_interaction?.transaction_data?.ticket_url || '',
        expiration_date: result.date_of_expiration
      });
    }

    // Para Cartão: Criar pagamento direto
    if (metodoPagamento === 'cartao') {
      if (!cardToken) {
        return res.status(400).json({ 
          error: 'Token do cartão não fornecido',
          details: 'cardToken é obrigatório para pagamentos com cartão'
        });
      }

      console.log('💳 Processando pagamento por cartão...');
      console.log('Card Token recebido:', cardToken);
      console.log('Card Token length:', cardToken?.length);
      console.log('Installments:', installments);
      console.log('PayerData:', JSON.stringify(payerData, null, 2));

      // Validações específicas
      if (!cardToken || cardToken.length !== 32) {
        return res.status(400).json({ 
          error: 'Token do cartão inválido',
          details: `Token deve ter 32 caracteres. Recebido: ${cardToken?.length || 0}`
        });
      }

      if (!installments || installments < 1) {
        return res.status(400).json({ 
          error: 'Parcelas inválidas',
          details: `Parcelas deve ser maior que 0. Recebido: ${installments}`
        });
      }

      const paymentData = {
        transaction_amount: valorFinal,
        token: cardToken,
        description: `Sinal - ${packageData?.titulo || 'Viagem'}`,
        installments: parseInt(installments) || 1,
        payer: {
          email: payerData?.email || reservaData?.emailPassageiro || 'test_user_123@testuser.com',
          first_name: payerData?.first_name || 'APRO',
          last_name: (payerData?.last_name && payerData.last_name.trim()) || 'APRO',
          identification: {
            type: 'CPF',
            number: payerData?.identification?.number || '12345678909'
          }
        },
        notification_url: 'https://20buscarvacationbeach.com.br/api/webhook/mercadopago',
        metadata: {
          reserva_data: JSON.stringify(reservaData),
          package_data: JSON.stringify(packageData),
          metodo_pagamento: metodoPagamento,
          valor_original: valor,
          valor_final: valorFinal,
          installments: installments
        }
      };

      console.log('🎯 Criando pagamento por cartão:', JSON.stringify(paymentData, null, 2));

      try {
        const result = await payment.create({ body: paymentData });
        
        console.log('✅ Resultado Cartão - Sucesso:', JSON.stringify(result, null, 2));
        
        return res.status(200).json({
          success: true,
          payment_id: result.id,
          status: result.status,
          status_detail: result.status_detail,
          payment_method_id: result.payment_method_id,
          installments: result.installments,
          transaction_amount: result.transaction_amount,
          date_created: result.date_created
        });
      } catch (paymentError) {
        console.error('❌ Erro específico do pagamento cartão:', paymentError);
        console.error('Error message:', paymentError.message);
        console.error('Error status:', paymentError.status);
        console.error('Error response:', paymentError.response?.data);
        console.error('Error details:', paymentError.details);
        
        return res.status(500).json({
          success: false,
          error: 'Erro ao processar pagamento com cartão',
          message: paymentError.message,
          status: paymentError.status,
          details: paymentError.response?.data || paymentError.details
        });
      }
    }

    // Fallback: Criar preferência (método antigo)
    const preferenceData = {
      items: [
        {
          id: packageData?.id || 'viagem',
          title: `Sinal - ${packageData?.titulo || 'Viagem'}`,
          description: `Pagamento do sinal para viagem. Passageiro: ${reservaData?.nomePassageiro || 'N/A'}`,
          quantity: 1,
          unit_price: valorFinal,
          currency_id: 'BRL',
        }
      ],
      payer: {
        name: reservaData?.nomePassageiro || '',
        email: reservaData?.emailPassageiro || '',
        phone: {
          area_code: '71', // Código da Bahia por padrão
          number: reservaData?.telefonePassageiro?.replace(/\D/g, '') || ''
        }
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: metodoPagamento === 'cartao' ? 12 : 1, // Parcelamento apenas para cartão
      },
      back_urls: {
        success: `${process.env.VERCEL_URL || 'https://sua-url.vercel.app'}/pagamento/sucesso`,
        failure: `${process.env.VERCEL_URL || 'https://sua-url.vercel.app'}/pagamento/erro`,
        pending: `${process.env.VERCEL_URL || 'https://sua-url.vercel.app'}/pagamento/pendente`
      },
      auto_return: 'approved',
      notification_url: `${process.env.VERCEL_URL || 'https://sua-url.vercel.app'}/api/webhook/mercadopago`,
      external_reference: `reserva_${Date.now()}`,
      metadata: {
        reserva_data: JSON.stringify(reservaData),
        package_data: JSON.stringify(packageData),
        metodo_pagamento: metodoPagamento,
        valor_original: valor,
        valor_final: valorFinal
      }
    };

    // Configurar métodos de pagamento baseado na escolha
    if (metodoPagamento === 'pix') {
      // Para PIX: permitir apenas Pix
      preferenceData.payment_methods = {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ],
        excluded_payment_methods: [],
        installments: 1
      };
    } else {
      // Para cartão: permitir cartões e parcelamento
      preferenceData.payment_methods = {
        excluded_payment_types: [
          { id: 'pix' }
        ],
        excluded_payment_methods: [],
        installments: 12
      };
    }

    // Criar preferência no Mercado Pago
    const result = await preference.create({ body: preferenceData });

    return res.status(200).json({
      success: true,
      preference_id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar preferência/pagamento:', error);
    console.error('Stack trace:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        details: error.details
      } : undefined
    });
  }
}
