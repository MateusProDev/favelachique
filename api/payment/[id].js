// api/payment/[id].js - Verificar status de pagamento
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.REACT_APP_MERCADO_PAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});

const payment = new Payment(client);

export default async function handler(req, res) {
  // Configurar CORS
  const allowedOrigins = [
    'http://localhost:3000',
    'https://20buscarvacationbeach.com.br',
    'https://favelachique-2b35b.vercel.app',
    'https://favelachique.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID do pagamento é obrigatório' });
    }

    // Buscar informações do pagamento
    const result = await payment.get({ id });
    
    return res.status(200).json({
      success: true,
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      payment_method_id: result.payment_method_id,
      transaction_amount: result.transaction_amount,
      date_created: result.date_created,
      date_approved: result.date_approved,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
}
