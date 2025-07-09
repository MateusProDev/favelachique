// src/components/Admin/AdminDashboard/AdminDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebaseConfig";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Funções de navegação
  const goToEditHeader = () => navigate("/admin/edit-header");
  const goToEditBanner = () => navigate("/admin/edit-banner");
  const goToEditBoxes = () => navigate("/admin/edit-boxes");
  const goToEditAbout = () => navigate("/admin/edit-about");
  const goToEditFooter = () => navigate("/admin/edit-footer");
  const goToEditHours = () => navigate("/admin/edit-hours");
  const goToEditWhatsapp = () => navigate("/admin/edit-whatsapp");
  const goToEditCarousel = () => navigate("/admin/edit-carousel");
  const goToManagePackages = () => navigate("/admin/pacotes");
  const goToCreatePackage = () => navigate("/admin/pacotes/novo");
  const goToHome = () => navigate("/");

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Painel de Administração</h2>
      
      <div className="admin-sections">
        {/* Seção de Conteúdo Principal */}
        <div className="admin-section">
          <h3>Conteúdo Principal</h3>
          <div className="admin-actions">
            <button onClick={goToEditHeader}>Editar Logo</button>
            <button onClick={goToEditBanner}>Editar Banner</button>
            <button onClick={goToEditBoxes}>Editar Boxes</button>
            <button onClick={goToEditAbout}>Editar Sobre</button>
            <button onClick={goToEditFooter}>Editar Rodapé</button>
            <button onClick={goToEditHours}>Editar Horários</button>
            <button onClick={goToEditWhatsapp}>Editar WhatsApp</button>
            <button onClick={goToEditCarousel}>Editar Carrossel</button>
          </div>
        </div>

        {/* Seção de Pacotes */}
        <div className="admin-section">
          <h3>Gerenciamento de Pacotes</h3>
          <div className="admin-actions">
            <button onClick={goToManagePackages}>Ver Todos os Pacotes</button>
            <button onClick={goToCreatePackage}>Criar Novo Pacote</button>
          </div>
        </div>
      </div>

      <div className="admin-footer">
        <button onClick={goToHome}>Voltar para a Home</button>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default AdminDashboard;