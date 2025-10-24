/**
 * Google Places API Service
 * Busca avaliações do Google para exibir no site
 * Com cache de 30 dias no localStorage
 */

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
const PLACE_ID = process.env.REACT_APP_GOOGLE_PLACE_ID;
const CACHE_KEY = 'google_reviews_cache';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias em millisegundos

/**
 * Busca dados do cache se ainda válido
 */
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Verifica se o cache ainda é válido (30 dias)
    if (now - timestamp < CACHE_DURATION) {
      console.log('✅ Usando cache de avaliações do Google (válido por mais', 
        Math.floor((CACHE_DURATION - (now - timestamp)) / (24 * 60 * 60 * 1000)), 'dias)');
      return data;
    }

    // Cache expirado
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Erro ao ler cache:', error);
    return null;
  }
};

/**
 * Salva dados no cache
 */
const setCachedData = (data) => {
  try {
    const cacheObject = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    console.log('💾 Avaliações do Google salvas no cache (válido por 30 dias)');
  } catch (error) {
    console.error('Erro ao salvar cache:', error);
  }
};

/**
 * Busca detalhes do estabelecimento incluindo avaliações
 * Com cache de 30 dias
 */
export const getGooglePlaceDetails = async () => {
  if (!GOOGLE_API_KEY || !PLACE_ID) {
    console.warn('Google Places API não configurada. Adicione REACT_APP_GOOGLE_PLACES_API_KEY e REACT_APP_GOOGLE_PLACE_ID no .env');
    return null;
  }

  // Verifica cache primeiro
  const cachedData = getCachedData();
  if (cachedData) {
    return cachedData;
  }

  try {
    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'reviews',
      'url'
    ].join(',');

    // Usando CORS proxy para evitar problemas de CORS
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=${fields}&key=${GOOGLE_API_KEY}&language=pt-BR`;
    
    const response = await fetch(corsProxy + encodeURIComponent(apiUrl));
    
    if (!response.ok) {
      throw new Error('Erro ao buscar avaliações do Google');
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || 'Erro na resposta da API do Google');
    }

    const result = {
      name: data.result.name,
      rating: data.result.rating,
      totalReviews: data.result.user_ratings_total,
      reviews: data.result.reviews || [],
      googleUrl: data.result.url
    };

    // Salva no cache
    setCachedData(result);

    return result;
  } catch (error) {
    console.error('Erro ao buscar avaliações do Google:', error);
    throw error;
  }
};

/**
 * Formata avaliação do Google para o formato do sistema
 */
export const formatGoogleReview = (review) => {
  return {
    id: `google_${review.time}`,
    nomeUsuario: review.author_name,
    avatarUsuario: review.profile_photo_url,
    nota: review.rating,
    comentario: review.text,
    createdAt: new Date(review.time * 1000),
    verificado: true, // Avaliações do Google são sempre verificadas
    source: 'google'
  };
};

export const googleReviewsService = {
  getGooglePlaceDetails,
  formatGoogleReview
};
