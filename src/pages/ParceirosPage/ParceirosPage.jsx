import React from 'react';
import { Box } from '@mui/material';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import ParceirosSection from '../../components/ParceirosSection/ParceirosSection';
import './ParceirosPage.css';

const ParceirosPage = () => {
  return (
    <Box className="parceiros-page">
      <Header />
      <Box sx={{ minHeight: '80vh', pt: 4 }}>
        <ParceirosSection 
          titulo="Todos os Nossos Parceiros" 
          destaquesOnly={false} 
        />
      </Box>
      <Footer />
      <WhatsAppButton />
    </Box>
  );
};

export default ParceirosPage;
