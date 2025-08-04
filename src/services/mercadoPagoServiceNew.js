// src/services/mercadoPagoService.js
class MercadoPagoService {
  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://sua-url.vercel.app/api' 
      : '/api'; // Para desenvolvimento local
  }

  async createPaymentPreference(data) {
    try {
      const response = await fetch(`${this.baseUrl}/mercadopago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar preferência');
      }

      return {
        id: result.preference_id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      };
      
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      throw new Error('Falha ao processar pagamento. Tente novamente.');
    }
  }

  async verifyPayment(paymentId) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw new Error('Falha ao verificar pagamento.');
    }
  }
}

const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
