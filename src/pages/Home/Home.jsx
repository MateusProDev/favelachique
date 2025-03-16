// src/pages/Home/Home.js
import React from 'react';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Boxes from '../../components/Boxes/Boxes';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';

// Importando componente Carousel

import Carousel from '../../components/Carousel/Carousel';
 // Componente Carousel que renderiza as imagens do carousel.

// Importando CSS
import './Home.css';
 // Componente Home que contém Header, Banner, Boxes, Footer e o botão do WhatsApp.

const Home = () => {
  return (
    <div>
      <Header />
      <Banner />
      <Boxes />
      <Carousel />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;
