import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./SalesEntry.css";

const SalesEntry = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsRef = doc(db, "lojinha", "produtos");
      const docSnap = await getDoc(productsRef);
      if (docSnap.exists()) {
        const categories = docSnap.data().categories || {};
        const productsList = Object.values(categories).flatMap((category) =>
          Object.entries(category.products || {}).map(([name, product]) => ({
            name,
            ...product,
          }))
        );
        setProducts(productsList);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = searchTerm
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setSearchTerm("");
  };

  const handleRecordSale = async () => {
    if (!selectedProduct || quantity <= 0) return;

    const productsRef = doc(db, "lojinha", "produtos");
    const salesRef = doc(db, "lojinha", "sales");

    try {
      const productsSnap = await getDoc(productsRef);
      const salesSnap = await getDoc(salesRef);

      // Verifique se o documento de vendas existe
      if (!salesSnap.exists()) {
        // Crie o documento de vendas com um array vazio
        await setDoc(salesRef, { sales: [] });
      }

      const productsData = productsSnap.exists() ? productsSnap.data().categories : {};
      let salesData = salesSnap.exists() ? salesSnap.data().sales || [] : [];

      const category = Object.keys(productsData).find((cat) =>
        productsData[cat].products[selectedProduct.name]
      );
      if (category && productsData[category].products[selectedProduct.name]) {
        const product = productsData[category].products[selectedProduct.name];
        const variantIndex = product.variants?.findIndex(
          (v) => v.color === selectedVariant?.color && v.size === selectedVariant?.size
        );

        if (variantIndex !== -1 && product.variants[variantIndex].stock >= quantity) {
          product.variants[variantIndex].stock -= quantity;
          product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
        } else if (!selectedVariant && product.stock >= quantity) {
          product.stock -= quantity;
        } else {
          alert("Estoque insuficiente!");
          return;
        }
      }

      const sale = {
        items: [
          {
            name: selectedProduct.name,
            quantity,
            variant: selectedVariant
              ? { color: selectedVariant.color, size: selectedVariant.size, price: selectedVariant.price || selectedProduct.price }
              : null,
          },
        ],
        total: (selectedVariant?.price || selectedProduct.price || 0) * quantity,
        timestamp: new Date().toISOString(),
      };
      salesData.push(sale);

      await updateDoc(productsRef, { categories: productsData });
      await updateDoc(salesRef, { sales: salesData });

      alert("Venda registrada com sucesso!");
      setSelectedProduct(null);
      setQuantity(1);
      setSelectedVariant(null);
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      alert("Erro ao registrar venda. Verifique o console.");
    }
  };

  if (loading) return <div className="loading-spinner">Carregando produtos...</div>;

  return (
    <div className="sales-entry-container">
      <h2>Registrar Venda</h2>

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
              <p>Nenhum produto encontrado.</p>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.name}
                  className="product-preview"
                  onClick={() => handleProductSelect(product)}
                >
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  <div className="product-details">
                    <p className="product-name">{product.name}</p>
                    <p className="product-price">
                      R${(product.price || 0).toFixed(2)}
                    </p>
                    <p className="product-stock">Estoque: {product.stock || 0}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="selected-product">
          <h3>{selectedProduct.name}</h3>
          <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="selected-product-image" />
          <p>
            Preço: R$
            {(selectedVariant?.price || selectedProduct.price || 0).toFixed(2)}
          </p>

          {selectedProduct.variants && (
            <div className="variant-selector">
              <label>Variante:</label>
              <select
                value={selectedVariant ? `${selectedVariant.color}-${selectedVariant.size}` : ""}
                onChange={(e) => {
                  const [color, size] = e.target.value.split("-");
                  const variant = selectedProduct.variants.find(
                    (v) => v.color === color && v.size === size
                  );
                  setSelectedVariant(variant);
                }}
              >
                {selectedProduct.variants.map((variant, idx) => (
                  <option key={idx} value={`${variant.color}-${variant.size}`}>
                    {variant.color} ({variant.size}) - R$
                    {(variant.price || selectedProduct.price || 0).toFixed(2)} - Estoque: {variant.stock}
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
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>

          <button className="record-sale-btn" onClick={handleRecordSale}>
            Registrar Venda
          </button>
        </div>
      )}
    </div>
  );
};

export default SalesEntry;