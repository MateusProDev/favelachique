import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./SalesEntry.css";

const SalesEntry = () => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // Lista de itens selecionados
  const [currentProduct, setCurrentProduct] = useState(null); // Produto atual sendo adicionado
  const [currentVariant, setCurrentVariant] = useState(null); // Variante atual
  const [currentQuantity, setCurrentQuantity] = useState(1); // Quantidade atual
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [dueDate, setDueDate] = useState("");
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

  const handleProductSelect = (product) => {
    setCurrentProduct(product);
    setCurrentVariant(product.variants?.[0] || null);
    setSearchTerm("");
    setError("");
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

  const handleAddItem = () => {
    if (!currentProduct || currentQuantity <= 0) {
      setError("Selecione um produto e uma quantidade válida.");
      return;
    }

    const item = {
      name: currentProduct.name,
      quantity: currentQuantity,
      variant: currentVariant ? { ...currentVariant } : null,
      price: currentVariant?.price || currentProduct.price || 0,
    };

    setSelectedItems([...selectedItems, item]);
    setCurrentProduct(null);
    setCurrentVariant(null);
    setCurrentQuantity(1);
    setError("");
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleRecordSale = async () => {
    if (selectedItems.length === 0) {
      setError("Adicione pelo menos um item à venda.");
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

      // Verificar e atualizar estoque para cada item
      for (const item of selectedItems) {
        const category = Object.keys(productsData).find((cat) =>
          productsData[cat].products[item.name]
        );
        if (!category) throw new Error(`Categoria não encontrada para ${item.name}.`);

        const product = productsData[category].products[item.name];
        const variantIndex = item.variant
          ? product.variants?.findIndex(
              (v) => v.color === item.variant.color && v.size === item.variant.size
            )
          : -1;

        if (variantIndex !== -1 && product.variants[variantIndex].stock < item.quantity) {
          setError(`Estoque insuficiente para ${item.name} (${item.variant.color}, ${item.variant.size}).`);
          return;
        } else if (!item.variant && product.stock < item.quantity) {
          setError(`Estoque insuficiente para ${item.name}.`);
          return;
        }

        if (variantIndex !== -1) {
          product.variants[variantIndex].stock -= item.quantity;
          product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else {
          product.stock -= item.quantity;
        }

        // Verificar estoque baixo
        const remainingStock = variantIndex !== -1 ? product.variants[variantIndex].stock : product.stock;
        if (remainingStock <= 5) {
          showNotification(
            `Estoque baixo para ${item.name}${item.variant ? ` (${item.variant.color}, ${item.variant.size})` : ""}: apenas ${remainingStock} unidades restantes!`
          );
        }
      }

      const sale = {
        items: selectedItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          variant: item.variant ? { color: item.variant.color, size: item.variant.size, price: item.price } : null,
        })),
        total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        timestamp: new Date().toISOString(),
        client: {
          id: selectedClient.id,
          name: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
        },
        paymentStatus,
        ...(paymentStatus === "pending" && { dueDate }),
      };
      salesData.push(sale);

      await updateDoc(productsRef, { categories: productsData });
      await updateDoc(salesRef, { sales: salesData });

      alert("Venda registrada com sucesso!");
      setSelectedItems([]);
      setSelectedClient(null);
      setPaymentStatus("paid");
      setDueDate("");
      setError("");
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      setError("Erro ao registrar venda. Verifique o console.");
    }
  };

  if (loading) return <div className="loading-message">Carregando dados...</div>;

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
              <p className="no-results">Nenhum produto encontrado.</p>
            ) : (
              filteredProducts.map((product, index) => (
                <div
                  key={`${product.name}-${index}`}
                  className="product-preview"
                  onClick={() => handleProductSelect(product)}
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

      {currentProduct && (
        <div className="selected-product">
          <h3>{currentProduct.name}</h3>
          <div className="selected-product-image-container">
            <img src={currentProduct.imageUrl} alt={currentProduct.name} className="selected-product-image" />
          </div>
          <p className="selected-product-price">
            Preço: R${(currentVariant?.price || currentProduct.price || 0).toFixed(2)}
          </p>

          {currentProduct.variants?.length > 0 && (
            <div className="variant-selector">
              <label>Variante:</label>
              <select
                value={currentVariant ? `${currentVariant.color}-${currentVariant.size}` : ""}
                onChange={(e) => {
                  const [color, size] = e.target.value.split("-");
                  setCurrentVariant(currentProduct.variants.find((v) => v.color === color && v.size === size));
                }}
              >
                {currentProduct.variants.map((variant, idx) => (
                  <option key={idx} value={`${variant.color}-${variant.size}`}>
                    {variant.color} ({variant.size}) - R${(variant.price || currentProduct.price || 0).toFixed(2)} - Estoque: {variant.stock}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="quantity-selector">
            <label>Quantidade:</label>
            <input
              type="number"
              min="1"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <button className="add-item-btn" onClick={handleAddItem}>
            Adicionar Item
          </button>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="selected-items-list">
          <h3>Itens Selecionados</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Variante</th>
                <th>Quantidade</th>
                <th>Preço Unitário</th>
                <th>Subtotal</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.variant ? `${item.variant.color} (${item.variant.size})` : "N/A"}</td>
                  <td>{item.quantity}</td>
                  <td>R${item.price.toFixed(2)}</td>
                  <td>R${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="remove-item-btn" onClick={() => handleRemoveItem(index)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="total-items">
            Total: R${selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
          </p>
        </div>
      )}

      <div className="sale-details">
        <div className="client-selector">
          <label>Cliente:</label>
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
                {client.name} ({client.phone || "Sem telefone"})
              </option>
            ))}
          </select>
        </div>

        <div className="payment-status-selector">
          <label>Status do Pagamento:</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <option value="paid">Pago</option>
            <option value="pending">A Prazo</option>
          </select>
        </div>

        {paymentStatus === "pending" && (
          <div className="due-date-selector">
            <label>Data de Vencimento:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="due-date-input"
            />
          </div>
        )}

        <button className="record-sale-btn" onClick={handleRecordSale}>
          Registrar Venda
        </button>
      </div>
    </div>
  );
};

export default SalesEntry;