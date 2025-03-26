import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { FaUser, FaHome, FaList, FaPlus, FaMinus } from "react-icons/fa";
import { db } from "../../firebase/firebaseConfig";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import Footer from "../../components/Footer/Footer";
import LojinhaHeader from "./LojinhaHeader/LojinhaHeader";
import BannerRotativo from "./BannerRotativo/BannerRotativo";
import WhatsAppLojinhaButton from "../WhatsAppLojinhaButton/WhatsAppLojinhaButton";
import { useCart } from "../../context/CartContext/CartContext";
import "./Lojinha.css";

const Lojinha = () => {
  const { cart, total, addToCart, removeFromCart } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [categories, setCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { categoria } = useParams();

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "",
    deliveryOption: "",
    additionalNotes: "",
  });
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const consolidatedCart = useMemo(() => {
    const consolidated = {};
    cart.forEach((item) => {
      const key = JSON.stringify({
        nome: item.nome,
        variant: item.variant ? { color: item.variant.color, size: item.variant.size } : null,
      });

      if (consolidated[key]) {
        consolidated[key].quantity += 1;
      } else {
        consolidated[key] = { ...item, quantity: 1 };
      }
    });
    return Object.values(consolidated);
  }, [cart]);

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

  const handleCheckoutInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenCheckoutModal = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleFinalizePurchaseWhatsApp = async () => {
    const requiredFields = ["name", "phone", "address", "paymentMethod", "deliveryOption"];
    const missingFields = requiredFields.filter((field) => !checkoutForm[field]);

    if (missingFields.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios: ${missingFields.join(", ")}`);
      return;
    }

    const message = consolidatedCart
      .map((item) => {
        const variantDetails = item.variant
          ? ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})`
          : "";
        return `${item.quantity}x ${item.nome}${variantDetails} - R$${(
          (item.preco || item.price || 0) * item.quantity
        ).toFixed(2)}`;
      })
      .join("\n");

    const deliveryInfo = `
-------------------
INFORMAÇÕES DE ENTREGA
Nome: ${checkoutForm.name}
Telefone: ${checkoutForm.phone}
Endereço: ${checkoutForm.address}
Forma de Pagamento: ${checkoutForm.paymentMethod}
Opção de Entrega: ${checkoutForm.deliveryOption}
Observações: ${checkoutForm.additionalNotes || "Sem observações"}
-------------------
Frete a calcular`;

    const totalValue = total.toFixed(2);
    const whatsappMessage = `Desejo concluir meu pedido:\n\n${message}\n\nTotal: R$${totalValue}\n\n${deliveryInfo}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      whatsappMessage
    )}`;

    await recordSaleAndUpdateStock(consolidatedCart, totalValue);

    window.open(whatsappUrl, "_blank");
    setIsCheckoutModalOpen(false);
    setCheckoutForm({
      name: "",
      phone: "",
      address: "",
      paymentMethod: "",
      deliveryOption: "",
      additionalNotes: "",
    });
  };

  const handleCartToggle = () => setCartOpen(!isCartOpen);

  const handleAddItem = (item) => {
    addToCart(item);
  };

  const handleRemoveItem = (item) => {
    const indicesToRemove = cart.reduce((acc, cartItem, idx) => {
      if (
        cartItem.nome === item.nome &&
        (!item.variant || !cartItem.variant
          ? !item.variant && !cartItem.variant
          : JSON.stringify(cartItem.variant) === JSON.stringify(item.variant))
      ) {
        acc.push(idx);
      }
      return acc;
    }, []);
    if (indicesToRemove.length > 0) {
      removeFromCart(indicesToRemove[0]);
    }
  };

  const handleRemoveAll = (item) => {
    const indicesToRemove = cart.reduce((acc, cartItem, idx) => {
      if (
        cartItem.nome === item.nome &&
        (!item.variant || !cartItem.variant
          ? !item.variant && !cartItem.variant
          : JSON.stringify(cartItem.variant) === JSON.stringify(item.variant))
      ) {
        acc.push(idx);
      }
      return acc;
    }, []);
    indicesToRemove.reverse().forEach(removeFromCart);
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
          if (variantIndex !== -1 && product.variants[variantIndex].stock >= item.quantity) {
            product.variants[variantIndex].stock -= item.quantity;
            product.stock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
          } else {
            console.warn(`Estoque insuficiente para ${item.nome}`);
          }
        }
      });

      const sale = {
        items: cartItems.map((item) => ({
          name: item.nome,
          quantity: item.quantity,
          variant: item.variant
            ? { color: item.variant.color, size: item.variant.size, price: item.preco || item.price }
            : null,
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
      <LojinhaHeader cart={cart} onCartToggle={handleCartToggle} />
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
                const visibleProducts = isExpanded
                  ? category.products
                  : category.products.slice(0, initialVisibleCount);

                return (
                  <div key={category.title} className="category-section">
                    <h2>
                      {categoria
                        ? category.title
                        : category.title === "Destaque"
                        ? "Produtos em Destaque"
                        : category.title}
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
                              <p
                                className={`stock-info ${
                                  product.stock > 5 ? "high" : product.stock > 0 ? "low" : "out"
                                }`}
                              >
                                Estoque: {product.stock || 0} disponível
                              </p>
                              {product.description && (
                                <p className="product-description-preview">{product.description}</p>
                              )}
                              <Link
                                to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(
                                  /\s+/g,
                                  "-"
                                )}`}
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
                              to={`/produto/${category.title.replace(/\s+/g, "-")}/${product.name.replace(
                                /\s+/g,
                                "-"
                              )}`}
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
                                <p
                                  className={`stock-info ${
                                    product.stock > 5 ? "high" : product.stock > 0 ? "low" : "out"
                                  }`}
                                >
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

          {isCheckoutModalOpen && (
            <div className="checkout-modal">
              <div className="checkout-modal-content">
                <h2>Finalizar Compra</h2>
                <form>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nome Completo *"
                    value={checkoutForm.name}
                    onChange={handleCheckoutInputChange}
                    required
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefone *"
                    value={checkoutForm.phone}
                    onChange={handleCheckoutInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Endereço Completo *"
                    value={checkoutForm.address}
                    onChange={handleCheckoutInputChange}
                    required
                  />
                  <select
                    name="paymentMethod"
                    value={checkoutForm.paymentMethod}
                    onChange={handleCheckoutInputChange}
                    required
                  >
                    <option value="">Selecione a Forma de Pagamento *</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                  <select
                    name="deliveryOption"
                    value={checkoutForm.deliveryOption}
                    onChange={handleCheckoutInputChange}
                    required
                  >
                    <option value="">Selecione a Opção de Entrega *</option>
                    <option value="Retirada Local">Retirada no Local</option>
                    <option value="Correios">Correios</option>
                    <option value="Transportadora">Transportadora</option>
                    <option value="Entrega Própria">Entrega Própria</option>
                  </select>
                  <textarea
                    name="additionalNotes"
                    placeholder="Observações adicionais (opcional)"
                    value={checkoutForm.additionalNotes}
                    onChange={handleCheckoutInputChange}
                  />
                  <div className="checkout-modal-actions">
                    <button type="button" onClick={() => setIsCheckoutModalOpen(false)}>
                      Cancelar
                    </button>
                    <button type="button" onClick={handleFinalizePurchaseWhatsApp}>
                      Confirmar Pedido
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <section className={`carinho_compras ${isCartOpen ? "open" : ""}`}>
            <div className="carrinho-header">
              <h2 id="titleCar">Sacola de Compras</h2>
              <button className="close-cart-btn" onClick={handleCartToggle}>X</button>
            </div>
            <div className="cart-navigation">
              <Link to="/lojinha" className="cart-nav-link">
                <FaHome /> Home
              </Link>
              <Link to="/lojinha/produtos" className="cart-nav-link">
                <FaList /> Categorias
              </Link>
            </div>
            <div className="carrinhoItens">
              {consolidatedCart.length === 0 ? (
                <p className="empty-cart">Sua sacola está vazia</p>
              ) : (
                consolidatedCart.map((item, index) => (
                  <div key={index} className="cartItem">
                    <div className="cartItem-details">
                      <span className="carTl">
                        {item.nome}
                        {item.variant
                          ? ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})`
                          : ""}
                      </span>
                      <span className="cartItem-price">
                        R${((item.preco || item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="cartItem-actions">
                      <button className="quantity-btn" onClick={() => handleRemoveItem(item)}>
                        <FaMinus />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button className="quantity-btn" onClick={() => handleAddItem(item)}>
                        <FaPlus />
                      </button>
                      <button className="removeItem" onClick={() => handleRemoveAll(item)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="totalCarrinho">
              <p>
                <strong>Total:</strong> R${total.toFixed(2)}
              </p>
              {cart.length > 0 && (
                <div className="checkout-buttons">
                  <button className="btnCar whatsapp-btn" onClick={handleOpenCheckoutModal}>
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