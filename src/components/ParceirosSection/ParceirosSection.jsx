import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Handshake as HandshakeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import ParceiroCard from '../ParceiroCard/ParceiroCard';
import parceiroService from '../../services/parceiroService';
import './ParceirosSection.css';

const CATEGORIAS_FILTRO = [
  { label: 'Todos', value: 'todos' },
  { label: 'Hospedagem', value: 'Hospedagem' },
  { label: 'Restaurante', value: 'Restaurante' },
  { label: 'Transporte', value: 'Transporte' },
  { label: 'Turismo', value: 'Turismo' },
  { label: 'Entretenimento', value: 'Entretenimento' }
];

const ParceirosSection = ({ titulo = 'Nossos Parceiros', destaquesOnly = false, limite = 6 }) => {
  const navigate = useNavigate();
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');

  useEffect(() => {
    carregarParceiros();
  }, [destaquesOnly, limite]);

  const carregarParceiros = async () => {
    try {
      setLoading(true);
      let dados;
      
      if (destaquesOnly) {
        dados = await parceiroService.buscarDestaques(limite);
      } else {
        dados = await parceiroService.buscarAtivos();
      }
      
      setParceiros(dados);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = (event, novaCategoria) => {
    setCategoriaAtiva(novaCategoria);
  };

  const parceirosFiltrados = categoriaAtiva === 'todos'
    ? parceiros
    : parceiros.filter(p => p.categoria === categoriaAtiva);

  const handleVerTodos = () => {
    navigate('/parceiros');
  };

  if (loading) {
    return (
      <Box className="parceiros-section" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (parceiros.length === 0) {
    return null;
  }

  return (
    <Box className="parceiros-section">
      <Container maxWidth="lg">
        {/* Header */}
        <Box className="parceiros-header">
          <Box className="title-container">
            <HandshakeIcon className="title-icon" />
            <Typography variant="h3" component="h2" className="section-title">
              {titulo}
            </Typography>
          </Box>
          <Typography variant="h6" component="p" className="section-subtitle">
            Empresas e profissionais que confiam em nosso trabalho
          </Typography>
        </Box>

        {/* Filtros de Categoria */}
        {!destaquesOnly && (
          <Box className="parceiros-filtros">
            <Tabs
              value={categoriaAtiva}
              onChange={handleCategoriaChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '.MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 'auto',
                  px: 3
                },
                '.Mui-selected': {
                  color: '#667eea !important'
                },
                '.MuiTabs-indicator': {
                  backgroundColor: '#667eea',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {CATEGORIAS_FILTRO.map((cat) => (
                <Tab key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Grid de Parceiros */}
        <Grid container spacing={3} className="parceiros-grid">
          {parceirosFiltrados.slice(0, limite).map((parceiro, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={destaquesOnly ? 4 : 3}
              key={parceiro.id}
              sx={{
                animation: 'fadeInUp 0.6s ease-out',
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'both'
              }}
            >
              <ParceiroCard parceiro={parceiro} />
            </Grid>
          ))}
        </Grid>

        {/* Botão Ver Todos */}
        {parceirosFiltrados.length > limite && (
          <Box className="parceiros-footer">
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleVerTodos}
              className="ver-todos-button"
            >
              Ver Todos os Parceiros
            </Button>
          </Box>
        )}

        {/* Mensagem se não houver parceiros na categoria */}
        {parceirosFiltrados.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhum parceiro encontrado nesta categoria
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ParceirosSection;
