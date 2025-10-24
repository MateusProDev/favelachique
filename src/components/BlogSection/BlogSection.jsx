import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Chip, Button } from '@mui/material';
import { CalendarToday, Person, ArrowForward, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { postsService } from '../../services/postsService';
import './BlogSection.css';

const BlogSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await postsService.getPosts({
        publicados: true,
        orderByField: 'createdAt',
        direction: 'desc',
        limitCount: 3
      });
      setPosts(postsData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <section className="blog-section">
        <div className="container">
          <Typography>Carregando posts...</Typography>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="blog-section">
      <div className="container">
        <Box className="section-header">
          <Typography variant="h2" className="section-title">
            Nosso Blog
          </Typography>
          <Typography variant="subtitle1" className="section-subtitle">
            Histórias, experiências e novidades da comunidade
          </Typography>
        </Box>

        <div className="posts-grid">
          {posts.map((post) => (
            <Card className="post-card" key={post.id}>
              {post.imagemCapa && (
                <CardMedia
                  component="img"
                  image={post.imagemCapa}
                  alt={post.titulo}
                  className="post-image"
                />
              )}
              
              <CardContent className="post-content">
                {post.categoria && (
                  <Chip 
                    label={post.categoria} 
                    size="small" 
                    className="post-category"
                    color="primary"
                  />
                )}

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

                <Button
                  component={Link}
                  to={`/blog/${post.slug || post.id}`}
                  variant="text"
                  endIcon={<ArrowForward />}
                  className="read-more-btn"
                >
                  Ler mais
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {posts.length >= 3 && (
          <Box className="blog-footer">
            <Button
              component={Link}
              to="/blog"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
            >
              Ver todos os posts
            </Button>
          </Box>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
