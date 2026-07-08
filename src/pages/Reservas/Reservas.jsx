import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { criarReserva } from '../../utils/reservaApi';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import './Reservas.css';

const ReservasPage = () => {
  const navigate = useNavigate();
  const [pacotes, setPacotes] = useState([]);
  const [loadingPacotes, setLoadingPacotes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    tipoReserva: 'passeio',
    pacoteId: '',
    pacoteTitulo: '',
    nome: '',
    email: '',
    telefone: '',
    data: '',
    hora: '',
    dataVolta: '',
    horaVolta: '',
    origem: '',
    destino: '',
    pagamento: 'pix',
    passageiros: 1,
    valorOrcamento: '',
    observacoes: ''
  });

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'pacotes'), orderBy('createdAt', 'desc')));
        const pacoteData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPacotes(pacoteData);
      } catch (error) {
        console.error('Erro ao carregar pacotes:', error);
      } finally {
        setLoadingPacotes(false);
      }
    };

    fetchPacotes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTipoReservaChange = (event) => {
    const tipoReserva = event.target.value;
    setFormData((prev) => ({
      ...prev,
      tipoReserva,
      pacoteId: tipoReserva === 'pacote' ? prev.pacoteId : '',
      pacoteTitulo: tipoReserva === 'pacote' ? prev.pacoteTitulo : ''
    }));
  };

  const handlePacoteSelection = (event) => {
    const pacoteId = event.target.value;
    const pacote = pacotes.find((item) => item.id === pacoteId);
    setFormData((prev) => ({
      ...prev,
      pacoteId,
      pacoteTitulo: pacote ? pacote.titulo : ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage({ type: '', text: '' });

    if (!formData.nome || !formData.email || !formData.telefone || !formData.data || !formData.hora) {
      setStatusMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios antes de enviar.' });
      return;
    }

    if (!formData.origem || !formData.destino) {
      setStatusMessage({ type: 'error', text: 'Por favor, informe origem e destino para que possamos enviar o orçamento correto.' });
      return;
    }

    if (formData.tipoReserva === 'pacote' && !formData.pacoteId) {
      setStatusMessage({ type: 'error', text: 'Selecione um pacote para continuar.' });
      return;
    }

    setSubmitting(true);

    try {
      await criarReserva({
        tipoReserva: formData.tipoReserva,
        pacoteId: formData.pacoteId || null,
        pacoteTitulo: formData.pacoteTitulo || null,
        clienteNome: formData.nome,
        clienteEmail: formData.email,
        clienteTelefone: formData.telefone,
        dataReserva: formData.data,
        hora: formData.hora,
        dataVolta: formData.dataVolta || null,
        horaVolta: formData.horaVolta || null,
        origem: formData.origem,
        destino: formData.destino,
        pagamento: formData.pagamento,
        totalPassageiros: Number(formData.passageiros) || 1,
        valorOrcamento: formData.valorOrcamento ? Number(formData.valorOrcamento) : null,
        observacoes: formData.observacoes,
        mensagemOrigem: 'Reserva direta pela página /reservas'
      });

      setStatusMessage({
        type: 'success',
        text: 'Reserva enviada com sucesso! Nossa equipe entrará em contato em breve.'
      });

      navigate('/obrigado');

      setFormData({
        tipoReserva: 'passeio',
        pacoteId: '',
        pacoteTitulo: '',
        nome: '',
        email: '',
        telefone: '',
        data: '',
        hora: '',
        dataVolta: '',
        horaVolta: '',
        origem: '',
        destino: '',
        pagamento: 'pix',
        passageiros: 1,
        valorOrcamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao registrar reserva:', error);
      setStatusMessage({ type: 'error', text: 'Ocorreu um erro ao enviar a reserva. Tente novamente mais tarde.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reservas-page">
      <Header />
      <main className="reservas-main">
        <Container maxWidth="lg">
          <Breadcrumb currentPage="Reservas" />

          <Box className="reservas-hero" sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Solicite sua reserva
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
              Prefere orçamento pelo WhatsApp? <Link to="/contato">Clique aqui</Link> para falar diretamente conosco.
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Não mostramos valores no site — seu orçamento será enviado pelo WhatsApp ou pela nossa equipe após o envio.
            </Typography>
          </Box>

          <Box className="reservas-content">
            <Box component="form" onSubmit={handleSubmit} className="reservas-form">
              {statusMessage.text && (
                <Alert severity={statusMessage.type} sx={{ mb: 3 }}>
                  {statusMessage.text}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="tipo-reserva-label">Tipo de serviço</InputLabel>
                    <Select
                      labelId="tipo-reserva-label"
                      label="Tipo de serviço"
                      name="tipoReserva"
                      value={formData.tipoReserva}
                      onChange={handleTipoReservaChange}
                      displayEmpty
                      MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                    >
                      <MenuItem value="passeio">Passeio</MenuItem>
                      <MenuItem value="transfer">Transfer</MenuItem>
                      <MenuItem value="pacote">Pacote / Tour</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {formData.tipoReserva === 'pacote' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="pacote-label">Pacote</InputLabel>
                      <Select
                        labelId="pacote-label"
                        label="Pacote"
                        name="pacoteId"
                        value={formData.pacoteId}
                        onChange={handlePacoteSelection}
                        displayEmpty
                        MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                      >
                        <MenuItem value="">Selecione um pacote</MenuItem>
                        {pacotes.map((pacote) => (
                          <MenuItem key={pacote.id} value={pacote.id}>
                            {pacote.titulo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nome completo"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-mail"
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
                    label="Data de ida"
                    name="data"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.data}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário de ida"
                    name="hora"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={formData.hora}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data de volta (opcional)"
                    name="dataVolta"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.dataVolta}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Horário de volta (opcional)"
                    name="horaVolta"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    value={formData.horaVolta}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Origem"
                    name="origem"
                    value={formData.origem}
                    onChange={handleChange}
                    placeholder="Ex: Aeroporto, Hotel, Residência"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Destino"
                    name="destino"
                    value={formData.destino}
                    onChange={handleChange}
                    placeholder="Ex: Praia, Passeio, Ponto turístico"
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="pagamento-label">Forma de pagamento</InputLabel>
                    <Select
                      labelId="pagamento-label"
                      label="Forma de pagamento"
                      name="pagamento"
                      value={formData.pagamento}
                      onChange={handleChange}
                      displayEmpty
                      MenuProps={{ PaperProps: { style: { maxHeight: 280 } } }}
                    >
                      <MenuItem value="pix">PIX</MenuItem>
                      <MenuItem value="cartao_credito">Cartão de crédito</MenuItem>
                      <MenuItem value="cartao_debito">Cartão de débito</MenuItem>
                      <MenuItem value="dinheiro">Dinheiro</MenuItem>
                      <MenuItem value="transferencia">Transferência</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Quantidade de passageiros"
                    name="passageiros"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={formData.passageiros}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Valor do orçamento (R$)"
                    name="valorOrcamento"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={formData.valorOrcamento}
                    onChange={handleChange}
                    placeholder="Ex: 850"
                    helperText="Informe o valor combinado com você para esse orçamento"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Observações"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Informações adicionais, restrições ou pedidos especiais"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
                    <Button type="submit" variant="contained" size="large" disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar reserva'}
                    </Button>
                    <Typography variant="body2" color="textSecondary">
                      A reserva será analisada pela nossa equipe e um atendente fará contato para confirmar a disponibilidade.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box className="reservas-sidebar">
              <Typography variant="h5" gutterBottom>
                Dicas rápidas
              </Typography>
              <Box component="div" className="reserva-note">
                <Typography>
                  • Se você já sabe qual pacote deseja, selecione a opção <strong>Pacote / Tour</strong>.
                </Typography>
                <Typography>
                  • Para transfers, informe o endereço de origem e destino com clareza.
                </Typography>
                <Typography>
                  • Após o envio, nosso time confirma o horário e os valores.
                </Typography>
              </Box>

              <Box className="reserva-whatsapp-card">
                <Typography variant="h6">Prefere WhatsApp?</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  A forma mais rápida de receber um orçamento e tirar dúvidas é pelo WhatsApp.
                </Typography>
                <Button component={Link} to="/contato" variant="outlined" fullWidth>
                  Solicitar orçamento pelo WhatsApp
                </Button>
              </Box>

              {!loadingPacotes && pacotes.length > 0 && (
                <Box className="reserva-pacotes-list">
                  <Typography variant="h6" gutterBottom>Pacotes mais procurados</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Os valores são enviados somente após a solicitação de orçamento.
                  </Typography>
                  {pacotes.slice(0, 4).map((pacote) => (
                    <Box key={pacote.id} className="pacote-item">
                      <Typography variant="subtitle1">{pacote.titulo}</Typography>
                      {pacote.duracao && (
                        <Typography variant="body2" color="textSecondary">
                          {pacote.duracao}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default ReservasPage;
