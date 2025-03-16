import React, { useState, useEffect } from "react";
import { useCart } from "../../../context/CartContext/CartContext";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import "./CheckoutOptions.css";

const CheckoutOptions = () => {
  const { cart, total } = useCart();
  const [payerEmail, setPayerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const response = await fetch("/api/get-mercado-pago-key");
        if (!response.ok) throw new Error("Erro ao carregar chave pública");
        const { publicKey } = await response.json();
        if (!publicKey) {
          setError("Chave pública do Mercado Pago não configurada.");
          return;
        }
        initMercadoPago(publicKey, { locale: "pt-BR" });
      } catch (err) {
        setError("Erro ao carregar a chave pública do Mercado Pago.");
        console.error(err);
      }
    };
    fetchPublicKey();
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleMercadoPagoCheckout = async () => {
    setError("");
    setSuccess("");

    if (!isValidEmail(payerEmail)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (cart.length === 0) {
      setError("Carrinho vazio.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, payerEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const data = await response.json();
      setPreferenceId(data.id);
      setSuccess("Pronto para pagar com Mercado Pago!");
    } catch (err) {
      setError(`Erro ao processar o pagamento: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-options">
      <h2>Finalizar Compra Online</h2>
      {cart.length === 0 ? (
        <p>Sua sacola está vazia.</p>
      ) : (
        <>
          <p>Total: R${total.toFixed(2)}</p>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.nome} - R${(item.preco || item.price || 0).toFixed(2)}
                {item.variant && ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})`}
              </li>
            ))}
          </ul>
          {error && <p className="checkout-error">{error}</p>}
          {success && <p className="checkout-success">{success}</p>}
          <input
            type="email"
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            placeholder="Seu e-mail"
            className="email-input"
          />
          <button
            className="mercadopago-btn"
            onClick={handleMercadoPagoCheckout}
            disabled={loading}
          >
            {loading ? "Processando..." : "Pagar com Mercado Pago"}
          </button>
          {preferenceId && <Wallet initialization={{ preferenceId }} />}
        </>
      )}
    </div>
  );
};

export default CheckoutOptions;