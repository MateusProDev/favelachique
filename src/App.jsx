// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext/CartContext";
import { auth } from "./firebase/firebaseConfig";

// Páginas públicas
import Home from "./pages/Home/Home";
import AboutPage from "./pages/AboutPage/AboutPage";
import PacotesListPage from "./pages/PacotesListPage/PacotesListPage";
import PacoteDetailPage from "./pages/PacoteDetailPage/PacoteDetailPage";

// Componentes de loja
import LojaLogin from "./pages/LojaLogin/LojaLogin";
import Lojinha from "./components/Lojinha/Lojinha";
import Products from "./components/Lojinha/Products/Products";
import CategoryProducts from "./components/Lojinha/CategoryProducts/CategoryProducts";
import ProductDetail from "./components/Lojinha/ProductDetail/ProductDetail";
import CheckoutOptions from "./components/Lojinha/CheckoutOptions/CheckoutOptions";

// Componentes administrativos
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard";
import AdminPacotes from "./components/AdminPacotes/AdminPacotes";
import AdminEditPacote from "./components/Admin/AdminEditPacote/AdminEditPacote";

// Outros componentes admin
import EditHeader from "./components/Admin/EditHeader/EditHeader";
import EditBanner from "./components/Admin/EditBanner/EditBanner";
import EditBoxes from "./components/Admin/EditBoxes/EditBoxes";
import EditAbout from "./components/Admin/EditAbout/EditAbout";
import EditFooter from "./components/Admin/EditFooter/EditFooter";
import AdminWhatsAppConfig from "./components/Admin/AdminWhatsAppConfig/AdminWhatsAppConfig";
import EditCarousel from "./components/Admin/EditCarousel/EditCarousel";
import EditHours from "./components/Admin/EditHours/EditHours";
import AdminLoja from "./components/Admin/AdminLoja/AdminLoja";
import BannerAdmin from "./components/Admin/BannerAdmin/BannerAdmin";
import EditLojinhaHeader from "./components/Admin/EditLojinhaHeader/EditLojinhaHeader";
import EditProducts from "./components/Admin/EditProducts/EditProducts";
import ViewUsers from "./components/ViewUsers/ViewUsers";
import EditMercadoPagoKey from "./components/Admin/EditMercadoPagoKey/EditMercadoPagoKey";
import StockManagement from "./components/Lojinha/StockManagement/StockManagement";
import SalesReports from "./components/Lojinha/SalesReports/SalesReports";
import SalesEntry from "./components/Lojinha/SalesEntry/SalesEntry";
import ClientManagement from "./components/Lojinha/ClientManagement/ClientManagement";

// Componente de Loading
import LoadingOverlay from "./components/LoadingOverlay/LoadingOverlay";

// Contexto para controle global do loading
export const LoadingContext = React.createContext();

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setLoading: setGlobalLoading } = React.useContext(LoadingContext);

  useEffect(() => {
    setGlobalLoading(true);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      setGlobalLoading(false);
    });
    return () => unsubscribe();
  }, [setGlobalLoading]);

  if (loading) return null; // O LoadingOverlay global já está cuidando disso
  return user ? children : <Navigate to="/admin/login" />;
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Simula um carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      <CartProvider>
        <Router>
          {/* Overlay de loading global */}
          {(loading || initialLoad) && <LoadingOverlay />}
          
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pacotes" element={<PacotesListPage />} />
            <Route path="/pacote/:pacoteId" element={<PacoteDetailPage />} />
            <Route path="/loja/login" element={<LojaLogin />} />
            <Route path="/lojinha" element={<Lojinha />} />
            <Route path="/lojinha/produtos" element={<Products />} />
            <Route path="/lojinha/produtos/:categoryKey" element={<CategoryProducts />} />
            <Route path="/produto/:categoryKey/:productKey" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutOptions />} />

            {/* Rotas Administrativas */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            
            {/* Rotas de Administração de Pacotes */}
            <Route path="/admin/pacotes" element={<ProtectedRoute><AdminPacotes /></ProtectedRoute>} />
            <Route path="/admin/pacotes/novo" element={<ProtectedRoute><AdminEditPacote /></ProtectedRoute>} />
            <Route path="/admin/pacotes/editar/:pacoteId" element={<ProtectedRoute><AdminEditPacote /></ProtectedRoute>} />

            {/* Outras Rotas Administrativas */}
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
            <Route path="/loja/admin/edit-lojinhaHeader" element={<ProtectedRoute><EditLojinhaHeader /></ProtectedRoute>} />
            <Route path="/admin/stock" element={<ProtectedRoute><StockManagement /></ProtectedRoute>} />
            <Route path="/admin/sales-reports" element={<ProtectedRoute><SalesReports /></ProtectedRoute>} />
            <Route path="/admin/sales-entry" element={<ProtectedRoute><SalesEntry /></ProtectedRoute>} />
            <Route path="/admin/client-management" element={<ProtectedRoute><ClientManagement /></ProtectedRoute>} />

            {/* Rota padrão para redirecionar */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CartProvider>
    </LoadingContext.Provider>
  );
};

export default App;