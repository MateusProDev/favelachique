// src/Lojinha/AdminLoja/AdminLoja.jsx
import React, { useState } from "react";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton,
  Toolbar, AppBar, Typography, Box, CssBaseline
} from "@mui/material";
import {
  Menu as MenuIcon, Logout as LogoutIcon, Edit as EditIcon,
  Image as ImageIcon, ShoppingCart as ShoppingCartIcon,
  WhatsApp as WhatsAppIcon, People as PeopleIcon,
  Inventory as InventoryIcon, PointOfSale as PointOfSaleIcon,
  Assessment as AssessmentIcon, Home as HomeIcon
} from "@mui/icons-material";
import { auth } from "../../../firebase/firebaseConfig";

// Importação dos componentes
import EditLojinhaHeader from "../../Admin/EditLojinhaHeader/EditLojinhaHeader";
import BannerAdmin from "../../Admin/EditBanner/EditBanner";
import EditProdutos from "../../Admin/EditProducts/EditProducts";
import EditWhatsApp from "../../Admin/EditWhatsApp/EditWhatsApp";
import ClientManagement from "../../Lojinha/ClientManagement/ClientManagement";
import ViewUsers from "../../ViewUsers/ViewUsers";
import StockManagement from "../../Lojinha/StockManagement/StockManagement";
import SalesEntry from "../../Lojinha/SalesEntry/SalesEntry";
import SalesReports from "../../Lojinha/SalesReports/SalesReports";
import HomeContent from "../../Lojinha/HomeContent/HomeContent";

import "./AdminLoja.css";

// Contexto
import { AdminContext } from "../../Lojinha/AdminContext/AdminContext";

const AdminLoja = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Home");

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/loja/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, component: HomeContent },
    { text: "Editar Cabeçalho", icon: <EditIcon />, component: EditLojinhaHeader },
    { text: "Editar Banner", icon: <ImageIcon />, component: BannerAdmin },
    { text: "Editar Produtos", icon: <ShoppingCartIcon />, component: EditProdutos },
    { text: "Editar WhatsApp", icon: <WhatsAppIcon />, component: EditWhatsApp },
    { text: "Gerenciar Clientes", icon: <PeopleIcon />, component: ClientManagement },
    { text: "Ver Usuários", icon: <PeopleIcon />, component: ViewUsers },
    { text: "Gerenciar Estoque", icon: <InventoryIcon />, component: StockManagement },
    { text: "Registrar Venda", icon: <PointOfSaleIcon />, component: SalesEntry },
    { text: "Relatórios de Vendas", icon: <AssessmentIcon />, component: SalesReports },
  ];

  const renderContent = () => {
    const selectedItem = menuItems.find((item) => item.text === selectedSection);
    const Component = selectedItem ? selectedItem.component : HomeContent;
    return <Component />;
  };

  const drawerContent = (
    <div className="admin-loja-drawer-container">
      <Toolbar className="admin-loja-drawer-header">
        <Typography variant="h6" noWrap>
          Painel Admin
        </Typography>
      </Toolbar>
      <List className="admin-loja-menu-list">
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => {
              setSelectedSection(item.text);
              setMobileOpen(false);
            }}
            className={selectedSection === item.text ? "admin-loja-active" : ""}
          >
            <ListItemIcon className="admin-loja-menu-icon">{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <div className="admin-loja-logout-button" onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1 }} />
        Sair
      </div>
    </div>
  );

  return (
    <AdminContext.Provider value={{ selectedSection, setSelectedSection }}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "#2c3e50",
            display: { sm: "none" },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Painel Admin
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer lateral */}
        <Drawer
          variant="permanent"
          sx={{
            flexShrink: 0,
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: 260,
              position: "fixed",
              height: "100vh",
              boxSizing: "border-box",
              zIndex: 1200,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>

        {/* Drawer mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            flexShrink: 0,
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Conteúdo principal */}
        <Box
          component="main"
          className="admin-loja-main"
          sx={{
            flexGrow: 1,
            p: 0,
            width: { xs: "100%", sm: "calc(100% - 260px)" },
            ml: { sm: "260px" },
            mt: { xs: 8, sm: 0 },
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="admin-loja-dashboard">{renderContent()}</div>
        </Box>
      </Box>
    </AdminContext.Provider>
  );
};

export default AdminLoja;
