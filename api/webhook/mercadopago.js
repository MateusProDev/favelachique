// api/webhook/mercadopago.js - Webhook para confirmações de pagamento
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc, addDoc, collection } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  // Suas configurações do Firebase aqui
  // Você pode usar variáveis de ambiente para isso também
};

// Inicializar Firebase apenas se não estiver inicializado
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const payment = new Payment(client);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { type, data } = req.body;

    // Verificar se é uma notificação de pagamento
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar informações do pagamento
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo.status === 'approved') {
        // Pagamento aprovado - salvar no Firestore
        const metadata = paymentInfo.metadata;
        const reservaData = JSON.parse(metadata.reserva_data || '{}');
        const packageData = JSON.parse(metadata.package_data || '{}');
        
        const reservaFinal = {
          ...reservaData,
          // Dados do pagamento
          paymentId: paymentId,
          status: 'confirmada',
          statusPagamento: 'aprovado',
          metodoPagamento: metadata.metodo_pagamento,
          valorPago: paymentInfo.transaction_amount,
          valorOriginal: metadata.valor_original,
          dataPagamento: new Date(),
          
          // Dados do Mercado Pago
          mercadoPago: {
            paymentId: paymentId,
            status: paymentInfo.status,
            paymentMethodId: paymentInfo.payment_method_id,
            paymentTypeId: paymentInfo.payment_type_id,
          },
          
          // Metadados
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Salvar no Firestore
        await addDoc(collection(db, 'reservas'), reservaFinal);
        
        console.log('Reserva salva com sucesso:', reservaFinal);
      }
    }

    return res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
