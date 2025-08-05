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
console.log('🔑 Access Token (primeiros 20 chars):', accessToken?.substring(0, 20) + '...');

if (!accessToken) {
  console.error('❌ Access Token do Mercado Pago não encontrado!');
}

let client, preference, payment;

try {
  console.log('🔧 Inicializando MercadoPagoConfig...');
  client = new MercadoPagoConfig({
    accessToken,
    options: {
      timeout: 10000, // Aumentar timeout
    }
  });
  console.log('✅ MercadoPagoConfig inicializado com sucesso');

  console.log('🔧 Inicializando Preference...');
  preference = new Preference(client);
  console.log('✅ Preference inicializado com sucesso');

  console.log('🔧 Inicializando Payment...');
  payment = new Payment(client);
  console.log('✅ Payment inicializado com sucesso');
} catch (initError) {
  console.error('❌ Erro ao inicializar MercadoPago:', initError);
  console.error('Init Error Details:', {
    message: initError.message,
    stack: initError.stack,
    accessToken: accessToken ? 'PRESENTE' : 'AUSENTE'
  });
}

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

  // Verificar se os objetos MercadoPago foram inicializados
  if (!client || !preference || !payment) {
    console.error('❌ Objetos MercadoPago não inicializados corretamente');
    return res.status(500).json({ 
      error: 'Erro de inicialização do Mercado Pago',
      details: 'Falha na inicialização dos serviços do MercadoPago'
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
          first_name: payerData?.first_name || reservaData?.nomePassageiro?.split(' ')[0] || 'APRO',
          last_name: payerData?.last_name || reservaData?.nomePassageiro?.split(' ').slice(1).join(' ') || 'APRO',
          identification: {
            type: 'CPF',
            number: payerData?.identification?.number || 
                   reservaData?.clienteCpf?.replace(/\D/g, '') || 
                   '12345678909' // CPF de teste como fallback
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

      // Validar dados essenciais antes do envio
      console.log('🔍 Validando dados antes do envio...');
      console.log('Email:', paymentData.payer.email);
      console.log('Nome:', `${paymentData.payer.first_name} ${paymentData.payer.last_name}`);
      console.log('CPF:', paymentData.payer.identification.number);
      console.log('CPF length:', paymentData.payer.identification.number?.length);

      // Garantir que o CPF tenha exatamente 11 dígitos
      if (!paymentData.payer.identification.number || paymentData.payer.identification.number.length !== 11) {
        console.log('⚠️ CPF inválido, usando CPF de teste');
        paymentData.payer.identification.number = '12345678909';
      }

      // Garantir que o email seja válido
      if (!paymentData.payer.email || !paymentData.payer.email.includes('@')) {
        console.log('⚠️ Email inválido, usando email de teste');
        paymentData.payer.email = 'test_user_123@testuser.com';
      }

      // Garantir que os nomes não estejam vazios
      if (!paymentData.payer.first_name || paymentData.payer.first_name.trim().length === 0) {
        console.log('⚠️ First name vazio, usando APRO');
        paymentData.payer.first_name = 'APRO';
      }

      if (!paymentData.payer.last_name || paymentData.payer.last_name.trim().length === 0) {
        console.log('⚠️ Last name vazio, usando APRO');
        paymentData.payer.last_name = 'APRO';
      }

      console.log('🎯 Criando pagamento por cartão:', JSON.stringify(paymentData, null, 2));

      try {
        console.log('🔄 Verificando se payment está disponível...');
        if (!payment || typeof payment.create !== 'function') {
          throw new Error('Payment object não está inicializado corretamente');
        }
        
        console.log('🔄 Tentando criar pagamento...');
        console.log('🔄 Access token being used:', accessToken?.substring(0, 30) + '...');
        console.log('🔄 Payment data summary:', {
          amount: paymentData.transaction_amount,
          token_length: paymentData.token?.length,
          installments: paymentData.installments,
          payer_email: paymentData.payer.email,
          payer_name: `${paymentData.payer.first_name} ${paymentData.payer.last_name}`
        });
        
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
        console.error('Error cause:', paymentError.cause);
        console.error('Error api_response:', paymentError.api_response);
        console.error('Error response:', paymentError.response?.data);
        console.error('Error details:', paymentError.details);
        console.error('Error stack:', paymentError.stack);
        
        // Verificar se é erro de credenciais
        const isCredentialError = paymentError.message?.includes('credential') || 
                                 paymentError.message?.includes('authentication') ||
                                 paymentError.message?.includes('unauthorized') ||
                                 paymentError.status === 401;
        
        // Verificar se é erro de token expirado/inválido
        const isTokenError = paymentError.message?.includes('Card Token not found') ||
                            paymentError.message?.includes('token') ||
                            paymentError.cause?.[0]?.code === 2006;
        
        let errorMessage = paymentError.message || 'Erro desconhecido';
        let userFriendlyMessage = 'Erro ao processar pagamento com cartão';
        
        if (isTokenError) {
          userFriendlyMessage = 'Token do cartão expirou. Por favor, tente novamente.';
          errorMessage = 'Card Token expired or invalid';
        } else if (isCredentialError) {
          userFriendlyMessage = 'Erro de configuração do sistema de pagamento';
          errorMessage = 'Credential error';
        }
        
        return res.status(500).json({
          success: false,
          error: userFriendlyMessage,
          message: errorMessage,
          status: paymentError.status,
          isCredentialError,
          isTokenError,
          code: paymentError.cause?.[0]?.code,
          details: paymentError.response?.data || paymentError.details || paymentError.api_response,
          accessTokenType: accessToken?.startsWith('TEST-') ? 'TESTE' : 'PRODUÇÃO'
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
