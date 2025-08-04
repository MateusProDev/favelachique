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
  FormLabel,
  CircularProgress,
  Alert
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
import mercadoPagoService from '../../services/mercadoPagoServiceNew';
import MercadoPagoCheckout from '../MercadoPagoCheckout/MercadoPagoCheckout';

const ReservaModalV2 = ({ open, onClose, pacote }) => {
  const { user } = useContext(AuthContext);
  const [tipoViagem, setTipoViagem] = useState('ida'); // 'ida', 'volta', 'ida_volta'
  const [metodoPagamento, setMetodoPagamento] = useState('pix'); // 'pix', 'cartao'
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [dadosReserva, setDadosReserva] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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
    
    // Passageiros (máximo 6)
    totalPassageiros: 1,
    adultos: 1,
    criancas: 0,
    infantis: 0,
    
    // Observações
    observacoes: '',
  });
  
  const [valores, setValores] = useState({
    valorTotal: 0,
    valorSinal: 0,
    valorPrimeiraViagem: 0,
    valorSegundaViagem: 0,
    valorRestante: 0,
    valorComDesconto: 0
  });

  useEffect(() => {
    calcularPrecos();
  }, [tipoViagem, metodoPagamento, pacote]); // Remover calcularPrecos da dependência

  // useEffect para preencher campos automaticamente
  useEffect(() => {
    if (user && open) {
      // Obter data atual e próximos dias
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      const depoisDeAmanha = new Date(amanha);
      depoisDeAmanha.setDate(amanha.getDate() + 1);
      
      const formatarData = (data) => {
        return data.toISOString().split('T')[0];
      };

      // Determinar ponto de partida e destino baseado no pacote
      let pontoPartida = '';
      let pontoDestino = '';
      
      if (pacote) {
        // Tenta extrair informações do título ou propriedades do pacote
        const titulo = pacote.titulo?.toLowerCase() || '';
        
        if (titulo.includes('salvador')) {
          pontoPartida = titulo.includes('para') || titulo.includes('x') ? 'Salvador - BA' : '';
          pontoDestino = titulo.includes('para') || titulo.includes('x') ? titulo.split(/para|x/)[1]?.trim() || '' : 'Salvador - BA';
        } else {
          pontoPartida = pacote.cidadeOrigem || pacote.origem || '';
          pontoDestino = pacote.cidadeDestino || pacote.destino || pacote.titulo || '';
        }
      }

      setFormData(prev => ({
        ...prev,
        // Dados do usuário (se disponíveis no contexto)
        nome: user.displayName || user.nome || '',
        email: user.email || '',
        telefone: user.phoneNumber || user.telefone || '',
        
        // Datas padrão inteligentes
        dataIda: formatarData(amanha),
        horaIda: '08:00',
        dataVolta: pacote?.isIdaEVolta ? formatarData(depoisDeAmanha) : '',
        horaVolta: pacote?.isIdaEVolta ? '18:00' : '',
        
        // Localização baseada no pacote
        pontoPartida: pontoPartida,
        pontoDestino: pontoDestino,
        
        // Observação padrão útil
        observacoes: `Reserva automática para ${pacote?.titulo || 'viagem'}. Entre em contato para mais detalhes.`,
      }));
    }
  }, [user, open, pacote]);

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

    // Sistema de valores fixos divididos em 3 partes
    let valorSinal = 0;
    let valorPrimeiraViagem = 0;
    let valorSegundaViagem = 0;
    
    if (pacote.isIdaEVolta && tipoViagem === 'ida_volta') {
      // Para ida e volta: dividir em 3 partes iguais
      const valorPorParte = valorTotal / 3;
      valorSinal = pacote.valorSinal || valorPorParte;
      valorPrimeiraViagem = pacote.valorPrimeiraViagem || valorPorParte;
      valorSegundaViagem = pacote.valorSegundaViagem || valorPorParte;
    } else {
      // Para apenas ida ou apenas volta: usar valores específicos
      valorSinal = pacote.valorSinal || (valorTotal / 2);
      valorPrimeiraViagem = pacote.valorPrimeiraViagem || (valorTotal / 2);
      valorSegundaViagem = 0;
    }
    
    const valorRestante = valorPrimeiraViagem + valorSegundaViagem;
    
    // Calcula desconto de 5% para pagamento PIX
    const valorComDesconto = metodoPagamento === 'pix' 
      ? valorSinal * 0.95 // 5% de desconto apenas no sinal
      : valorSinal;
    
    setValores({
      valorTotal,
      valorSinal,
      valorPrimeiraViagem,
      valorSegundaViagem,
      valorRestante,
      valorComDesconto
    });
  }, [pacote, tipoViagem, metodoPagamento]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Função para lidar com mudanças nos passageiros
  const handlePassageirosChange = (tipo, valor) => {
    const novoValor = Math.max(0, parseInt(valor) || 0);
    
    setFormData(prev => {
      const novosPassageiros = { ...prev };
      novosPassageiros[tipo] = novoValor;
      
      // Calcular total
      const total = novosPassageiros.adultos + novosPassageiros.criancas + novosPassageiros.infantis;
      
      // Validar máximo de 6 passageiros
      if (total > 6) {
        return prev; // Não atualizar se exceder o limite
      }
      
      novosPassageiros.totalPassageiros = total;
      return novosPassageiros;
    });
  };

  // Função para formatar exibição de passageiros
  const formatarPassageiros = (adultos, criancas, infantis) => {
    const total = adultos + criancas + infantis;
    return `${total}(${adultos}-${criancas}-${infantis})`;
  };

  const limparCampos = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataIda: '',
      horaIda: '',
      dataVolta: '',
      horaVolta: '',
      pontoPartida: '',
      pontoDestino: '',
      observacoes: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Faça login para continuar');
      return;
    }

    // Validação especial para pacotes com ida e volta
    if (pacote.isIdaEVolta && (!formData.dataVolta || !formData.horaVolta)) {
      alert('Para pacotes com ida e volta, é obrigatório informar a data e horário da volta.');
      return;
    }

    // Validação de passageiros
    if (formData.totalPassageiros === 0) {
      alert('É obrigatório selecionar pelo menos 1 passageiro.');
      return;
    }

    if (formData.totalPassageiros > 6) {
      alert('Máximo de 6 passageiros permitidos.');
      return;
    }

    // Preparar dados da reserva
    const porcentagemSinal = pacote.porcentagemSinalPadrao || 40;
    const tipoSinal = pacote.tipoSinal || 'porcentagem';

    const dadosParaPagamento = {
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
      dataVolta: pacote.isIdaEVolta ? formData.dataVolta : null,
      horaIda: formData.horaIda,
      horaVolta: pacote.isIdaEVolta ? formData.horaVolta : null,
      
      // Informações específicas para gestão da volta
      temVoltaPendente: pacote.isIdaEVolta && tipoViagem === 'ida',
      voltaOrganizada: tipoViagem === 'ida_volta',
      
      // Status
      status: 'pendente',
      
      // Financeiro - Valores fixos divididos
      valorTotal: valores.valorTotal,
      valorComDesconto: valores.valorComDesconto,
      valorSinal: valores.valorSinal,
      valorPrimeiraViagem: valores.valorPrimeiraViagem,
      valorSegundaViagem: valores.valorSegundaViagem,
      valorRestante: valores.valorRestante,
      
      // Localização
      pontoPartida: formData.pontoPartida,
      pontoDestino: formData.pontoDestino,
      
      // Passageiros
      totalPassageiros: formData.totalPassageiros,
      adultos: formData.adultos,
      criancas: formData.criancas,
      infantis: formData.infantis,
      passageirosFormatado: formatarPassageiros(formData.adultos, formData.criancas, formData.infantis),
      
      // Observações
      observacoes: formData.observacoes,
    };

    // Salvar dados e abrir modal de pagamento
    setDadosReserva(dadosParaPagamento);
    setShowPagamentoModal(true);
  };

  const finalizarPagamento = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!dadosReserva) {
        throw new Error('Dados da reserva não encontrados');
      }

      // Preparar dados da reserva para o pagamento
      const reservaData = {
        nomePassageiro: dadosReserva.clienteNome,
        telefonePassageiro: dadosReserva.clienteTelefone,
        emailPassageiro: dadosReserva.clienteEmail,
        localPartida: dadosReserva.pontoPartida,
        observacoes: dadosReserva.observacoes,
        dataViagem: dadosReserva.dataIda,
        horaPartida: dadosReserva.horaIda,
      };

      // Criar preferência no Mercado Pago
      const preference = await mercadoPagoService.createPaymentPreference({
        valor: dadosReserva.valorSinal,
        metodoPagamento,
        packageData: {
          id: dadosReserva.pacoteId,
          titulo: dadosReserva.pacoteTitulo
        },
        reservaData
      });

      setPreferenceId(preference.id);
      setShowPagamentoModal(false);
      setShowCheckoutModal(true);

    } catch (error) {
      console.error('Erro ao finalizar pagamento:', error);
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePagamentoSucesso = async () => {
    try {
      setShowCheckoutModal(false);
      setShowPagamentoModal(false);
      setSuccess('Pagamento realizado com sucesso!');
      
      // Finalizar a reserva
      await finalizarReserva();
    } catch (error) {
      console.error('Erro ao finalizar reserva:', error);
      setError('Pagamento realizado, mas erro ao salvar reserva. Entre em contato conosco.');
    }
  };

  const handlePagamentoErro = (erro) => {
    setShowCheckoutModal(false);
    setError(erro || 'Erro no pagamento. Tente novamente.');
  };

  const finalizarReserva = async () => {
    if (!dadosReserva) return;

    const reservaData = {
      ...dadosReserva,
      metodoPagamento,
      status: 'confirmada',
      dataCriacao: new Date(),
      userId: user?.uid
    };

    // Salvar no Firestore
    await addDoc(collection(db, 'reservas'), reservaData);
    
    // Resetar formulário
    setTimeout(() => {
      resetAllStates();
      onClose();
    }, 2000);
  };

  const resetAllStates = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataIda: '',
      horaIda: '',
      dataVolta: '',
      horaVolta: '',
      pontoPartida: '',
      pontoDestino: '',
      totalPassageiros: 1,
      adultos: 1,
      criancas: 0,
      infantis: 0,
      observacoes: '',
    });
    setTipoViagem('ida');
    setMetodoPagamento('pix');
    setError(null);
    setSuccess(null);
    setLoading(false);
    setShowPagamentoModal(false);
    setShowCheckoutModal(false);
    setPreferenceId(null);
    setDadosReserva(null);
  };

  const handlePagamentoPendente = () => {
    setShowCheckoutModal(false);
    alert('Pagamento pendente. Você receberá uma confirmação assim que for processado.');
    onClose();
  };

  if (!pacote) return null;

  return (
    <>
      {/* Modal Principal de Reserva */}
      <Dialog 
        open={open && !showPagamentoModal} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            maxHeight: '90vh'
          }
        }}
      >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white',
        py: 2
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%', 
              p: 0.8,
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem'
            }}>
              🎫
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Reservar Viagem
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {pacote.titulo}
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="outlined"
            size="small" 
            onClick={limparCampos}
            sx={{ 
              fontSize: '0.7rem',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              py: 0.5,
              px: 1.5,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            🗑️ Limpar
          </Button>
        </Box>
        <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, display: 'block' }}>
          ℹ️ Campos preenchidos automaticamente. Edite conforme necessário.
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, bgcolor: '#f8fafc', maxHeight: '70vh', overflowY: 'auto' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            
            {/* Tipo de Viagem */}
            {pacote.isIdaEVolta && (
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🚍 Tipo de Viagem
                    </Typography>
                    <FormControl fullWidth size="small">
                      <InputLabel>Escolha o tipo de viagem</InputLabel>
                      <Select
                        value={tipoViagem}
                        label="Escolha o tipo de viagem"
                        onChange={(e) => setTipoViagem(e.target.value)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        <MenuItem value="ida">
                          <Box display="flex" alignItems="center" gap={1}>
                            <FlightTakeoff color="primary" /> Apenas Ida
                          </Box>
                        </MenuItem>
                        <MenuItem value="volta">
                          <Box display="flex" alignItems="center" gap={1}>
                            <FlightLand color="primary" /> Apenas Volta
                          </Box>
                        </MenuItem>
                        <MenuItem value="ida_volta">
                          <Box display="flex" alignItems="center" gap={1}>
                            <FlightTakeoff color="primary" /><FlightLand color="primary" /> Ida e Volta
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Dados do Cliente */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    👤 Dados do Cliente
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Nome Completo"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Dados da Viagem */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    📅 Dados da Viagem
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Data da Ida"
                        name="dataIda"
                        type="date"
                        value={formData.dataIda}
                        onChange={handleChange}
                        required
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      </>
                    )}

                    {/* Campos de volta sempre visíveis quando o pacote tem ida e volta */}
                    {pacote.isIdaEVolta && tipoViagem === 'ida' && (
                      <>
                        <Grid item xs={12}>
                          <Box sx={{ 
                            bgcolor: 'info.light', 
                            p: 2, 
                            borderRadius: 2, 
                            mt: 2,
                            border: '1px solid',
                            borderColor: 'info.main'
                          }}>
                            <Typography variant="subtitle1" color="info.dark" gutterBottom fontWeight="bold">
                              📅 Informações da Volta (para futura reserva)
                            </Typography>
                            <Typography variant="body2" color="info.dark">
                              Preencha as informações da volta. Após finalizar a ida, o dono da agência será notificado para organizar sua volta.
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Data Pretendida para Volta"
                            name="dataVolta"
                            type="date"
                            value={formData.dataVolta}
                            onChange={handleChange}
                            required
                            InputLabelProps={{ shrink: true }}
                            helperText="Esta data será mostrada para o dono da agência"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Horário Pretendido para Volta"
                            name="horaVolta"
                            type="time"
                            value={formData.horaVolta}
                            onChange={handleChange}
                            required
                            InputLabelProps={{ shrink: true }}
                            helperText="Horário aproximado desejado"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Localização */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    📍 Localização
                  </Typography>
                  <Grid container spacing={1.5}>
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
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                        size="small"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Passageiros */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    👥 Passageiros (Máximo 6)
                  </Typography>
                  
                  {/* Display do total */}
                  <Box sx={{ 
                    bgcolor: 'primary.light', 
                    p: 1.5, 
                    borderRadius: 1.5, 
                    mb: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" color="primary.dark">
                      Total: {formatarPassageiros(formData.adultos, formData.criancas, formData.infantis)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Formato: Total(Adultos-Crianças-Infantis)
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Adultos"
                        type="number"
                        value={formData.adultos}
                        onChange={(e) => handlePassageirosChange('adultos', e.target.value)}
                        inputProps={{ min: 0, max: 6 }}
                        size="small"
                        required
                        helperText="Acima de 12 anos"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Crianças"
                        type="number"
                        value={formData.criancas}
                        onChange={(e) => handlePassageirosChange('criancas', e.target.value)}
                        inputProps={{ min: 0, max: 6 }}
                        size="small"
                        helperText="De 2 a 12 anos"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Infantis"
                        type="number"
                        value={formData.infantis}
                        onChange={(e) => handlePassageirosChange('infantis', e.target.value)}
                        inputProps={{ min: 0, max: 6 }}
                        size="small"
                        helperText="Até 2 anos (colo)"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    </Grid>
                  </Grid>

                  {/* Validação de limite */}
                  {formData.totalPassageiros > 6 && (
                    <Box sx={{ 
                      bgcolor: 'error.light', 
                      p: 1.5, 
                      borderRadius: 1.5, 
                      mt: 2,
                      border: '1px solid',
                      borderColor: 'error.main'
                    }}>
                      <Typography variant="body2" color="error.dark" fontWeight="bold">
                        ⚠️ Máximo de 6 passageiros permitidos
                      </Typography>
                    </Box>
                  )}

                  {formData.totalPassageiros === 0 && (
                    <Box sx={{ 
                      bgcolor: 'warning.light', 
                      p: 1.5, 
                      borderRadius: 1.5, 
                      mt: 2,
                      border: '1px solid',
                      borderColor: 'warning.main'
                    }}>
                      <Typography variant="body2" color="warning.dark" fontWeight="bold">
                        ⚠️ Pelo menos 1 passageiro é obrigatório
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 1.5, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    💬 Observações
                  </Typography>
                  <TextField
                    fullWidth
                    label="Observações"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    size="small"
                    placeholder={
                      pacote.isIdaEVolta && tipoViagem === 'ida' 
                        ? "Observações adicionais sobre a viagem..."
                        : "Observações adicionais sobre a viagem..."
                    }
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          size="medium"
          sx={{ 
            borderRadius: 1.5, 
            px: 3,
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: '#f1f5f9'
            }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          size="medium"
          sx={{ 
            borderRadius: 1.5, 
            px: 3,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Continuar
        </Button>
      </DialogActions>
    </Dialog>

    {/* Modal de Pagamento */}
    <Dialog 
      open={showPagamentoModal} 
      onClose={() => setShowPagamentoModal(false)} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
        color: 'white',
        py: 2
      }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            borderRadius: '50%', 
            p: 0.8,
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem'
          }}>
            💳
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Finalizar Pagamento
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Escolha a forma de pagamento do sinal
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, bgcolor: '#f8fafc', maxHeight: '70vh', overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {dadosReserva && (
          <Grid container spacing={2}>
            {/* Valores */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    💰 Valores da Viagem
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f1f5f9', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Valor Total
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          R$ {dadosReserva.valorTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#dbeafe', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Sinal (Agência)
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          R$ {dadosReserva.valorSinal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fef3c7', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          1ª Viagem
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="warning.dark">
                          R$ {dadosReserva.valorPrimeiraViagem?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#dcfce7', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          2ª Viagem
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="success.main">
                          R$ {dadosReserva.valorSegundaViagem?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        bgcolor: 'info.light', 
                        p: 2, 
                        borderRadius: 1.5, 
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'info.main'
                      }}>
                        <Typography variant="body2" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          � Divisão de Pagamentos:
                        </Typography>
                        <Typography variant="body1" color="info.dark" sx={{ mb: 1 }}>
                          <strong>Sinal:</strong> Pago agora para a agência • 
                          <strong>1ª Viagem:</strong> Para motorista da ida • 
                          <strong>2ª Viagem:</strong> Para motorista da volta
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Motoristas recebem pagamento via PIX ou dinheiro ao final de cada trajeto
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Escolha do Método de Pagamento */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    💳 Forma de Pagamento
                  </Typography>
                  
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={metodoPagamento}
                      onChange={(e) => setMetodoPagamento(e.target.value)}
                    >
                      <Card 
                        sx={{ 
                          mb: 1.5, 
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: metodoPagamento === 'pix' ? 'success.main' : 'grey.200',
                          bgcolor: metodoPagamento === 'pix' ? 'success.light' : 'white',
                          transform: metodoPagamento === 'pix' ? 'scale(1.01)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => setMetodoPagamento('pix')}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <FormControlLabel 
                            value="pix" 
                            control={<Radio />} 
                            label={
                              <Box>
                                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                  <Box sx={{ 
                                    bgcolor: 'success.main', 
                                    borderRadius: '50%', 
                                    p: 0.8, 
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    <QrCodeIcon fontSize="small" />
                                  </Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    PIX (5% desconto)
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="success.dark" fontWeight="bold">
                                  R$ {(dadosReserva.valorSinal * 0.95).toFixed(2)}
                                </Typography>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>

                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: metodoPagamento === 'cartao' ? 'primary.main' : 'grey.200',
                          bgcolor: metodoPagamento === 'cartao' ? 'primary.light' : 'white',
                          transform: metodoPagamento === 'cartao' ? 'scale(1.01)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.01)',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => setMetodoPagamento('cartao')}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <FormControlLabel 
                            value="cartao" 
                            control={<Radio />} 
                            label={
                              <Box>
                                <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                  <Box sx={{ 
                                    bgcolor: 'primary.main', 
                                    borderRadius: '50%', 
                                    p: 0.8, 
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}>
                                    <CreditCard fontSize="small" />
                                  </Box>
                                  <Typography variant="body1" fontWeight="bold">
                                    Cartão de Crédito
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="primary.dark" fontWeight="bold">
                                  R$ {dadosReserva.valorSinal.toFixed(2)}
                                </Typography>
                              </Box>
                            }
                            sx={{ margin: 0, width: '100%' }}
                          />
                        </CardContent>
                      </Card>
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', gap: 1 }}>
        <Button 
          onClick={() => setShowPagamentoModal(false)}
          variant="outlined"
          size="medium"
          sx={{ 
            borderRadius: 1.5, 
            px: 3,
            borderColor: '#cbd5e1',
            color: '#64748b',
            '&:hover': {
              borderColor: '#94a3b8',
              bgcolor: '#f1f5f9'
            }
          }}
        >
          ← Voltar
        </Button>
        <Button 
          onClick={finalizarPagamento} 
          variant="contained" 
          size="medium"
          disabled={loading}
          sx={{ 
            borderRadius: 1.5, 
            px: 3,
            py: 1,
            background: metodoPagamento === 'pix' 
              ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: metodoPagamento === 'pix'
              ? '0 2px 8px rgba(17, 153, 142, 0.3)'
              : '0 2px 8px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: metodoPagamento === 'pix'
                ? 'linear-gradient(135deg, #0e8578 0%, #32d16a 100%)'
                : 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              boxShadow: metodoPagamento === 'pix'
                ? '0 4px 12px rgba(17, 153, 142, 0.4)'
                : '0 4px 12px rgba(102, 126, 234, 0.4)',
            }
          }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : (metodoPagamento === 'pix' ? <QrCodeIcon /> : <CreditCard />)}
        >
          {loading 
            ? 'Processando...'
            : (metodoPagamento === 'pix' 
              ? 'Pagar com PIX' 
              : 'Pagar com Cartão'
            )
          }
        </Button>
      </DialogActions>
    </Dialog>

    {/* Modal do Mercado Pago */}
    <MercadoPagoCheckout 
      open={showCheckoutModal}
      onClose={() => setShowCheckoutModal(false)}
      preferenceId={preferenceId}
      onSuccess={handlePagamentoSucesso}
      onError={handlePagamentoErro}
    />
    </>
  );
};

export default ReservaModalV2;
