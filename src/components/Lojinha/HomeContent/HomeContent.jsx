// HomeContent.jsx
import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { styled } from 'styled-components';

const WelcomeContainer = styled(Paper)`
  padding: 24px;
  margin-top: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HomeContent = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold' }}>
        Bem-vindo ao Painel Administrativo
      </Typography>
      
      <WelcomeContainer elevation={1}>
        <Typography variant="h6" gutterBottom sx={{ color: '#34495e' }}>
          Gerencie sua loja com facilidade
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
          Utilize o menu lateral para:
        </Typography>
        <Box component="ul" sx={{ pl: 4, mt: 1 }}>
          <li>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Editar o cabeçalho e banners da sua loja
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Gerenciar produtos e estoque
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Configurar o botão do WhatsApp
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Acompanhar vendas e relatórios
            </Typography>
          </li>
          <li>
            <Typography variant="body1" sx={{ color: '#666' }}>
              Gerenciar clientes e usuários
            </Typography>
          </li>
        </Box>
      </WelcomeContainer>
    </Box>
  );
};

export default HomeContent;