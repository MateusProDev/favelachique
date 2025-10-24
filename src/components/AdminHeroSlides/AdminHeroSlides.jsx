import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  ArrowUpward,
  ArrowDownward,
  Image as ImageIcon
} from '@mui/icons-material';
import { db, storage } from '../../firebase/firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import './AdminHeroSlides.css';

const AdminHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
    order: 0
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const slidesRef = collection(db, 'heroSlides');
      const q = query(slidesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      const slidesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSlides(slidesData);
    } catch (error) {
      console.error('Erro ao buscar slides:', error);
      showSnackbar('Erro ao carregar slides', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (slide = null) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData({
        title: slide.title || '',
        description: slide.description || '',
        buttonText: slide.buttonText || '',
        buttonLink: slide.buttonLink || '',
        imageUrl: slide.imageUrl || '',
        order: slide.order || 0
      });
      setImagePreview(slide.imageUrl || '');
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        imageUrl: '',
        order: slides.length
      });
      setImagePreview('');
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSlide(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const timestamp = Date.now();
    const fileName = `hero-slides/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSave = async () => {
    try {
      setUploading(true);

      let imageUrl = formData.imageUrl;

      // Upload nova imagem se selecionada
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const slideData = {
        ...formData,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingSlide) {
        // Atualizar slide existente
        const slideRef = doc(db, 'heroSlides', editingSlide.id);
        await updateDoc(slideRef, slideData);
        showSnackbar('Slide atualizado com sucesso!', 'success');
      } else {
        // Criar novo slide
        slideData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'heroSlides'), slideData);
        showSnackbar('Slide criado com sucesso!', 'success');
      }

      fetchSlides();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar slide:', error);
      showSnackbar('Erro ao salvar slide', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm('Tem certeza que deseja excluir este slide?')) return;

    try {
      await deleteDoc(doc(db, 'heroSlides', slide.id));
      showSnackbar('Slide excluído com sucesso!', 'success');
      fetchSlides();
    } catch (error) {
      console.error('Erro ao excluir slide:', error);
      showSnackbar('Erro ao excluir slide', 'error');
    }
  };

  const handleReorder = async (slide, direction) => {
    try {
      const currentIndex = slides.findIndex(s => s.id === slide.id);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= slides.length) return;

      const updatedSlides = [...slides];
      [updatedSlides[currentIndex], updatedSlides[newIndex]] = 
      [updatedSlides[newIndex], updatedSlides[currentIndex]];

      // Atualizar ordem no Firestore
      for (let i = 0; i < updatedSlides.length; i++) {
        const slideRef = doc(db, 'heroSlides', updatedSlides[i].id);
        await updateDoc(slideRef, { order: i });
      }

      fetchSlides();
      showSnackbar('Ordem atualizada!', 'success');
    } catch (error) {
      console.error('Erro ao reordenar:', error);
      showSnackbar('Erro ao reordenar slides', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="admin-hero-slides">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gerenciar Hero Carousel
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Adicionar Slide
        </Button>
      </Box>

      {slides.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum slide cadastrado
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Comece adicionando seu primeiro slide para o Hero Carousel
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
              Adicionar Primeiro Slide
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagem</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Botão</TableCell>
                <TableCell align="center">Ordem</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slides.map((slide, index) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <Box
                      component="img"
                      src={slide.imageUrl}
                      alt={slide.title}
                      sx={{
                        width: 100,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{slide.title}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {slide.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{slide.buttonText || '-'}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleReorder(slide, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUpward fontSize="small" />
                      </IconButton>
                      <Typography>{index + 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleReorder(slide, 'down')}
                        disabled={index === slides.length - 1}
                      >
                        <ArrowDownward fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(slide)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(slide)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para criar/editar slide */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSlide ? 'Editar Slide' : 'Adicionar Novo Slide'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              required
            />

            <TextField
              label="Texto do Botão"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              fullWidth
              placeholder="Ex: Conheça Nossos Tours"
            />

            <TextField
              label="Link do Botão"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              fullWidth
              placeholder="Ex: /pacotes"
            />

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                fullWidth
              >
                {imageFile ? 'Trocar Imagem' : 'Selecionar Imagem'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 1,
                    mt: 2
                  }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={uploading || !formData.title || !formData.description}
          >
            {uploading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminHeroSlides;
