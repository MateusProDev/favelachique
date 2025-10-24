import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Language as LanguageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';
import parceiroService from '../../services/parceiroService';
import { validateImageFile } from '../../utils/cloudinaryHelper';
import './AdminParceiros.css';

const CATEGORIAS = [
  'Hospedagem',
  'Restaurante',
  'Transporte',
  'Turismo',
  'Agência de Viagens',
  'Entretenimento',
  'Comércio Local',
  'Serviços',
  'Outros'
];

const AdminParceiros = () => {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricaoBreve: '',
    descricaoCompleta: '',
    categoria: '',
    logo: '',
    imagemCapa: '',
    imagens: [],
    website: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: ''
    },
    locais: [{
      nome: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: '',
        referencia: ''
      },
      telefone: '',
      whatsapp: '',
      email: '',
      horarioFuncionamento: {
        segunda: '',
        terca: '',
        quarta: '',
        quinta: '',
        sexta: '',
        sabado: '',
        domingo: '',
        feriados: ''
      },
      coordenadas: {
        latitude: null,
        longitude: null
      },
      observacoes: ''
    }],
    redesSociais: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
      tiktok: ''
    },
    destaque: false,
    ativo: true,
    beneficios: [],
    especialidades: [],
    formasPagamento: [],
    tags: [],
    ordem: 0
  });

  // Estado para arquivos de upload
  const [arquivos, setArquivos] = useState({
    logo: null,
    imagemCapa: null,
    imagens: []
  });

  const [beneficioInput, setBeneficioInput] = useState('');
  const [especialidadeInput, setEspecialidadeInput] = useState('');
  const [formaPagamentoInput, setFormaPagamentoInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    carregarParceiros();
  }, []);

  const carregarParceiros = async () => {
    try {
      setLoading(true);
      const dados = await parceiroService.buscarTodos();
      setParceiros(dados);
    } catch (error) {
      showNotification('Erro ao carregar parceiros', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleOpenDialog = (parceiro = null) => {
    if (parceiro) {
      setFormData(parceiro);
      setSelectedParceiro(parceiro);
    } else {
      resetForm();
      setSelectedParceiro(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
    setCurrentTab(0);
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricaoBreve: '',
      descricaoCompleta: '',
      categoria: '',
      logo: '',
      imagemCapa: '',
      imagens: [],
      website: '',
      email: '',
      telefone: '',
      whatsapp: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        complemento: ''
      },
      locais: [{
        nome: '',
        endereco: {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          complemento: '',
          referencia: ''
        },
        telefone: '',
        whatsapp: '',
        email: '',
        horarioFuncionamento: {
          segunda: '',
          terca: '',
          quarta: '',
          quinta: '',
          sexta: '',
          sabado: '',
          domingo: '',
          feriados: ''
        },
        coordenadas: {
          latitude: null,
          longitude: null
        },
        observacoes: ''
      }],
      redesSociais: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        tiktok: ''
      },
      destaque: false,
      ativo: true,
      beneficios: [],
      especialidades: [],
      formasPagamento: [],
      tags: [],
      ordem: 0
    });
    setArquivos({
      logo: null,
      imagemCapa: null,
      imagens: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEnderecoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [name]: value
      }
    }));
  };

  const handleRedesSociaisChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      redesSociais: {
        ...prev.redesSociais,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e, tipo) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (tipo === 'imagens') {
        // Múltiplas imagens
        const fileArray = Array.from(files);
        fileArray.forEach(file => validateImageFile(file));
        setArquivos(prev => ({
          ...prev,
          imagens: fileArray
        }));
      } else {
        // Logo ou Capa (única imagem)
        const file = files[0];
        validateImageFile(file);
        setArquivos(prev => ({
          ...prev,
          [tipo]: file
        }));
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleAddBeneficio = () => {
    if (beneficioInput.trim()) {
      setFormData(prev => ({
        ...prev,
        beneficios: [...prev.beneficios, beneficioInput.trim()]
      }));
      setBeneficioInput('');
    }
  };

  const handleRemoveBeneficio = (index) => {
    setFormData(prev => ({
      ...prev,
      beneficios: prev.beneficios.filter((_, i) => i !== index)
    }));
  };

  const handleAddEspecialidade = () => {
    if (especialidadeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, especialidadeInput.trim()]
      }));
      setEspecialidadeInput('');
    }
  };

  const handleRemoveEspecialidade = (index) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, i) => i !== index)
    }));
  };

  const handleAddFormaPagamento = () => {
    if (formaPagamentoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        formasPagamento: [...prev.formasPagamento, formaPagamentoInput.trim()]
      }));
      setFormaPagamentoInput('');
    }
  };

  const handleRemoveFormaPagamento = (index) => {
    setFormData(prev => ({
      ...prev,
      formasPagamento: prev.formasPagamento.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Funções para gerenciar múltiplos locais
  const handleAddLocal = () => {
    setFormData(prev => ({
      ...prev,
      locais: [...prev.locais, {
        nome: '',
        endereco: {
          rua: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          complemento: '',
          referencia: ''
        },
        telefone: '',
        whatsapp: '',
        email: '',
        horarioFuncionamento: {
          segunda: '',
          terca: '',
          quarta: '',
          quinta: '',
          sexta: '',
          sabado: '',
          domingo: '',
          feriados: ''
        },
        coordenadas: {
          latitude: null,
          longitude: null
        },
        observacoes: ''
      }]
    }));
  };

  const handleRemoveLocal = (index) => {
    if (formData.locais.length > 1) {
      setFormData(prev => ({
        ...prev,
        locais: prev.locais.filter((_, i) => i !== index)
      }));
    }
  };

  const handleLocalChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      locais: prev.locais.map((local, i) => 
        i === index ? { ...local, [field]: value } : local
      )
    }));
  };

  const handleLocalEnderecoChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      locais: prev.locais.map((local, i) => 
        i === index ? {
          ...local,
          endereco: { ...local.endereco, [field]: value }
        } : local
      )
    }));
  };

  const handleLocalHorarioChange = (index, dia, value) => {
    setFormData(prev => ({
      ...prev,
      locais: prev.locais.map((local, i) => 
        i === index ? {
          ...local,
          horarioFuncionamento: { ...local.horarioFuncionamento, [dia]: value }
        } : local
      )
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (selectedParceiro) {
        // Atualizar
        await parceiroService.atualizar(selectedParceiro.id, formData, arquivos);
        showNotification('Parceiro atualizado com sucesso!');
      } else {
        // Criar
        await parceiroService.criar(formData, arquivos);
        showNotification('Parceiro criado com sucesso!');
      }

      await carregarParceiros();
      handleCloseDialog();
    } catch (error) {
      showNotification(error.message || 'Erro ao salvar parceiro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await parceiroService.deletar(selectedParceiro.id);
      showNotification('Parceiro deletado com sucesso!');
      await carregarParceiros();
      setDeleteDialogOpen(false);
      setSelectedParceiro(null);
    } catch (error) {
      showNotification('Erro ao deletar parceiro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (id) => {
    try {
      await parceiroService.toggleAtivo(id);
      await carregarParceiros();
      showNotification('Status atualizado com sucesso!');
    } catch (error) {
      showNotification('Erro ao atualizar status', 'error');
    }
  };

  const handleToggleDestaque = async (id) => {
    try {
      await parceiroService.toggleDestaque(id);
      await carregarParceiros();
      showNotification('Destaque atualizado com sucesso!');
    } catch (error) {
      showNotification('Erro ao atualizar destaque', 'error');
    }
  };

  return (
    <Box className="admin-parceiros">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Gerenciar Parceiros
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              px: 3,
              py: 1.5
            }}
          >
            Novo Parceiro
          </Button>
        </Box>

        {/* Loading */}
        {loading && parceiros.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Lista de Parceiros */}
            <Grid container spacing={3}>
              {parceiros.map((parceiro) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={parceiro.id}>
                  <Card className="parceiro-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Logo */}
                    <CardMedia
                      component="img"
                      height="180"
                      image={parceiro.logo || '/placeholder-logo.png'}
                      alt={parceiro.nome}
                      sx={{ objectFit: 'contain', bgcolor: '#f5f5f5', p: 2 }}
                    />

                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Badges */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        {parceiro.destaque && (
                          <Chip
                            icon={<StarIcon />}
                            label="Destaque"
                            size="small"
                            color="warning"
                          />
                        )}
                        {parceiro.ativo ? (
                          <Chip label="Ativo" size="small" color="success" />
                        ) : (
                          <Chip label="Inativo" size="small" color="default" />
                        )}
                        <Chip label={parceiro.categoria} size="small" color="primary" variant="outlined" />
                      </Box>

                      <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                        {parceiro.nome}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {parceiro.descricaoBreve}
                      </Typography>

                      {/* Informações */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {parceiro.website && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LanguageIcon fontSize="small" />
                            {parceiro.website}
                          </Typography>
                        )}
                        {parceiro.telefone && (
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" />
                            {parceiro.telefone}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box>
                        <Tooltip title={parceiro.destaque ? 'Remover destaque' : 'Destacar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleDestaque(parceiro.id)}
                            color={parceiro.destaque ? 'warning' : 'default'}
                          >
                            {parceiro.destaque ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={parceiro.ativo ? 'Desativar' : 'Ativar'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleAtivo(parceiro.id)}
                            color={parceiro.ativo ? 'success' : 'default'}
                          >
                            {parceiro.ativo ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(parceiro)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedParceiro(parceiro);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {parceiros.length === 0 && !loading && (
              <Paper sx={{ p: 8, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum parceiro cadastrado
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ mt: 2 }}
                >
                  Adicionar Primeiro Parceiro
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* Dialog de Edição/Criação */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { minHeight: '80vh' }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedParceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Informações Básicas" />
              <Tab label="Contato e Endereço" />
              <Tab label="Locais/Unidades" />
              <Tab label="Imagens" />
              <Tab label="Detalhes Adicionais" />
            </Tabs>

            {/* Tab 0: Informações Básicas */}
            {currentTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Nome do Parceiro"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                />

                <FormControl fullWidth required>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    label="Categoria"
                  >
                    {CATEGORIAS.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Descrição Breve"
                  name="descricaoBreve"
                  value={formData.descricaoBreve}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                  helperText="Descrição curta que aparece no card"
                />

                <TextField
                  fullWidth
                  label="Descrição Completa"
                  name="descricaoCompleta"
                  value={formData.descricaoCompleta}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  helperText="Descrição detalhada para a página do parceiro"
                />

                <TextField
                  fullWidth
                  label="Ordem de Exibição"
                  name="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={handleInputChange}
                  helperText="Menor número aparece primeiro"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ativo}
                        onChange={handleInputChange}
                        name="ativo"
                      />
                    }
                    label="Parceiro Ativo"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.destaque}
                        onChange={handleInputChange}
                        name="destaque"
                      />
                    }
                    label="Destacar na Home"
                  />
                </Box>
              </Box>
            )}

            {/* Tab 1: Contato e Endereço */}
            {currentTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                  Contato
                </Typography>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="Telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  fullWidth
                  label="WhatsApp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WhatsAppIcon />
                      </InputAdornment>
                    )
                  }}
                  helperText="Apenas números com DDI (ex: 5511999999999)"
                />

                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Redes Sociais
                </Typography>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="facebook"
                  value={formData.redesSociais.facebook}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://facebook.com/..."
                />
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={formData.redesSociais.instagram}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://instagram.com/..."
                />
                <TextField
                  fullWidth
                  label="Twitter"
                  name="twitter"
                  value={formData.redesSociais.twitter}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://twitter.com/..."
                />
                <TextField
                  fullWidth
                  label="LinkedIn"
                  name="linkedin"
                  value={formData.redesSociais.linkedin}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://linkedin.com/company/..."
                />
                <TextField
                  fullWidth
                  label="YouTube"
                  name="youtube"
                  value={formData.redesSociais.youtube}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://youtube.com/..."
                />
                <TextField
                  fullWidth
                  label="TikTok"
                  name="tiktok"
                  value={formData.redesSociais.tiktok}
                  onChange={handleRedesSociaisChange}
                  placeholder="https://tiktok.com/@..."
                />

                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Endereço
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Rua"
                      name="rua"
                      value={formData.endereco.rua}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Número"
                      name="numero"
                      value={formData.endereco.numero}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bairro"
                      name="bairro"
                      value={formData.endereco.bairro}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Complemento"
                      name="complemento"
                      value={formData.endereco.complemento}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      name="cidade"
                      value={formData.endereco.cidade}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Estado"
                      name="estado"
                      value={formData.endereco.estado}
                      onChange={handleEnderecoChange}
                      inputProps={{ maxLength: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="CEP"
                      name="cep"
                      value={formData.endereco.cep}
                      onChange={handleEnderecoChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Tab 2: Locais/Unidades */}
            {currentTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Locais/Unidades do Parceiro
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddLocal}
                    size="small"
                  >
                    Adicionar Local
                  </Button>
                </Box>

                <Alert severity="info">
                  Adicione múltiplos locais se o parceiro tiver mais de uma unidade (ex: Chico do Caranguejo tem várias filiais)
                </Alert>

                {formData.locais.map((local, index) => (
                  <Paper key={index} sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Local {index + 1}
                      </Typography>
                      {formData.locais.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveLocal(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Nome do Local"
                        value={local.nome}
                        onChange={(e) => handleLocalChange(index, 'nome', e.target.value)}
                        placeholder="Ex: Unidade Centro, Filial Praia"
                      />

                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Endereço</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth
                            label="Rua"
                            value={local.endereco.rua}
                            onChange={(e) => handleLocalEnderecoChange(index, 'rua', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Número"
                            value={local.endereco.numero}
                            onChange={(e) => handleLocalEnderecoChange(index, 'numero', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Bairro"
                            value={local.endereco.bairro}
                            onChange={(e) => handleLocalEnderecoChange(index, 'bairro', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Cidade"
                            value={local.endereco.cidade}
                            onChange={(e) => handleLocalEnderecoChange(index, 'cidade', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="Estado"
                            value={local.endereco.estado}
                            onChange={(e) => handleLocalEnderecoChange(index, 'estado', e.target.value)}
                            inputProps={{ maxLength: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="CEP"
                            value={local.endereco.cep}
                            onChange={(e) => handleLocalEnderecoChange(index, 'cep', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Complemento"
                            value={local.endereco.complemento}
                            onChange={(e) => handleLocalEnderecoChange(index, 'complemento', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Ponto de Referência"
                            value={local.endereco.referencia}
                            onChange={(e) => handleLocalEnderecoChange(index, 'referencia', e.target.value)}
                            placeholder="Ex: Próximo ao shopping, em frente à praia"
                          />
                        </Grid>
                      </Grid>

                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Contato do Local</Typography>
                      <TextField
                        fullWidth
                        label="Telefone"
                        value={local.telefone}
                        onChange={(e) => handleLocalChange(index, 'telefone', e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="WhatsApp"
                        value={local.whatsapp}
                        onChange={(e) => handleLocalChange(index, 'whatsapp', e.target.value)}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        value={local.email}
                        onChange={(e) => handleLocalChange(index, 'email', e.target.value)}
                      />

                      <Typography variant="subtitle2" sx={{ mt: 1 }}>Horário de Funcionamento</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Segunda"
                            value={local.horarioFuncionamento.segunda}
                            onChange={(e) => handleLocalHorarioChange(index, 'segunda', e.target.value)}
                            placeholder="Ex: 8h-18h"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Terça"
                            value={local.horarioFuncionamento.terca}
                            onChange={(e) => handleLocalHorarioChange(index, 'terca', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Quarta"
                            value={local.horarioFuncionamento.quarta}
                            onChange={(e) => handleLocalHorarioChange(index, 'quarta', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Quinta"
                            value={local.horarioFuncionamento.quinta}
                            onChange={(e) => handleLocalHorarioChange(index, 'quinta', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Sexta"
                            value={local.horarioFuncionamento.sexta}
                            onChange={(e) => handleLocalHorarioChange(index, 'sexta', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Sábado"
                            value={local.horarioFuncionamento.sabado}
                            onChange={(e) => handleLocalHorarioChange(index, 'sabado', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Domingo"
                            value={local.horarioFuncionamento.domingo}
                            onChange={(e) => handleLocalHorarioChange(index, 'domingo', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Feriados"
                            value={local.horarioFuncionamento.feriados}
                            onChange={(e) => handleLocalHorarioChange(index, 'feriados', e.target.value)}
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Observações"
                        value={local.observacoes}
                        onChange={(e) => handleLocalChange(index, 'observacoes', e.target.value)}
                        multiline
                        rows={2}
                        placeholder="Ex: Aceita cartão, Estacionamento próprio, Wi-Fi grátis"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}

            {/* Tab 3: Imagens */}
            {currentTab === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Logo */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Logo do Parceiro *
                  </Typography>
                  {formData.logo && !arquivos.logo && (
                    <Box sx={{ mb: 2 }}>
                      <img src={formData.logo} alt="Logo atual" style={{ maxHeight: 100, objectFit: 'contain' }} />
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    {arquivos.logo ? `Logo selecionado: ${arquivos.logo.name}` : 'Selecionar Logo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                    />
                  </Button>
                </Box>

                {/* Imagem de Capa */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Imagem de Capa
                  </Typography>
                  {formData.imagemCapa && !arquivos.imagemCapa && (
                    <Box sx={{ mb: 2 }}>
                      <img src={formData.imagemCapa} alt="Capa atual" style={{ maxWidth: '100%', borderRadius: 8 }} />
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    {arquivos.imagemCapa ? `Capa selecionada: ${arquivos.imagemCapa.name}` : 'Selecionar Imagem de Capa'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'imagemCapa')}
                    />
                  </Button>
                </Box>

                {/* Galeria de Imagens */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Galeria de Imagens
                  </Typography>
                  
                  {/* Imagens Existentes */}
                  {formData.imagens && formData.imagens.length > 0 && (
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {formData.imagens.map((img, index) => (
                        <Grid item xs={6} sm={4} key={index}>
                          <Box sx={{ position: 'relative' }}>
                            <img src={img} alt={`Imagem ${index + 1}`} style={{ width: '100%', borderRadius: 8 }} />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                              }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    fullWidth
                  >
                    {arquivos.imagens.length > 0 
                      ? `${arquivos.imagens.length} imagem(ns) selecionada(s)` 
                      : 'Adicionar Imagens à Galeria'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'imagens')}
                    />
                  </Button>
                </Box>
              </Box>
            )}

            {/* Tab 4: Detalhes Adicionais */}
            {currentTab === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Especialidades */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Especialidades
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Ex: Frutos do mar, Caranguejo, Cerveja gelada, etc.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={especialidadeInput}
                      onChange={(e) => setEspecialidadeInput(e.target.value)}
                      placeholder="Digite uma especialidade"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddEspecialidade()}
                    />
                    <Button variant="contained" onClick={handleAddEspecialidade}>
                      Adicionar
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.especialidades.map((esp, index) => (
                      <Chip
                        key={index}
                        label={esp}
                        onDelete={() => handleRemoveEspecialidade(index)}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Formas de Pagamento */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Formas de Pagamento
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Ex: Dinheiro, Cartão de Crédito, PIX, Vale Refeição, etc.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={formaPagamentoInput}
                      onChange={(e) => setFormaPagamentoInput(e.target.value)}
                      placeholder="Digite uma forma de pagamento"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFormaPagamento()}
                    />
                    <Button variant="contained" onClick={handleAddFormaPagamento}>
                      Adicionar
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.formasPagamento.map((forma, index) => (
                      <Chip
                        key={index}
                        label={forma}
                        onDelete={() => handleRemoveFormaPagamento(index)}
                        color="info"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Benefícios */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Benefícios/Vantagens
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Ex: Desconto de 10% para clientes, Wi-Fi grátis, Estacionamento, etc.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={beneficioInput}
                      onChange={(e) => setBeneficioInput(e.target.value)}
                      placeholder="Digite um benefício"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBeneficio()}
                    />
                    <Button variant="contained" onClick={handleAddBeneficio}>
                      Adicionar
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.beneficios.map((beneficio, index) => (
                      <Chip
                        key={index}
                        label={beneficio}
                        onDelete={() => handleRemoveBeneficio(index)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Tags */}
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Tags
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Ex: família, luxo, econômico, pet-friendly, etc.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Digite uma tag"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button variant="contained" onClick={handleAddTag}>
                      Adicionar
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(index)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {selectedParceiro ? 'Atualizar' : 'Criar'} Parceiro
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja excluir o parceiro <strong>{selectedParceiro?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar de Notificação */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminParceiros;
