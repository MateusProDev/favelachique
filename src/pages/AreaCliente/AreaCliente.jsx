// src/pages/AreaCliente/AreaCliente.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import {
  Person,
  Payment,
  DateRange,
  LocationOn,
  WhatsApp,
  ExitToApp,
  Receipt,
  History,
  AccountBox
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const AreaCliente = () => {
  const { user, getUserData } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Buscar dados do usuário
    const fetchUserData = async () => {
      const data = await getUserData(user.uid);
      setUserData(data);
    };

    fetchUserData();

    // Escutar reservas do usuário em tempo real
    const reservasQuery = query(
      collection(db, 'reservas'),
      where('clienteId', '==', user.uid),
      orderBy('criadoEm', 'desc')
    );

    const unsubscribe = onSnapshot(reservasQuery, (querySnapshot) => {
      const reservasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setReservas(reservasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, getUserData, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmado':
      case 'approved':
        return 'success';
      case 'pendente':
      case 'pending':
        return 'warning';
      case 'cancelado':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmado':
      case 'approved':
        return 'Confirmado';
      case 'pendente':
      case 'pending':
        return 'Pendente';
      case 'cancelado':
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleWhatsApp = (reserva) => {
    const whatsappNumber = "5511999999999";
    const message = encodeURIComponent(
      `Olá! Gostaria de tirar dúvidas sobre minha reserva:
      
ID: ${reserva.id}
Pacote: ${reserva.pacoteTitulo}
Data: ${new Date(reserva.dataIda).toLocaleDateString('pt-BR')}
Status: ${getStatusText(reserva.status)}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: 'white', color: 'primary.main' }}>
            <AccountBox />
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="bold">
              Área do Cliente
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Bem-vindo, {userData?.nome || user?.displayName || 'Cliente'}!
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Informações do Usuário */}
        {userData && (
          <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'white', color: 'primary.main' }}>
                    <Person sx={{ fontSize: 30 }} />
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" fontWeight="bold">
                    {userData.nome}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    📧 {userData.email}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    📱 {userData.telefone}
                  </Typography>
                </Grid>
                <Grid item>
                  <Chip 
                    label="Cliente Ativo" 
                    color="success" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab label="Minhas Reservas" icon={<Receipt />} />
            <Tab label="Histórico" icon={<History />} />
          </Tabs>
        </Box>

        {/* Conteúdo das Reservas */}
        {tab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt /> Minhas Reservas Ativas
            </Typography>

            {reservas.filter(r => r.status !== 'cancelado').length === 0 ? (
              <Alert severity="info" sx={{ my: 3 }}>
                Você ainda não possui reservas ativas. Que tal fazer sua primeira reserva?
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {reservas
                  .filter(reserva => reserva.status !== 'cancelado')
                  .map((reserva) => (
                    <Grid item xs={12} md={6} key={reserva.id}>
                      <Card sx={{ height: '100%', position: 'relative' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
                              {reserva.pacoteTitulo}
                            </Typography>
                            <Chip 
                              label={getStatusText(reserva.status)}
                              color={getStatusColor(reserva.status)}
                              size="small"
                            />
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <DateRange fontSize="small" />
                              <strong>Ida:</strong> {new Date(reserva.dataIda).toLocaleDateString('pt-BR')}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <DateRange fontSize="small" />
                              <strong>Volta:</strong> {new Date(reserva.dataVolta).toLocaleDateString('pt-BR')}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Person fontSize="small" />
                              <strong>Passageiros:</strong> {reserva.adultos} adulto(s), {reserva.criancas} criança(s)
                            </Typography>
                            {reserva.valorTotal && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Payment fontSize="small" />
                                <strong>Valor:</strong> R$ {reserva.valorTotal.toFixed(2)}
                              </Typography>
                            )}
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<WhatsApp />}
                              onClick={() => handleWhatsApp(reserva)}
                              sx={{
                                bgcolor: '#25D366',
                                '&:hover': { bgcolor: '#1da851' }
                              }}
                            >
                              WhatsApp
                            </Button>
                          </Box>

                          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              <strong>ID da Reserva:</strong> {reserva.id}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              <strong>Criado em:</strong> {new Date(reserva.criadoEm?.toDate()).toLocaleString('pt-BR')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Histórico */}
        {tab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History /> Histórico de Reservas
            </Typography>

            {reservas.length === 0 ? (
              <Alert severity="info" sx={{ my: 3 }}>
                Nenhuma reserva encontrada no histórico.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {reservas.map((reserva) => (
                  <Grid item xs={12} key={reserva.id}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {reserva.pacoteTitulo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(reserva.dataIda).toLocaleDateString('pt-BR')} - {new Date(reserva.dataVolta).toLocaleDateString('pt-BR')}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Typography variant="body2">
                              <strong>Passageiros:</strong><br />
                              {reserva.adultos}A + {reserva.criancas}C
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Typography variant="body2">
                              <strong>Valor:</strong><br />
                              R$ {reserva.valorTotal?.toFixed(2) || '0,00'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Chip 
                              label={getStatusText(reserva.status)}
                              color={getStatusColor(reserva.status)}
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} md={2}>
                            <Button
                              size="small"
                              startIcon={<WhatsApp />}
                              onClick={() => handleWhatsApp(reserva)}
                              sx={{ color: '#25D366' }}
                            >
                              Contato
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AreaCliente;
