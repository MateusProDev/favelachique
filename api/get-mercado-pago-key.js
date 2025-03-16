export default async function handler(req, res) {
  try {
    const publicKey = process.env.MERCADO_PAGO_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(400).json({ error: "Chave pública do Mercado Pago não configurada." });
    }
    return res.json({ publicKey });
  } catch (error) {
    console.error("Erro ao obter chave pública:", error.message);
    return res.status(500).json({ error: "Erro ao obter chave pública do Mercado Pago." });
  }
}