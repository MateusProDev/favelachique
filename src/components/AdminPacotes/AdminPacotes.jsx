import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import axios from "axios";
import RichTextEditorV2 from '../RichTextEditorV2/RichTextEditorV2';
import { 
  migrarTodosPacotes, 
  atualizarCamposPacote, 
  calcularValoresPacote 
} from '../../utils/firestoreAutoFields';

import { 
  Box,
  Container,
  Typography, 
  Button, 
  TextField, 
  Checkbox, 
  FormControlLabel, 
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Grid,
  Paper,
  IconButton,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Divider,
  Chip
} from "@mui/material";
import { 
  Upload as UploadIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import "./AdminPacotes.css";

const AdminPacotes = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState({
    list: true,
    upload: false,
    saving: false
  });
  const [currentPacote, setCurrentPacote] = useState({
    titulo: "",
    descricao: "",
    descricaoCurta: "",
    preco: 0,
    precoOriginal: 0,
    imagens: [],
    destaque: false,
    slug: "",
    // Configurações de ida e volta
    isIdaEVolta: false,
    precoIda: 0,
    precoVolta: 0,
    precoIdaVolta: 0,
    // Configurações de sinal
    sinalConfig: {
      tipo: "porcentagem", // "porcentagem" ou "valor"
      valor: 30, // Se tipo for "porcentagem", representa %, se for "valor", representa valor fixo
      obrigatorio: true
    },
    // Campos automáticos calculados
    valorSinalCalculado: 0,
    valorParaMotorista: 0,
    porcentagemSinalPadrao: 40
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pacotes'));
        const pacotesData = [];
        
        // Atualizar cada pacote automaticamente com os novos campos
        for (const docSnap of querySnapshot.docs) {
          const dadosOriginais = docSnap.data();
          const dadosAtualizados = await atualizarCamposPacote(docSnap.id, dadosOriginais);
          
          pacotesData.push({
            id: docSnap.id,
            ...dadosAtualizados
          });
        }
        
        setPacotes(pacotesData);
        showNotification("success", "Pacotes carregados e atualizados automaticamente!");
      } catch (err) {
        showNotification("error", "Erro ao carregar pacotes");
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(prev => ({ ...prev, list: false }));
      }
    };
    fetchPacotes();
  }, []); // Removendo loading da dependência para evitar loop infinito

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  // Função para calcular valores automaticamente
  const calcularValores = (pacote) => {
    const valoresCalculados = calcularValoresPacote(pacote);
    return {
      ...pacote,
      ...valoresCalculados
    };
  };

  // Atualizar valores quando pacote mudar
  useEffect(() => {
    if (currentPacote.preco || currentPacote.precoIdaVolta) {
      const pacoteAtualizado = calcularValores(currentPacote);
      if (JSON.stringify(pacoteAtualizado) !== JSON.stringify(currentPacote)) {
        setCurrentPacote(pacoteAtualizado);
      }
    }
  }, [currentPacote.preco, currentPacote.precoIdaVolta, currentPacote.isIdaEVolta, currentPacote.sinalConfig?.tipo, currentPacote.sinalConfig?.valor]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.match("image.*")) {
      showNotification("error", "Por favor, selecione um arquivo de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    setLoading({ ...loading, upload: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      
      setCurrentPacote(prev => ({ 
        ...prev, 
        imagens: [...prev.imagens, response.data.secure_url] 
      }));
      
      showNotification("success", "Imagem enviada com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao enviar imagem");
      console.error("Erro no upload:", error);
    } finally {
      setLoading({ ...loading, upload: false });
    }
  };

  const removeImage = (index) => {
    setCurrentPacote(prev => {
      const newImages = [...prev.imagens];
      newImages.splice(index, 1);
      return { ...prev, imagens: newImages };
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pacote?')) {
      try {
        await deleteDoc(doc(db, 'pacotes', id));
        setPacotes(pacotes.filter(pacote => pacote.id !== id));
        showNotification("success", "Pacote excluído com sucesso!");
      } catch (err) {
        showNotification("error", "Erro ao excluir pacote");
        console.error("Erro ao excluir pacote:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentPacote.titulo.trim()) {
      showNotification("error", "O título do pacote é obrigatório");
      return;
    }

    if (currentPacote.imagens.length === 0) {
      showNotification("error", "Adicione pelo menos uma imagem");
      return;
    }

    // Gerar slug automaticamente se estiver vazio
    if (!currentPacote.slug.trim()) {
      const slug = currentPacote.titulo
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      setCurrentPacote(prev => ({ ...prev, slug }));
    }

    setLoading({ ...loading, saving: true });

    try {
      const pacoteData = {
        ...currentPacote,
        createdAt: currentPacote.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
        preco: Number(currentPacote.preco),
        precoOriginal: currentPacote.precoOriginal ? Number(currentPacote.precoOriginal) : null
      };

      if (currentPacote.id) {
        // Atualizar existente
        await setDoc(doc(db, "pacotes", currentPacote.id), pacoteData);
        showNotification("success", "Pacote atualizado com sucesso!");
      } else {
        // Criar novo
        const newDocRef = doc(collection(db, "pacotes"));
        await setDoc(newDocRef, { ...pacoteData, id: newDocRef.id });
        showNotification("success", "Pacote criado com sucesso!");
      }

      // Recarregar lista
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      setPacotes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Resetar formulário
      setCurrentPacote({
        titulo: "",
        descricao: "",
        descricaoCurta: "",
        preco: 0,
        precoOriginal: 0,
        imagens: [],
        destaque: false,
        slug: ""
      });
      
    } catch (error) {
      showNotification("error", "Erro ao salvar pacote");
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading({ ...loading, saving: false });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentPacote(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDescriptionChange = (content) => {
    setCurrentPacote(prev => ({ 
      ...prev, 
      descricao: content 
    }));
  };

  const editPacote = (pacote) => {
    setCurrentPacote({
      ...pacote,
      preco: Number(pacote.preco),
      precoOriginal: pacote.precoOriginal ? Number(pacote.precoOriginal) : null,
      // Garantir que os novos campos existam
      isIdaEVolta: pacote.isIdaEVolta || false,
      precoIda: Number(pacote.precoIda) || 0,
      precoVolta: Number(pacote.precoVolta) || 0,
      precoIdaVolta: Number(pacote.precoIdaVolta) || 0,
      sinalConfig: pacote.sinalConfig || {
        tipo: "porcentagem",
        valor: 30,
        obrigatorio: true
      },
      valorSinalCalculado: pacote.valorSinalCalculado || 0,
      valorParaMotorista: pacote.valorParaMotorista || 0,
      porcentagemSinalPadrao: pacote.porcentagemSinalPadrao || 40
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Pacotes
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined"
            color="info"
            onClick={async () => {
              setLoading(prev => ({ ...prev, saving: true }));
              const resultado = await migrarTodosPacotes();
              if (resultado.sucesso) {
                showNotification("success", `${resultado.totalMigrados} pacotes migrados automaticamente!`);
                // Recarregar pacotes
                window.location.reload();
              } else {
                showNotification("error", "Erro na migração: " + resultado.erro);
              }
              setLoading(prev => ({ ...prev, saving: false }));
            }}
            disabled={loading.saving}
          >
            🔄 Migrar Campos Automaticamente
          </Button>
          <Button 
            variant="contained"
            onClick={() => setCurrentPacote({
              titulo: "",
              descricao: "",
              descricaoCurta: "",
              preco: 0,
              precoOriginal: 0,
              imagens: [],
              destaque: false,
              slug: "",
              // Novos campos padrão
              isIdaEVolta: false,
              precoIda: 0,
              precoVolta: 0,
              precoIdaVolta: 0,
              sinalConfig: {
                tipo: "porcentagem",
                valor: 30,
                obrigatorio: true
              },
              valorSinalCalculado: 0,
              valorParaMotorista: 0,
              porcentagemSinalPadrao: 40
            })}
          >
            Novo Pacote
          </Button>
        </Box>
      </Box>

      {notification.show && (
        <Alert 
          severity={notification.type} 
          sx={{ mb: 3 }}
          onClose={() => setNotification({ show: false, type: "", message: "" })}
        >
          {notification.message}
        </Alert>
      )}

      {/* Formulário de Edição/Criação */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {currentPacote.id ? "Editar Pacote" : "Criar Novo Pacote"}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título do Pacote"
                name="titulo"
                value={currentPacote.titulo}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slug (URL amigável)"
                name="slug"
                value={currentPacote.slug}
                onChange={handleChange}
                margin="normal"
                helperText="Deixe em branco para gerar automaticamente"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição Curta"
                name="descricaoCurta"
                value={currentPacote.descricaoCurta}
                onChange={handleChange}
                required
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                Descrição Completa *
              </Typography>
              <RichTextEditorV2
                value={currentPacote.descricao}
                onChange={handleDescriptionChange}
                placeholder="Digite a descrição completa do pacote usando Markdown. Seja detalhado sobre o que está incluído, itinerário, e observações importantes."
                height={350}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preço Atual"
                name="preco"
                type="number"
                value={currentPacote.preco}
                onChange={handleChange}
                required
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Preço Original (para desconto)"
                name="precoOriginal"
                type="number"
                value={currentPacote.precoOriginal || ''}
                onChange={handleChange}
                margin="normal"
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="destaque"
                    checked={currentPacote.destaque}
                    onChange={handleChange}
                  />
                }
                label="Destacar este pacote"
              />
            </Grid>
            
            {/* Configurações de Ida e Volta */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                🚍 Configurações de Viagem
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isIdaEVolta"
                    checked={currentPacote.isIdaEVolta}
                    onChange={handleChange}
                  />
                }
                label="Este pacote oferece opção de ida e volta"
              />
            </Grid>
            
            {currentPacote.isIdaEVolta && (
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Preço só da Ida"
                    name="precoIda"
                    type="number"
                    value={currentPacote.precoIda}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Preço só da Volta"
                    name="precoVolta"
                    type="number"
                    value={currentPacote.precoVolta}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Preço Ida + Volta"
                    name="precoIdaVolta"
                    type="number"
                    value={currentPacote.precoIdaVolta}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="% Sinal Padrão"
                    name="porcentagemSinalPadrao"
                    type="number"
                    value={currentPacote.porcentagemSinalPadrao}
                    onChange={handleChange}
                    margin="normal"
                    inputProps={{ step: "1", min: "1", max: "100" }}
                    helperText="Ex: 40 para 40%"
                  />
                </Grid>
              </>
            )}
            
            {/* Seção de Configuração de Sinal */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💰 Configuração de Sinal
                <Chip 
                  label={`Sinal: R$ ${currentPacote.valorSinalCalculado?.toFixed(2) || '0,00'}`} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`Motorista: R$ ${currentPacote.valorParaMotorista?.toFixed(2) || '0,00'}`} 
                  color="success" 
                  size="small" 
                />
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Tipo de Sinal</FormLabel>
                <RadioGroup
                  value={currentPacote.sinalConfig?.tipo || 'porcentagem'}
                  onChange={(e) => setCurrentPacote(prev => ({
                    ...prev,
                    sinalConfig: {
                      ...prev.sinalConfig,
                      tipo: e.target.value
                    }
                  }))}
                  row
                >
                  <FormControlLabel value="porcentagem" control={<Radio />} label="Porcentagem %" />
                  <FormControlLabel value="valor" control={<Radio />} label="Valor Fixo R$" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={currentPacote.sinalConfig?.tipo === 'porcentagem' ? 'Porcentagem do Sinal (%)' : 'Valor do Sinal (R$)'}
                name="sinalValor"
                type="number"
                value={currentPacote.sinalConfig?.valor || 0}
                onChange={(e) => setCurrentPacote(prev => ({
                  ...prev,
                  sinalConfig: {
                    ...prev.sinalConfig,
                    valor: parseFloat(e.target.value) || 0
                  }
                }))}
                margin="normal"
                inputProps={{ 
                  step: currentPacote.sinalConfig?.tipo === 'porcentagem' ? "1" : "0.01", 
                  min: "0",
                  max: currentPacote.sinalConfig?.tipo === 'porcentagem' ? "100" : undefined
                }}
                helperText={
                  currentPacote.sinalConfig?.tipo === 'porcentagem' 
                    ? 'Ex: 30 para 30%' 
                    : 'Ex: 150.00 para R$ 150,00'
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentPacote.sinalConfig?.obrigatorio || false}
                    onChange={(e) => setCurrentPacote(prev => ({
                      ...prev,
                      sinalConfig: {
                        ...prev.sinalConfig,
                        obrigatorio: e.target.checked
                      }
                    }))}
                  />
                }
                label="Sinal Obrigatório"
                sx={{ mt: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Imagens do Pacote
              </Typography>
              
              <Grid container spacing={2}>
                {currentPacote.imagens.map((img, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={img}
                        alt={`Imagem ${index + 1}`}
                      />
                      <CardActions>
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          color="error"
                        >
                          <CloseIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                
                <Grid item xs={6} sm={4} md={3}>
                  <label htmlFor="upload-image">
                    <input
                      id="upload-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    <Button
                      component="span"
                      variant="outlined"
                      fullWidth
                      sx={{ height: '100%', minHeight: '180px' }}
                      disabled={loading.upload}
                    >
                      {loading.upload ? (
                        <CircularProgress size={24} />
                      ) : (
                        <>
                          <UploadIcon sx={{ mr: 1 }} />
                          Adicionar Imagem
                        </>
                      )}
                    </Button>
                  </label>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {currentPacote.id && (
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPacote({
                      titulo: "",
                      descricao: "",
                      descricaoCurta: "",
                      preco: 0,
                      precoOriginal: 0,
                      imagens: [],
                      destaque: false,
                      slug: ""
                    })}
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading.saving || loading.upload}
                  startIcon={loading.saving ? <CircularProgress size={20} /> : <SaveIcon />}
                >
                  {currentPacote.id ? "Atualizar" : "Salvar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Lista de Pacotes */}
      <Typography variant="h5" gutterBottom>
        Pacotes Cadastrados
      </Typography>
      
      {loading.list ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={60} />
        </Box>
      ) : pacotes.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Nenhum pacote cadastrado ainda.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {pacotes.map(pacote => (
            <Grid item xs={12} sm={6} md={4} key={pacote.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {pacote.imagens && pacote.imagens.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={pacote.imagens[0]}
                    alt={pacote.titulo}
                  />
                )}
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6">
                    {pacote.titulo}
                    {pacote.destaque && (
                      <Box component="span" sx={{ 
                        ml: 1,
                        fontSize: '0.7rem',
                        color: 'secondary.main',
                        fontWeight: 'bold'
                      }}>
                        ★ Destaque
                      </Box>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pacote.descricaoCurta}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {pacote.precoOriginal && (
                      <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>
                        R$ {Number(pacote.precoOriginal).toFixed(2).replace('.', ',')}
                      </Typography>
                    )}
                    <Typography variant="h6">
                      R$ {Number(pacote.preco).toFixed(2).replace('.', ',')}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => editPacote(pacote)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={() => handleDelete(pacote.id)}
                  >
                    Excluir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminPacotes;