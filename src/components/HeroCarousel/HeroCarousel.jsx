import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import './HeroCarousel.css';

const HeroCarousel = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const slidesRef = collection(db, 'heroSlides');
      const q = query(slidesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Dados de exemplo se não houver slides
        setSlides([{
          id: 'default',
          title: 'Bem-vindo à Favela Chique',
          description: 'Experiências únicas de turismo comunitário',
          imageUrl: '/assets/default-hero.jpg',
          buttonText: 'Conheça Nossos Tours',
          buttonLink: '/pacotes',
          order: 0
        }]);
      } else {
        const slidesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSlides(slidesData);
      }
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      // Mantém dados de exemplo em caso de erro
      setSlides([{
        id: 'default',
        title: 'Bem-vindo 20Buscar Vacation Beach',
        description: 'Experiências únicas de turismo',
        imageUrl: '/assets/default-hero.jpg',
        buttonText: 'Conheça Nossos Tours',
        buttonLink: '/pacotes',
        order: 0
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleDotClick = (index) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (loading || slides.length === 0) {
    return <div className="hero-carousel-loading">Carregando...</div>;
  }

  const currentSlide = slides[currentIndex];

  return (
    <section className="hero-carousel">
      {/* Slide atual */}
      <div 
        className="hero-slide"
        style={{ backgroundImage: `url(${currentSlide.imageUrl})` }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Overlay escuro */}
        <div className="hero-overlay"></div>

        {/* Conteúdo do slide */}
        <div className="hero-content">
          <h1 className="hero-title">{currentSlide.title}</h1>
          <p className="hero-description">{currentSlide.description}</p>
          
          {currentSlide.buttonText && currentSlide.buttonLink && (
            <a 
              href={currentSlide.buttonLink} 
              className="hero-button"
            >
              {currentSlide.buttonText}
            </a>
          )}
        </div>

        {/* Botões de navegação */}
        {slides.length > 1 && (
          <>
            <IconButton 
              className="hero-nav-button hero-prev" 
              onClick={handlePrevious}
              aria-label="Slide anterior"
            >
              <ChevronLeft />
            </IconButton>

            <IconButton 
              className="hero-nav-button hero-next" 
              onClick={handleNext}
              aria-label="Próximo slide"
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {/* Indicadores (dots) */}
        {slides.length > 1 && (
          <div className="hero-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroCarousel;
