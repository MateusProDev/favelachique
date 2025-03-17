import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import "./Products.css";

const Products = () => {
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = doc(db, "lojinha", "produtos");

    const unsubscribe = onSnapshot(productsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Dados carregados do Firestore em Products:", data);
        setCategories(data.categories || {});
      } else {
        console.log("Documento 'produtos' não encontrado em 'lojinha'");
        setCategories({});
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      setCategories({});
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredCategories = loading || !categories
    ? []
    : Object.entries(categories)
        .map(([categoryName, categoryData]) => {
          const productsArray = Object.entries(categoryData.products || {}).map(([productName, productData]) => ({
            name: productName,
            ...productData,
          }));
          const filteredProducts = productsArray.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categoryName.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return {
            title: categoryName,
            products: filteredProducts,
          };
        })
        .filter((category) => category.products.length > 0);

  const toggleCategoryExpansion = (categoryTitle) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  if (loading) return <div>Carregando produtos...</div>;

  return (
    <div className="products-container">
      <h1>Todos os Produtos</h1>
      <section className="search-bar">
        <input
          type="text"
          placeholder="Pesquisar produtos por nome ou categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      <section className="products-list">
        {filteredCategories.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.title];
            const visibleProducts = isExpanded ? category.products : category.products.slice(0, 2);

            return (
              <div key={category.title} className="category-section">
                <h2>{category.title}</h2>
                <div className="product-grid">
                  {visibleProducts.map((product) => (
                    <Link
                      key={product.name}
                      to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
                      className="product-item-link"
                    >
                      <div className="product-item">
                        <img src={product.imageUrl} alt={product.name} className="product-image" />
                        <p>{product.name} - R${product.price.toFixed(2)}</p>
                        {product.description && (
                          <p className="product-description-preview">{product.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
                {category.products.length > 2 && (
                  <button
                    className="see-more-btn"
                    onClick={() => toggleCategoryExpansion(category.title)}
                  >
                    {isExpanded ? "Ver menos" : "Ver mais"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default Products;