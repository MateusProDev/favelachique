import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { Search, Clear, FilterAlt } from '@mui/icons-material';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import './PacotesListPage.css';

const PacotesListPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [filteredPacotes, setFilteredPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDestaque, setFilterDestaque] = useState(false);

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        let q;
        if (filterDestaque) {
          q = query(collection(db, 'pacotes'), 
            where('destaque', '==', true),
            orderBy('createdAt', 'desc')
          );
        } else {
          q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        }
        
        const querySnapshot = await getDocs(q);
        
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));

        setPacotes(pacotesData);
        setFilteredPacotes(pacotesData);
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacotes();
  }, [filterDestaque]);

  useEffect(() => {
    let results = pacotes;
    
    if (searchTerm) {
      results = results.filter(pacote =>
        pacote.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pacote.descricaoCurta.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPacotes(results);
  }, [searchTerm, pacotes]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterDestaque(false);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="plp-loading-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  return (
    <div className="pacotes-list-page">
      <Header />
      <Container maxWidth="xl" className="plp-container" sx={{ py: 2 }}>
        <Breadcrumb 
          currentPage="Pacotes"
        />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom className="plp-title">
            Nossos Pacotes
          </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          
          <Button 
            size="small"
            variant={!filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(false)}
          >
            Todos
          </Button>
          
          <Button 
            size="small"
            variant={filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(true)}
          >
            Destaques
          </Button>
          
        </Box>
      </Box>
      
      <Box className="plp-grid-container">
        {filteredPacotes.map(pacote => (
          <Link 
            to={`/pacote/${pacote.slug || pacote.id}`} 
            key={pacote.id}
            className="plp-card-link"
          >
            <Card className="plp-pacote-card">
              {pacote.imagens && pacote.imagens[0] && (
                <Box className="plp-card-image-container">
                  <CardMedia
                    component="img"
                    image={pacote.imagens[0]}
                    alt={pacote.titulo}
                    className="plp-card-image"
                  />
                </Box>
              )}
              
              <CardContent className="plp-card-content">
                <Typography gutterBottom variant="subtitle2" component="h3" className="plp-pacote-title">
                  {pacote.titulo}
                  {pacote.destaque && (
                    <Box component="span" className="plp-destaque-badge">
                      ★
                    </Box>
                  )}
                </Typography>
                
                <Typography variant="caption" color="text.secondary" className="plp-pacote-desc">
                  {pacote.descricaoCurta}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Preços sob consulta. Solicite cotação.
                  </Typography>
                </Box>
              </CardContent>
              
              <Box sx={{ p: 1 }}>
                <Button
                  component="div"
                  variant="contained"
                  fullWidth
                  size="small"
                  className="plp-details-button"
                >
                  📩 Solicitar Cotação
                </Button>
              </Box>
            </Card>
          </Link>
        ))}
      </Box>
      
      {filteredPacotes.length === 0 && (
        <Box className="plp-no-results" sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1">
            Nenhum pacote encontrado
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            onClick={handleClearFilters}
            sx={{ mt: 1 }}
            startIcon={<Clear />}
          >
            Limpar filtros
          </Button>
        </Box>
      )}
      </Container>
      <Footer />
    </div>
  );
};

export default PacotesListPage;