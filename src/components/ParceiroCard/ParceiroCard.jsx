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
    if (parceiro.website) {
      window.open(parceiro.website, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsApp = () => {
    if (parceiro.whatsapp) {
      const message = encodeURIComponent(`Olá! Vim através do site Favela Chique e gostaria de saber mais sobre ${parceiro.nome}.`);
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

      {/* Imagem de Capa (se houver) */}
      {parceiro.imagemCapa && (
        <Box className="parceiro-capa">
          <img src={parceiro.imagemCapa} alt={parceiro.nome} />
        </Box>
      )}

      <CardContent className="parceiro-content">
        {/* Categoria */}
        <Chip
          label={parceiro.categoria}
          size="small"
          color="primary"
          sx={{ mb: 1 }}
        />

        {/* Nome */}
        <Typography variant="h6" component="h3" className="parceiro-nome">
          {parceiro.nome}
        </Typography>

        {/* Descrição Breve */}
        <Typography variant="body2" color="text.secondary" className="parceiro-descricao">
          {parceiro.descricaoBreve}
        </Typography>

        {/* Tags */}
        {parceiro.tags && parceiro.tags.length > 0 && (
          <Box className="parceiro-tags">
            {parceiro.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        )}

        {/* Benefícios */}
        {parceiro.beneficios && parceiro.beneficios.length > 0 && (
          <Box className="parceiro-beneficio">
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              ✨ {parceiro.beneficios[0]}
            </Typography>
          </Box>
        )}

        {/* Contatos Rápidos */}
        {showActions && (
          <Box className="parceiro-contatos-rapidos">
            {parceiro.whatsapp && (
              <Tooltip title="WhatsApp">
                <IconButton
                  size="small"
                  onClick={handleWhatsApp}
                  sx={{ color: '#25D366' }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {parceiro.telefone && (
              <Tooltip title="Telefone">
                <IconButton
                  size="small"
                  onClick={handleTelefone}
                  color="primary"
                >
                  <PhoneIcon fontSize="small" />
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
            startIcon={<InfoIcon />}
            onClick={handleVerDetalhes}
            sx={{
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Ver Detalhes
          </Button>
          {parceiro.website && (
            <Button
              size="small"
              variant="contained"
              startIcon={<LanguageIcon />}
              onClick={handleVisitarSite}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)'
                }
              }}
            >
              Visitar Site
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default ParceiroCard;
