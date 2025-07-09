import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiSave, FiLoader, FiImage, FiX, FiTrash2, FiEdit2 } from "react-icons/fi";
// import uploadimg from "../../../assets/uploadimg.png";
import "./AdminPacotes.css";

const AdminPacotes = () => {
  const navigate = useNavigate();
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
    slug: ""
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
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPacotes(pacotesData);
      } catch (err) {
        showNotification("error", "Erro ao carregar pacotes");
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading({ ...loading, list: false });
      }
    };
    fetchPacotes();
  }, []);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Verifica se é imagem
    if (!file.type.match("image.*")) {
      showNotification("error", "Por favor, selecione um arquivo de imagem");
      return;
    }

    // Verifica tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    setLoading({ ...loading, upload: true });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck"); // Seu upload preset do Cloudinary
    formData.append("cloud_name", "doeiv6m4h"); // Seu cloud name

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

    setLoading({ ...loading, saving: true });

    try {
      const pacoteData = {
        ...currentPacote,
        createdAt: currentPacote.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
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

  const editPacote = (pacote) => {
    setCurrentPacote(pacote);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-pacotes-container">
      <div className="admin-pacotes-header">
        <h2 className="title-with-icon">
          <FiImage className="title-icon" />
          Gerenciamento de Pacotes
        </h2>
        <button 
          className="new-button"
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
          + Novo Pacote
        </button>
      </div>

      {notification.show && (
        <div className={`notification notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Formulário de Edição/Criação */}
      <form onSubmit={handleSubmit} className="pacote-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="titulo" className="form-label">
              Título do Pacote
            </label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              value={currentPacote.titulo}
              onChange={handleChange}
              placeholder="Ex: Pacote Premium para Fernando de Noronha"
              className="form-input"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug" className="form-label">
              Slug (URL amigável)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={currentPacote.slug}
              onChange={handleChange}
              placeholder="Ex: pacote-premium-noronha"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="descricaoCurta" className="form-label">
              Descrição Curta
            </label>
            <input
              id="descricaoCurta"
              name="descricaoCurta"
              type="text"
              value={currentPacote.descricaoCurta}
              onChange={handleChange}
              placeholder="Breve descrição para listagens"
              className="form-input"
              required
              maxLength={150}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                name="destaque"
                checked={currentPacote.destaque}
                onChange={handleChange}
                className="form-checkbox"
              />
              Destacar este pacote
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descricao" className="form-label">
            Descrição Completa
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={currentPacote.descricao}
            onChange={handleChange}
            placeholder="Descreva todos os detalhes do pacote"
            className="form-textarea"
            required
            rows={5}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="preco" className="form-label">
              Preço Atual
            </label>
            <input
              id="preco"
              name="preco"
              type="number"
              value={currentPacote.preco}
              onChange={handleChange}
              placeholder="0.00"
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="precoOriginal" className="form-label">
              Preço Original (para desconto)
            </label>
            <input
              id="precoOriginal"
              name="precoOriginal"
              type="number"
              value={currentPacote.precoOriginal || ''}
              onChange={handleChange}
              placeholder="0.00"
              className="form-input"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Imagens do Pacote</label>
          <div className="images-grid">
            {currentPacote.imagens.map((img, index) => (
              <div key={index} className="image-preview-wrapper">
                <img
                  src={img}
                  alt={`Imagem ${index + 1}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-button"
                  onClick={() => removeImage(index)}
                >
                  <FiX />
                </button>
              </div>
            ))}

            <label className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0])}
                disabled={loading.upload}
                className="upload-input"
              />
              {loading.upload ? (
                <FiLoader className="upload-icon spin" />
              ) : (
                <FiUpload className="upload-icon" />
              )}
              <span>{loading.upload ? "Enviando..." : "Adicionar Imagem"}</span>
            </label>
          </div>
          <small className="form-hint">Recomendado: imagens com proporção 16:9</small>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading.saving || loading.upload}
        >
          {loading.saving ? (
            <>
              <FiLoader className="button-loader spin" />
              Salvando...
            </>
          ) : (
            <>
              <FiSave className="button-icon" />
              {currentPacote.id ? "Atualizar Pacote" : "Salvar Pacote"}
            </>
          )}
        </button>
      </form>

      {/* Lista de Pacotes */}
      <div className="pacotes-list">
        <h3 className="list-title">Pacotes Cadastrados</h3>
        
        {loading.list ? (
          <div className="loading-spinner">
            <FiLoader className="spin" /> Carregando...
          </div>
        ) : pacotes.length === 0 ? (
          <p className="no-items">Nenhum pacote cadastrado ainda.</p>
        ) : (
          <div className="pacotes-grid">
            {pacotes.map(pacote => (
              <div key={pacote.id} className="pacote-card">
                <div className="pacote-image-container">
                  {pacote.imagens && pacote.imagens.length > 0 && (
                    <img src={pacote.imagens[0]} alt={pacote.titulo} />
                  )}
                  {pacote.destaque && (
                    <span className="destaque-badge">Destaque</span>
                  )}
                </div>
                <div className="pacote-info">
                  <h4>{pacote.titulo}</h4>
                  <p className="descricao-curta">{pacote.descricaoCurta}</p>
                  <div className="pacote-price">
                    <span className="current-price">
                      R$ {Number(pacote.preco).toFixed(2).replace('.', ',')}
                    </span>
                    {pacote.precoOriginal > 0 && (
                      <span className="original-price">
                        R$ {Number(pacote.precoOriginal).toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>
                  <div className="pacote-actions">
                    <button 
                      className="edit-button"
                      onClick={() => editPacote(pacote)}
                    >
                      <FiEdit2 /> Editar
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(pacote.id)}
                    >
                      <FiTrash2 /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPacotes;