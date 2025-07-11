import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { Button, Container, Typography, Grid, Card, CardContent, CardMedia, Box, CircularProgress  } from '@mui/material';
import './PacotesListPage.css';

const PacotesListPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } catch (err) {
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPacotes();
  }, [filterDestaque]);

  if (loading) {
    return (
      <Container maxWidth="lg" className="plp-loading-container">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="plp-container" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Nossos Pacotes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant={!filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(false)}
          >
            Todos os Pacotes
          </Button>
          <Button 
            variant={filterDestaque ? 'contained' : 'outlined'}
            onClick={() => setFilterDestaque(true)}
          >
            Destaques
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {pacotes.map(pacote => (
          <Grid item xs={12} sm={6} md={4} key={pacote.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {pacote.imagens && pacote.imagens[0] && (
                <CardMedia
                  component="img"
                  height="200"
                  image={pacote.imagens[0]}
                  alt={pacote.titulo}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  {pacote.titulo}
                  {pacote.destaque && (
                    <Box component="span" sx={{ 
                      ml: 1,
                      fontSize: '0.7rem',
                      color: 'secondary.main',
                      fontWeight: 'bold'
                    }}>
                      ★
                    </Box>
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pacote.descricaoCurta}
                </Typography>
                
                <Box sx={{ mt: 'auto' }}>
                  {pacote.precoOriginal && (
                    <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                      De: R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
                    </Typography>
                  )}
                  <Typography variant="h6">
                    Por: R$ {pacote.preco.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              </CardContent>
              
              <Box sx={{ p: 2 }}>
                <Button
                  component={Link}
                  to={`/pacote/${pacote.slug || pacote.id}`}
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
      
      {pacotes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">
            Nenhum pacote encontrado
          </Typography>
          {filterDestaque && (
            <Button 
              variant="text" 
              onClick={() => setFilterDestaque(false)}
              sx={{ mt: 2 }}
            >
              Ver todos os pacotes
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default PacotesListPage;