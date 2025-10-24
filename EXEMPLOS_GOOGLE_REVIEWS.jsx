/**
 * EXEMPLOS DE USO - Google Reviews
 * 
 * Este arquivo mostra diferentes formas de usar os componentes de avaliações
 * Copie e cole onde precisar!
 */

// ========================================
// EXEMPLO 1: Apenas Google Reviews
// ========================================
import GoogleReviews from '../components/GoogleReviews/GoogleReviews';

function MinhaPage() {
  return (
    <div>
      {/* Mostra 5 avaliações do Google */}
      <GoogleReviews maxReviews={5} />
    </div>
  );
}

// ========================================
// EXEMPLO 2: Google Reviews em seção específica
// ========================================
import GoogleReviews from '../components/GoogleReviews/GoogleReviews';
import { Box, Container } from '@mui/material';

function PaginaDepoimentos() {
  return (
    <Container>
      <Box sx={{ my: 8 }}>
        <GoogleReviews maxReviews={10} />
      </Box>
    </Container>
  );
}

// ========================================
// EXEMPLO 3: Combinado (Google + Local) com Tabs
// ========================================
import CombinedReviews from '../components/CombinedReviews/CombinedReviews';

function PaginaAvaliacoes() {
  return (
    <div>
      {/* Permite alternar entre avaliações do Google e locais */}
      <CombinedReviews maxReviews={6} />
    </div>
  );
}

// ========================================
// EXEMPLO 4: Duas seções separadas
// ========================================
import GoogleReviews from '../components/GoogleReviews/GoogleReviews';
import AvaliacoesPreview from '../components/AvaliacoesPreview/AvaliacoesPreview';

function Home() {
  return (
    <div>
      {/* Primeiro as do Google */}
      <GoogleReviews maxReviews={3} />
      
      {/* Depois as locais */}
      <AvaliacoesPreview />
    </div>
  );
}

// ========================================
// EXEMPLO 5: Apenas buscar dados (sem componente visual)
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';

function MeuComponente() {
  const [googleData, setGoogleData] = useState(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        const data = await googleReviewsService.getGooglePlaceDetails();
        setGoogleData(data);
        
        // Agora você tem acesso a:
        console.log('Nome:', data.name);
        console.log('Nota média:', data.rating);
        console.log('Total de avaliações:', data.totalReviews);
        console.log('Avaliações:', data.reviews);
        console.log('Link do Google:', data.googleUrl);
      } catch (error) {
        console.error('Erro:', error);
      }
    }
    
    loadReviews();
  }, []);

  return (
    <div>
      {googleData && (
        <div>
          <h2>{googleData.name}</h2>
          <p>Nota: {googleData.rating} ⭐</p>
          <p>{googleData.totalReviews} avaliações</p>
        </div>
      )}
    </div>
  );
}

// ========================================
// EXEMPLO 6: Widget personalizado simples
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';
import { Box, Typography, Rating } from '@mui/material';

function GoogleRatingWidget() {
  const [rating, setRating] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    googleReviewsService.getGooglePlaceDetails()
      .then(data => {
        setRating(data.rating);
        setTotal(data.totalReviews);
      })
      .catch(console.error);
  }, []);

  if (!rating) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="h4">{rating}</Typography>
      <Rating value={rating} readOnly precision={0.1} />
      <Typography variant="caption">
        ({total.toLocaleString('pt-BR')} avaliações)
      </Typography>
    </Box>
  );
}

// ========================================
// EXEMPLO 7: Card de estatísticas
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Star, Google } from '@mui/icons-material';

function GoogleStatsCard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    googleReviewsService.getGooglePlaceDetails()
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  if (!stats) return null;

  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Google color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Google Reviews</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
          <Typography variant="h3" sx={{ mr: 1 }}>
            {stats.rating}
          </Typography>
          <Star sx={{ color: '#fbbc04' }} />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          Baseado em {stats.totalReviews.toLocaleString('pt-BR')} avaliações
        </Typography>
      </CardContent>
    </Card>
  );
}

// ========================================
// EXEMPLO 8: Mesclar todas as avaliações (Google + Local)
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';
import { avaliacoesService } from '../services/avaliacoesService';

function TodasAvaliacoes() {
  const [todasAvaliacoes, setTodasAvaliacoes] = useState([]);

  useEffect(() => {
    async function loadAllReviews() {
      try {
        // Buscar do Google
        const googleData = await googleReviewsService.getGooglePlaceDetails();
        const googleReviews = googleData.reviews.map(googleReviewsService.formatGoogleReview);
        
        // Buscar locais
        const localData = await avaliacoesService.getAvaliacoes({ limit: 50 });
        const localReviews = localData.avaliacoes;
        
        // Combinar e ordenar por data
        const todas = [...googleReviews, ...localReviews]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setTodasAvaliacoes(todas);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      }
    }
    
    loadAllReviews();
  }, []);

  return (
    <div>
      <h2>Todas as Avaliações ({todasAvaliacoes.length})</h2>
      {todasAvaliacoes.map(review => (
        <div key={review.id}>
          <p><strong>{review.nomeUsuario}</strong></p>
          <p>⭐ {review.nota}</p>
          <p>{review.comentario}</p>
          {review.source === 'google' && <span>🔵 Google</span>}
        </div>
      ))}
    </div>
  );
}

// ========================================
// EXEMPLO 9: Badge de nota no Header/Footer
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';
import { Chip } from '@mui/material';
import { Star } from '@mui/icons-material';

function GoogleBadge() {
  const [rating, setRating] = useState(null);

  useEffect(() => {
    googleReviewsService.getGooglePlaceDetails()
      .then(data => setRating(data.rating))
      .catch(() => setRating(null));
  }, []);

  if (!rating) return null;

  return (
    <Chip 
      icon={<Star />}
      label={`${rating} no Google`}
      color="primary"
      size="small"
    />
  );
}

// ========================================
// EXEMPLO 10: Link para avaliar
// ========================================
import { useEffect, useState } from 'react';
import { googleReviewsService } from '../services/googleReviewsService';
import { Button } from '@mui/material';
import { RateReview } from '@mui/icons-material';

function AvaliarNoGoogleButton() {
  const [googleUrl, setGoogleUrl] = useState('');

  useEffect(() => {
    googleReviewsService.getGooglePlaceDetails()
      .then(data => setGoogleUrl(data.googleUrl))
      .catch(console.error);
  }, []);

  if (!googleUrl) return null;

  return (
    <Button
      variant="contained"
      startIcon={<RateReview />}
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Avaliar no Google
    </Button>
  );
}

export {
  MinhaPage,
  PaginaDepoimentos,
  PaginaAvaliacoes,
  Home,
  MeuComponente,
  GoogleRatingWidget,
  GoogleStatsCard,
  TodasAvaliacoes,
  GoogleBadge,
  AvaliarNoGoogleButton
};
