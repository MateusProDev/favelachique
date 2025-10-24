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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Language as LanguageIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import parceiroService from '../../services/parceiroService';
import { validateImageFile } from '../../utils/cloudinaryHelper';
import './AdminParceiros.css';

const CATEGORIAS = ['Restaurante', 'Hospedagem', 'Transporte', 'Turismo', 'Entretenimento', 'Outros'];

// Chave para salvar os dados do formulário no localStorage
const FORM_DATA_KEY = 'adminParceiroFormData';

const AdminParceiros = () => {
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState({ list: true, save: false });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [parceiroToDelete, setParceiroToDelete] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const initialFormData = {
    id: null,
    nome: '',
    descricaoBreve: '',
    categoria: '',
    telefone: '',
    whatsapp: '',
    instagram: '',
    website: '',
    locais: [],
    destaque: false,
    ativo: true,
    ordem: 0,
    logo: '',
    imagens: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [arquivos, setArquivos] = useState({ logo: null, imagens: [] });
  const [localInput, setLocalInput] = useState('');

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(FORM_DATA_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados do formulário do localStorage", error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que o formulário mudar
  useEffect(() => {
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    carregarParceiros();
  }, []);

  const carregarParceiros = async () => {
    try {
      setLoading(prev => ({ ...prev, list: true }));
      const dados = await parceiroService.buscarTodos();
      setParceiros(dados);
    } catch (error) {
      showNotification('Erro ao carregar parceiros', 'error');
    } finally {
      setLoading(prev => ({ ...prev, list: false }));
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleEditClick = (parceiro) => {
    setFormData(parceiro);
    setArquivos({ logo: null, imagens: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setArquivos({ logo: null, imagens: [] });
    localStorage.removeItem(FORM_DATA_KEY);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e, tipo) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      if (tipo === 'imagens') {
        const fileArray = Array.from(files);
        fileArray.forEach(file => validateImageFile(file));
        setArquivos(prev => ({ ...prev, imagens: [...prev.imagens, ...fileArray] }));
      } else {
        const file = files[0];
        validateImageFile(file);
        setArquivos(prev => ({ ...prev, [tipo]: file }));
      }
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleAddLocal = () => {
    if (localInput.trim()) {
      setFormData(prev => ({ ...prev, locais: [...prev.locais, localInput.trim()] }));
      setLocalInput('');
    }
  };

  const handleRemoveLocal = (index) => {
    setFormData(prev => ({ ...prev, locais: prev.locais.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, save: true }));
      if (formData.id) {
        await parceiroService.atualizar(formData.id, formData, arquivos);
        showNotification('Parceiro atualizado!');
      } else {
        await parceiroService.criar(formData, arquivos);
        showNotification('Parceiro criado!');
      }
      resetForm();
      await carregarParceiros();
    } catch (error) {
      showNotification(error.message || 'Erro ao salvar', 'error');
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleDelete = async () => {
    if (!parceiroToDelete) return;
    try {
      await parceiroService.deletar(parceiroToDelete.id);
      showNotification('Parceiro excluído!');
      setParceiros(prev => prev.filter(p => p.id !== parceiroToDelete.id));
      setDeleteDialogOpen(false);
      setParceiroToDelete(null);
    } catch (error) {
      showNotification('Erro ao excluir', 'error');
    }
  };

  const handleToggleAtivo = async (id, statusAtual) => {
    try {
      await parceiroService.toggleAtivo(id, !statusAtual);
      setParceiros(prev => prev.map(p => p.id === id ? { ...p, ativo: !p.ativo } : p));
    } catch (error) {
      showNotification('Erro ao alterar status', 'error');
    }
  };

  const handleToggleDestaque = async (id, statusAtual) => {
    try {
      await parceiroService.toggleDestaque(id, !statusAtual);
      setParceiros(prev => prev.map(p => p.id === id ? { ...p, destaque: !p.destaque } : p));
    } catch (error) {
      showNotification('Erro ao alterar destaque', 'error');
    }
  };

  return (
    <Box className="admin-parceiros">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">Gerenciar Parceiros</Typography>
        </Box>

        {/* Formulário de Criação/Edição */}
        <Paper elevation={3} sx={{ p: 3, mb: 5 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">{formData.id ? 'Editar Parceiro' : 'Criar Novo Parceiro'}</Typography>
              <Button onClick={resetForm} startIcon={<ClearIcon />} size="small">Limpar</Button>
            </Box>
            <Grid container spacing={2}>
              {/* Coluna 1: Informações Principais */}
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Nome *" name="nome" value={formData.nome} onChange={handleInputChange} required />
                <FormControl fullWidth required sx={{ mt: 2 }}>
                  <InputLabel>Categoria</InputLabel>
                  <Select name="categoria" value={formData.categoria} onChange={handleInputChange} label="Categoria">
                    {CATEGORIAS.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Descrição" name="descricaoBreve" value={formData.descricaoBreve} onChange={handleInputChange} multiline rows={3} sx={{ mt: 2 }} />
              </Grid>

              {/* Coluna 2: Contatos e Locais */}
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Telefone" name="telefone" value={formData.telefone} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} />
                <TextField fullWidth label="WhatsApp" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start"><WhatsAppIcon /></InputAdornment> }} helperText="Com DDI: 55219..." sx={{ mt: 2 }} />
                <TextField fullWidth label="Instagram" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="@usuario" sx={{ mt: 2 }} />
                <TextField fullWidth label="Website" name="website" value={formData.website} onChange={handleInputChange} InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon /></InputAdornment> }} sx={{ mt: 2 }} />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Locais/Unidades</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField fullWidth size="small" value={localInput} onChange={(e) => setLocalInput(e.target.value)} placeholder="Ex: Centro, Copacabana" onKeyPress={(e) => e.key === 'Enter' && handleAddLocal()} />
                    <Button variant="outlined" onClick={handleAddLocal} size="small">Add</Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.locais.map((local, index) => (
                      <Chip key={index} label={local} onDelete={() => handleRemoveLocal(index)} size="small" />
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Coluna 3: Imagens e Configs */}
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Logo *</Typography>
                  {formData.logo && !arquivos.logo && (
                    <Box sx={{ mb: 1, border: '1px dashed grey', p: 1, borderRadius: 1, textAlign: 'center' }}>
                      <img src={formData.logo} alt="Logo Atual" style={{ maxHeight: 80, objectFit: 'contain' }} />
                    </Box>
                  )}
                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth size="small">
                    {arquivos.logo ? arquivos.logo.name : 'Selecionar Nova Logo'}
                    <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                  </Button>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Galeria de Imagens</Typography>
                  <Button variant="outlined" component="label" fullWidth size="small">
                    {arquivos.imagens.length > 0 ? `${arquivos.imagens.length} nova(s) imagem(ns)` : 'Adicionar Imagens'}
                    <input type="file" hidden multiple accept="image/*" onChange={(e) => handleFileChange(e, 'imagens')} />
                  </Button>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <FormControlLabel control={<Switch checked={formData.ativo} onChange={handleInputChange} name="ativo" />} label="Ativo" />
                  <FormControlLabel control={<Switch checked={formData.destaque} onChange={handleInputChange} name="destaque" />} label="Destaque" />
                </Box>
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button onClick={resetForm} variant="outlined">Cancelar</Button>
                <Button type="submit" variant="contained" disabled={loading.save}>
                  {loading.save ? <CircularProgress size={24} /> : formData.id ? 'Atualizar' : 'Criar Parceiro'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Divider sx={{ my: 4 }}><Chip label="Lista de Parceiros" /></Divider>

        {loading.list ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (
          <Grid container spacing={3}>
            {parceiros.map((parceiro) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={parceiro.id}>
                <Card>
                  {parceiro.logo && (
                    <CardMedia component="img" height="140" image={parceiro.logo} alt={parceiro.nome} sx={{ objectFit: 'contain', p: 2 }} />
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                      {parceiro.destaque && <Chip icon={<StarIcon />} label="Destaque" size="small" color="warning" />}
                      <Chip label={parceiro.ativo ? 'Ativo' : 'Inativo'} size="small" color={parceiro.ativo ? 'success' : 'default'} />
                      <Chip label={parceiro.categoria} size="small" color="primary" variant="outlined" />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>{parceiro.nome}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{parceiro.descricaoBreve}</Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 1 }}>
                    <Box>
                      <IconButton size="small" onClick={() => handleToggleDestaque(parceiro.id, parceiro.destaque)} color={parceiro.destaque ? 'warning' : 'default'}>
                        {parceiro.destaque ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleToggleAtivo(parceiro.id, parceiro.ativo)} color={parceiro.ativo ? 'success' : 'default'}>
                        {parceiro.ativo ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleEditClick(parceiro)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => { setParceiroToDelete(parceiro); setDeleteDialogOpen(true); }} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <Typography>Tem certeza que deseja excluir <strong>{parceiroToDelete?.nome}</strong>?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setNotification(prev => ({ ...prev, open: false }))} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminParceiros;
