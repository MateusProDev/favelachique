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

  if (loading) return <div className="category-loading">Carregando produtos...</div>;
  if (!category) return <div className="category-not-found">Categoria '{categoryKey.replace(/-/g, " ")}' não encontrada.</div>;

  return (
    <div className="category-products-container">
      <div className="category-header">
        <h1 className="category-header-title">{category.title}</h1>
        <button className="category-share-btn" onClick={shareCategoryLink} title="Compartilhar categoria">
          <FiShare2 />
        </button>
      </div>
      {copySuccess && <span className="category-copy-feedback">{copySuccess}</span>}
      <section className="category-search-bar">
        <input
          type="text"
          placeholder={`Pesquisar em ${category.title}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="category-search-input"
        />
      </section>

      <section className="category-products-list">
        {filteredProducts.length === 0 ? (
          <p className="category-no-products">Nenhum produto encontrado nesta categoria.</p>
        ) : (
          <>
            <div className="category-product-grid">
              {visibleProducts.map((product) => (
                <Link
                  key={product.name}
                  to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
                  className="category-product-item-link"
                >
                  <div className="category-product-item">
                    <div className="category-product-image-container">
                      <img src={product.imageUrl} alt={product.name} className="category-product-image" />
                      {product.discountPercentage > 0 && (
                        <span className="category-discount-tag">{product.discountPercentage}% OFF</span>
                      )}
                    </div>
                    <div className="category-product-content">
                      <p className="category-product-name">{product.name}</p>
                      {product.description && (
                        <p className="category-product-description-preview">{product.description}</p>
                      )}
                      <div className="category-price-container">
                        {product.discountPercentage > 0 && (
                          <span className="category-original-price">
                            R${calculateOriginalPrice(product.price || 0, product.discountPercentage)}
                          </span>
                        )}
                        <span className="category-current-price">R${(product.price || 0).toFixed(2)}</span>
                      </div>
                      <button className="category-view-product-btn">Mais Detalhes</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredProducts.length > 2 && (
              <button className="category-see-more-btn" onClick={toggleExpansion}>
                {expanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CategoryProducts;