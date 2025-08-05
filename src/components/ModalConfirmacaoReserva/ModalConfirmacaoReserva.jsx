// src/components/ModalConfirmacaoReserva/ModalConfirmacaoReserva.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  CheckCircle,
  WhatsApp,
  AccountBox,
  Payment,
  DateRange,
  LocationOn,
  Person
} from '@mui/icons-material';

const ModalConfirmacaoReserva = ({ 
  open, 
  onClose, 
  reservaData, 
  paymentData,
  onVerMinhasReservas 
}) => {
  console.log('🎭 Modal props:', { open, reservaData, paymentData });
  
  if (!paymentData) {
    console.log('❌ PaymentData não existe, modal não será exibido');
    return null;
  }

  // Dados seguros para o WhatsApp
  const reservaId = reservaData?.id || paymentData?.id || 'N/A';
  const pacoteTitulo = reservaData?.pacoteTitulo || 'Pacote não informado';
  
  const whatsappNumber = "5511999999999"; // Número da agência
  const whatsappMessage = encodeURIComponent(
    `Olá! Acabei de fazer uma reserva (ID: ${reservaId}) e gostaria de mais informações. 
    
Pacote: ${pacoteTitulo}
Valor: R$ ${paymentData.transaction_amount?.toFixed(2)}
Status: ${paymentData.status === 'approved' ? 'Aprovado' : 'Pendente'}`
  );

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60 }}>
            <CheckCircle sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            🎉 Reserva Confirmada!
          </Typography>
          <Chip 
            label={paymentData.status === 'approved' ? 'PAGAMENTO APROVADO' : 'AGUARDANDO PAGAMENTO'}
            color={paymentData.status === 'approved' ? 'success' : 'warning'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn /> Detalhes da Reserva
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>Pacote:</strong> {reservaData?.pacoteTitulo || 'Pacote não informado'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Data Ida:</strong><br />
                  {reservaData?.dataIda ? new Date(reservaData.dataIda).toLocaleDateString('pt-BR') : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Data Volta:</strong><br />
                  {reservaData?.dataVolta ? new Date(reservaData.dataVolta).toLocaleDateString('pt-BR') : 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Adultos:</strong> {reservaData?.adultos || 'N/A'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Crianças:</strong> {reservaData?.criancas || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment /> Informações do Pagamento
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  <strong>ID do Pagamento:</strong> {paymentData.id}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Valor:</strong><br />
                  R$ {paymentData.transaction_amount?.toFixed(2)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <strong>Método:</strong><br />
                  {paymentData.payment_method_id === 'pix' ? 'PIX' : 'Cartão'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person /> Dados do Cliente
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              <strong>Nome:</strong> {reservaData?.clienteNome || 'N/A'}<br />
              <strong>Email:</strong> {reservaData?.clienteEmail || 'N/A'}<br />
              <strong>Telefone:</strong> {reservaData?.clienteTelefone || 'N/A'}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
            📧 <strong>Email de confirmação enviado!</strong><br />
            📱 Entre em contato via WhatsApp para mais detalhes
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleWhatsApp}
          startIcon={<WhatsApp />}
          sx={{
            bgcolor: '#25D366',
            '&:hover': { bgcolor: '#1da851' },
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          Falar com a Agência
        </Button>
        
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={onVerMinhasReservas}
          startIcon={<AccountBox />}
          sx={{
            borderColor: 'white',
            color: 'white',
            '&:hover': { 
              borderColor: 'white', 
              bgcolor: 'rgba(255,255,255,0.1)' 
            },
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          Ver Minhas Reservas
        </Button>

        <Button
          onClick={onClose}
          sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalConfirmacaoReserva;
