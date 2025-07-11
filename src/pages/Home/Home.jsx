import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Banner from '../../components/Banner/Banner';
import Boxes from '../../components/Boxes/Boxes';
import Footer from '../../components/Footer/Footer';
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton';
import Carousel from '../../components/Carousel/Carousel';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Box, Typography, Button, Card, CardContent, CardMedia, Container, CircularProgress, Grid } from '@mui/material';
import './Home.css';

const Home = () => {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [regularPackages, setRegularPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Busca pacotes em destaque
        const featuredQuery = query(
          collection(db, 'pacotes'),
          where('destaque', '==', true),
          orderBy('createdAt', 'desc')
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        
        // Busca outros pacotes
        const regularQuery = query(
          collection(db, 'pacotes'),
          where('destaque', '!=', true),
          orderBy('createdAt', 'desc')
        );
        const regularSnapshot = await getDocs(regularQuery);
        
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));
        
        const regularData = regularSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          preco: Number(doc.data().preco),
          precoOriginal: doc.data().precoOriginal ? Number(doc.data().precoOriginal) : null
        }));
        
        setFeaturedPackages(featuredData);
        setRegularPackages(regularData);
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div className="home-container">
      <Header />
      <Banner />
      
      {/* Seção de Pacotes em Destaque */}
      {featuredPackages.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Pacotes em Destaque
          </Typography>
          
          <Grid container spacing={4}>
            {featuredPackages.map(pkg => (
              <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {pkg.imagens && pkg.imagens[0] && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={pkg.imagens[0]}
                      alt={pkg.titulo}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {pkg.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {pkg.descricaoCurta}
                    </Typography>
                    
                    <Box sx={{ mt: 'auto' }}>
                      {pkg.precoOriginal && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                          De: R$ {pkg.precoOriginal.toFixed(2).replace('.', ',')}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary">
                        Por: R$ {pkg.preco.toFixed(2).replace('.', ',')}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <Box sx={{ p: 2 }}>
                    <Button
                      component={Link}
                      to={`/pacote/${pkg.slug || pkg.id}`}
                      variant="contained"
                      fullWidth
                    >
                      Ver Detalhes
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
      
      {/* Seção de Outros Pacotes */}
      {regularPackages.length > 0 && (
        <Box sx={{ backgroundColor: '#f5f5f5', py: 6 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
              Nossos Pacotes
            </Typography>
            
            <Grid container spacing={3}>
              {regularPackages.map(pkg => (
                <Grid item xs={12} sm={6} md={3} key={pkg.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {pkg.imagens && pkg.imagens[0] && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={pkg.imagens[0]}
                        alt={pkg.titulo}
                      />
                    )}
                    
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="h3">
                        {pkg.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {pkg.descricaoCurta}
                      </Typography>
                      
                      <Typography variant="h6" color="primary">
                        R$ {pkg.preco.toFixed(2).replace('.', ',')}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, mt: 'auto' }}>
                      <Button
                        component={Link}
                        to={`/pacote/${pkg.slug || pkg.id}`}
                        variant="outlined"
                        fullWidth
                      >
                        Ver Detalhes
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}
      
      <Boxes />
      <Carousel />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Home;