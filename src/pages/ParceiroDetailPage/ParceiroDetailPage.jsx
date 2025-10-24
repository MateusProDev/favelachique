import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  Language as LanguageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import parceiroService from '../../services/parceiroService';
import './ParceiroDetailPage.css';

const ParceiroDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parceiro, setParceiro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    carregarParceiro();
  }, [id]);

  const carregarParceiro = async () => {
    try {
      setLoading(true);
      const dados = await parceiroService.buscarPorId(id);
      setParceiro(dados);
    } catch (err) {
      setError('Parceiro não encontrado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVisitarSite = () => {
    if (parceiro?.website) {
      window.open(parceiro.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsApp = () => {
    if (parceiro?.whatsapp) {
      const message = encodeURIComponent(
        `Olá! Vim através do site Favela Chique e gostaria de saber mais sobre ${parceiro.nome}.`
      );
      window.open(`https://wa.me/${parceiro.whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (parceiro?.email) {
      window.location.href = `mailto:${parceiro.email}`;
    }
  };

  const handleTelefone = () => {
    if (parceiro?.telefone) {
      window.location.href = `tel:${parceiro.telefone}`;
    }
  };

  const handleMaps = () => {
    if (parceiro?.endereco) {
      const { rua, numero, bairro, cidade, estado } = parceiro.endereco;
      const endereco = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank');
    }
  };

  const handleRedeSocial = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const proximaImagem = () => {
    if (parceiro?.imagens?.length > 0) {
      setImagemAtual((prev) => (prev + 1) % parceiro.imagens.length);
    }
  };

  const imagemAnterior = () => {
    if (parceiro?.imagens?.length > 0) {
      setImagemAtual((prev) => (prev - 1 + parceiro.imagens.length) % parceiro.imagens.length);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !parceiro) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Parceiro não encontrado'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parceiros')}
        >
          Voltar para Parceiros
        </Button>
      </Container>
    );
  }

  const imagemPrincipal = parceiro.imagemCapa || parceiro.logo;
  const temGaleria = parceiro.imagens && parceiro.imagens.length > 0;

  return (
    <Box className="parceiro-detail-page">
      {/* Hero Section */}
      <Box className="pdp-hero">
        <div
          className="pdp-hero-image"
          style={{ backgroundImage: `url(${imagemPrincipal})` }}
        >
          <div className="pdp-hero-overlay" />
        </div>

        {/* Breadcrumb */}
        <Container maxWidth="lg" className="pdp-breadcrumb-wrapper">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{
              color: 'white',
              '& .MuiBreadcrumbs-separator': { color: 'white' }
            }}
          >
            <MuiLink
              component="button"
              onClick={() => navigate('/')}
              sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <HomeIcon fontSize="small" />
              Início
            </MuiLink>
            <MuiLink
              component="button"
              onClick={() => navigate('/parceiros')}
              sx={{ color: 'white' }}
            >
              Parceiros
            </MuiLink>
            <Typography sx={{ color: 'white' }}>{parceiro.nome}</Typography>
          </Breadcrumbs>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" className="pdp-content">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card className="pdp-main-card">
              <CardContent>
                {/* Header */}
                <Box className="pdp-header">
                  {parceiro.destaque && (
                    <Box className="pdp-badge-destaque">
                      <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                      Parceiro em Destaque
                    </Box>
                  )}

                  {/* Logo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <img
                      src={parceiro.logo}
                      alt={parceiro.nome}
                      style={{
                        maxWidth: 120,
                        maxHeight: 120,
                        objectFit: 'contain',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Box>
                      <Typography variant="h3" className="pdp-title">
                        {parceiro.nome}
                      </Typography>
                      <Chip
                        label={parceiro.categoria}
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Box>

                  <Typography variant="h6" className="pdp-short-description">
                    {parceiro.descricaoBreve}
                  </Typography>
                </Box>

                <Divider className="pdp-divider" />

                {/* Descrição Completa */}
                {parceiro.descricaoCompleta && (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Sobre
                    </Typography>
                    <Typography variant="body1" className="pdp-description-content">
                      {parceiro.descricaoCompleta}
                    </Typography>
                    <Divider className="pdp-divider" />
                  </>
                )}

                {/* Benefícios */}
                {parceiro.beneficios && parceiro.beneficios.length > 0 && (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      Benefícios e Vantagens
                    </Typography>
                    <List>
                      {parceiro.beneficios.map((beneficio, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={beneficio} />
                        </ListItem>
                      ))}
                    </List>
                    <Divider className="pdp-divider" />
                  </>
                )}

                {/* Tags */}
                {parceiro.tags && parceiro.tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Tags:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {parceiro.tags.map((tag, index) => (
                        <Chip key={index} label={tag} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Galeria de Imagens */}
                {temGaleria && (
                  <>
                    <Divider className="pdp-divider" />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                      Galeria
                    </Typography>
                    <Box className="parceiro-galeria">
                      <Box className="galeria-main">
                        <img
                          src={parceiro.imagens[imagemAtual]}
                          alt={`Imagem ${imagemAtual + 1}`}
                          className="galeria-imagem-principal"
                        />
                        {parceiro.imagens.length > 1 && (
                          <>
                            <IconButton
                              className="galeria-nav prev"
                              onClick={imagemAnterior}
                            >
                              ‹
                            </IconButton>
                            <IconButton
                              className="galeria-nav next"
                              onClick={proximaImagem}
                            >
                              ›
                            </IconButton>
                          </>
                        )}
                      </Box>
                      <Box className="galeria-thumbnails">
                        {parceiro.imagens.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className={`thumbnail ${index === imagemAtual ? 'active' : ''}`}
                            onClick={() => setImagemAtual(index)}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Card de Contato */}
              <Card className="pdp-sidebar-card">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Entre em Contato
                  </Typography>

                  {/* Botões de Ação Principais */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {parceiro.website && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<LanguageIcon />}
                        onClick={handleVisitarSite}
                        className="pdp-reserve-button"
                      >
                        Visitar Website
                      </Button>
                    )}
                    {parceiro.whatsapp && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<WhatsAppIcon />}
                        onClick={handleWhatsApp}
                        sx={{
                          background: '#25D366',
                          '&:hover': { background: '#20BA5A' }
                        }}
                      >
                        WhatsApp
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Informações de Contato */}
                  <List dense>
                    {parceiro.telefone && (
                      <ListItem button onClick={handleTelefone}>
                        <ListItemIcon>
                          <PhoneIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Telefone"
                          secondary={parceiro.telefone}
                        />
                      </ListItem>
                    )}
                    {parceiro.email && (
                      <ListItem button onClick={handleEmail}>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email"
                          secondary={parceiro.email}
                          secondaryTypographyProps={{
                            sx: { wordBreak: 'break-all' }
                          }}
                        />
                      </ListItem>
                    )}
                  </List>

                  {/* Redes Sociais */}
                  {(parceiro.redesSociais?.facebook || parceiro.redesSociais?.instagram || 
                    parceiro.redesSociais?.twitter || parceiro.redesSociais?.linkedin) && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Redes Sociais
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {parceiro.redesSociais?.facebook && (
                          <IconButton
                            color="primary"
                            onClick={() => handleRedeSocial(parceiro.redesSociais.facebook)}
                          >
                            <FacebookIcon />
                          </IconButton>
                        )}
                        {parceiro.redesSociais?.instagram && (
                          <IconButton
                            sx={{ color: '#E4405F' }}
                            onClick={() => handleRedeSocial(parceiro.redesSociais.instagram)}
                          >
                            <InstagramIcon />
                          </IconButton>
                        )}
                        {parceiro.redesSociais?.twitter && (
                          <IconButton
                            sx={{ color: '#1DA1F2' }}
                            onClick={() => handleRedeSocial(parceiro.redesSociais.twitter)}
                          >
                            <TwitterIcon />
                          </IconButton>
                        )}
                        {parceiro.redesSociais?.linkedin && (
                          <IconButton
                            sx={{ color: '#0A66C2' }}
                            onClick={() => handleRedeSocial(parceiro.redesSociais.linkedin)}
                          >
                            <LinkedInIcon />
                          </IconButton>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Card de Endereço */}
              {parceiro.endereco?.cidade && (
                <Card className="pdp-sidebar-card">
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Localização
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                      <Box>
                        {parceiro.endereco.rua && (
                          <Typography variant="body2">
                            {parceiro.endereco.rua}
                            {parceiro.endereco.numero && `, ${parceiro.endereco.numero}`}
                          </Typography>
                        )}
                        {parceiro.endereco.bairro && (
                          <Typography variant="body2">
                            {parceiro.endereco.bairro}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {parceiro.endereco.cidade} - {parceiro.endereco.estado}
                        </Typography>
                        {parceiro.endereco.cep && (
                          <Typography variant="body2">
                            CEP: {parceiro.endereco.cep}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<LocationOnIcon />}
                      onClick={handleMaps}
                      sx={{ mt: 2 }}
                    >
                      Ver no Mapa
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ParceiroDetailPage;
