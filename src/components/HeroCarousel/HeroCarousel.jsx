import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
      const slidesRef = doc(db, 'content', 'heroSlides');
      const slidesDoc = await getDoc(slidesRef);
      
      if (slidesDoc.exists()) {
        const data = slidesDoc.data();
        const slidesArray = data.slides || [];
        
        if (slidesArray.length > 0) {
          setSlides(slidesArray);
        } else {
          setSlides([getDefaultSlide()]);
        }
      } else {
        setSlides([getDefaultSlide()]);
      }
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      setSlides([getDefaultSlide()]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSlide = () => ({
    title: 'Bem-vindo à 20Buscar Vacation Beach',
    description: 'Experiências únicas de turismo comunitário',
    imageUrl: '',
    buttonText: 'Conheça Nossos Tours',
    buttonLink: '/pacotes'
  });

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
      <div 
        className="hero-slide"
        style={{ 
          backgroundImage: currentSlide.imageUrl 
            ? `url(${currentSlide.imageUrl})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <div className="hero-overlay"></div>

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
