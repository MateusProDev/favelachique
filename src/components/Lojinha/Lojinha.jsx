import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { FiTrash2, FiSearch } from "react-icons/fi";
import { FaUser, FaHome, FaList, FaPlus, FaMinus, FaShoppingCart, FaStar } from "react-icons/fa";
import { db } from "../../firebase/firebaseConfig";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import Footer from "../../components/Footer/Footer";
import LojinhaHeader from "./LojinhaHeader/LojinhaHeader";
import BannerRotativo from "./BannerRotativo/BannerRotativo";
import WhatsAppLojinhaButton from "../WhatsAppLojinhaButton/WhatsAppLojinhaButton";
import { useCart } from "../../context/CartContext/CartContext";
import "./Lojinha.css";

const Lojinha = () => {
 const { cart, total, addToCart, removeFromCart, clearCart } = useCart();
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

 // Consolida itens iguais no carrinho
 const consolidatedCart = useMemo(() => {
 const consolidated = {};
 cart.forEach((item) => {
 const key = `${item.nome}-${item.variant ? JSON.stringify(item.variant) : "no-variant"}`;
 
 if (consolidated[key]) {
 consolidated[key].quantity += 1;
 consolidated[key].totalPrice += item.preco || item.price || 0;
 } else {
 consolidated[key] = { 
 ...item, 
 quantity: 1,
 totalPrice: item.preco || item.price || 0
 };
 }
 });
 return Object.values(consolidated);
 }, [cart]);

 // Carrega produtos e número do WhatsApp
 useEffect(() => {
 const productsRef = doc(db, "lojinha", "produtos");
 const unsubscribe = onSnapshot(productsRef, (docSnap) => {
 if (docSnap.exists()) {
 setCategories(docSnap.data().categories || {});
 } else {
 setCategories({});
 }
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

 // Filtra categorias e produtos
 const filteredCategories = useMemo(() => {
 if (loading || !categories) return [];
 
 return Object.entries(categories)
 .map(([categoryName, categoryData]) => {
 const productsArray = Object.entries(categoryData.products || {})
 .map(([productName, productData]) => ({
 id: `${categoryName}-${productName}`,
 name: productName,
 category: categoryName, // Add category to product data
 ...productData,
 }));
 
 const filteredProducts = productsArray.filter((product) =>
 product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
 categoryName.toLowerCase().includes(searchTerm.toLowerCase())
 );
 
 return {
 title: categoryName,
 imageUrl: categoryData.imageUrl,
 products: filteredProducts,
 };
 })
 .filter((category) =>
 categoria
 ? category.title.toLowerCase() === categoria.toLowerCase()
 : category.products.length > 0 || category.title === "Destaque"
 );
 }, [categories, loading, searchTerm, categoria]);

 // Manipulação do carrinho
 const handleAddItem = (item) => addToCart(item);
 const handleRemoveItem = (item) => removeFromCart(item);
 const handleRemoveAll = (item) => {
 const indices = cart.reduce((acc, cartItem, idx) => {
 if (cartItem.nome === item.nome && 
 JSON.stringify(cartItem.variant) === JSON.stringify(item.variant)) {
 acc.push(idx);
 }
 return acc;
 }, []);
 indices.reverse().forEach(idx => removeFromCart(idx));
 };

 // Finalização de compra
 const handleFinalizePurchase = async () => {
 const requiredFields = ["name", "phone", "address", "paymentMethod", "deliveryOption"];
 const missingFields = requiredFields.filter(field => !checkoutForm[field]);

 if (missingFields.length > 0) {
 alert(`Por favor, preencha: ${missingFields.join(", ")}`);
 return;
 }

 await recordSaleAndUpdateStock();
 
 const message = createWhatsAppMessage();
 const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
 
 window.open(whatsappUrl, "_blank");
 setIsCheckoutModalOpen(false);
 clearCart();
 resetCheckoutForm();
 };

 // Componente de Skeleton Loading
 const renderSkeletonLoader = (count = 6) => (
 <div className="productList">
 {Array.from({ length: count }).map((_, idx) => (
 <div key={idx} className="productItem skeleton">
 <div className="productImageContainer"></div>
 <div className="productContent">
 <div className="productName"></div>
 <div className="productDescription"></div>
 <div className="current-price"></div>
 </div>
 </div>
 ))}
 </div>
 );

 return (
 <div className="lojinhaContainer">
 <LojinhaHeader cart={cart} onCartToggle={() => setCartOpen(!isCartOpen)} />
 
 <BannerRotativo />
 
 <div className="lojaFlex">
 <main className="mainContent">
 {/* Barra de Pesquisa */}
 <section className="search-bar">
 <div className="search-input-container">
 <FiSearch className="search-icon" />
 <input
 type="text"
 placeholder="        Pesquisar produtos..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 </section>

 {/* Lista de Categorias */}
 <section className="categories">
 <h2 className="section-title">Nossas Categorias</h2>
 <div className="categoryList">
 {loading ? (
 Array.from({ length: 6 }).map((_, idx) => (
 <div key={idx} className="categoryItem skeleton">
 <div className="categoryPlaceholder"></div>
 <span className="categoryName"></span>
 </div>
 ))
 ) : (
 Object.entries(categories).map(([cat, catData], index) => (
 <Link 
 key={index} 
 to={`/lojinha/produtos/${cat.replace(/\s+/g, "-")}`} 
 className="categoryItem"
 >
 {catData.imageUrl ? (
 <img src={catData.imageUrl} alt={cat} className="categoryImage" />
 ) : (
 <div className="categoryPlaceholder">
 <FaShoppingCart />
 </div>
 )}
 <span className="categoryName">{cat}</span>
 </Link>
 ))
 )}
 </div>
 </section>

 {/* Lista de Produtos */}
 <section className="products">
 {loading ? (
 renderSkeletonLoader()
 ) : filteredCategories.length === 0 ? (
 <div className="empty-state">
 <img src="/empty-state.svg" alt="Nenhum produto encontrado" />
 <h3>Nenhum produto encontrado</h3>
 <p>Tente ajustar sua busca ou explorar outras categorias</p>
 </div>
 ) : (
 filteredCategories.map((category) => (
 <CategorySection 
 key={category.title}
 category={category}
 expandedCategories={expandedCategories}
 onToggleCategory={setExpandedCategories}
 handleAddItem={handleAddItem}
 />
 ))
 )}
 </section>
 </main>
 </div>

 {/* Carrinho de Compras */}
 <ShoppingCart
 isOpen={isCartOpen}
 onClose={() => setCartOpen(false)}
 cart={consolidatedCart}
 total={total}
 onAddItem={handleAddItem}
 onRemoveItem={handleRemoveItem}
 onRemoveAll={handleRemoveAll}
 onCheckout={() => setIsCheckoutModalOpen(true)}
 />

 {/* Modal de Checkout */}
 <CheckoutModal
 isOpen={isCheckoutModalOpen}
 onClose={() => setIsCheckoutModalOpen(false)}
 formData={checkoutForm}
 onFormChange={(e) => setCheckoutForm({
 ...checkoutForm,
 [e.target.name]: e.target.value
 })}
 onSubmit={handleFinalizePurchase}
 />

 <WhatsAppLojinhaButton phoneNumber={phoneNumber} />
 <Footer />
 </div>
 );
};

// Componente de Seção de Categoria
const CategorySection = ({ category, expandedCategories, onToggleCategory, handleAddItem }) => {
 const isExpanded = expandedCategories[category.title];
 const isHighlight = category.title === "Destaque";
 
 return (
 <div className={`category-section ${isHighlight ? 'highlight' : ''}`}>
 <h2 className="section-title">
 {isHighlight ? (
 <>
 <FaStar className="highlight-icon" /> Destaques
 </>
 ) : (
 category.title
 )}
 </h2>
 
 {isHighlight ? (
 <div className="highlightCarouselWrapper">
 <div className="highlightCarousel">
 {[...category.products, ...category.products].map((product, idx) => (
 <ProductCard 
 key={`${product.id}-${idx}`} 
 product={product} 
 isHighlight 
 onAddToCart={handleAddItem}
 />
 ))}
 </div>
 </div>
 ) : (
 <>
 <div className="productList">
 {category.products.slice(0, isExpanded ? undefined : 6).map(product => (
 <ProductCard 
 key={product.id} 
 product={product}
 onAddToCart={handleAddItem}
 />
 ))}
 </div>
 
 {category.products.length > 6 && (
 <button
 className="see-more-btn"
 onClick={() => onToggleCategory(prev => ({
 ...prev,
 [category.title]: !prev[category.title]
 }))}
 >
 {isExpanded ? 'Ver menos' : `Ver mais (${category.products.length - 6})`}
 </button>
 )}
 </>
 )}
 </div>
 );
};

// Componente de Card de Produto
const ProductCard = ({ product, isHighlight }) => {
 const hasDiscount = product.discountPercentage > 0;
 const originalPrice = hasDiscount 
 ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
 : null;

 return (
 <div className={`productItem ${isHighlight ? 'highlight' : ''}`}>
 <Link 
 to={`/produto/${product.category.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
 className="product-link"
 >
 <div className="productImageContainer">
 <img 
 src={product.imageUrl || '/product-placeholder.jpg'} 
 alt={product.name} 
 className="productImage"
 onError={(e) => {
 e.target.src = '/product-placeholder.jpg';
 }}
 />
 
 {hasDiscount && (
 <span className="discount-tag">{product.discountPercentage}% OFF</span>
 )}
 
 <span className={`stock-info ${getStockStatus(product.stock)}`}>
 {getStockMessage(product.stock)}
 </span>
 </div>
 </Link>

 <div className="productContent">
 <div className="productHeader">
 <h3 className="productName">{product.name}</h3>
 {product.isNew && <span className="new-badge">Novo</span>}
 </div>
 
 <div className="price-container">
 {hasDiscount && (
 <span className="original-price">R$ {originalPrice}</span>
 )}
 <span className="current-price">R$ {product.price.toFixed(2)}</span>
 </div>
 
 <p className="productDescription">
 {product.description || 'Descrição não disponível'}
 </p>
 
 <div className="productActions">
 <Link 
 to={`/produto/${product.category.replace(/\s+/g, "-")}/${product.name.replace(/\s+/g, "-")}`}
 className="add-to-cart-btn"
 >
 <FaShoppingCart /> Mais Detalhes
 </Link>
 </div>
 </div>
 </div>
 );
};

// Componente de Carrinho de Compras
const ShoppingCart = ({ isOpen, onClose, cart, total, onAddItem, onRemoveItem, onRemoveAll, onCheckout }) => {
 return (
 <div className={`carinho_compras ${isOpen ? 'open' : ''}`}>
 <div className="carrinho-header">
 <h2 id="titleCar">
 <FaShoppingCart /> Seu Carrinho
 </h2>
 <button className="close-cart-btn" onClick={onClose}>
 ×
 </button>
 </div>
 
 <div className="cart-navigation">
 <Link to="/lojinha" className="cart-nav-link" onClick={onClose}>
 <FaHome /> Home
 </Link>
 <Link to="/lojinha/produtos" className="cart-nav-link" onClick={onClose}>
 <FaList /> Categorias
 </Link>
 </div>
 
 <div className="carrinhoItens">
 {cart.length === 0 ? (
 <div className="empty-cart">
 <img src="/empty-cart.svg" alt="Carrinho vazio" />
 <h3>Seu carrinho está vazio</h3>
 <p>Adicione produtos para continuar</p>
 </div>
 ) : (
 cart.map((item, index) => (
 <div key={`${item.nome}-${index}`} className="cartItem">
 <div className="cartItem-image">
 <img 
 src={item.imageUrl || '/product-placeholder.jpg'} 
 alt={item.nome}
 onError={(e) => {
 e.target.src = '/product-placeholder.jpg';
 }}
 />
 </div>
 
 <div className="cartItem-details">
 <h4 className="carTl">{item.nome}</h4>
 {item.variant && (
 <p className="cartItem-variant">
 {item.variant.color && `Cor: ${item.variant.color}`}
 {item.variant.size && ` | Tamanho: ${item.variant.size}`}
 </p>
 )}
 <p className="cartItem-price">R$ {item.totalPrice.toFixed(2)}</p>
 
 <div className="cartItem-actions">
 <button 
 className="quantity-btn" 
 onClick={() => onRemoveItem(item)}
 >
 <FaMinus />
 </button>
 <span className="quantity">{item.quantity}</span>
 <button 
 className="quantity-btn" 
 onClick={() => onAddItem(item)}
 >
 <FaPlus />
 </button>
 <button 
 className="removeItem" 
 onClick={() => onRemoveAll(item)}
 >
 <FiTrash2 />
 </button>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 
 {cart.length > 0 && (
 <div className="totalCarrinho">
 <div className="cart-summary">
 <div className="cart-summary-row">
 <span>Subtotal</span>
 <span>R$ {total.toFixed(2)}</span>
 </div>
 <div className="cart-summary-row">
 <span>Frete</span>
 <span>A calcular</span>
 </div>
 <div className="cart-summary-row total">
 <span>Total</span>
 <span>R$ {total.toFixed(2)}</span>
 </div>
 </div>
 
 <button className="btnCar whatsapp-btn" onClick={onCheckout}>
 Finalizar Compra
 </button>
 </div>
 )}
 
 <div className="cartLoginAdmin">
 <Link to="/loja/login" className="adminLink">
 <FaUser /> Painel Administrativo
 </Link>
 </div>
 </div>
 );
};

// Componente de Modal de Checkout
const CheckoutModal = ({ isOpen, onClose, formData, onFormChange, onSubmit }) => {
 return (
 <div className={`checkout-modal ${isOpen ? 'active' : ''}`}>
 <div className="checkout-modal-content">
 <h2>Finalizar Compra</h2>
 
 <form onSubmit={(e) => {
 e.preventDefault();
 onSubmit();
 }}>
 <div className="form-group">
 <label>Nome Completo *</label>
 <input
 type="text"
 name="name"
 placeholder="Seu nome completo"
 value={formData.name}
 onChange={onFormChange}
 required
 />
 </div>
 
 <div className="form-group">
 <label>Telefone *</label>
 <input
 type="tel"
 name="phone"
 placeholder="(00) 00000-0000"
 value={formData.phone}
 onChange={onFormChange}
 required
 />
 </div>
 
 <div className="form-group">
 <label>Endereço Completo *</label>
 <input
 type="text"
 name="address"
 placeholder="Rua, número, bairro, cidade"
 value={formData.address}
 onChange={onFormChange}
 required
 />
 </div>
 
 <div className="form-row">
 <div className="form-group">
 <label>Forma de Pagamento *</label>
 <select
 name="paymentMethod"
 value={formData.paymentMethod}
 onChange={onFormChange}
 required
 >
 <option value="">Selecione</option>
 <option value="Pix">Pix</option>
 <option value="Cartão de Crédito">Cartão de Crédito</option>
 <option value="Cartão de Débito">Cartão de Débito</option>
 <option value="Dinheiro">Dinheiro</option>
 </select>
 </div>
 
 <div className="form-group">
 <label>Opção de Entrega *</label>
 <select
 name="deliveryOption"
 value={formData.deliveryOption}
 onChange={onFormChange}
 required
 >
 <option value="">Selecione</option>
 <option value="Retirada Local">Retirada no Local</option>
 <option value="Entrega Padrão">Entrega Padrão</option>
 <option value="Expressa">Entrega Expressa</option>
 </select>
 </div>
 </div>
 
 <div className="form-group">
 <label>Observações (opcional)</label>
 <textarea
 name="additionalNotes"
 placeholder="Alguma observação importante?"
 value={formData.additionalNotes}
 onChange={onFormChange}
 rows="3"
 />
 </div>
 
 <div className="checkout-modal-actions">
 <button type="button" className="cancel-btn" onClick={onClose}>
 Cancelar
 </button>
 <button type="submit" className="confirm-btn">
 Confirmar Pedido
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

// Funções auxiliares
const getStockStatus = (stock) => {
 if (stock > 10) return 'high';
 if (stock > 0) return 'low';
 return 'out';
};

const getStockMessage = (stock) => {
 if (stock > 10) return 'Em estoque';
 if (stock > 0) return `Últimas ${stock} unidades`;
 return 'Esgotado';
};

const recordSaleAndUpdateStock = async (cartItems, totalValue) => {
 // Implementação da função para registrar venda e atualizar estoque
};

const createWhatsAppMessage = (cart, total, formData) => {
 // Implementação da função para criar mensagem do WhatsApp
};

const resetCheckoutForm = () => {
 // Implementação para resetar o formulário
};

export default Lojinha;