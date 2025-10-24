import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Chip, Button, Grid, Container, Pagination } from '@mui/material';
import { CalendarToday, Person, ArrowForward, Visibility, WhatsApp } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { postsService } from '../../services/postsService';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import { db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './BlogPage.css';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const postsPerPage = 9;

  useEffect(() => {
    loadPosts();
    loadWhatsAppNumber();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await postsService.getPosts({
        publicados: true,
        orderByField: 'createdAt',
        direction: 'desc'
      });
      setPosts(postsData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
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

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const truncateText = (text, maxLength = 150) => {
    const stripped = stripHtml(text);
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength) + '...';
  };

  const handleWhatsAppClick = (postTitle) => {
    if (!whatsappNumber) return;
    const message = `Olá! Vi o post "${postTitle}" no blog e gostaria de saber mais informações.`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const indexOfLastPost = page * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  if (loading) {
    return (
      <div className="blog-page">
        <Container>
          <Box className="loading-container">
            <Typography variant="h5">Carregando posts...</Typography>
          </Box>
        </Container>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <Box className="blog-hero">
        <Container>
          <Typography variant="h1" className="blog-hero-title">
            Nosso Blog
          </Typography>
          <Typography variant="h5" className="blog-hero-subtitle">
            Histórias, experiências e novidades da comunidade 20 Buscar
          </Typography>
        </Container>
      </Box>

      <Container className="blog-content">
        {posts.length === 0 ? (
          <Box className="no-posts">
            <Typography variant="h5">Nenhum post publicado ainda.</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={4} className="posts-grid">
              {currentPosts.map((post) => (
                <Grid item xs={12} sm={6} md={4} key={post.id}>
                  <Card className="blog-post-card">
                    {post.imagemCapa && (
                      <CardMedia
                        component="img"
                        height="220"
                        image={post.imagemCapa}
                        alt={post.titulo}
                        className="post-image"
                      />
                    )}
                    
                    <CardContent className="post-content">
                      <Box className="post-header">
                        {post.categoria && (
                          <Chip 
                            label={post.categoria} 
                            size="small" 
                            className="post-category"
                            color="primary"
                          />
                        )}
                        
                        {whatsappNumber && (
                          <button
                            className="whatsapp-mini-btn"
                            onClick={() => handleWhatsAppClick(post.titulo)}
                            title="Falar sobre este post"
                          >
                            <WhatsApp fontSize="small" />
                          </button>
                        )}
                      </Box>

                      <Typography variant="h5" className="post-title">
                        {post.titulo}
                      </Typography>

                      <Typography variant="body2" className="post-description">
                        {post.descricao || truncateText(post.conteudo)}
                      </Typography>

                      <Box className="post-meta">
                        <Box className="meta-item">
                          <CalendarToday fontSize="small" />
                          <Typography variant="caption">
                            {formatDate(post.createdAt)}
                          </Typography>
                        </Box>

                        {post.autor && (
                          <Box className="meta-item">
                            <Person fontSize="small" />
                            <Typography variant="caption">
                              {post.autor}
                            </Typography>
                          </Box>
                        )}

                        {post.views > 0 && (
                          <Box className="meta-item">
                            <Visibility fontSize="small" />
                            <Typography variant="caption">
                              {post.views}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box className="post-actions">
                        <Button
                          component={Link}
                          to={`/blog/${post.slug || post.id}`}
                          variant="text"
                          endIcon={<ArrowForward />}
                          className="read-more-btn"
                        >
                          Ler mais
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box className="pagination-container">
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton 
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <WhatsAppButton />
    </div>
  );
};

export default BlogPage;
