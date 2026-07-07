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
import { useWhatsAppNumber } from '../../hooks/useWhatsAppNumber';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import MarkdownRenderer from '../../components/MarkdownRenderer/MarkdownRenderer';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteSlug } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  const formatPacoteData = useCallback((doc) => {
    const data = doc.data();
    const tituloExibido = data.titulo || data.nome || data.name || data.title || 'Pacote';
    const nomePersonalizado = data.nomePersonalizado || data.nomePersonal || data.alias || '';
    const tituloPagina = nomePersonalizado?.trim() || tituloExibido;

    return {
      id: doc.id,
      titulo: tituloPagina,
      tituloOriginal: tituloExibido,
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

  useEffect(() => {
    if (!pacote) {
      document.title = '20 Buscar - Agência de Turismo';
      return;
    }

    const titleBase = `${pacote.titulo || pacote.tituloOriginal} | 20 Buscar`;
    document.title = titleBase;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${pacote.titulo} - Descubra este pacote com a 20 Buscar.`);
    }

    return () => {
      document.title = '20 Buscar - Agência de Turismo';
    };
  }, [pacote]);

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

  const { phoneNumber: whatsappNumber } = useWhatsAppNumber();

  const normalizeWhatsappNumber = (number) => {
    if (!number) return '';
    let cleaned = number.toString().replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (!cleaned.startsWith('55')) {
      cleaned = `55${cleaned}`;
    }
    return cleaned;
  };

  const buildWhatsappUrl = (number, message) => {
    const formatted = normalizeWhatsappNumber(number);
    if (!formatted) return null;
    return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
  };

  const handleSolicitarCotacao = () => {
    if (!pacote) return;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18301434043/FuEQCIb6yswcELvx5pZE'
      });
    }

    const message = `Olá, gostaria de solicitar cotação para o pacote "${pacote.titulo}". Por favor, envie mais informações e condições.`;
    const url = buildWhatsappUrl(whatsappNumber, message);
    if (!url) {
      alert('Número de WhatsApp não disponível no momento. Tente novamente mais tarde.');
      return;
    }
    window.open(url, '_blank');
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
              currentPage={pacote.titulo || pacote.tituloOriginal}
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
                  {pacote.titulo || pacote.tituloOriginal}
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

          {/* Sidebar - Preço e Cotação */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} className="pdp-sidebar-card">
              <div className="pdp-price-section">
                <Typography variant="overline" className="pdp-price-label">
                  Orçamento Sob Consulta
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Os preços não são exibidos no site. Solicite sua cotação e receba atendimento personalizado.
                </Typography>
              </div>

              <Button 
                id={`whatsapp-cotacao-btn-${pacote?.slug || pacote?.id || 'pacote'}`}
                variant="contained" 
                size="large" 
                fullWidth
                className="pdp-reserve-button"
                onClick={handleSolicitarCotacao}
              >
                📩 Solicitar Cotação
              </Button>

              <div className="pdp-benefits">
                <Typography variant="subtitle2" className="pdp-benefits-title">
                  ✨ Por que solicitar cotação?
                </Typography>
                <ul className="pdp-benefits-list">
                  <li>✓ Atendimento rápido pelo WhatsApp</li>
                  <li>✓ Proposta personalizada para você</li>
                  <li>✓ Melhor preço e condições exclusivas</li>
                  <li>✓ Suporte direto antes da compra</li>
                </ul>
              </div>
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