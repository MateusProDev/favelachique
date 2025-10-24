/**
 * EXEMPLO PRONTO - Copie e cole no GoogleReviews.jsx
 * 
 * Este é um exemplo completo que você pode usar como base
 * Substitua os dados pelos do seu negócio
 */

const GOOGLE_REVIEWS_DATA = {
  // ========================================
  // 1. LINK DO GOOGLE REVIEWS
  // ========================================
  // Como pegar:
  // - Google Maps → Seu negócio → Compartilhar → Copiar link
  // - OU use o formato: https://search.google.com/local/writereview?placeid=SEU_PLACE_ID
  
  googleUrl: 'https://g.page/r/CeJ2VkqsSpdqEBM/review',
  
  // ========================================
  // 2. NOTA MÉDIA
  // ========================================
  // Veja no Google Maps ou Google Meu Negócio
  // Exemplo: 4.8, 4.5, 5.0
  
  rating: 4.8,
  
  // ========================================
  // 3. TOTAL DE AVALIAÇÕES
  // ========================================
  // Número que aparece no Google Maps
  // Exemplo: 150, 87, 1250
  
  totalReviews: 150,
  
  // ========================================
  // 4. AVALIAÇÕES
  // ========================================
  // Copie do Google Reviews e cole aqui
  // Recomendado: 1-3 avaliações
  
  reviews: [
    // AVALIAÇÃO 1 (essa vai aparecer no card principal)
    {
      author_name: 'Maria Silva',
      author_avatar: '', // Deixe vazio (usa inicial do nome)
      rating: 5,
      time: 'Há 2 meses',
      text: 'Experiência incrível! O tour foi muito bem organizado e o guia super atencioso. Conhecemos a história da comunidade de perto e foi emocionante. Recomendo demais para quem quer viver uma experiência autêntica. Vale cada centavo!'
    },
    
    // AVALIAÇÃO 2 (opcional - não aparece, mas fica salva)
    {
      author_name: 'João Santos',
      author_avatar: '',
      rating: 5,
      time: 'Há 1 mês',
      text: 'Maravilhoso! Aprendi muito sobre a cultura local. O passeio é imperdível!'
    },
    
    // AVALIAÇÃO 3 (opcional - não aparece, mas fica salva)
    {
      author_name: 'Ana Costa',
      author_avatar: '',
      rating: 5,
      time: 'Há 3 semanas',
      text: 'Adorei cada minuto! Super organizado e educativo. Voltaria com certeza!'
    },
  ]
};

// ========================================
// DICAS PARA ESCOLHER BOAS AVALIAÇÕES
// ========================================

/*

✅ ESCOLHA AVALIAÇÕES QUE:
- Têm 5 estrelas ⭐⭐⭐⭐⭐
- São detalhadas (mais de 1 linha)
- Mencionam pontos fortes do seu negócio
- São recentes (últimos 3-6 meses)
- Têm um tom positivo e genuíno
- Mencionam experiências específicas

❌ EVITE AVALIAÇÕES QUE:
- Têm menos de 4 estrelas
- São muito curtas ("Bom", "Legal")
- São muito antigas (mais de 1 ano)
- Têm erros de português graves
- São genéricas demais

📝 COMO COPIAR DO GOOGLE:

1. Acesse: Google Maps → Seu Negócio → Avaliações
2. Escolha uma boa avaliação
3. Copie:
   - Nome: "Maria Silva"
   - Estrelas: 5
   - Tempo: "Há 2 meses" (veja embaixo do nome)
   - Texto: Clique em "Mais" se estiver cortado

4. Cole no formato acima

*/

// ========================================
// EXEMPLO COM DADOS REAIS (SUBSTITUA)
// ========================================

const EXEMPLO_REAL = {
  googleUrl: 'https://g.page/r/CRocena-Tour-Favela/review',
  rating: 4.9,
  totalReviews: 87,
  
  reviews: [
    {
      author_name: 'Carlos Mendes',
      author_avatar: '',
      rating: 5,
      time: 'Há 1 semana',
      text: 'Fiz o tour completo e foi sensacional! O guia é muito conhecedor da história local e nos levou aos melhores pontos. A comunidade é acolhedora e a experiência foi transformadora. Recomendo fortemente!'
    },
    {
      author_name: 'Beatriz Lima',
      author_avatar: '',
      rating: 5,
      time: 'Há 2 semanas',
      text: 'Simplesmente perfeito! Adorei conhecer a cultura local através desse tour. Muito bem organizado e seguro. Com certeza voltarei!'
    },
  ]
};

// ========================================
// COMO USAR ESTE EXEMPLO
// ========================================

/*

1. Copie TODO o bloco GOOGLE_REVIEWS_DATA acima
2. Abra: src/components/GoogleReviews/GoogleReviews.jsx
3. Encontre a linha que tem: const GOOGLE_REVIEWS_DATA = {
4. Substitua TUDO até a chave } final
5. Salve o arquivo
6. Recarregue o site (Ctrl+Shift+R)
7. Pronto! ✅

*/

// ========================================
// TROUBLESHOOTING
// ========================================

/*

❓ Não aparece nada na página?
→ Verifique se tem pelo menos 1 avaliação no array reviews
→ Abra o console (F12) e veja se tem erros

❓ O link não abre?
→ Verifique se o googleUrl está correto
→ Teste clicando no link direto no navegador

❓ As estrelas não aparecem?
→ Verifique se o rating está entre 1 e 5
→ Use ponto, não vírgula: 4.8 (não 4,8)

❓ Nome sem foto?
→ Normal! Deixe author_avatar vazio
→ O sistema usa a primeira letra do nome automaticamente

❓ Quer adicionar mais avaliações?
→ Copie o bloco { author_name... } completo
→ Cole abaixo, separado por vírgula
→ Lembre-se da vírgula entre os blocos!

*/

export default GOOGLE_REVIEWS_DATA;
