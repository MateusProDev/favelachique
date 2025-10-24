import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Chip, 
  Avatar, 
  Button, 
  Divider,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  CalendarToday, 
  Person, 
  Visibility, 
  ArrowBack, 
  WhatsApp, 
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  AccessTime,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';
import { postsService } from '../../services/postsService';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    loadPost();
    loadWhatsAppNumber();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await postsService.getPostBySlug(slug);
      if (postData) {
        setPost(postData);
        // Calcular tempo de leitura (média de 200 palavras por minuto)
        const wordCount = postData.conteudo.replace(/<[^>]*>/g, '').split(/\s+/).length;
        setReadingTime(Math.ceil(wordCount / 200));
        // Incrementar visualizações
        await postsService.incrementPostViews(postData.id);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppNumber = async () => {
    try {
      const docRef = doc(db, "settings", "whatsapp");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWhatsappNumber(docSnap.data().number || '');
      }
    } catch (error) {
      console.error('Erro ao carregar WhatsApp:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleWhatsAppShare = () => {
    if (!whatsappNumber || !post) return;
    const message = `Olá! Acabei de ler o post "${post.titulo}" no blog da 20 Buscar e gostaria de saber mais informações. ${window.location.href}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.descricao,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback: copiar link
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.titulo);
    const text = encodeURIComponent(post.descricao || '');

    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Aqui você pode adicionar lógica para salvar no localStorage ou backend
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="blog-post-page">
          <Container>
            <Box className="loading-container">
              <LinearProgress sx={{ mb: 2, maxWidth: 400, mx: 'auto' }} />
              <Typography variant="h5" color="text.secondary">
                Carregando post...
              </Typography>
            </Box>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="blog-post-page">
          <Container>
            <Box className="not-found-container">
              <Typography variant="h3" gutterBottom>
                Post não encontrado
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                O post que você está procurando não existe ou foi removido.
              </Typography>
              <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate('/blog')}
                variant="contained"
                size="large"
              >
                Voltar ao Blog
              </Button>
            </Box>
          </Container>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="blog-post-page">
        {/* Hero Section com Imagem de Capa */}
        {post.imagemCapa && (
          <Box className="post-hero-section">
            <img src={post.imagemCapa} alt={post.titulo} className="hero-cover-image" />
            <div className="hero-overlay"></div>
          </Box>
        )}

        <Container className="post-container">
          {/* Barra de Navegação Fixa */}
          <Box className="post-nav-bar">
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/blog')}
              className="back-btn-modern"
              size="small"
            >
              Blog
            </Button>
            
            <Box className="post-nav-actions">
              <Tooltip title={isSaved ? "Remover dos salvos" : "Salvar para ler depois"}>
                <IconButton onClick={toggleSave} className="action-icon-btn">
                  {isSaved ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Compartilhar">
                <IconButton onClick={handleShare} className="action-icon-btn">
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <article className="post-article-modern">
            {/* Cabeçalho do Post */}
            <Box className="post-header-modern">
              {post.categoria && (
                <Chip 
                  label={post.categoria} 
                  className="category-chip-modern"
                  size="small"
                />
              )}

              <Typography variant="h1" className="post-title-modern">
                {post.titulo}
              </Typography>

              {post.descricao && (
                <Typography variant="h2" className="post-description-modern">
                  {post.descricao}
                </Typography>
              )}

              {/* Informações do Autor e Metadata */}
              <Box className="post-meta-modern">
                <Box className="author-section">
                  {post.autor && (
                    <Avatar className="author-avatar-modern">
                      {post.autor.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <Box className="author-info">
                    <Typography variant="subtitle1" className="author-name">
                      {post.autor || '20Buscar Vacation Beach'}
                    </Typography>
                    <Box className="meta-tags">
                      <Chip 
                        icon={<CalendarToday />}
                        label={formatDate(post.createdAt)}
                        size="small"
                        variant="outlined"
                        className="meta-chip"
                      />
                      {readingTime > 0 && (
                        <Chip 
                          icon={<AccessTime />}
                          label={`${readingTime} min de leitura`}
                          size="small"
                          variant="outlined"
                          className="meta-chip"
                        />
                      )}
                      {post.views > 0 && (
                        <Chip 
                          icon={<Visibility />}
                          label={`${post.views} visualizações`}
                          size="small"
                          variant="outlined"
                          className="meta-chip"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Compartilhamento Social */}
                <Box className="social-share-section">
                  <Typography variant="caption" className="share-label">
                    Compartilhar:
                  </Typography>
                  <Box className="social-buttons">
                    <Tooltip title="Facebook">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSocialShare('facebook')}
                        className="social-btn facebook-btn"
                      >
                        <Facebook fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Twitter">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSocialShare('twitter')}
                        className="social-btn twitter-btn"
                      >
                        <Twitter fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="LinkedIn">
                      <IconButton 
                        size="small" 
                        onClick={() => handleSocialShare('linkedin')}
                        className="social-btn linkedin-btn"
                      >
                        <LinkedIn fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider className="modern-divider" />

            {/* Conteúdo do Post */}
            <Box className="post-content-modern">
              <div 
                className="content-html-modern"
                dangerouslySetInnerHTML={{ __html: post.conteudo }} 
              />
            </Box>

            <Divider className="modern-divider" />

            {/* Footer com CTA */}
            <Box className="post-footer-modern">
              <Box className="cta-box">
                <Typography variant="h5" className="cta-title-modern">
                  Gostou deste conteúdo?
                </Typography>
                <Typography variant="body1" className="cta-subtitle">
                  Entre em contato conosco para saber mais sobre nossos serviços!
                </Typography>
                
                <Box className="cta-buttons">
                  {whatsappNumber && (
                    <Button
                      variant="contained"
                      startIcon={<WhatsApp />}
                      onClick={handleWhatsAppShare}
                      className="whatsapp-cta-btn"
                      size="large"
                    >
                      Falar no WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/blog')}
                    className="blog-cta-btn"
                    size="large"
                  >
                    Ver Mais Posts
                  </Button>
                </Box>
              </Box>

              {/* Tags do Post */}
              {post.tags && post.tags.length > 0 && (
                <Box className="post-tags-section">
                  <Typography variant="caption" className="tags-label">
                    Tags:
                  </Typography>
                  <Box className="tags-container">
                    {post.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        className="tag-chip"
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </article>
        </Container>
      </div>
      
      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default BlogPostPage;
