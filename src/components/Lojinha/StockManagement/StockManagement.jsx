import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import "./StockManagement.css";

const StockManagement = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalStocks, setAdditionalStocks] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const productsRef = doc(db, "lojinha", "produtos");
    const unsubscribe = onSnapshot(
      productsRef,
      (docSnap) => {
        setCategories(docSnap.exists() ? docSnap.data().categories || {} : {});
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar estoque:", error);
        setError("Erro ao carregar estoque.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleStockInputChange = (key, value) => {
    setAdditionalStocks({ ...additionalStocks, [key]: value });
  };

  const handleAddStock = async (categoryName, productName, variantIndex) => {
    const key = `${categoryName}-${productName}-${variantIndex}`;
    const additionalStock = parseInt(additionalStocks[key]) || 0;
    if (additionalStock <= 0) {
      setError("Digite uma quantidade válida para adicionar.");
      return;
    }

    try {
      const productsRef = doc(db, "lojinha", "produtos");
      const updatedCategories = { ...categories };
      const product = updatedCategories[categoryName].products[productName];
      const currentStock = product.variants[variantIndex].stock || 0;

      product.variants[variantIndex].stock = currentStock + additionalStock;
      product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

      await updateDoc(productsRef, { categories: updatedCategories });
      setAdditionalStocks({ ...additionalStocks, [key]: "" });
      setError("");
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
      setError("Erro ao adicionar estoque.");
    }
  };

  const filteredCategories = Object.entries(categories)
    .map(([categoryName, categoryData]) => ({
      title: categoryName,
      products: Object.entries(categoryData.products || {}).map(([productName, productData]) => ({
        name: productName,
        ...productData,
      })),
    }))
    .filter((category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.products.some((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (loading) return <div className="loading-spinner">Carregando estoque...</div>;

  return (
    <div className="stock-management-container">
      <h2>Gerenciamento de Estoque</h2>
      {error && <p className="error-message">{error}</p>}
      <input
        type="text"
        placeholder="Pesquisar por categoria ou produto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="stock-search-bar"
      />
      <div className="stock-list">
        {filteredCategories.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.title} className="stock-category">
              <h3>{category.title}</h3>
              <table className="stock-table">
                <thead>
                  <tr>
                    <th>Imagem</th>
                    <th>Produto</th>
                    <th>Variante</th>
                    <th>Estoque Atual</th>
                    <th>Adicionar Estoque</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {category.products.flatMap((product) =>
                    product.variants.map((variant, idx) => {
                      const key = `${category.title}-${product.name}-${idx}`;
                      return (
                        <tr key={key}>
                          <td>
                            <img src={product.imageUrl} alt={product.name} className="stock-image" />
                          </td>
                          <td>{product.name}</td>
                          <td>{variant.color} ({variant.size})</td>
                          <td>{variant.stock || 0}</td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              value={additionalStocks[key] || ""}
                              onChange={(e) => handleStockInputChange(key, e.target.value)}
                              placeholder="Ex: 2"
                              className="stock-input"
                            />
                          </td>
                          <td>
                            <button
                              onClick={() => handleAddStock(category.title, product.name, idx)}
                              className="add-stock-btn"
                            >
                              Adicionar
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockManagement;