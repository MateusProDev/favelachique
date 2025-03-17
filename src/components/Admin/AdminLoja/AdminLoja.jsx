import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebaseConfig";
import "./AdminLoja.css";

const AdminLoja = () => {
  const navigate = useNavigate();

  const goToEditLojinhaHeader = () => {
    navigate("/loja/admin/edit-lojinhaHeader");
  };

  const goToBannerAdmin = () => {
    navigate("/admin/banner-admin");
  };

  const goToEditProdutos = () => {
    navigate("/admin/edit-products");
  };

  const goToEditWhatsApp = () => {
    navigate("/admin/edit-whatsapp");
  };

  const goToViewUsers = () => {
    navigate("/admin/view-users");
  };

  const goToStockManagement = () => {
    navigate("/admin/stock");
  };
  
  const goToSalesEntry = () => {
    navigate("/admin/sales-entry");
  };

  const goToSalesReports = () => {
    navigate("/admin/sales-reports");
  };

  const goToHome = () => {
    navigate("/lojinha");
  };  

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/loja/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="admin-loja-dashboard">
      <h2>Painel da Loja</h2>
      
      <div className="admin-loja-actions">
        <button onClick={goToEditLojinhaHeader}>Editar Cabeçalho</button>
        <button onClick={goToBannerAdmin}>Editar Banner</button>
        <button onClick={goToEditProdutos}>Editar Produtos</button>
        <button onClick={goToEditWhatsApp}>Editar Número do WhatsApp</button>
        <button onClick={goToViewUsers}>Ver Usuários Cadastrados</button>
        <button onClick={goToStockManagement}>Gerenciar Estoque</button>
        <button onClick={goToSalesEntry}>Registrar Venda</button>
        <button onClick={goToSalesReports}>Relatórios de Vendas</button>
        <button onClick={goToHome}>Voltar para a Home</button>
      </div>

      <div className="logout-section">
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default AdminLoja;