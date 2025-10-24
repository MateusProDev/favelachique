/**
 * Utilitários para gerenciar cache de avaliações do Google
 * 
 * Use estas funções no console do navegador (F12) quando precisar
 */

/**
 * Limpa o cache de avaliações do Google
 * Útil para forçar uma nova busca na API
 */
export const clearGoogleReviewsCache = () => {
  try {
    localStorage.removeItem('google_reviews_cache');
    console.log('✅ Cache de avaliações do Google limpo com sucesso!');
    console.log('🔄 Recarregue a página para buscar novos dados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
};

/**
 * Verifica informações do cache
 */
export const checkGoogleReviewsCache = () => {
  try {
    const cached = localStorage.getItem('google_reviews_cache');
    if (!cached) {
      console.log('❌ Nenhum cache encontrado');
      return null;
    }

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    const age = now - timestamp;
    const daysOld = Math.floor(age / (24 * 60 * 60 * 1000));
    const hoursOld = Math.floor(age / (60 * 60 * 1000));
    const daysRemaining = 30 - daysOld;

    console.log('📊 Informações do Cache:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📅 Criado há:', daysOld, 'dias (', hoursOld, 'horas)');
    console.log('⏰ Válido por mais:', daysRemaining, 'dias');
    console.log('⭐ Nota:', data.rating);
    console.log('📝 Total de avaliações:', data.totalReviews);
    console.log('💬 Avaliações no cache:', data.reviews?.length || 0);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      age,
      daysOld,
      hoursOld,
      daysRemaining,
      data
    };
  } catch (error) {
    console.error('❌ Erro ao verificar cache:', error);
    return null;
  }
};

/**
 * Força atualização do cache
 * Limpa o cache e recarrega a página
 */
export const forceUpdateGoogleReviews = () => {
  clearGoogleReviewsCache();
  window.location.reload();
};

// Expõe funções globalmente para uso no console
if (typeof window !== 'undefined') {
  window.clearGoogleReviewsCache = clearGoogleReviewsCache;
  window.checkGoogleReviewsCache = checkGoogleReviewsCache;
  window.forceUpdateGoogleReviews = forceUpdateGoogleReviews;
  
  console.log('🔧 Utilitários de cache disponíveis:');
  console.log('   • clearGoogleReviewsCache() - Limpa o cache');
  console.log('   • checkGoogleReviewsCache() - Verifica status do cache');
  console.log('   • forceUpdateGoogleReviews() - Força atualização');
}
