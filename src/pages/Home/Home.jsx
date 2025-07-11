import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Boxes from '../../components/Boxes/Boxes';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Carousel from '../../components/Carousel/Carousel';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Star } from '@mui/icons-material';
import './Home.css';

const Home = () => {
  const [pacotes, setPacotes] = useState([]);
  const [destaques, setDestaques] = useState([]);
  const [outrosPacotes, setOutrosPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setPacotes(pacotesData);
        setDestaques(pacotesData.filter(p => p.destaque));
        setOutrosPacotes(pacotesData.filter(p => !p.destaque));
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Configurar carrossel automático para destaques
  useEffect(() => {
    if (destaques.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % destaques.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [destaques.length]);

  if (loading) {
    return (
      <Box className="loading-container">
        <div className="spinner"></div>
      </Box>
    );
  }

  return (
    <div className="home-container">
      <Header />
      <Banner />
      
      {/* Seção de Destaques (Carrossel) */}
      {destaques.length > 0 && (
        <section className="destaques-section">
          <div className="section-header">
            <Typography variant="h2" className="section-title">
              <Star className="star-icon" /> Pacotes em Destaque
            </Typography>
            <div className="carousel-controls">
              <IconButton 
                className="nav-button"
                onClick={() => {
                  clearInterval(intervalRef.current);
                  setCurrentSlide(prev => (prev - 1 + destaques.length) % destaques.length);
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                className="nav-button"
                onClick={() => {
                  clearInterval(intervalRef.current);
                  setCurrentSlide(prev => (prev + 1) % destaques.length);
                }}
              >
                <ChevronRight />
              </IconButton>
            </div>
          </div>
          
          <div className="destaques-carousel">
            <div 
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {destaques.map((pkg, index) => (
                <div 
                  key={pkg.id} 
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <div className="destaque-card">
                    <div className="image-container">
                      <img 
                        src={pkg.imagens?.[0] || 'https://via.placeholder.com/800x500'} 
                        alt={pkg.titulo} 
                      />
                      {pkg.precoOriginal && (
                        <span className="discount-badge">
                          {Math.round((1 - pkg.preco / pkg.precoOriginal) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="card-content">
                      <h3>{pkg.titulo}</h3>
                      <p className="short-description">{pkg.descricaoCurta}</p>
                      <div className="price-container">
                        {pkg.precoOriginal && (
                          <span className="original-price">
                            De: R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="current-price">
                          Por: R$ {pkg.preco.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <Button
                        component={Link}
                        to={`/pacote/${pkg.slug || pkg.id}`}
                        variant="contained"
                        className="details-button"
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-indicators">
              {destaques.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    clearInterval(intervalRef.current);
                    setCurrentSlide(index);
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Seção de Outros Pacotes (Scroll Horizontal) */}
      {outrosPacotes.length > 0 && (
        <section className="outros-pacotes-section">
          <Typography variant="h2" className="section-title">
            Nossos Pacotes
          </Typography>
          
          <div className="scroll-container" ref={scrollRef}>
            <div className="scroll-content">
              {outrosPacotes.map(pkg => (
                <div key={pkg.id} className="pacote-card">
                  <div className="card-image">
                    <img 
                      src={pkg.imagens?.[0] || 'https://via.placeholder.com/300x200'} 
                      alt={pkg.titulo} 
                    />
                  </div>
                  <div className="card-details">
                    <h3>{pkg.titulo}</h3>
                    <p className="description">{pkg.descricaoCurta}</p>
                    <div className="price-container">
                      {pkg.precoOriginal && (
                        <span className="original-price">
                          R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                      <span className="current-price">
                        R$ {pkg.preco.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <Button
                      component={Link}
                      to={`/pacote/${pkg.slug || pkg.id}`}
                      variant="outlined"
                      className="details-button"
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      <Boxes />
      <Carousel />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;