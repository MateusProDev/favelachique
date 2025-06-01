// src/Lojinha/HomeContent/HomeContent.jsx
import React, { useContext } from "react";
import {
  Edit as EditIcon,
  Image as ImageIcon,
  ShoppingCart as ShoppingCartIcon,
  WhatsApp as WhatsAppIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  PointOfSale as PointOfSaleIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { AdminContext } from "../AdminContext/AdminContext";
import "./HomeContent.css";

const menuItems = [
  { text: "Editar Cabeçalho", icon: <EditIcon />, color: "#4e73df" },
  { text: "Editar Banner", icon: <ImageIcon />, color: "#1cc88a" },
  { text: "Editar Produtos", icon: <ShoppingCartIcon />, color: "#36b9cc" },
  { text: "Editar WhatsApp", icon: <WhatsAppIcon />, color: "#f6c23e" },
  { text: "Gerenciar Clientes", icon: <PeopleIcon />, color: "#e74a3b" },
  { text: "Ver Usuários", icon: <PeopleIcon />, color: "#858796" },
  { text: "Gerenciar Estoque", icon: <InventoryIcon />, color: "#5a5c69" },
  { text: "Registrar Venda", icon: <PointOfSaleIcon />, color: "#6f42c1" },
  { text: "Relatórios de Vendas", icon: <AssessmentIcon />, color: "#20c9a6" },
];

const HomeContent = () => {
  const { setSelectedSection } = useContext(AdminContext);

  return (
    <div className="home-container">
      <header className="home-header">
        <h2 className="home-title">Bem-vindo ao Painel Administrativo</h2>
        <p className="home-subtitle">Gerencie sua loja com facilidade</p>
        <div className="divider"></div>
        <p className="home-description">
          Selecione abaixo o módulo que deseja acessar
        </p>
      </header>

      <div className="shortcut-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="shortcut-card"
            onClick={() => setSelectedSection(item.text)}
            style={{ "--card-color": item.color }}
          >
            <div className="shortcut-icon">{item.icon}</div>
            <div className="shortcut-label">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeContent;