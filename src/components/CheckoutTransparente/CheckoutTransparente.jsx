import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  CreditCard,
  Lock,
  QrCode as QrCodeIcon,
  Person,
  Email
} from '@mui/icons-material';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import QRCode from 'qrcode';
import { AuthContext } from '../../context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import ModalConfirmacaoReserva from '../ModalConfirmacaoReserva';
import ModalLoginRequerido from '../ModalLoginRequerido';
import { useNavigate } from 'react-router-dom';


function CheckoutTransparente(props) {
  const { valor, metodoPagamento, onSuccess, onError, dadosReserva } = props;
  if (!valor || !metodoPagamento || !dadosReserva) {
    // Early return FORA do componente React: não chama hooks!
    return (
      <Box p={4} textAlign="center">
        <Typography variant="body1" color="error">
          Erro: Dados de pagamento incompletos
        </Typography>
      </Box>
    );
  }
  return <CheckoutTransparenteInner {...props} />;
}

function CheckoutTransparenteInner({ valor, metodoPagamento, onSuccess, onError, dadosReserva }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  // Derivar propriedades do contexto
  const isAuthenticated = !!user;
  const userData = user;

  const [loading, setLoading] = useState(false);
  const [mercadoPago, setMercadoPago] = useState(null);
  const [error, setError] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // Estados para o modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [paymentConfirmado, setPaymentConfirmado] = useState(null);
  
  // Estados para o modal de login
  const [modalLoginRequerido, setModalLoginRequerido] = useState(false);
  const [dadosTemporarios, setDadosTemporarios] = useState(null);
  
  // Estados do formulário de cartão e PIX
  const [formData, setFormData] = useState({
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    cardHolderName: '',
    cardHolderEmail: dadosReserva?.clienteEmail || '',
    cardHolderCpf: dadosReserva?.clienteCpf || '',
    pixCpf: dadosReserva?.clienteCpf || '',
    installments: 1
  });

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        await loadMercadoPago();
        
        const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
        console.log('🔧 Inicializando MP com Public Key:', publicKey?.substring(0, 10) + '...');
        
        const mp = new window.MercadoPago(publicKey, {
          locale: 'pt-BR'
        });
        setMercadoPago(mp);
      } catch (error) {
        console.error('Erro ao carregar Mercado Pago:', error);
        setError('Erro ao carregar sistema de pagamento');
      }
    };

    const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
    if (publicKey) {
      initMP();
    } else {
      setError('Chave pública do Mercado Pago não configurada');
    }
  }, []);

  // Preencher dados automaticamente quando usuário estiver logado
  useEffect(() => {
    if (isAuthenticated && userData) {
      setFormData(prev => ({
        ...prev,
        cardHolderName: userData.nome || prev.cardHolderName,
        cardHolderEmail: userData.email || prev.cardHolderEmail,
        cardHolderCpf: userData.cpf || prev.cardHolderCpf,
        pixCpf: userData.cpf || prev.pixCpf
      }));
      console.log('✅ Dados do usuário preenchidos automaticamente');
    }
  }, [isAuthenticated, userData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .substr(0, 19);
  };

  const formatExpirationDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substr(0, 5);
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substr(0, 14);
  };

  // Função para verificar se usuário está logado
  const verificarLoginAntesPagamento = (metodoPagamento) => {
    if (!isAuthenticated || !user || !userData) {
      console.log('🔐 Usuário não logado, abrindo modal de login');
      setDadosTemporarios({ metodoPagamento });
      setModalLoginRequerido(true);
      return false;
    }
    return true;
  };

  // Callback quando login é bem-sucedido
  const handleLoginSuccess = async (usuarioLogado, dadosUsuario) => {
    console.log('✅ Login realizado com sucesso, continuando pagamento');
    setModalLoginRequerido(false);

    if (dadosTemporarios?.metodoPagamento === 'pix') {
      await processarPagamentoPix();
    } else if (dadosTemporarios?.metodoPagamento === 'cartao') {
      await processarPagamentoCartao();
    }

    setDadosTemporarios(null);
  };

  // Função para processar sucesso do pagamento
  const processarSucessoPagamento = async (paymentData) => {
    try {
      console.log('🎉 Processando sucesso do pagamento:', paymentData);

      if (!user || !userData) {
        console.log('⚠️ Usuário não logado, mas pagamento aprovado');
        // Ainda assim processar o sucesso para não perder o pagamento
      }

      const dadosReservaCompletos = {
        ...dadosReserva,
        clienteId: user?.uid || 'usuario_nao_logado',
        clienteNome: userData?.nome || dadosReserva?.clienteNome || '',
        clienteEmail: userData?.email || dadosReserva?.clienteEmail || '',
        clienteTelefone: userData?.telefone || dadosReserva?.clienteTelefone || '',
        clienteCpf: userData?.cpf || dadosReserva?.clienteCpf || '',
      };

      console.log('💾 Salvando reserva no Firestore...');
      
      // Salvar reserva no Firestore
      const reservaDocRef = await addDoc(collection(db, 'reservas'), {
        ...dadosReservaCompletos,
        pagamento: {
          status: paymentData.status,
          paymentId: paymentData.id,
          paymentType: paymentData.payment_type_id,
          transactionAmount: paymentData.transaction_amount,
          dateCreated: paymentData.date_created,
          dateApproved: paymentData.date_approved,
          description: paymentData.description
        },
        userId: user?.uid || null,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      
      const resultadoReserva = {
        reservaId: reservaDocRef.id,
        reservaData: {
          ...dadosReservaCompletos,
          id: reservaDocRef.id
        }
      };
      
      console.log('✅ Reserva salva:', resultadoReserva.reservaId);

      setReservaConfirmada(resultadoReserva.reservaData);
      setPaymentConfirmado(paymentData);
      setModalConfirmacao(true);

      if (onSuccess) {
        onSuccess({
          ...paymentData,
          reservaId: resultadoReserva.reservaId,
          usuarioLogado: user
        });
      }

    } catch (error) {
      console.error('❌ Erro no fluxo de sucesso:', error);
      // Ainda mostrar confirmação mesmo com erro de salvamento
      setPaymentConfirmado(paymentData);
      setModalConfirmacao(true);
      
      if (onSuccess) {
        onSuccess({
          ...paymentData,
          erro: error.message,
          usuarioLogado: user
        });
      }
    }
  };

  const processarPagamentoPix = async () => {
    if (!verificarLoginAntesPagamento('pix')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');

      // Usar dados do usuário logado como fallback
      const dadosPagamento = {
        valor: valor * 0.95,
        metodoPagamento: 'pix',
        packageData: {
          id: dadosReserva?.pacoteId || '',
          titulo: dadosReserva?.pacoteTitulo || ''
        },
        reservaData: {
          pacoteId: dadosReserva?.pacoteId || '',
          pacoteTitulo: dadosReserva?.pacoteTitulo || '',
          clienteNome: dadosReserva?.clienteNome || userData?.nome || '',
          clienteEmail: dadosReserva?.clienteEmail || userData?.email || '',
          clienteTelefone: dadosReserva?.clienteTelefone || userData?.telefone || '',
          clienteCpf: dadosReserva?.clienteCpf || userData?.cpf || '',
          valorTotal: dadosReserva?.valorTotal || valor,
          metodoPagamento: 'pix'
        },
        payerData: {
          email: dadosReserva?.clienteEmail || userData?.email || '',
          first_name: (dadosReserva?.clienteNome || userData?.nome || '').split(' ')[0] || 'Cliente',
          last_name: (dadosReserva?.clienteNome || userData?.nome || '').split(' ').slice(1).join(' ') || '',
          identification: {
            type: 'CPF',
            number: (formData.pixCpf || userData?.cpf || '').replace(/\D/g, '') || '11111111111'
          }
        }
      };

      const isLocalDev = window.location.hostname === 'localhost';
      const apiUrl = isLocalDev 
        ? 'https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/mercadopago'
        : '/api/mercadopago';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPagamento)
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento PIX');
      }

      const result = await response.json();
      
      if (result.success && result.qr_code) {
        setPixQrCode(result.qr_code);
        setPixCopiaECola(result.qr_code);
        
        try {
          const qrDataUrl = await QRCode.toDataURL(result.qr_code, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (qrError) {
          console.error('Erro ao gerar QR Code visual:', qrError);
        }
        
        iniciarVerificacaoPix(result.payment_id);
      } else {
        throw new Error(result.error || 'Erro ao gerar PIX');
      }

    } catch (error) {
      console.error('Erro PIX:', error);
      setError(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  const processarPagamentoCartao = async () => {
    if (!verificarLoginAntesPagamento('cartao')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (!mercadoPago) {
        throw new Error('Mercado Pago não inicializado');
      }

      if (!formData.cardNumber || !formData.expirationDate || !formData.securityCode || !formData.cardHolderName) {
        throw new Error('Preencha todos os campos do cartão');
      }

      const [month, year] = formData.expirationDate.split('/');
      
      const cardToken = await mercadoPago.createCardToken({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expirationMonth: month.padStart(2, '0'),
        expirationYear: `20${year}`,
        securityCode: formData.securityCode,
        cardHolderName: formData.cardHolderName,
      });

      if (cardToken.error) {
        throw new Error('Dados do cartão inválidos');
      }

      const dadosPagamento = {
        valor,
        metodoPagamento: 'cartao',
        packageData: {
          id: dadosReserva?.pacoteId || '',
          titulo: dadosReserva?.pacoteTitulo || ''
        },
        reservaData: {
          pacoteId: dadosReserva?.pacoteId || '',
          pacoteTitulo: dadosReserva?.pacoteTitulo || '',
          clienteNome: dadosReserva?.clienteNome || '',
          clienteEmail: dadosReserva?.clienteEmail || '',
          clienteTelefone: dadosReserva?.clienteTelefone || '',
          clienteCpf: dadosReserva?.clienteCpf || '',
          valorTotal: dadosReserva?.valorTotal || valor,
          metodoPagamento: 'cartao'
        },
        cardToken: cardToken.id,
        installments: formData.installments,
        payerData: {
          email: formData.cardHolderEmail || userData?.email || '',
          first_name: (formData.cardHolderName || userData?.nome || '').split(' ')[0] || 'Cliente',
          last_name: (formData.cardHolderName || userData?.nome || '').split(' ').slice(1).join(' ') || '',
          identification: {
            type: 'CPF',
            number: (formData.cardHolderCpf || userData?.cpf || '').replace(/\D/g, '') || '11111111111'
          }
        }
      };

      const isLocalDev = window.location.hostname === 'localhost';
      const apiUrl = isLocalDev 
        ? 'https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/mercadopago'
        : '/api/mercadopago';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPagamento)
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (result.isTokenError || result.message?.includes('Card Token')) {
          throw new Error('Token do cartão expirou. Por favor, preencha os dados novamente.');
        }
        throw new Error(result.error || result.message || 'Erro ao processar pagamento');
      }
      
      if (result.success) {
        await processarSucessoPagamento(result);
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

    } catch (error) {
      console.error('Erro Cartão:', error);
      
      if (error.message?.includes('Token do cartão expirou')) {
        setFormData(prev => ({
          ...prev,
          cardNumber: '',
          expirationDate: '',
          securityCode: '',
          cardHolderName: ''
        }));
      }
      
      setError(error.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const iniciarVerificacaoPix = (paymentId) => {
    const interval = setInterval(async () => {
      try {
        const isLocalDev = window.location.hostname === 'localhost';
        const apiUrl = isLocalDev 
          ? `https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/payment/${paymentId}`
          : `/api/payment/${paymentId}`;

        const response = await fetch(apiUrl);
        const result = await response.json();
        
        if (result.status === 'approved') {
          clearInterval(interval);
          await processarSucessoPagamento(result);
        } else if (result.status === 'rejected') {
          clearInterval(interval);
          setError('Pagamento PIX rejeitado');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 600000);
  };

  const copiarPixCodigo = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    alert('Código PIX copiado para área de transferência!');
  };


  // Redireciona automaticamente para área do cliente ao fechar o modal de confirmação
  useEffect(() => {
    if (!modalConfirmacao && reservaConfirmada) {
      navigate('/area-cliente');
    }
  }, [modalConfirmacao, reservaConfirmada, navigate]);

  const irParaAreaCliente = () => {
    setModalConfirmacao(false);
    // O redirecionamento será feito automaticamente pelo useEffect acima
  };

  const valorFinal = metodoPagamento === 'pix' ? valor * 0.95 : valor;

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            R$ {valorFinal.toFixed(2)}
          </Typography>
          {metodoPagamento === 'pix' && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              5% desconto aplicado
            </Typography>
          )}
        </CardContent>
      </Card>

      {metodoPagamento === 'pix' && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <QrCodeIcon color="success" />
              <Typography variant="h6" fontWeight="bold">
                Pagamento via PIX
              </Typography>
            </Box>

            {!pixQrCode ? (
              <Box>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="CPF"
                      value={formData.pixCpf}
                      onChange={(e) => setFormData({ ...formData, pixCpf: formatCPF(e.target.value) })}
                      placeholder="000.000.000-00"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={processarPagamentoPix}
                  disabled={loading || !formData.pixCpf || formData.pixCpf.replace(/\D/g, '').length !== 11}
                  startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
                  sx={{
                    py: 2,
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e8578 0%, #32d16a 100%)',
                    }
                  }}
                >
                  {loading ? 'Gerando PIX...' : 'Gerar Código PIX'}
                </Button>
              </Box>
            ) : (
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Escaneie o QR Code ou copie o código PIX:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code PIX" 
                      style={{ 
                        width: 200, 
                        height: 200, 
                        border: '1px solid #ddd',
                        borderRadius: 8
                      }} 
                    />
                  ) : (
                    <Box sx={{ 
                      width: 200, 
                      height: 200, 
                      bgcolor: '#f5f5f5', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #ddd',
                      borderRadius: 1
                    }}>
                      <CircularProgress />
                    </Box>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  onClick={copiarPixCodigo}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Copiar código PIX
                </Button>

                <Typography variant="caption" color="text.secondary">
                  O pagamento será confirmado automaticamente
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {metodoPagamento === 'cartao' && (
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <CreditCard color="primary" />
              <Typography variant="h6" fontWeight="bold">
                Pagamento com Cartão
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número do Cartão"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCard />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Validade"
                  value={formData.expirationDate}
                  onChange={(e) => handleInputChange('expirationDate', formatExpirationDate(e.target.value))}
                  placeholder="MM/AA"
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  value={formData.securityCode}
                  onChange={(e) => handleInputChange('securityCode', e.target.value.replace(/\D/g, '').substr(0, 4))}
                  placeholder="000"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome no Cartão"
                  value={formData.cardHolderName}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value.toUpperCase())}
                  placeholder="NOME COMO NO CARTÃO"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="CPF do Portador"
                  value={formData.cardHolderCpf}
                  onChange={(e) => handleInputChange('cardHolderCpf', formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email do Portador"
                  type="email"
                  value={formData.cardHolderEmail}
                  onChange={(e) => handleInputChange('cardHolderEmail', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Parcelas</InputLabel>
                  <Select
                    value={formData.installments}
                    onChange={(e) => handleInputChange('installments', e.target.value)}
                    label="Parcelas"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                      <MenuItem key={num} value={num}>
                        {num}x de R$ {(valor / num).toFixed(2)}
                        {num === 1 ? ' à vista' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={processarPagamentoCartao}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CreditCard />}
                  sx={{
                    py: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  {loading ? 'Processando...' : `Pagar R$ ${valor.toFixed(2)}`}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <ModalLoginRequerido
        open={modalLoginRequerido}
        onClose={() => setModalLoginRequerido(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      <ModalConfirmacaoReserva
        open={modalConfirmacao}
        onClose={() => setModalConfirmacao(false)}
        reservaData={reservaConfirmada}
        paymentData={paymentConfirmado}
        onVerMinhasReservas={irParaAreaCliente}
      />
    </Box>
  );
};

export default CheckoutTransparente;
