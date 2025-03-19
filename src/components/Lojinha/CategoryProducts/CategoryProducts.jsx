import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { FiShare2 } from "react-icons/fi";
import "./CategoryProducts.css";

const CategoryProducts = () => {
  const { categoryKey } = useParams();
  const [category, setCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    const productsRef = doc(db, "lojinha", "produtos");

    const unsubscribe = onSnapshot(productsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const categories = data.categories || {};
        const firestoreCategoryKey = categoryKey.replace(/-/g, " ");

        if (categories[firestoreCategoryKey]) {
          const productsArray = Object.entries(categories[firestoreCategoryKey].products || {}).map(
            ([productName, productData]) => ({
              name: productName,
              ...productData,
            })
          );
          setCategory({ title: firestoreCategoryKey, products: productsArray });
        } else {
          setCategory(null);
        }
      } else {
        setCategory(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar produtos:", error);
      setCategory(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [categoryKey]);

  const filteredProducts = loading || !category
    ? []
    : category.products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const visibleProducts = expanded ? filteredProducts : filteredProducts.slice(0, 2);

  const toggleExpansion = () => {
    setExpanded((prev) => !prev);
  };

  const calculateOriginalPrice = (price, discountPercentage) => {
    if (discountPercentage > 0) {
      return (price / (1 - discountPercentage / 100)).toFixed(2);
    }
    return price.toFixed(2);
  };

  const shareCategoryLink = () => {
    const categoryUrl = `${window.location.origin}/lojinha/produtos/${categoryKey}`;
    navigator.clipboard.writeText(categoryUrl).then(() => {
      setCopySuccess("Link copiado!");
      setTimeout(() => setCopySuccess(""), 2000);
    }).catch((err) => {
      console.error("Erro ao copiar o link:", err);
      setCopySuccess("Erro ao copiar.");
    });
  };

  if (loading) return <div className="loading">Carregando produtos...</div>;
  if (!category) return <div className="not-found">Categoria '{categoryKey.replace(/-/g, " ")}' não encontrada.</div>;

  return (
    <div className="category-products-container">
      <div className="category-header">
        <h1>{category.title}</h1>
        <button className="share-btn" onClick={shareCategoryLink} title="Compartilhar categoria">
          <FiShare2 />
        </button>
      </div>
      {copySuccess && <span className="copy-feedback">{copySuccess}</span>}
      <section className="search-bar">
        <input
          type="text"
          placeholder={`Pesquisar em ${category.title}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </section>

      <section className="category-products-list">
        {filteredProducts.length === 0 ? (
          <p className="no-products">Nenhum produto encontrado nesta categoria.</p>
        ) : (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <Link
                key={product.name}
                to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
                className="product-item-link"
              >
                <div className="product-item">
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                  {product.discountPercentage > 0 && (
                    <span className="discount-tag">{product.discountPercentage}% OFF</span>
                  )}
                  <p className="product-name">{product.name}</p>
                  <div className="price-container">
                    {product.discountPercentage > 0 && (
                      <span className="original-price">
                        R${calculateOriginalPrice(product.price || 0, product.discountPercentage)}
                      </span>
                    )}
                    <span className="current-price">R${(product.price || 0).toFixed(2)}</span>
                  </div>
                  {product.description && (
                    <p className="product-description-preview">{product.description}</p>
                  )}
                  <button className="view-product-btn">Mais Detalhes</button>
                </div>
              </Link>
            ))}
          </div>
        )}
        {filteredProducts.length > 2 && (
          <button className="see-more-btn" onClick={toggleExpansion}>
            {expanded ? "Ver menos" : "Ver mais"}
          </button>
        )}
      </section>
    </div>
  );
};

export default CategoryProducts;