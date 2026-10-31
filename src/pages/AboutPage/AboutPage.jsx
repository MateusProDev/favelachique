import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import AboutCarousel from "../../components/About/AboutCarousel";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "./AboutPage.css";

const AboutPage = () => {
  const [aboutData, setAboutData] = useState({
    description: "", // Carregar descrição
    aboutCarousel: {
      images: [] // Carregar imagens do carrossel
    }
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const aboutRef = doc(db, "content", "about");
        const aboutDoc = await getDoc(aboutRef);

        if (aboutDoc.exists()) {
          const data = aboutDoc.data();
          // Atualizando o estado com a descrição e o carrossel
          setAboutData({
            description: data.description || "", // Atualiza a descrição
            aboutCarousel: {
              images: data.aboutCarousel?.images || [] // Atualiza as imagens do carrossel
            }
          });
        } else {
          console.log("Nenhum dado encontrado para About");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchAboutData();
  }, []); // Apenas executa uma vez, quando o componente for montado

  return (
    <div className="about-page">
      <Header />
      
      <div className="about-content-wrapper">
        <Breadcrumb 
          currentPage="Sobre Nós"
        />
        
        {/* Carrossel */}
        <AboutCarousel images={aboutData.aboutCarousel?.images} />
        {/* Exibindo a descrição */}
        <p className="description">{aboutData.description}</p>

        {/* QR Code Section */}
        <div className="qr-code-section">
          <h3 className="qr-code-title">Conheça também o Lucrazi</h3>
          <div className="qr-code-wrapper">
            <img
              src="/qr-code-lucrazi (21).png"
              alt="QR Code - Lucrazi"
              className="qr-code-image"
            />
            <p className="qr-code-description">
              Escaneie o QR code para acessar <a href="https://www.lucrazi.com.br" target="_blank" rel="noopener noreferrer">www.lucrazi.com.br</a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
