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
import { AdminContext } from "../../Lojinha/AdminContext/AdminContext";
import "./HomeContent.css";

const menuItems = [
  { text: "Editar Cabeçalho", icon: <EditIcon /> },
  { text: "Editar Banner", icon: <ImageIcon /> },
  { text: "Editar Produtos", icon: <ShoppingCartIcon /> },
  { text: "Editar WhatsApp", icon: <WhatsAppIcon /> },
  { text: "Gerenciar Clientes", icon: <PeopleIcon /> },
  { text: "Ver Usuários", icon: <PeopleIcon /> },
  { text: "Gerenciar Estoque", icon: <InventoryIcon /> },
  { text: "Registrar Venda", icon: <PointOfSaleIcon /> },
  { text: "Relatórios de Vendas", icon: <AssessmentIcon /> },
];

const HomeContent = () => {
  const { setSelectedSection } = useContext(AdminContext);

  return (
    <div className="home-container">
      <h2 className="home-title">Bem-vindo ao Painel Administrativo</h2>
      <p className="home-subtitle">Gerencie sua loja com facilidade</p>
      <p className="home-description">Clique em uma opção para começar:</p>

      <div className="shortcut-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="shortcut-card"
            onClick={() => setSelectedSection(item.text)}
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
