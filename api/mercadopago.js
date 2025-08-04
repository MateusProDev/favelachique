// api/mercadopago.js - Vercel Function para Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});

const preference = new Preference(client);

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { valor, metodoPagamento, packageData, reservaData } = req.body;

    if (!valor || !metodoPagamento) {
      return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
    }

    // Calcular valor com desconto PIX
    const valorFinal = metodoPagamento === 'pix' ? valor * 0.95 : valor;

    // Dados da preferência
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

    // Configurações específicas para PIX
    if (metodoPagamento === 'pix') {
      preferenceData.payment_methods.excluded_payment_types = [
        { id: 'credit_card' },
        { id: 'debit_card' },
        { id: 'ticket' }
      ];
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
    console.error('Erro ao criar preferência:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
