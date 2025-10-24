import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Chip, Avatar, Button, Divider } from '@mui/material';
import { CalendarToday, Person, Visibility, ArrowBack, WhatsApp, Share } from '@mui/icons-material';
import { postsService } from '../../services/postsService';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './BlogPostPage.css';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    loadPost();
    loadWhatsAppNumber();
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await postsService.getPostBySlug(slug);
      if (postData) {
        setPost(postData);
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

  if (loading) {
    return (
      <div className="blog-post-page">
        <Container>
          <Box className="loading-container">
            <Typography variant="h5">Carregando post...</Typography>
          </Box>
        </Container>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-page">
        <Container>
          <Box className="not-found-container">
            <Typography variant="h4">Post não encontrado</Typography>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={() => navigate('/blog')}
              variant="contained"
            >
              Voltar ao Blog
            </Button>
          </Box>
        </Container>
      </div>
    );
  }

  return (
    <div className="blog-post-page">
      <Container className="post-container">
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/blog')}
          className="back-btn"
        >
          Voltar ao Blog
        </Button>

        <article className="post-article">
          {post.imagemCapa && (
            <Box className="post-cover-image">
              <img src={post.imagemCapa} alt={post.titulo} />
            </Box>
          )}

          <Box className="post-header">
            {post.categoria && (
              <Chip 
                label={post.categoria} 
                color="primary"
                className="post-category-chip"
              />
            )}

            <Typography variant="h1" className="post-main-title">
              {post.titulo}
            </Typography>

            {post.descricao && (
              <Typography variant="h5" className="post-subtitle">
                {post.descricao}
              </Typography>
            )}

            <Box className="post-meta-info">
              {post.autor && (
                <Box className="meta-item">
                  <Avatar className="author-avatar">
                    {post.autor.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" className="meta-label">
                      Autor
                    </Typography>
                    <Typography variant="body1" className="meta-value">
                      {post.autor}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box className="meta-item">
                <CalendarToday />
                <Box>
                  <Typography variant="body2" className="meta-label">
                    Publicado em
                  </Typography>
                  <Typography variant="body1" className="meta-value">
                    {formatDate(post.createdAt)}
                  </Typography>
                </Box>
              </Box>

              {post.views > 0 && (
                <Box className="meta-item">
                  <Visibility />
                  <Box>
                    <Typography variant="body2" className="meta-label">
                      Visualizações
                    </Typography>
                    <Typography variant="body1" className="meta-value">
                      {post.views}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Divider className="section-divider" />

          <Box className="post-content">
            <div 
              className="content-html"
              dangerouslySetInnerHTML={{ __html: post.conteudo }} 
            />
          </Box>

          <Divider className="section-divider" />

          <Box className="post-actions-footer">
            <Typography variant="h6" className="cta-title">
              Gostou do conteúdo?
            </Typography>
            <Box className="action-buttons">
              {whatsappNumber && (
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppShare}
                  className="whatsapp-action-btn"
                >
                  Falar no WhatsApp
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                className="share-btn"
              >
                Compartilhar
              </Button>
            </Box>
          </Box>
        </article>
      </Container>

      <WhatsAppButton />
    </div>
  );
};

export default BlogPostPage;
