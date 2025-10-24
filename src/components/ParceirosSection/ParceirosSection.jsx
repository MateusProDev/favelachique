import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import {
  Box,
  Container,
  Typography,
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
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    carregarParceiros();
  }, [destaquesOnly, limite]);

  useEffect(() => {
    // Força atualização do Swiper quando os parceiros mudarem
    if (swiperInstance && parceiros.length > 0) {
      console.log('🔄 Atualizando Swiper...');
      setTimeout(() => {
        swiperInstance.update();
        if (swiperInstance.autoplay && parceiros.length >= 1) {
          swiperInstance.autoplay.start();
          console.log('▶️ Autoplay iniciado');
        }
      }, 100);
    }
  }, [parceiros, swiperInstance]);

  const carregarParceiros = async () => {
    try {
      setLoading(true);
      let dados;
      
      if (destaquesOnly) {
        dados = await parceiroService.buscarDestaques(limite);
        console.log('🌟 Buscando DESTAQUES:', dados.length);
      } else {
        dados = await parceiroService.buscarAtivos();
        console.log('✅ Buscando ATIVOS:', dados.length);
      }
      
      console.log('🔍 Parceiros carregados:', dados);
      console.log('📊 Quantidade:', dados.length);
      setParceiros(dados);
    } catch (error) {
      console.error('❌ Erro ao carregar parceiros:', error);
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

  // Se houver apenas 1 parceiro, duplica para permitir o loop
  const parceirosParaExibir = parceirosFiltrados.length === 1 
    ? [...parceirosFiltrados, ...parceirosFiltrados] 
    : parceirosFiltrados;

  console.log('🎯 Parceiros para exibir:', parceirosParaExibir.length);
  console.log('🎪 Loop ativo?', parceirosParaExibir.length >= 2);

  const handleVerTodos = () => {
    console.log('🔘 Botão "Ver Todos" clicado!');
    console.log('📍 Navegando para: /parceiros');
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

        {/* Carrossel de Parceiros */}
        <Box className="parceiros-carousel-container">
          <Swiper
            onSwiper={(swiper) => {
              console.log('✅ Swiper inicializado:', swiper);
              setSwiperInstance(swiper);
            }}
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            navigation={true}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={parceirosParaExibir.length >= 2 ? {
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              stopOnLastSlide: false,
              reverseDirection: false
            } : false}
            loop={parceirosParaExibir.length >= 2}
            speed={600}
            watchOverflow={true}
            observer={true}
            observeParents={true}
            allowTouchMove={true}
            cssMode={false}
            breakpoints={{
              480: {
                slidesPerView: 1.5,
                spaceBetween: 16,
                centeredSlides: true
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 18,
                centeredSlides: false
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
                centeredSlides: false
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 22,
                centeredSlides: false
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 24,
                centeredSlides: false
              }
            }}
            className="parceiros-swiper"
          >
            {parceirosParaExibir.map((parceiro, index) => (
              <SwiperSlide key={`${parceiro.id}-${index}-${Date.now()}`}>
                <ParceiroCard parceiro={parceiro} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>

        {/* Botão Ver Todos */}
        {parceiros.length > 0 && (
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
