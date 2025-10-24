import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Card, CardContent, Avatar, Rating, Chip } from '@mui/material';
import { Google, Person } from '@mui/icons-material';
import { googleReviewsService } from '../../services/googleReviewsService';
import { avaliacoesService } from '../../services/avaliacoesService';
import './CombinedReviews.css';

/**
 * Componente que combina avaliações do Google e avaliações locais
 * Permite alternar entre as fontes
 */
const CombinedReviews = ({ maxReviews = 6 }) => {
  const [tabValue, setTabValue] = useState(0);
  const [googleData, setGoogleData] = useState(null);
  const [localReviews, setLocalReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllReviews();
  }, []);

  const loadAllReviews = async () => {
    try {
      setLoading(true);

      // Buscar avaliações do Google
      const googlePromise = googleReviewsService.getGooglePlaceDetails().catch(err => {
        console.warn('Avaliações do Google não disponíveis:', err);
        return null;
      });

      // Buscar avaliações locais
      const localPromise = avaliacoesService.getAvaliacoes({ 
        limit: maxReviews, 
        orderBy: 'nota', 
        direction: 'desc' 
      }).catch(err => {
        console.warn('Avaliações locais não disponíveis:', err);
        return { avaliacoes: [] };
      });

      const [googleResult, localResult] = await Promise.all([googlePromise, localPromise]);

      setGoogleData(googleResult);
      setLocalReviews(localResult.avaliacoes || []);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box className="combined-reviews-loading">
        <Typography>Carregando avaliações...</Typography>
      </Box>
    );
  }

  const hasGoogle = googleData && googleData.reviews && googleData.reviews.length > 0;
  const hasLocal = localReviews && localReviews.length > 0;

  if (!hasGoogle && !hasLocal) {
    return null;
  }

  return (
    <section className="combined-reviews">
      <div className="container">
        <Typography variant="h2" className="section-title">
          O que dizem sobre nós
        </Typography>

        {hasGoogle && hasLocal && (
          <Box className="reviews-tabs">
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab 
                icon={<Google />} 
                label={`Google (${googleData.totalReviews})`}
                iconPosition="start"
              />
              <Tab 
                icon={<Person />} 
                label={`Clientes (${localReviews.length})`}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        )}

        {/* Google Reviews Tab */}
        {hasGoogle && (tabValue === 0 || !hasLocal) && (
          <Box className="reviews-content">
            <Box className="rating-summary">
              <Typography variant="h3">{googleData.rating}</Typography>
              <Rating value={googleData.rating} readOnly precision={0.1} size="large" />
              <Typography variant="caption">
                {googleData.totalReviews.toLocaleString('pt-BR')} avaliações
              </Typography>
            </Box>

            <Box className="reviews-grid">
              {googleData.reviews.slice(0, maxReviews).map((review) => (
                <Card key={`google_${review.time}`} className="review-card">
                  <CardContent>
                    <Box className="review-header">
                      <Avatar src={review.profile_photo_url} alt={review.author_name} />
                      <Box className="review-info">
                        <Typography variant="subtitle2">{review.author_name}</Typography>
                        <Typography variant="caption">
                          {formatDate(new Date(review.time * 1000))}
                        </Typography>
                      </Box>
                      <Chip icon={<Google />} label="Google" size="small" color="primary" />
                    </Box>
                    <Rating value={review.rating} readOnly size="small" />
                    <Typography variant="body2" className="review-text">
                      {review.text}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Local Reviews Tab */}
        {hasLocal && (tabValue === 1 || !hasGoogle) && (
          <Box className="reviews-content">
            <Box className="reviews-grid">
              {localReviews.map((review) => (
                <Card key={review.id} className="review-card">
                  <CardContent>
                    <Box className="review-header">
                      <Avatar src={review.avatarUsuario}>{review.nomeUsuario?.[0]}</Avatar>
                      <Box className="review-info">
                        <Typography variant="subtitle2">{review.nomeUsuario}</Typography>
                        <Typography variant="caption">
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Box>
                      <Chip icon={<Person />} label="Cliente" size="small" color="secondary" />
                    </Box>
                    <Rating value={review.nota} readOnly size="small" />
                    <Typography variant="body2" className="review-text">
                      {review.comentario}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}
      </div>
    </section>
  );
};

export default CombinedReviews;
