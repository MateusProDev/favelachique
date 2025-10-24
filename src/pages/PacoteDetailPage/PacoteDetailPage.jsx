import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  Typography, 
  Container, 
  Box, 
  Button, 
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import ReservaModalV2 from '../../components/ReservaModalV2/ReservaModalV2';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const formatPacoteData = useCallback((doc) => {
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
  }, [pacoteSlug]);

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const pacotesRef = collection(db, 'pacotes');
        const q = query(pacotesRef, where("slug", "==", pacoteSlug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setPacote(formatPacoteData(doc));
          return;
        }
        
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
  }, [pacoteSlug, formatPacoteData]);

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

  const handleAccordionChange = () => {
    setExpanded(!expanded);
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
      {/* Hero Section com Imagem */}
      <div className="pdp-hero">
        {pacote.imagens.length > 0 ? (
          <>
            <div 
              className="pdp-hero-image"
              style={{ backgroundImage: `url(${pacote.imagens[currentImageIndex]})` }}
            >
              <div className="pdp-hero-overlay"></div>
            </div>
            {pacote.imagens.length > 1 && (
              <>
                <button className="pdp-nav-button prev" onClick={prevImage}>
                  ❮
                </button>
                <button className="pdp-nav-button next" onClick={nextImage}>
                  ❯
                </button>
                <div className="pdp-image-indicators">
                  {pacote.imagens.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`Ver imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="pdp-hero-placeholder">
            <Typography variant="h6">Nenhuma imagem disponível</Typography>
          </div>
        )}
        
        {/* Breadcrumb no Hero */}
        <div className="pdp-breadcrumb-wrapper">
          <Container maxWidth="lg">
            <Breadcrumb 
              items={[
                { path: '/pacotes', label: 'Pacotes' }
              ]}
              currentPage={pacote.titulo}
            />
          </Container>
        </div>
      </div>

      <Container maxWidth="lg" className="pdp-content">
        <Grid container spacing={4}>
          {/* Coluna Principal - Informações */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} className="pdp-main-card">
              <div className="pdp-header">
                {pacote.destaque && (
                  <div className="pdp-badge-destaque">
                    ⭐ Pacote em Destaque
                  </div>
                )}
                <Typography variant="h3" className="pdp-title">
                  {pacote.titulo}
                </Typography>
                <Typography variant="h6" className="pdp-short-description">
                  {pacote.descricaoCurta}
                </Typography>
              </div>

              <Divider className="pdp-divider" />

              {/* Thumbnails de Imagens */}
              {pacote.imagens.length > 1 && (
                <div className="pdp-thumbnails">
                  {pacote.imagens.map((img, index) => (
                    <div
                      key={index}
                      className={`pdp-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}

              <Divider className="pdp-divider" />

              {/* Descrição Completa */}
              <Accordion 
                expanded={expanded}
                onChange={handleAccordionChange}
                className="pdp-accordion"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  className="pdp-accordion-summary"
                >
                  <Typography className="pdp-accordion-title">
                    📋 Descrição Completa do Pacote
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="pdp-accordion-details">
                  <MarkdownRenderer 
                    content={pacote.descricao} 
                    className="pdp-description-content" 
                  />
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          {/* Sidebar - Preço e Reserva */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className="pdp-sidebar-card">
              <div className="pdp-price-section">
                <Typography variant="overline" className="pdp-price-label">
                  Valor do Pacote
                </Typography>
                
                {pacote.precoOriginal && (
                  <div className="pdp-price-original">
                    <Typography variant="body2">De:</Typography>
                    <Typography variant="h6">
                      R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                    </Typography>
                  </div>
                )}
                
                <div className="pdp-price-current">
                  <Typography variant="body2">Por apenas:</Typography>
                  <Typography variant="h3" className="pdp-price-value">
                    R$ {pacote.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </div>

                {pacote.precoOriginal && (
                  <div className="pdp-discount-badge">
                    Economize R$ {(pacote.precoOriginal - pacote.preco).toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>

              <Button 
                variant="contained" 
                size="large" 
                fullWidth
                className="pdp-reserve-button"
                onClick={() => setModalOpen(true)}
              >
                🎫 Reservar Agora
              </Button>

              <div className="pdp-benefits">
                <Typography variant="subtitle2" className="pdp-benefits-title">
                  ✨ Vantagens da Reserva:
                </Typography>
                <ul className="pdp-benefits-list">
                  <li>✓ Confirmação imediata</li>
                  <li>✓ Melhor preço garantido</li>
                  <li>✓ Suporte 24/7</li>
                  <li>✓ Pagamento seguro</li>
                </ul>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <ReservaModalV2 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        pacote={pacote} 
      />
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default PacoteDetailPage;