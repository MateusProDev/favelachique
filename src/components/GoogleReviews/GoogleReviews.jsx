import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Avatar, Rating, Chip, IconButton } from '@mui/material';
import { Google, OpenInNew, ChevronLeft, ChevronRight } from '@mui/icons-material';
import './GoogleReviews.css';

/**
 * Componente de Avaliações do Google - VERSÃO MANUAL COM CARROSSEL
 * 
 * ✅ Sem API, sem cartão, sem configuração
 * ✅ Carrossel automático que passa as avaliações
 * ✅ Você edita as avaliações diretamente aqui
 * 
 * COMO ADICIONAR/EDITAR AVALIAÇÕES:
 * 1. Copie avaliações do Google Reviews do seu negócio
 * 2. Cole os dados no array GOOGLE_REVIEWS_DATA abaixo
 * 3. Pronto! Salve o arquivo e recarregue o site
 */

// ========================================
// 📝 EDITE SUAS AVALIAÇÕES AQUI
// ========================================
const GOOGLE_REVIEWS_DATA = {
  // Link do seu Google Reviews (onde as pessoas podem avaliar)
  googleUrl: 'https://g.page/r/CeJ2VkqsSpdqEBM/review',
  
  // Nota média do Google (veja no Google Maps)
  rating: 5.0,
  
  // Total de avaliações (veja no Google Maps)
  totalReviews: 150,
  
  // Avaliações que você quer mostrar (copie do Google)
  reviews: [
    {
      author_name: 'Mateus Ferreira',
      author_avatar: '/icons/mateus.png',
      rating: 5,
      time: 'Há 2 meses',
      text: 'Uma agência que preza pela experiência e excelência dos clientes, recomendo muito! Atendimento impecável e tours incríveis.'
    },
    {
      author_name: 'Ana Silva',
      author_avatar: '',
      rating: 5,
      time: 'Há 1 mês',
      text: 'Experiência maravilhosa! O tour superou todas as expectativas. Guias atenciosos e conhecedores. Voltarei com certeza!'
    },
    {
      author_name: 'Carlos Santos',
      author_avatar: '',
      rating: 5,
      time: 'Há 3 semanas',
      text: 'Simplesmente perfeito! Adorei conhecer a comunidade através desse tour. Muito bem organizado e seguro. Recomendo!'
    },
    {
      author_name: 'Beatriz Lima',
      author_avatar: '',
      rating: 5,
      time: 'Há 2 semanas',
      text: 'Melhor experiência turística que já tive! Os guias são locais e compartilham histórias incríveis. Vale cada centavo!'
    }
  ]
};

// ========================================
// NÃO PRECISA EDITAR DAQUI PRA BAIXO
// ========================================

const GoogleReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Carrossel automático
  useEffect(() => {
    if (!isAutoPlaying || GOOGLE_REVIEWS_DATA.reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % GOOGLE_REVIEWS_DATA.reviews.length
      );
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? GOOGLE_REVIEWS_DATA.reviews.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => 
      (prevIndex + 1) % GOOGLE_REVIEWS_DATA.reviews.length
    );
  };

  const handleCardClick = () => {
    if (GOOGLE_REVIEWS_DATA.googleUrl) {
      window.open(GOOGLE_REVIEWS_DATA.googleUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Se não tiver avaliações configuradas, não mostra nada
  if (!GOOGLE_REVIEWS_DATA.reviews || GOOGLE_REVIEWS_DATA.reviews.length === 0) {
    return null;
  }

  const currentReview = GOOGLE_REVIEWS_DATA.reviews[currentIndex];

  return (
    <section className="google-reviews google-reviews-carousel">
      <div className="container">
        {/* Header com nota geral do Google */}
        <Box className="google-reviews-header">
          <Box className="google-rating-summary">
            <Google className="google-icon" />
            <Box className="rating-info">
              <Typography variant="h3" className="rating-number">
                {GOOGLE_REVIEWS_DATA.rating}
              </Typography>
              <Rating 
                value={GOOGLE_REVIEWS_DATA.rating} 
                readOnly 
                precision={0.1} 
                size="large"
                sx={{ color: '#fbbc04' }}
              />
              <Typography variant="body2" className="rating-count">
                Baseado em {GOOGLE_REVIEWS_DATA.totalReviews.toLocaleString('pt-BR')} avaliações do Google
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Carrossel de Avaliações */}
        <Box className="carousel-wrapper">
          <Box className="carousel-content">
            <Card 
              className="google-review-card carousel-card clickable" 
              onClick={handleCardClick}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              sx={{ cursor: 'pointer' }}
            >
              <CardContent>
                <Box className="review-header">
                  <Avatar 
                    src={currentReview.author_avatar} 
                    className="review-avatar"
                    alt={currentReview.author_name}
                  >
                    {!currentReview.author_avatar && currentReview.author_name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box className="review-author-info">
                    <Typography variant="subtitle1" className="review-author">
                      {currentReview.author_name}
                    </Typography>
                    <Typography variant="caption" className="review-time">
                      {currentReview.time}
                    </Typography>
                  </Box>
                  <Chip 
                    icon={<Google sx={{ fontSize: 14 }} />} 
                    label="Google" 
                    size="small" 
                    className="google-badge"
                  />
                </Box>

                <Rating 
                  value={currentReview.rating} 
                  readOnly 
                  size="small" 
                  className="review-rating"
                  sx={{ color: '#fbbc04' }}
                />

                <Typography variant="body2" className="review-text">
                  {currentReview.text}
                </Typography>

                <Box className="review-footer">
                  <Typography variant="caption" className="click-hint">
                    Clique para ver todas as {GOOGLE_REVIEWS_DATA.totalReviews.toLocaleString('pt-BR')} avaliações no Google
                  </Typography>
                  <OpenInNew className="open-icon" fontSize="small" />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Botões de navegação lado a lado */}
          {GOOGLE_REVIEWS_DATA.reviews.length > 1 && (
            <Box className="carousel-buttons">
              <IconButton 
                className="carousel-button carousel-prev" 
                onClick={handlePrevious}
                aria-label="Avaliação anterior"
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                className="carousel-button carousel-next" 
                onClick={handleNext}
                aria-label="Próxima avaliação"
              >
                <ChevronRight />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Indicadores de posição (dots) */}
        {GOOGLE_REVIEWS_DATA.reviews.length > 1 && (
          <Box className="carousel-indicators">
            {GOOGLE_REVIEWS_DATA.reviews.map((_, index) => (
              <Box
                key={index}
                className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
              />
            ))}
          </Box>
        )}
      </div>
    </section>
  );
};

export default GoogleReviews;
