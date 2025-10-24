import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { postsService } from '../../services/postsService';
import RichTextEditorV2 from '../RichTextEditorV2/RichTextEditorV2';
import './AdminBlog.css';

const CATEGORIAS = ['Experiências', 'Impacto Social', 'Gastronomia', 'Cultura', 'Dicas', 'Notícias'];

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    descricao: '',
    conteudo: '',
    categoria: 'Experiências',
    autor: 'Favela Chique',
    imagemCapa: '',
    tags: '',
    publicado: true
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const postsData = await postsService.getPosts({
        publicados: null, // Buscar todos
        orderByField: 'createdAt',
        direction: 'desc',
        limitCount: 100
      });
      setPosts(postsData);
    } catch (error) {
      showSnackbar('Erro ao carregar posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        titulo: post.titulo,
        slug: post.slug,
        descricao: post.descricao || '',
        conteudo: post.conteudo,
        categoria: post.categoria,
        autor: post.autor,
        imagemCapa: post.imagemCapa || '',
        tags: post.tags?.join(', ') || '',
        publicado: post.publicado
      });
    } else {
      setEditingPost(null);
      setFormData({
        titulo: '',
        slug: '',
        descricao: '',
        conteudo: '',
        categoria: 'Experiências',
        autor: 'Favela Chique',
        imagemCapa: '',
        tags: '',
        publicado: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPost(null);
  };

  const generateSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleChange = (e) => {
    const { name, value, checked} = e.target;
    
    if (name === 'publicado') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'titulo') {
      setFormData(prev => ({
        ...prev,
        titulo: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, conteudo: content }));
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.conteudo) {
      showSnackbar('Preencha título e conteúdo', 'error');
      return;
    }

    try {
      const postData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (editingPost) {
        await postsService.updatePost(editingPost.id, postData);
        showSnackbar('Post atualizado com sucesso!', 'success');
      } else {
        await postsService.createPost(postData);
        showSnackbar('Post criado com sucesso!', 'success');
      }

      handleCloseDialog();
      loadPosts();
    } catch (error) {
      showSnackbar('Erro ao salvar post', 'error');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) {
      return;
    }

    try {
      await postsService.deletePost(postId);
      showSnackbar('Post deletado com sucesso!', 'success');
      loadPosts();
    } catch (error) {
      showSnackbar('Erro ao deletar post', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Box className="admin-blog">
      <Box className="admin-blog-header">
        <Typography variant="h4">Gerenciar Blog</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Post
        </Button>
      </Box>

      <TableContainer component={Paper} className="posts-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Autor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.titulo}</TableCell>
                <TableCell>
                  <Chip label={post.categoria} size="small" color="primary" />
                </TableCell>
                <TableCell>{post.autor}</TableCell>
                <TableCell>
                  <Chip
                    label={post.publicado ? 'Publicado' : 'Rascunho'}
                    size="small"
                    color={post.publicado ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility fontSize="small" />
                    {post.views || 0}
                  </Box>
                </TableCell>
                <TableCell>{formatDate(post.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(post)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(post.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para Criar/Editar Post */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPost ? 'Editar Post' : 'Novo Post'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Título"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              fullWidth
              required
            />

            <TextField
              label="Slug (URL)"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              fullWidth
              helperText="Gerado automaticamente a partir do título"
            />

            <TextField
              label="Descrição Curta"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              helperText="Resumo que aparece nos cards"
            />

            <TextField
              label="Categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              select
              fullWidth
            >
              {CATEGORIAS.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Autor"
              name="autor"
              value={formData.autor}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="URL da Imagem de Capa"
              name="imagemCapa"
              value={formData.imagemCapa}
              onChange={handleChange}
              fullWidth
              helperText="URL da imagem (ex: https://...)"
            />

            <TextField
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              fullWidth
              helperText="Separe por vírgula (ex: tour, cultura, experiência)"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Conteúdo
              </Typography>
              <RichTextEditorV2
                value={formData.conteudo}
                onChange={handleContentChange}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.publicado}
                  onChange={handleChange}
                  name="publicado"
                />
              }
              label="Publicar imediatamente"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPost ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBlog;
