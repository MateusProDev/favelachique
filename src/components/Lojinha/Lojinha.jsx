import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FiShoppingBag } from "react-icons/fi";
import { FaUser, FaHome, FaList } from "react-icons/fa";
import { db } from "../../firebase/firebaseConfig";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import Footer from "../../components/Footer/Footer";
import LojinhaHeader from "./LojinhaHeader/LojinhaHeader";
import BannerRotativo from "./BannerRotativo/BannerRotativo";
import WhatsAppLojinhaButton from "../WhatsAppLojinhaButton/WhatsAppLojinhaButton";
import { useCart } from "../../context/CartContext/CartContext";
import "./Lojinha.css";

const Lojinha = () => {
  const { cart, total, removeFromCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { categoria } = useParams();

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
      console.error("Erro ao carregar produtos:", error);
      setCategories({});
      setLoading(false);
    });

    const fetchWhatsAppNumber = async () => {
      const docRef = doc(db, "settings", "whatsapp");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPhoneNumber(docSnap.data().number || "5585991470709");
      }
    };
    fetchWhatsAppNumber();

    return () => unsubscribe();
  }, []);

  const handleCartToggle = () => setCartOpen(!isCartOpen);

  const handleFinalizePurchaseWhatsApp = async () => {
    const message = cart
      .map((item) => {
        const variantDetails = item.variant ? ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})` : "";
        return `${item.nome}${variantDetails} - R$${(item.preco || item.price || 0).toFixed(2)}`;
      })
      .join("\n");
    const totalValue = total.toFixed(2);
    const whatsappMessage = `Desejo concluir meu pedido:\n\n${message}\n\nTotal: R$${totalValue}\n\nPreencha as informações:\n\nNome:\nEndereço:\nForma de pagamento:\nPix, Débito, Crédito`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

    await recordSaleAndUpdateStock(cart, totalValue);

    window.open(whatsappUrl, "_blank");
  };

  const recordSaleAndUpdateStock = async (cartItems, totalValue) => {
    const productsRef = doc(db, "lojinha", "produtos");
    const salesRef = doc(db, "lojinha", "sales");
    const timestamp = new Date().toISOString();

    try {
      const productsSnap = await getDoc(productsRef);
      const salesSnap = await getDoc(salesRef);
      const productsData = productsSnap.exists() ? productsSnap.data().categories : {};
      let salesData = salesSnap.exists() ? salesSnap.data().sales || [] : [];

      cartItems.forEach((item) => {
        const category = Object.keys(productsData).find((cat) =>
          productsData[cat].products[item.nome]
        );
        if (category && productsData[category].products[item.nome]) {
          const product = productsData[category].products[item.nome];
          const variantIndex = product.variants.findIndex(
            (v) => v.color === item.variant?.color && v.size === item.variant?.size
          );
          if (variantIndex !== -1 && product.variants[variantIndex].stock > 0) {
            product.variants[variantIndex].stock -= 1;
            product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          }
        }
      });

      const sale = {
        items: cartItems.map((item) => ({
          name: item.nome,
          quantity: 1,
          variant: item.variant ? { color: item.variant.color, size: item.variant.size, price: item.preco || item.price } : null,
        })),
        total: parseFloat(totalValue),
        timestamp,
      };
      salesData.push(sale);

      await updateDoc(productsRef, { categories: productsData });
      await updateDoc(salesRef, { sales: salesData });
      console.log("Venda registrada e estoque atualizado!");
    } catch (error) {
      console.error("Erro ao registrar venda ou atualizar estoque:", error);
    }
  };

  const getInitialVisibleCount = () => {
    if (window.innerWidth >= 1200) return 5;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const [initialVisibleCount, setInitialVisibleCount] = useState(getInitialVisibleCount());

  useEffect(() => {
    const handleResize = () => setInitialVisibleCount(getInitialVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
        .filter((category) =>
          categoria
            ? category.title.toLowerCase() === categoria.toLowerCase()
            : category.products.length > 0 || category.title === "Destaque"
        );

  const toggleCategoryExpansion = (categoryTitle) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryTitle]: !prev[categoryTitle],
    }));
  };

  const calculateOriginalPrice = (price, discountPercentage) => {
    if (discountPercentage > 0) {
      return (price / (1 - discountPercentage / 100)).toFixed(2);
    }
    return price.toFixed(2);
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="lojinhaContainer">
      <LojinhaHeader logo="/logo.png" title="Bem-vindo à Lojinha" />
      <div className="boxCar" onClick={handleCartToggle}>
        <FiShoppingBag className="cartIcon" />
        {cart.length > 0 && <span className="cartCount">{cart.length}</span>}
      </div>
      <BannerRotativo />
      <div className="lojaFlex">
        <main className="mainContent">
          <section className="search-bar">
            <input
              type="text"
              placeholder="Pesquisar produtos por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </section>

          <section className="categories">
            <h2>Categorias</h2>
            <div className="categoryList">
              {Object.keys(categories).map((cat, index) => (
                <Link key={index} to={`/lojinha/produtos/${cat.replace(/\s+/g, "-")}`}>
                  {cat}
                </Link>
              ))}
            </div>
          </section>

          <section className="products">
            {filteredCategories.length === 0 ? (
              <p>Nenhum produto encontrado.</p>
            ) : (
              filteredCategories.map((category) => {
                const isExpanded = expandedCategories[category.title];
                const visibleProducts = isExpanded ? category.products : category.products.slice(0, initialVisibleCount);

                return (
                  <div key={category.title} className="category-section">
                    <h2>
                      {categoria ? category.title : category.title === "Destaque" ? "Produtos em Destaque" : category.title}
                    </h2>
                    {category.title === "Destaque" && !categoria ? (
                      <div className="highlightCarouselWrapper">
                        <div className="highlightCarousel">
                          {category.products.concat(category.products).map((product, productIndex) => (
                            <div key={`${productIndex}-${category.title}`} className="productItemDestaque">
                              <img src={product.imageUrl} alt={product.name} className="productImageDestaque" />
                              {product.discountPercentage > 0 && (
                                <span className="discount-tag">{product.discountPercentage}% OFF</span>
                              )}
                              <p className="productName">{product.name}</p>
                              <div className="price-container">
                                {product.discountPercentage > 0 && (
                                  <span className="original-price">
                                    R${calculateOriginalPrice(product.price || 0, product.discountPercentage)}
                                  </span>
                                )}
                                <span className="current-price">R${(product.price || 0).toFixed(2)}</span>
                              </div>
                              <p className={`stock-info ${product.stock > 5 ? 'high' : product.stock > 0 ? 'low' : 'out'}`}>
                                Estoque: {product.stock || 0} disponível
                              </p>
                              {product.description && (
                                <p className="product-description-preview">{product.description}</p>
                              )}
                              <Link
                                to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
                                className="view-product-btn"
                              >
                                Mais Detalhes
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="productList">
                        {visibleProducts.length === 0 ? (
                          <p>Nenhum produto disponível nesta categoria.</p>
                        ) : (
                          visibleProducts.map((product) => (
                            <Link
                              key={product.name}
                              to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
                              className="product-item-link"
                            >
                              <div className="productItem">
                                <img src={product.imageUrl} alt={product.name} className="productImage" />
                                {product.discountPercentage > 0 && (
                                  <span className="discount-tag">{product.discountPercentage}% OFF</span>
                                )}
                                <p>{product.name}</p>
                                <div className="price-container">
                                  {product.discountPercentage > 0 && (
                                    <span className="original-price">
                                      R${calculateOriginalPrice(product.price || 0, product.discountPercentage)}
                                    </span>
                                  )}
                                  <span className="current-price">R${(product.price || 0).toFixed(2)}</span>
                                </div>
                                <p className={`stock-info ${product.stock > 5 ? 'high' : product.stock > 0 ? 'low' : 'out'}`}>
                                  {product.stock || 0} disponível
                                </p>
                                {product.description ? (
                                  <p className="product-description-preview">{product.description}</p>
                                ) : (
                                  <p className="noDescription">Descrição não disponível</p>
                                )}
                                <button className="view-product-btn">Mais Detalhes</button>
                              </div>
                            </Link>
                          ))
                        )}
                        {category.products.length > initialVisibleCount && (
                          <button
                            className="see-more-btn"
                            onClick={() => toggleCategoryExpansion(category.title)}
                          >
                            {isExpanded ? "Ver menos" : "Ver mais"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <section className={`carinho_compras ${isCartOpen ? "open" : ""}`}>
            <h2 id="titleCar">Sacola</h2>
            <div className="cart-navigation">
              <Link to="/lojinha" className="cart-nav-link">
                <FaHome /> Home
              </Link>
              <Link to="/lojinha/produtos" className="cart-nav-link">
                <FaList /> Categorias
              </Link>
            </div>
            <div className="carrinhoItens">
              {cart.length === 0 ? (
                <p>Sua sacola está vazia</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="cartItem">
                    <span className="carTl">
                      {item.nome}
                      {item.variant ? ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})` : ""} - R$
                      {(item.preco || item.price || 0).toFixed(2)}
                    </span>
                    <button className="removeItem" onClick={() => removeFromCart(index)}>X</button>
                  </div>
                ))
              )}
            </div>
            <div className="totalCarrinho">
              <p><strong>Total:</strong> R${total.toFixed(2)}</p>
              {cart.length > 0 && (
                <div className="checkout-buttons">
                  <button className="btnCar whatsapp-btn" onClick={handleFinalizePurchaseWhatsApp}>
                    Finalizar via WhatsApp
                  </button>
                </div>
              )}
            </div>
            <div className="cartLoginAdmin">
              <Link to="/loja/login" className="adminLink">
                <FaUser /> Painel Administrativo
              </Link>
            </div>
          </section>
        </main>
      </div>
      <WhatsAppLojinhaButton phoneNumber={phoneNumber} />
      <Footer />
    </div>
  );
};

export default Lojinha;