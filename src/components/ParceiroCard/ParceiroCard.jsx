import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Language as LanguageIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import './ParceiroCard.css';

const ParceiroCard = ({ parceiro, showActions = true }) => {
  const navigate = useNavigate();

  const handleVerDetalhes = () => {
    navigate(`/parceiro/${parceiro.id}`);
  };

  const handleVisitarSite = () => {
    console.log('Website do parceiro:', parceiro.website);
    console.log('Parceiro completo:', parceiro);
    if (parceiro.website) {
      // Garante que o URL tenha o protocolo
      let url = parceiro.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsApp = () => {
    if (parceiro.whatsapp) {
      const message = encodeURIComponent(`Olá! Vim através do site 20Buscar Vacation Beach e gostaria de saber mais sobre ${parceiro.nome}.`);
      window.open(`https://wa.me/${parceiro.whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleTelefone = () => {
    if (parceiro.telefone) {
      window.location.href = `tel:${parceiro.telefone}`;
    }
  };

  return (
    <Card className="parceiro-card">
      {/* Badge de Destaque */}
      {parceiro.destaque && (
        <Box className="destaque-badge">
          <StarIcon fontSize="small" />
          <Typography variant="caption">Parceiro em Destaque</Typography>
        </Box>
      )}

      {/* Logo */}
      <Box className="parceiro-logo-container">
        <CardMedia
          component="img"
          image={parceiro.logo || '/placeholder-logo.png'}
          alt={parceiro.nome}
          className="parceiro-logo"
        />
      </Box>

      <CardContent className="parceiro-content">
        {/* Categoria */}
        <Chip
          label={parceiro.categoria}
          size="small"
          color="primary"
          sx={{ 
            mb: 0.5,
            height: '22px',
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        />

        {/* Nome */}
        <Typography variant="h6" component="h3" className="parceiro-nome">
          {parceiro.nome}
        </Typography>

        {/* Descrição Breve */}
        <Typography variant="body2" color="text.secondary" className="parceiro-descricao">
          {parceiro.descricaoBreve}
        </Typography>

        {/* Locais */}
        {parceiro.locais && parceiro.locais.length > 0 && (
          <Box className="parceiro-tags" sx={{ mt: 0.5 }}>
            {parceiro.locais.slice(0, 2).map((local, index) => (
              <Chip
                key={index}
                label={local}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.65rem',
                  height: '22px',
                  borderColor: 'rgba(0,0,0,0.12)'
                }}
              />
            ))}
          </Box>
        )}

        {/* Contatos Rápidos */}
        {showActions && (parceiro.whatsapp || parceiro.telefone) && (
          <Box className="parceiro-contatos-rapidos">
            {parceiro.whatsapp && (
              <Tooltip title="WhatsApp" arrow>
                <IconButton
                  size="small"
                  onClick={handleWhatsApp}
                  sx={{ 
                    color: '#25D366',
                    '&:hover': { 
                      backgroundColor: 'rgba(37, 211, 102, 0.08)',
                      borderColor: '#25D366'
                    }
                  }}
                >
                  <WhatsAppIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            )}
            {parceiro.telefone && (
              <Tooltip title="Telefone" arrow>
                <IconButton
                  size="small"
                  onClick={handleTelefone}
                  sx={{
                    color: '#667eea',
                    '&:hover': { 
                      backgroundColor: 'rgba(102, 126, 234, 0.08)',
                      borderColor: '#667eea'
                    }
                  }}
                >
                  <PhoneIcon sx={{ fontSize: '1.1rem' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </CardContent>

      {showActions && (
        <CardActions className="parceiro-actions">
          <Button
            size="small"
            startIcon={<InfoIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleVerDetalhes}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#667eea',
              borderColor: 'rgba(102, 126, 234, 0.3)',
              '&:hover': {
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.04)'
              }
            }}
            variant="outlined"
          >
            Detalhes
          </Button>
          {parceiro.website && (
            <Button
              size="small"
              variant="contained"
              startIcon={<LanguageIcon sx={{ fontSize: '1rem' }} />}
              onClick={handleVisitarSite}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              Site
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default ParceiroCard;
