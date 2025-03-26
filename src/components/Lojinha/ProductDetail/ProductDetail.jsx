import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaShareAlt, FaHeart, FaHome, FaList, FaPlus, FaMinus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { db, auth } from "../../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot } from "firebase/firestore";
import { useCart } from "../../../context/CartContext/CartContext";
import LojinhaHeader from "../LojinhaHeader/LojinhaHeader";
import "./ProductDetail.css";

const RegisterModal = ({ onClose, onRegister, rating, comment }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      setError("Por favor, preencha nome e WhatsApp.");
      return;
    }

    try {
      const userDoc = await addDoc(collection(db, "users"), {
        name,
        whatsapp,
        timestamp: new Date().toISOString(),
      });
      setSuccess("Cadastro realizado com sucesso!");
      setTimeout(() => {
        setSuccess("");
        onRegister({ id: userDoc.id, name, whatsapp }, rating, comment);
        onClose();
      }, 2000);
    } catch (err) {
      setError("Erro ao cadastrar. Tente novamente.");
      console.error(err);
    }
  };

  return (
    <div className="product-detail-register-modal-overlay">
      <div className="product-detail-register-modal">
        <h2>Cadastre-se para Comentar</h2>
        {error && <p className="product-detail-error">{error}</p>}
        {success && <p className="product-detail-success">{success}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="WhatsApp (ex: 5585991470709)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <button type="submit">Cadastrar</button>
          <button type="button" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { categoryKey, productKey } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { cart, addToCart, removeFromCart } = useCart();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "",
    deliveryOption: "",
    additionalNotes: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("5585991470709"); // Número padrão

  useEffect(() => {
    const firestoreCategoryKey = categoryKey.replace(/-/g, " ");
    const firestoreProductKey = productKey.replace(/-/g, " ");
    const productsRef = doc(db, "lojinha", "produtos");
    const productDetailRef = doc(db, "lojinha", `product-details-${firestoreCategoryKey}-${firestoreProductKey}`);

    const unsubscribeProducts = onSnapshot(productsRef, (productsDoc) => {
      if (productsDoc.exists()) {
        const categories = productsDoc.data().categories || {};
        const productData = categories[firestoreCategoryKey]?.products[firestoreProductKey];
        if (productData) {
          setProduct((prev) => ({
            name: firestoreProductKey,
            ...productData,
            likes: prev?.likes || [],
            ratings: prev?.ratings || [],
          }));
          if (productData.variants && productData.variants.length > 0 && !selectedVariant) {
            setSelectedVariant(productData.variants[0]);
          }
        } else {
          setError("Produto não encontrado em lojinha/produtos.");
        }
      } else {
        setError("Documento 'produtos' não encontrado.");
      }
      setLoading(false);
    }, (error) => {
      setError("Erro ao carregar os detalhes do produto de lojinha/produtos.");
      console.error(error);
      setLoading(false);
    });

    const fetchProductDetails = async () => {
      try {
        const productDoc = await getDoc(productDetailRef);
        if (productDoc.exists()) {
          const data = productDoc.data();
          setProduct((prev) => ({
            ...prev,
            likes: data.likes || [],
            ratings: data.ratings || [],
          }));
          if (auth.currentUser && data.likes?.includes(auth.currentUser.uid)) {
            setHasLiked(true);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar product-details:", error);
      }
    };

    fetchProductDetails();

    // Buscar número do WhatsApp
    const fetchWhatsAppNumber = async () => {
      const docRef = doc(db, "settings", "whatsapp");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPhoneNumber(docSnap.data().number || "5585991470709");
      }
    };
    fetchWhatsAppNumber();

    return () => unsubscribeProducts();
  }, [categoryKey, productKey]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product || !selectedVariant) {
      setError("Selecione uma variante para adicionar ao carrinho.");
      return;
    }
    if (selectedVariant.stock <= 0) {
      setError("Estoque esgotado para esta variante.");
      return;
    }

    const itemToAdd = {
      ...product,
      preco: selectedVariant.price || product.price || 0,
      nome: product.name,
      variant: selectedVariant,
    };
    addToCart(itemToAdd);
    setSuccess("Produto adicionado ao carrinho!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRatingSubmit = async () => {
    if (!rating || !comment) {
      setError("Por favor, selecione uma pontuação e adicione um comentário.");
      return;
    }

    if (!auth.currentUser) {
      setRegisterModalOpen(true);
      return;
    }

    const userId = auth.currentUser.uid;
    const userName = auth.currentUser.displayName || "Usuário Autenticado";

    const newRating = {
      userId,
      userName,
      stars: rating,
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      const firestoreCategoryKey = categoryKey.replace(/-/g, " ");
      const firestoreProductKey = productKey.replace(/-/g, " ");
      const productDetailRef = doc(db, "lojinha", `product-details-${firestoreCategoryKey}-${firestoreProductKey}`);
      const productDoc = await getDoc(productDetailRef);
      const currentRatings = productDoc.exists() && productDoc.data().ratings ? productDoc.data().ratings : [];
      const updatedRatings = [...currentRatings, newRating];

      await updateDoc(productDetailRef, { ratings: updatedRatings }, { merge: true });
      setProduct((prev) => ({ ...prev, ratings: updatedRatings }));
      setRating(0);
      setComment("");
      setSuccess("Avaliação enviada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Erro ao enviar avaliação.");
      console.error(error);
    }
  };

  const handleShareLink = () => {
    const link = `${window.location.origin}/produto/${categoryKey}/${productKey}`;
    if (navigator.share) {
      navigator
        .share({
          title: product?.name || "Produto",
          text: `Confira este produto: ${product?.name || "Produto"}`,
          url: link,
        })
        .then(() => console.log("Compartilhamento bem-sucedido"))
        .catch((error) => console.error("Erro ao compartilhar:", error));
    } else {
      navigator.clipboard
        .writeText(link)
        .then(() => alert("Link copiado para a área de transferência!"))
        .catch((error) => console.error("Erro ao copiar o link:", error));
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) {
      setRegisterModalOpen(true);
      return;
    }

    const userId = auth.currentUser.uid;
    const firestoreCategoryKey = categoryKey.replace(/-/g, " ");
    const firestoreProductKey = productKey.replace(/-/g, " ");
    const productDetailRef = doc(db, "lojinha", `product-details-${firestoreCategoryKey}-${firestoreProductKey}`);

    try {
      const productDoc = await getDoc(productDetailRef);
      const currentLikes = productDoc.exists() && productDoc.data().likes ? productDoc.data().likes : [];

      if (currentLikes.includes(userId)) {
        setError("Você já curtiu este produto.");
        return;
      }

      const updatedLikes = [...currentLikes, userId];
      await updateDoc(productDetailRef, { likes: updatedLikes }, { merge: true });
      setHasLiked(true);
      setSuccess("Produto curtido com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Erro ao curtir o produto.");
      console.error(error);
    }
  };

  const handleRegisterOpen = () => {
    setRegisterModalOpen(true);
  };

  const handleRegister = async (newUser, rating, comment) => {
    const userId = newUser.id;
    const userName = newUser.name;

    const newRating = {
      userId,
      userName,
      stars: rating,
      comment,
      timestamp: new Date().toISOString(),
    };

    try {
      const firestoreCategoryKey = categoryKey.replace(/-/g, " ");
      const firestoreProductKey = productKey.replace(/-/g, " ");
      const productDetailRef = doc(db, "lojinha", `product-details-${firestoreCategoryKey}-${firestoreProductKey}`);
      const productDoc = await getDoc(productDetailRef);
      const currentRatings = productDoc.exists() && productDoc.data().ratings ? productDoc.data().ratings : [];
      const updatedRatings = [...currentRatings, newRating];

      await updateDoc(productDetailRef, { ratings: updatedRatings }, { merge: true });
      setProduct((prev) => ({ ...prev, ratings: updatedRatings }));
      setRating(0);
      setComment("");
      setSuccess("Avaliação enviada com sucesso!");
      setTimeout(() => setSuccess(""), 3000);

      const currentLikes = productDoc.exists() && productDoc.data().likes ? productDoc.data().likes : [];
      if (!currentLikes.includes(userId)) {
        const updatedLikes = [...currentLikes, userId];
        await updateDoc(productDetailRef, { likes: updatedLikes }, { merge: true });
        setHasLiked(true);
      }
    } catch (error) {
      setError("Erro ao enviar avaliação ou curtir.");
      console.error(error);
    }
  };

  const handleImageChange = (direction) => {
    const images = [product?.imageUrl, ...(product?.additionalImages || [])];
    if (direction === "next") {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
  };

  const handleCartToggle = () => setCartOpen(!isCartOpen);

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

    const consolidatedCart = cart.reduce((acc, item) => {
      const key = JSON.stringify({
        nome: item.nome,
        variant: item.variant ? { color: item.variant.color, size: item.variant.size } : null,
      });
      if (acc[key]) {
        acc[key].quantity += 1;
      } else {
        acc[key] = { ...item, quantity: 1 };
      }
      return acc;
    }, {});

    const message = Object.values(consolidatedCart)
      .map((item) => {
        const variantDetails = item.variant
          ? ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})`
          : "";
        return `${item.quantity}x ${item.nome}${variantDetails} - R$${(item.preco || item.price || 0) * item.quantity.toFixed(2)}`;
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

    const totalValue = cart.reduce((sum, item) => sum + (item.preco || item.price || 0), 0).toFixed(2);
    const whatsappMessage = `Desejo concluir meu pedido:\n\n${message}\n\nTotal: R$${totalValue}\n\n${deliveryInfo}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

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

  const handleCheckoutInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({ ...prev, [name]: value }));
  };

  const consolidatedCart = React.useMemo(() => {
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

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="product-detail-error">{error}</div>;

  const allImages = [product?.imageUrl, ...(product?.additionalImages || [])];

  return (
    <div className="product-detail">
      <LojinhaHeader cart={cart} onCartToggle={handleCartToggle} />
      <h1>{product?.name || "Produto"}</h1>
      {success && <p className="product-detail-success">{success}</p>}
      {error && <p className="product-detail-error">{error}</p>}
      <div className="product-detail-content">
        <div className="product-detail-image-gallery">
          <div className="product-detail-image-container">
            <img
              src={allImages[currentImageIndex]}
              alt={product?.name || "Produto"}
              className="product-detail-main-image"
            />
            <button
              className={`product-detail-like-btn ${hasLiked ? "liked" : ""}`}
              onClick={handleLike}
              disabled={hasLiked}
            >
              <FaHeart />
            </button>
          </div>
          <div className="product-detail-image-controls">
            <button onClick={() => handleImageChange("prev")}>◄</button>
            <button onClick={() => handleImageChange("next")}>►</button>
          </div>
          <div className="product-detail-thumbnail-gallery">
            {allImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product?.name || "Produto"} ${idx}`}
                className={`product-detail-thumbnail ${idx === currentImageIndex ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(idx)}
              />
            ))}
          </div>
        </div>
        <div className="product-detail-details">
          <p>{product?.description || "Sem descrição disponível"}</p>
          <div className="product-detail-price-info">
            <span className="product-detail-anchor-price">
              R${(product?.anchorPrice || 0).toFixed(2)}
            </span>
            <span className="product-detail-current-price">
              R${(selectedVariant?.price || product?.price || 0).toFixed(2)}
            </span>
            {product?.discountPercentage > 0 && (
              <span className="product-detail-discount">{product.discountPercentage}% OFF</span>
            )}
          </div>

          <div className="product-detail-stock-info">
            <h3>Estoque Disponível</h3>
            {product?.variants && product.variants.length > 0 ? (
              <div className="stock-details">
                {product.variants.map((variant, idx) => (
                  <p key={idx} className={selectedVariant === variant ? "selected-stock" : ""}>
                    {variant.color} ({variant.size}): <strong>{variant.stock || 0}</strong> unidades
                  </p>
                ))}
                <p className="total-stock">
                  Total no estoque: <strong>{product.stock || 0}</strong> unidades
                </p>
              </div>
            ) : (
              <p>
                Total no estoque: <strong>{product?.stock || 0}</strong> unidades
              </p>
            )}
          </div>

          {product?.variants && product.variants.length > 0 && (
            <div className="product-detail-variants-section">
              <h3>Escolha uma variante:</h3>
              <div className="product-detail-variant-options">
                {product.variants.map((variant, index) => (
                  <label key={index} className="product-detail-variant-label">
                    <input
                      type="radio"
                      name="variant"
                      checked={
                        selectedVariant &&
                        selectedVariant.color === variant.color &&
                        selectedVariant.size === variant.size
                      }
                      onChange={() => handleVariantChange(variant)}
                      disabled={variant.stock <= 0}
                    />
                    <span>
                      Cor: {variant.color}, Tamanho: {variant.size} ({variant.stock} disponíveis)
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="product-detail-add-to-cart"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant?.stock <= 0}
          >
            Adicionar ao Carrinho
          </button>
          <button className="product-detail-share-btn" onClick={handleShareLink} title="Compartilhar">
            <FaShareAlt />
          </button>
        </div>
      </div>

      <div className="product-detail-ratings-section">
        <h2>Avaliações</h2>
        {product?.ratings && product.ratings.length > 0 ? (
          product.ratings.map((r, idx) => (
            <div key={idx} className="product-detail-rating">
              <div className="product-detail-stars">
                {"★".repeat(r.stars)}
                {"☆".repeat(5 - r.stars)}
              </div>
              <p>{r.comment}</p>
              <small>
                {new Date(r.timestamp).toLocaleString()} - {r.userName}
              </small>
            </div>
          ))
        ) : (
          <p>Sem avaliações ainda.</p>
        )}

        <div className="product-detail-rating-form">
          <h3>Deixe sua Avaliação</h3>
          <div className="product-detail-star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`product-detail-star ${star <= rating ? "filled" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            placeholder="Escreva seu comentário..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleRatingSubmit}>Enviar Avaliação</button>
          {!auth.currentUser && (
            <button className="product-detail-register-btn" onClick={handleRegisterOpen}>
              Cadastrar
            </button>
          )}
        </div>
      </div>

      <section className={`carinho_compras ${isCartOpen ? "open" : ""}`}>
        <div className="carrinho-header">
          <h2 id="titleCar">Sacola de Compras</h2>
          <button className="close-cart-btn" onClick={handleCartToggle}>
            X
          </button>
        </div>
        <div className="cart-navigation">
          <a href="/lojinha" className="cart-nav-link">
            <FaHome /> Home
          </a>
          <a href="/lojinha/produtos" className="cart-nav-link">
            <FaList /> Categorias
          </a>
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
                  <button
                    className="quantity-btn"
                    onClick={() => handleAddToCart({ preventDefault: () => {}, ...item })}
                  >
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
            <strong>Total:</strong> R$
            {cart.reduce((sum, item) => sum + (item.preco || item.price || 0), 0).toFixed(2)}
          </p>
          {cart.length > 0 && (
            <button className="btnCar" onClick={handleOpenCheckoutModal}>
              Finalizar via WhatsApp
            </button>
          )}
        </div>
      </section>

      {isRegisterModalOpen && (
        <RegisterModal
          onClose={() => setRegisterModalOpen(false)}
          onRegister={handleRegister}
          rating={rating}
          comment={comment}
        />
      )}

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
    </div>
  );
};

export default ProductDetail;