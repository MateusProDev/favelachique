import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import "./StockManagement.css";

const StockManagement = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalStocks, setAdditionalStocks] = useState({});

  useEffect(() => {
    const productsRef = doc(db, "lojinha", "produtos");

    const unsubscribe = onSnapshot(productsRef, (docSnap) => {
      if (docSnap.exists()) {
        setCategories(docSnap.data().categories || {});
      } else {
        setCategories({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar estoque:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStockInputChange = (categoryName, productName, variantIndex, value) => {
    setAdditionalStocks({
      ...additionalStocks,
      [`${categoryName}-${productName}-${variantIndex}`]: value,
    });
  };

  const handleAddStock = async (categoryName, productName, variantIndex) => {
    const additionalStock = parseInt(additionalStocks[`${categoryName}-${productName}-${variantIndex}`]) || 0;
    if (additionalStock <= 0) return; // Evita adicionar valores inválidos

    const productsRef = doc(db, "lojinha", "produtos");

    try {
      const updatedCategories = { ...categories };
      const product = updatedCategories[categoryName].products[productName];
      const currentStock = product.variants[variantIndex].stock || 0;
      
      // Soma o estoque adicional ao existente
      product.variants[variantIndex].stock = currentStock + additionalStock;
      
      // Atualiza o estoque total do produto
      product.stock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);

      await updateDoc(productsRef, { categories: updatedCategories });
      setCategories(updatedCategories);
      setAdditionalStocks({
        ...additionalStocks,
        [`${categoryName}-${productName}-${variantIndex}`]: "", // Limpa o input
      });
    } catch (error) {
      console.error("Erro ao adicionar estoque:", error);
    }
  };

  const filteredCategories = loading || !categories
    ? []
    : Object.entries(categories)
        .map(([categoryName, categoryData]) => ({
          title: categoryName,
          products: Object.entries(categoryData.products || {}).map(([productName, productData]) => ({
            name: productName,
            ...productData,
          })),
        }))
        .filter((category) =>
          category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.products.some((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );

  if (loading) return <div className="loading-spinner">Carregando estoque...</div>;

  return (
    <div className="stock-management-container">
      <h2>Gerenciamento de Estoque</h2>
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
                  {category.products.map((product) =>
                    product.variants.map((variant, idx) => (
                      <tr key={`${product.name}-${idx}`}>
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
                            value={additionalStocks[`${category.title}-${product.name}-${idx}`] || ""}
                            onChange={(e) => handleStockInputChange(category.title, product.name, idx, e.target.value)}
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
                    ))
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