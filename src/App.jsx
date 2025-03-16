import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext/CartContext";
import Home from "./pages/Home/Home";
import AboutPage from "./pages/AboutPage/AboutPage";
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import EditHeader from "./components/Admin/EditHeader/EditHeader";
import EditBanner from "./components/Admin/EditBanner/EditBanner";
import EditBoxes from "./components/Admin/EditBoxes/EditBoxes";
import EditAbout from "./components/Admin/EditAbout/EditAbout";
import EditFooter from "./components/Admin/EditFooter/EditFooter";
import AdminWhatsAppConfig from "./components/Admin/AdminWhatsAppConfig/AdminWhatsAppConfig";
import EditCarousel from "./components/Admin/EditCarousel/EditCarousel";
import EditHours from "./components/Admin/EditHours/EditHours";
import LojaLogin from "./pages/LojaLogin/LojaLogin";
import Lojinha from "./components/Lojinha/Lojinha";
import AdminLoja from "./components/Admin/AdminLoja/AdminLoja";
import BannerAdmin from "./components/Admin/BannerAdmin/BannerAdmin";
import EditLojinhaHeader from "./components/Admin/EditLojinhaHeader/EditLojinhaHeader"; // Certifique-se de que esse componente existe
import EditProducts from "./components/Admin/EditProducts/EditProducts";
import Products from "./components/Lojinha/Products/Products";
import CategoryProducts from "./components/Lojinha/CategoryProducts/CategoryProducts";
import ProductDetail from "./components/Lojinha/ProductDetail/ProductDetail";
import ViewUsers from "./components/ViewUsers/ViewUsers";
import CheckoutOptions from "./components/Lojinha/CheckoutOptions/CheckoutOptions";
import EditMercadoPagoKey from "./components/Admin/EditMercadoPagoKey/EditMercadoPagoKey";
import { auth } from "./firebase/firebaseConfig";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (user === null) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to="/loja/login" />; // Redireciona para LojaLogin se não autenticado
};

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/loja/login" element={<LojaLogin />} />
          <Route path="/lojinha" element={<Lojinha />} />
          <Route path="/lojinha/produtos" element={<Products />} />
          <Route path="/lojinha/produtos/:categoryKey" element={<CategoryProducts />} />
          <Route path="/produto/:categoryKey/:productKey" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutOptions />} />

          {/* Rotas administrativas protegidas */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/edit-header" element={<ProtectedRoute><EditHeader /></ProtectedRoute>} />
          <Route path="/admin/edit-banner" element={<ProtectedRoute><EditBanner /></ProtectedRoute>} />
          <Route path="/admin/edit-boxes" element={<ProtectedRoute><EditBoxes /></ProtectedRoute>} />
          <Route path="/admin/edit-about" element={<ProtectedRoute><EditAbout /></ProtectedRoute>} />
          <Route path="/admin/edit-footer" element={<ProtectedRoute><EditFooter /></ProtectedRoute>} />
          <Route path="/admin/edit-whatsapp" element={<ProtectedRoute><AdminWhatsAppConfig /></ProtectedRoute>} />
          <Route path="/admin/edit-carousel" element={<ProtectedRoute><EditCarousel /></ProtectedRoute>} />
          <Route path="/admin/edit-hours" element={<ProtectedRoute><EditHours /></ProtectedRoute>} />
          <Route path="/admin/loja" element={<ProtectedRoute><AdminLoja /></ProtectedRoute>} />
          <Route path="/admin/banner-admin" element={<ProtectedRoute><BannerAdmin /></ProtectedRoute>} />
          <Route path="/admin/edit-products" element={<ProtectedRoute><EditProducts /></ProtectedRoute>} />
          <Route path="/admin/view-users" element={<ProtectedRoute><ViewUsers /></ProtectedRoute>} />
          <Route path="/admin/edit-mercadopago-key" element={<ProtectedRoute><EditMercadoPagoKey /></ProtectedRoute>} />
          
          {/* Rota para editar o cabeçalho da lojinha */}
          <Route path="/loja/admin/edit-lojinhaHeader" element={<ProtectedRoute><EditLojinhaHeader /></ProtectedRoute>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;