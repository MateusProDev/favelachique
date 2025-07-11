import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  Breadcrumbs, 
  Typography, 
  Container, 
  Box, 
  Button, 
  IconButton,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primeiro tenta buscar pelo slug
        const pacotesRef = collection(db, 'pacotes');
        const q = query(pacotesRef, where("slug", "==", pacoteSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPacote(formatPacoteData(doc));
          return;
        }
        
        // Se não encontrou pelo slug, tenta buscar pelo ID
        try {
          const docRef = doc(db, 'pacotes', pacoteSlug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setPacote(formatPacoteData(docSnap));
          } else {
            setError("Pacote não encontrado");
          }
        } catch (err) {
          console.error("Erro ao buscar pacote por ID:", err);
          setError("Pacote não encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar pacote:", err);
        setError("Erro ao carregar pacote. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPacote();
  }, [pacoteSlug]);

  const formatPacoteData = (doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data.titulo || '',
      descricao: data.descricao || '',
      descricaoCurta: data.descricaoCurta || '',
      preco: parseFloat(data.preco) || 0,
      precoOriginal: data.precoOriginal ? parseFloat(data.precoOriginal) : null,
      imagens: Array.isArray(data.imagens) ? data.imagens : [],
      slug: data.slug || pacoteSlug,
      destaque: data.destaque || false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === pacote.imagens.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? pacote.imagens.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pacotes')}
        >
          Voltar para lista de pacotes
        </Button>
      </Container>
    );
  }

  if (!pacote) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pacote não encontrado
        </Typography>
        <Typography sx={{ mb: 2 }}>
          O pacote que você está procurando não existe ou foi removido.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/pacotes')}
        >
          Voltar para lista de pacotes
        </Button>
      </Container>
    );
  }

  return (
    <div className="pdp-container">
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3, pt: 2 }}>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <IconButton component={Link} to="/" size="small">
              <HomeIcon fontSize="small" />
            </IconButton>
            <Link to="/pacotes">Pacotes</Link>
            <Typography color="text.primary">
              {pacote.titulo}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        {/* Conteúdo Principal */}
        <Grid container spacing={4}>
          {/* Galeria de Imagens */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {pacote.imagens.length > 0 ? (
                <div className="image-gallery">
                  <div className="main-image-container">
                    <img 
                      src={pacote.imagens[currentImageIndex]} 
                      alt={pacote.titulo} 
                      className="main-image"
                    />
                    {pacote.imagens.length > 1 && (
                      <>
                        <button className="nav-button prev" onClick={prevImage}>
                          &lt;
                        </button>
                        <button className="nav-button next" onClick={nextImage}>
                          &gt;
                        </button>
                      </>
                    )}
                  </div>
                  {pacote.imagens.length > 1 && (
                    <div className="thumbnail-container">
                      {pacote.imagens.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Thumbnail ${index + 1}`}
                          className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="300px"
                  bgcolor="#f5f5f5"
                >
                  <Typography variant="body1">Nenhuma imagem disponível</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Detalhes do Pacote */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {pacote.titulo}
              </Typography>
              
              {pacote.destaque && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="secondary" sx={{ fontWeight: 'bold' }}>
                    ★ PACOTE EM DESTAQUE ★
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" paragraph>
                  {pacote.descricaoCurta}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Detalhes do Pacote
                </Typography>
                <Typography variant="body1" paragraph>
                  {pacote.descricao}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {pacote.precoOriginal && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: 'line-through',
                      color: 'text.secondary',
                      mr: 2
                    }}
                  >
                    R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                  </Typography>
                )}
                <Typography variant="h4" color="primary">
                  R$ {pacote.preco.toFixed(2).replace('.', ',')}
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                size="large" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Reservar Agora
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PacoteDetailPage;