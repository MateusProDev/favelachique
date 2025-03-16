const { db } = require("../src/firebase/firebaseAdminConfig"); // Novo import
const { doc, getDoc } = require("firebase-admin/firestore"); // Atualizado
const mercadopago = require("mercadopago");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (req.headers.origin !== "https://site-comercial-ten.vercel.app") {
    return res.status(403).json({ error: "Origem não permitida" });
  }

  const { cart, payerEmail } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    console.error("Erro: Carrinho inválido ou vazio");
    return res.status(400).json({ error: "Carrinho inválido ou vazio" });
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail);
  if (!payerEmail || !isValidEmail) {
    console.error("Erro: E-mail inválido", payerEmail);
    return res.status(400).json({ error: "E-mail inválido" });
  }

  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Erro: Access Token não configurado");
      return res.status(400).json({ error: "Chave secreta do Mercado Pago não configurada" });
    }

    mercadopago.configure({
      access_token: accessToken,
    });

    const items = cart.map((item) => {
      const unitPrice = parseFloat(item.preco || item.price || 0);
      if (isNaN(unitPrice) || unitPrice <= 0) {
        console.error("Erro: Preço inválido ou zero para item:", item);
        throw new Error("Preço inválido ou zero no carrinho");
      }
      return {
        title: item.nome || "Produto sem nome",
        unit_price: unitPrice,
        quantity: item.quantidade ? parseInt(item.quantidade) : 1,
        currency_id: "BRL",
      };
    });

    const baseUrl = process.env.REACT_APP_BASE_URL || "https://site-comercial-ten.vercel.app";
    const preference = {
      items,
      payer: { email: payerEmail },
      back_urls: {
        success: `${baseUrl}/success`,
        failure: `${baseUrl}/failure`,
        pending: `${baseUrl}/pending`,
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ id: response.body.id });
  } catch (error) {
    console.error("Erro ao criar preferência:", error.message, error.stack);
    return res.status(500).json({ error: error.message || "Erro interno ao criar a preferência" });
  }
};