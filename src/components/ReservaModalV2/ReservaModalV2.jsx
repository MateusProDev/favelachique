// src/components/ReservaModalV2/ReservaModalV2.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  Payment,
  QrCode as QrCodeIcon,
  CreditCard
} from '@mui/icons-material';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const ReservaModalV2 = ({ open, onClose, pacote }) => {
  const { user } = useContext(AuthContext);
  const [tipoViagem, setTipoViagem] = useState('ida'); // 'ida', 'volta', 'ida_volta'
  const [metodoPagamento, setMetodoPagamento] = useState('pix'); // 'pix', 'cartao'
  const [formData, setFormData] = useState({
    // Dados do cliente
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    
    // Dados da viagem
    dataIda: '',
    horaIda: '',
    dataVolta: '',
    horaVolta: '',
    
    // Localização
    pontoPartida: '',
    pontoDestino: '',
    
    // Observações
    observacoes: '',
  });
  
  const [valores, setValores] = useState({
    valorTotal: 0,
    valorSinal: 0,
    valorRestante: 0,
    valorComDesconto: 0
  });

  useEffect(() => {
    calcularPrecos();
  }, [tipoViagem, metodoPagamento, pacote]); // Remover calcularPrecos da dependência

  const calcularPrecos = useCallback(() => {
    if (!pacote) return;

    let valorTotal = 0;
    
    if (pacote.isIdaEVolta) {
      switch (tipoViagem) {
        case 'ida':
          valorTotal = pacote.precoIda || 0;
          break;
        case 'volta':
          valorTotal = pacote.precoVolta || 0;
          break;
        case 'ida_volta':
          valorTotal = pacote.precoIdaVolta || 0;
          break;
        default:
          valorTotal = pacote.preco || 0;
      }
    } else {
      valorTotal = pacote.preco || 0;
    }

    // Obtém a configuração de sinal do pacote
    const porcentagemSinal = pacote.porcentagemSinalPadrao || 40;
    const tipoSinal = pacote.tipoSinal || 'porcentagem';
    
    // Calcula valores baseados na configuração do pacote
    let valorSinal = 0;
    if (tipoSinal === 'porcentagem') {
      valorSinal = (valorTotal * porcentagemSinal) / 100;
    } else {
      valorSinal = porcentagemSinal; // Valor fixo
    }
    
    const valorRestante = valorTotal - valorSinal;
    
    // Calcula desconto de 5% para pagamento PIX
    const valorComDesconto = metodoPagamento === 'pix' 
      ? valorTotal * 0.95 // 5% de desconto
      : valorTotal;
    
    setValores({
      valorTotal,
      valorSinal,
      valorRestante,
      valorComDesconto
    });
  }, [pacote, tipoViagem, metodoPagamento]); // Adicionar metodoPagamento

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Faça login para continuar');
      return;
    }

    try {
      // Obtém a configuração de sinal do pacote
      const porcentagemSinal = pacote.porcentagemSinalPadrao || 40;
      const tipoSinal = pacote.tipoSinal || 'porcentagem';
    
      const viagemData = {
        // Dados do pacote
        pacoteId: pacote.id,
        pacoteTitulo: pacote.titulo,
        
        // Dados do cliente
        clienteId: user.uid,
        clienteNome: formData.nome,
        clienteEmail: formData.email,
        clienteTelefone: formData.telefone,
        clienteCpf: formData.cpf,
        
        // Motoristas (serão definidos pela agência)
        motoristaIdaId: null,
        motoristaVoltaId: null,

        // Configuração da viagem
        isIdaEVolta: tipoViagem === 'ida_volta',
        tipoViagem,
        dataIda: formData.dataIda,
        dataVolta: tipoViagem === 'ida_volta' ? formData.dataVolta : null,
        horaIda: formData.horaIda,
        horaVolta: tipoViagem === 'ida_volta' ? formData.horaVolta : null,
        
        // Status
        status: 'pendente',
        
        // Financeiro - Apenas sinal pago pelo site
        valorTotal: valores.valorTotal,
        valorComDesconto: valores.valorComDesconto,
        metodoPagamento: metodoPagamento,
        descontoPix: metodoPagamento === 'pix' ? 5 : 0,
        porcentagemSinal: porcentagemSinal,
        tipoSinal: tipoSinal,
        valorSinal: valores.valorSinal, // Valor pago pelo site
        valorRestante: valores.valorRestante, // Será pago diretamente ao motorista
        statusPagamento: 'sinal_pago', // Apenas sinal foi pago
        formaPagamentoRestante: 'dinheiro_pix_motorista', // Restante será pago ao motorista
        
        // Localização
        pontoPartida: formData.pontoPartida,
        pontoDestino: formData.pontoDestino,
        
        // Observações
        observacoes: formData.observacoes,
        
        // Metadados
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'viagens'), viagemData);
      
      alert('Reserva criada com sucesso!');
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      alert('Erro ao criar reserva. Tente novamente.');
    }
  };

  if (!pacote) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          🎫 Reservar: {pacote.titulo}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Tipo de Viagem */}
            {pacote.isIdaEVolta && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  🚍 Tipo de Viagem
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>Escolha o tipo de viagem</InputLabel>
                  <Select
                    value={tipoViagem}
                    label="Escolha o tipo de viagem"
                    onChange={(e) => setTipoViagem(e.target.value)}
                  >
                    <MenuItem value="ida">
                      <Box display="flex" alignItems="center" gap={1}>
                        <FlightTakeoff /> Apenas Ida - R$ {pacote.precoIda}
                      </Box>
                    </MenuItem>
                    <MenuItem value="volta">
                      <Box display="flex" alignItems="center" gap={1}>
                        <FlightLand /> Apenas Volta - R$ {pacote.precoVolta}
                      </Box>
                    </MenuItem>
                    <MenuItem value="ida_volta">
                      <Box display="flex" alignItems="center" gap={1}>
                        <FlightTakeoff /><FlightLand /> Ida e Volta - R$ {pacote.precoIdaVolta}
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Dados do Cliente */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                👤 Dados do Cliente
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Dados da Viagem */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📅 Dados da Viagem
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Data da Ida"
                name="dataIda"
                type="date"
                value={formData.dataIda}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Horário da Ida"
                name="horaIda"
                type="time"
                value={formData.horaIda}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {tipoViagem === 'ida_volta' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data da Volta"
                    name="dataVolta"
                    type="date"
                    value={formData.dataVolta}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário da Volta"
                    name="horaVolta"
                    type="time"
                    value={formData.horaVolta}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Pagamento */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Pagamento do Sinal
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Você pagará apenas o sinal pelo site. O restante será pago diretamente ao motorista no final da viagem (PIX ou dinheiro).
                  </Typography>
                  
                  <Box mb={2}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Método de Pagamento</FormLabel>
                      <RadioGroup
                        row
                        value={metodoPagamento}
                        onChange={(e) => setMetodoPagamento(e.target.value)}
                      >
                        <FormControlLabel 
                          value="pix" 
                          control={<Radio />} 
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <QrCodeIcon color="primary" /> PIX (5% de desconto)
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="cartao" 
                          control={<Radio />} 
                          label={
                            <Box display="flex" alignItems="center" gap={1}>
                              <CreditCard color="primary" /> Cartão
                            </Box>
                          } 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Total da Viagem
                      </Typography>
                      <Typography variant="h6">
                        R$ {valores.valorTotal.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Sinal a ser pago agora (pelo site)
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        R$ {valores.valorSinal.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pacote.tipoSinal === 'porcentagem' 
                          ? `${pacote.porcentagemSinalPadrao || 40}% do valor total` 
                          : 'Valor fixo definido pela agência'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Valor a ser pago ao motorista no final da viagem
                        </Typography>
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          R$ {valores.valorRestante.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Pagamento direto ao motorista (PIX ou dinheiro)
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Localização */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📍 Localização
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ponto de Partida"
                name="pontoPartida"
                value={formData.pontoPartida}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ponto de Destino"
                name="pontoDestino"
                value={formData.pontoDestino}
                onChange={handleChange}
                required
                multiline
                rows={2}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observações"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Observações adicionais sobre a viagem..."
              />
            </Grid>

          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color={metodoPagamento === 'pix' ? 'success' : 'primary'}
          startIcon={metodoPagamento === 'pix' ? <QrCodeIcon /> : <CreditCard />}
        >
          {metodoPagamento === 'pix' ? 'Pagar Sinal com PIX' : 'Pagar Sinal com Cartão'} - R$ {valores.valorSinal.toFixed(2)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReservaModalV2;
