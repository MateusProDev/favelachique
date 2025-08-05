// src/components/CheckoutTransparente/CheckoutTransparente.jsx
import React, { useState, useEffect } from 'react';
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
  Email,
  Phone
} from '@mui/icons-material';
import { loadMercadoPago } from '@mercadopago/sdk-js';
import QRCode from 'qrcode';

const CheckoutTransparente = ({ 
  valor, 
  metodoPagamento, 
  onSuccess, 
  onError, 
  dadosReserva 
}) => {
  const [loading, setLoading] = useState(false);
  const [mercadoPago, setMercadoPago] = useState(null);
  const [error, setError] = useState('');
  const [pixQrCode, setPixQrCode] = useState('');
  const [pixCopiaECola, setPixCopiaECola] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  
  // Estados do formulário de cartão e PIX
  const [formData, setFormData] = useState({
    cardNumber: '', // Removendo dados de teste, user deve inserir cartão real
    expirationDate: '',
    securityCode: '',
    cardHolderName: '',
    cardHolderEmail: dadosReserva?.emailPassageiro || 'test_user_123@testuser.com',
    cardHolderCpf: '12345678909',
    pixCpf: '12345678909', // CPF para PIX
    installments: 1
  });

  // Inicializar Mercado Pago
  useEffect(() => {
    const initMP = async () => {
      try {
        await loadMercadoPago();
        
        // Usar credenciais de PRODUÇÃO 
        const publicKey = process.env.REACT_APP_MERCADO_PAGO_PUBLIC_KEY;
        
        console.log('🔧 Inicializando MP com Public Key:', publicKey?.substring(0, 10) + '...');
        console.log('🔧 Tipo de credencial:', publicKey?.startsWith('TEST-') ? 'TESTE' : 'PRODUÇÃO ✅');
        
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

  const processarPagamentoPix = async () => {
    try {
      setLoading(true);
      setError('');

      const dadosPagamento = {
        valor: valor * 0.95, // 5% desconto para PIX
        metodoPagamento: 'pix',
        packageData: {
          id: dadosReserva.pacoteId,
          titulo: dadosReserva.pacoteTitulo
        },
        reservaData: dadosReserva,
        payerData: {
          email: dadosReserva.emailPassageiro,
          first_name: dadosReserva.nomePassageiro?.split(' ')[0] || '',
          last_name: dadosReserva.nomePassageiro?.split(' ').slice(1).join(' ') || '',
          identification: {
            type: 'CPF',
            number: formData.pixCpf.replace(/\D/g, '') || '11111111111'
          }
        }
      };

      // Detectar se está em desenvolvimento local
      const isLocalDev = window.location.hostname === 'localhost';
      const apiUrl = isLocalDev 
        ? 'https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/mercadopago'
        : '/api/mercadopago';

      console.log('🎯 URL da API PIX:', apiUrl);
      console.log('🎯 Dados do pagamento:', dadosPagamento);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPagamento)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro da API:', errorText);
        throw new Error('Erro ao processar pagamento PIX');
      }

      const result = await response.json();
      console.log('✅ Resultado PIX:', result);
      
      if (result.success && result.qr_code) {
        setPixQrCode(result.qr_code);
        setPixCopiaECola(result.qr_code);
        
        // Gerar QR Code visual
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
        
        // Iniciar polling para verificar pagamento
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
    try {
      setLoading(true);
      setError('');

      if (!mercadoPago) {
        throw new Error('Mercado Pago não inicializado');
      }

      // Validar dados do cartão
      console.log('🎯 Validando dados do cartão:', {
        cardNumber: formData.cardNumber,
        expirationDate: formData.expirationDate,
        securityCode: formData.securityCode,
        cardHolderName: formData.cardHolderName
      });

      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 13) {
        throw new Error('Número do cartão inválido');
      }

      if (!formData.expirationDate || !formData.expirationDate.includes('/')) {
        throw new Error('Data de expiração inválida');
      }

      if (!formData.securityCode || formData.securityCode.length < 3) {
        throw new Error('Código de segurança inválido');
      }

      if (!formData.cardHolderName || formData.cardHolderName.trim().length < 2) {
        throw new Error('Nome do portador inválido');
      }

      // Validar formato da data
      const [month, year] = formData.expirationDate.split('/');
      console.log('🎯 Data de expiração:', formData.expirationDate);
      console.log('🎯 Mês:', month, 'Ano:', year);
      
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        throw new Error('Data de expiração inválida. Use formato MM/AA');
      }

      console.log('🎯 Criando token com dados:', {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expirationMonth: month.padStart(2, '0'),
        expirationYear: `20${year}`,
        securityCode: formData.securityCode,
        cardHolderName: formData.cardHolderName,
      });

      // Criar token do cartão
      const cardToken = await mercadoPago.createCardToken({
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expirationMonth: month.padStart(2, '0'),
        expirationYear: `20${year}`,
        securityCode: formData.securityCode,
        cardHolderName: formData.cardHolderName,
      });

      console.log('🎯 Token criado:', cardToken);

      if (cardToken.error) {
        throw new Error('Dados do cartão inválidos');
      }

      // Processar pagamento
      const dadosPagamento = {
        valor,
        metodoPagamento: 'cartao',
        packageData: {
          id: dadosReserva.pacoteId,
          titulo: dadosReserva.pacoteTitulo
        },
        reservaData: dadosReserva,
        cardToken: cardToken.id,
        installments: formData.installments,
        payerData: {
          email: formData.cardHolderEmail,
          first_name: 'APRO', // Usar valor fixo de teste
          last_name: 'APRO',  // Usar valor fixo de teste
          identification: {
            type: 'CPF',
            number: '12345678909' // CPF de teste fixo
          }
        }
      };

      // Detectar se está em desenvolvimento local
      const isLocalDev = window.location.hostname === 'localhost';
      const apiUrl = isLocalDev 
        ? 'https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/mercadopago'
        : '/api/mercadopago';

      console.log('💳 URL da API Cartão:', apiUrl);
      console.log('💳 Dados do pagamento:', dadosPagamento);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosPagamento)
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Verificar se é erro de token expirado
        if (result.isTokenError || result.message?.includes('Card Token')) {
          throw new Error('Token do cartão expirou. Por favor, preencha os dados novamente.');
        }
        throw new Error(result.error || result.message || 'Erro ao processar pagamento');
      }
      
      if (result.success) {
        onSuccess(result);
      } else {
        throw new Error(result.error || 'Erro ao processar pagamento');
      }

    } catch (error) {
      console.error('Erro Cartão:', error);
      
      // Limpar dados do cartão se for erro de token
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
        // Detectar se está em desenvolvimento local
        const isLocalDev = window.location.hostname === 'localhost';
        const apiUrl = isLocalDev 
          ? `https://favelachique-bodxmc5sg-mateus-ferreiras-projects.vercel.app/api/payment/${paymentId}`
          : `/api/payment/${paymentId}`;

        const response = await fetch(apiUrl);
        const result = await response.json();
        
        console.log('🔍 Status do pagamento:', result);
        
        if (result.status === 'approved') {
          clearInterval(interval);
          onSuccess(result);
        } else if (result.status === 'rejected') {
          clearInterval(interval);
          setError('Pagamento PIX rejeitado');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Parar verificação após 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  const copiarPixCodigo = () => {
    navigator.clipboard.writeText(pixCopiaECola);
    alert('Código PIX copiado para área de transferência!');
  };

  const valorFinal = metodoPagamento === 'pix' ? valor * 0.95 : valor;

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header com valor */}
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

      {/* Formulário PIX */}
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
                
                {/* QR Code Visual */}
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
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
                    <Box 
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        bgcolor: '#f5f5f5', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ddd',
                        borderRadius: 1
                      }}
                    >
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

      {/* Formulário Cartão */}
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
    </Box>
  );
};

export default CheckoutTransparente;
