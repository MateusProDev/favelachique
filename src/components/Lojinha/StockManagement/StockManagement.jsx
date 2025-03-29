import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import "./StockManagement.css";

const StockManagement = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [additionalStocks, setAdditionalStocks] = useState({});
  const [removeStocks, setRemoveStocks] = useState({});
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

  const handleStockInputChange = (key, value, type) => {
    if (type === "add") {
      setAdditionalStocks({ ...additionalStocks, [key]: value });
    } else {
      setRemoveStocks({ ...removeStocks, [key]: value });
    }
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

  const handleRemoveStock = async (categoryName, productName, variantIndex) => {
    const key = `${categoryName}-${productName}-${variantIndex}`;
    const removeStock = parseInt(removeStocks[key]) || 0;
    if (removeStock <= 0) {
      setError("Digite uma quantidade válida para remover.");
      return;
    }

    try {
      const productsRef = doc(db, "lojinha", "produtos");
      const updatedCategories = { ...categories };
      const product = updatedCategories[categoryName].products[productName];
      const currentStock = product.variants[variantIndex].stock || 0;

      if (currentStock < removeStock) {
        setError("Quantidade a remover excede o estoque atual.");
        return;
      }

      product.variants[variantIndex].stock = currentStock - removeStock;
      product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

      await updateDoc(productsRef, { categories: updatedCategories });
      setRemoveStocks({ ...removeStocks, [key]: "" });
      setError("");
    } catch (error) {
      console.error("Erro ao remover estoque:", error);
      setError("Erro ao remover estoque.");
    }
  };

  const handleDeleteProduct = async (categoryName, productName) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${productName}" da categoria "${categoryName}"?`)) return;

    try {
      const productsRef = doc(db, "lojinha", "produtos");
      const updatedCategories = { ...categories };
      delete updatedCategories[categoryName].products[productName];

      await updateDoc(productsRef, { categories: updatedCategories });
      setError("");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      setError("Erro ao excluir produto.");
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

  if (loading) return <div className="loading-message">Carregando estoque...</div>;

  return (
    <div className="stock-management">
      <h2 className="stock-management__title">Gerenciamento de Estoque</h2>
      {error && <div className="stock-management__error">{error}</div>}
      <div className="stock-management__search">
        <input
          type="text"
          placeholder="Pesquisar por categoria ou produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="stock-management__search-input"
        />
      </div>
      <div className="stock-list">
        {filteredCategories.length === 0 ? (
          <div className="stock-list__empty">Nenhum produto encontrado</div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.title} className="stock-category">
              <h3 className="stock-category__title">{category.title}</h3>
              <div className="stock-table-wrapper">
                <table className="stock-table">
                  <thead className="stock-table__head">
                    <tr className="stock-table__row">
                      <th className="stock-table__header">Imagem</th>
                      <th className="stock-table__header">Produto</th>
                      <th className="stock-table__header">Variante</th>
                      <th className="stock-table__header">Estoque Atual</th>
                      <th className="stock-table__header">Adicionar</th>
                      <th className="stock-table__header">Remover</th>
                      <th className="stock-table__header">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="stock-table__body">
                    {category.products.flatMap((product) =>
                      product.variants.map((variant, idx) => {
                        const key = `${category.title}-${product.name}-${idx}`;
                        return (
                          <tr key={key} className="stock-table__row">
                            <td className="stock-table__cell" data-label="Imagem">
                              <img src={product.imageUrl} alt={product.name} className="stock-image" />
                            </td>
                            <td className="stock-table__cell" data-label="Produto">{product.name}</td>
                            <td className="stock-table__cell" data-label="Variante">{variant.color} ({variant.size})</td>
                            <td className="stock-table__cell" data-label="Estoque Atual">{variant.stock || 0}</td>
                            <td className="stock-table__cell" data-label="Adicionar">
                              <input
                                type="number"
                                min="0"
                                value={additionalStocks[key] || ""}
                                onChange={(e) => handleStockInputChange(key, e.target.value, "add")}
                                placeholder="Ex: 2"
                                className="stock-input"
                              />
                              <button
                                onClick={() => handleAddStock(category.title, product.name, idx)}
                                className="stock-action-button stock-action-button--add"
                              >
                                Adicionar
                              </button>
                            </td>
                            <td className="stock-table__cell" data-label="Remover">
                              <input
                                type="number"
                                min="0"
                                value={removeStocks[key] || ""}
                                onChange={(e) => handleStockInputChange(key, e.target.value, "remove")}
                                placeholder="Ex: 1"
                                className="stock-input"
                              />
                              <button
                                onClick={() => handleRemoveStock(category.title, product.name, idx)}
                                className="stock-action-button stock-action-button--remove"
                              >
                                Remover
                              </button>
                            </td>
                            <td className="stock-table__cell stock-table__cell--actions" data-label="Ações">
                              <button
                                onClick={() => handleDeleteProduct(category.title, product.name)}
                                className="stock-action-button stock-action-button--delete"
                              >
                                Excluir Produto
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StockManagement;