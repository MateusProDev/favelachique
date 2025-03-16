import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebase/firebase";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const goToEditHeader = () => {
    navigate("/admin/edit-header");
  };

  const goToEditBanner = () => {
    navigate("/admin/edit-banner");
  };

  const goToEditBoxes = () => {
    navigate("/admin/edit-boxes");
  };

  const goToEditAbout = () => {
    navigate("/admin/edit-about");
  };

  const goToEditFooter = () => {
    navigate("/admin/edit-footer");
  };
  const goToEditHours = () => {
    navigate("/admin/edit-hours");
  };

  const goToEditWhatsapp = () => {
    navigate("/admin/edit-whatsapp");
  };

  const goToEditCarousel = () => {
    navigate("/admin/edit-carousel"); // Nova função para editar o carrossel
  };

  const goToHome = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      <h2>Painel de Administração</h2>
      
      {/* Botões de Navegação */}
      <div className="admin-actions">
        <button onClick={goToEditHeader}>Editar Logo</button>
        <button onClick={goToEditBanner}>Editar Banner</button>
        <button onClick={goToEditBoxes}>Editar Boxes</button>
        <button onClick={goToEditAbout}>Editar Sobre</button>
        <button onClick={goToEditFooter}>Editar Rodapé</button>
        <button onClick={goToEditHours}>Editar Horários</button>
        <button onClick={goToEditWhatsapp}>Editar WhatsApp</button>
        <button onClick={goToEditCarousel}>Editar Carrossel</button>
        <button onClick={goToHome}>Voltar para a Home</button>
      </div>

      {/* Logout */}
      <div className="logout-section">
        <button onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default AdminDashboard;