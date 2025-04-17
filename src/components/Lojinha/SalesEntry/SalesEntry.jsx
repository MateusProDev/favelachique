import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./SalesEntry.css";

const SalesEntry = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = doc(db, "lojinha", "produtos");
        const productsSnap = await getDoc(productsRef);
        if (productsSnap.exists()) {
          const categories = productsSnap.data().categories || {};
          const productsList = Object.values(categories).flatMap((category) =>
            Object.entries(category.products || {}).map(([name, product]) => ({
              name,
              ...product,
            }))
          );
          setProducts(productsList);
        }

        const clientsRef = doc(db, "lojinha", "clients");
        const clientsSnap = await getDoc(clientsRef);
        if (clientsSnap.exists()) {
          const clientsData = clientsSnap.data().clients || [];
          setClients(clientsData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError("Erro ao carregar dados.");
        setLoading(false);
      }
    };
    fetchData();
    requestNotificationPermission();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product, quantity, variant) => {
    if (quantity <= 0) {
      setError("Selecione uma quantidade válida.");
      return;
    }
    setCart((prevCart) => [
      ...prevCart,
      {
        product,
        quantity,
        variant: variant ? { ...variant } : null,
      },
    ]);
    setSearchTerm("");
    setError("");
  };

  const handleRemoveFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações.");
      return;
    }
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      await Notification.requestPermission();
    }
  };

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      new Notification("Registro de Vendas - Alerta", {
        body: message,
        icon: "/path/to/icon.png",
      });
    }
  };

  const handleRecordSale = async () => {
    if (cart.length === 0) {
      setError("Adicione pelo menos um produto à venda.");
      return;
    }
    if (!selectedClient) {
      setError("Selecione um cliente.");
      return;
    }
    if (paymentStatus === "pending" && !dueDate) {
      setError("Defina uma data de vencimento para vendas a prazo.");
      return;
    }
    if (note.length > 500) {
      setError("A observação não pode exceder 500 caracteres.");
      return;
    }

    const productsRef = doc(db, "lojinha", "produtos");
    const salesRef = doc(db, "lojinha", "sales");

    try {
      const productsSnap = await getDoc(productsRef);
      const salesSnap = await getDoc(salesRef);
      const productsData = productsSnap.exists() ? productsSnap.data().categories : {};
      let salesData = salesSnap.exists() ? salesSnap.data().sales || [] : [];

      if (!salesSnap.exists()) {
        await setDoc(salesRef, { sales: [] });
        salesData = [];
      }

      for (const item of cart) {
        const { product, quantity, variant } = item;
        const category = Object.keys(productsData).find((cat) =>
          productsData[cat].products[product.name]
        );

        if (!category) throw new Error(`Categoria não encontrada para ${product.name}.`);

        const prod = productsData[category].products[product.name];
        const variantIndex = variant
          ? prod.variants?.findIndex(
              (v) => v.color === variant.color && v.size === variant.size
            )
          : -1;

        if (variantIndex !== -1 && prod.variants[variantIndex].stock < quantity) {
          setError(`Estoque insuficiente para ${product.name} (${variant.color}, ${variant.size}).`);
          return;
        } else if (!variant && prod.stock < quantity) {
          setError(`Estoque insuficiente para ${product.name}.`);
          return;
        }

        if (variantIndex !== -1) {
          prod.variants[variantIndex].stock -= quantity;
          prod.stock = prod.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          prod.stock -= quantity;
        }
      }

      const sale = {
        items: cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          variant: item.variant
            ? {
                color: item.variant.color,
                size: item.variant.size,
                price: item.variant.price || item.product.price,
              }
            : null,
        })),
        total: cart.reduce(
          (sum, item) =>
            sum + (item.variant?.price || item.product.price || 0) * item.quantity,
          0
        ),
        timestamp: new Date().toISOString(),
        client: {
          id: selectedClient.id,
          name: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
        },
        paymentStatus,
        ...(paymentStatus === "pending" && { dueDate }),
        ...(note && { note }),
      };
      salesData.push(sale);

      await updateDoc(productsRef, { categories: productsData });
      await updateDoc(salesRef, { sales: salesData });

      for (const item of cart) {
        const { product, variant, quantity } = item;
        const category = Object.keys(productsData).find((cat) =>
          productsData[cat].products[product.name]
        );
        const prod = productsData[category].products[product.name];
        const variantIndex = variant
          ? prod.variants?.findIndex(
              (v) => v.color === variant.color && v.size === variant.size
            )
          : -1;
        const remainingStock = variantIndex !== -1 ? prod.variants[variantIndex].stock : prod.stock;
        if (remainingStock <= 5) {
          showNotification(
            `Estoque baixo para ${product.name}${variant ? ` (${variant.color}, ${variant.size})` : ""}: apenas ${remainingStock} unidades restantes!`
          );
        }
      }

      alert("Venda registrada com sucesso!");
      setCart([]);
      setSelectedClient(null);
      setPaymentStatus("paid");
      setDueDate("");
      setNote("");
      setError("");
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      setError("Erro ao registrar venda. Verifique o console.");
    }
  };

  if (loading) return <div className="loading-message">Carregando...</div>;

  return (
    <div className="sales-entry-container">
      <h2>Registrar Venda</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <div className="search-results">
            {filteredProducts.length === 0 ? (
              <p className="no-results">Nenhum produto encontrado</p>
            ) : (
              filteredProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="product-preview"
                  onClick={() => handleAddToCart(product, 1, product.variants?.[0] || null)}
                >
                  <div className="product-image-container">
                    <img src={product.imageUrl} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-details">
                    <p className="product-name">{product.name}</p>
                    <div className="product-info">
                      <p className="product-price">R${(product.price || 0).toFixed(2)}</p>
                      <p className="product-stock">Estoque: {product.stock || 0}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart">
          <h3>Produtos</h3>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item-image-container">
                <img src={item.product.imageUrl} alt={item.product.name} className="cart-item-image" />
              </div>
              <div className="cart-item-details">
                <p className="cart-item-name">{item.product.name}</p>
                {item.variant && (
                  <p>Variante: {item.variant.color} ({item.variant.size})</p>
                )}
                <p>Preço: R${(item.variant?.price || item.product.price || 0).toFixed(2)}</p>
                <div className="quantity-selector">
                  <label>Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                      setCart((prevCart) =>
                        prevCart.map((cartItem, i) =>
                          i === index ? { ...cartItem, quantity: newQuantity } : cartItem
                        )
                      );
                    }}
                  />
                </div>
                {item.product.variants?.length > 0 && (
                  <div className="variant-selector">
                    <label>Variante:</label>
                    <select
                      value={item.variant ? `${item.variant.color}-${item.variant.size}` : ""}
                      onChange={(e) => {
                        const [color, size] = e.target.value.split("-");
                        setCart((prevCart) =>
                          prevCart.map((cartItem, i) =>
                            i === index
                              ? {
                                  ...cartItem,
                                  variant: item.product.variants.find(
                                    (v) => v.color === color && v.size === size
                                  ),
                                }
                              : cartItem
                          )
                        );
                      }}
                    >
                      {item.product.variants.map((variant, idx) => (
                        <option key={idx} value={`${variant.color}-${variant.size}`}>
                          {variant.color} ({variant.size})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <button
                  className="remove-item-btn"
                  onClick={() => handleRemoveFromCart(index)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
          <p className="cart-total">
            Total: R${cart
              .reduce(
                (sum, item) =>
                  sum + (item.variant?.price || item.product.price || 0) * item.quantity,
                0
              )
              .toFixed(2)}
          </p>
        </div>
      )}

      <div className="client-selector">
        <label>Cliente</label>
        <select
          value={selectedClient?.id || ""}
          onChange={(e) => {
            const client = clients.find((c) => c.id === e.target.value);
            setSelectedClient(client || null);
          }}
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="payment-status-selector">
        <label>Pagamento</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="paid">Pago</option>
          <option value="pending">A Prazo</option>
        </select>
      </div>

      {paymentStatus === "pending" && (
        <div className="due-date-selector">
          <label>Data de Vencimento</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>
      )}

      <div className="note-selector">
        <label>Observação (opcional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex.: Entregar na loja"
          maxLength={500}
          rows={3}
        />
        <p className="note-counter">{note.length}/500</p>
      </div>

      <button className="record-sale-btn" onClick={handleRecordSale}>
        Registrar
      </button>
    </div>
  );
};

export default SalesEntry;