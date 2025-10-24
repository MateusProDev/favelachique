import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiSave, FiLoader, FiImage, FiX, FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
import "./EditHeroSlides.css";

const EditHeroSlides = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState({ upload: {}, saving: false });
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const slidesRef = doc(db, "content", "heroSlides");
      const slidesDoc = await getDoc(slidesRef);

      if (slidesDoc.exists()) {
        const data = slidesDoc.data();
        setSlides(data.slides || []);
      } else {
        // Criar documento inicial com slide padrão
        const defaultSlide = {
          title: "Bem-vindo à 20Buscar Vacation Beach",
          description: "Experiências únicas de turismo comunitário",
          imageUrl: "",
          buttonText: "Conheça Nossos Tours",
          buttonLink: "/pacotes"
        };
        setSlides([defaultSlide]);
      }
    } catch (error) {
      showNotification("error", "Erro ao carregar slides");
      console.error("Erro ao buscar slides:", error);
    }
  };

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const handleImageUpload = async (file, index) => {
    if (!file) return;

    setLoading(prev => ({ ...prev, upload: { ...prev.upload, [index]: true } }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://favelachique-2b35b.web.app/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.url) {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], imageUrl: response.data.url };
        setSlides(newSlides);
        showNotification("success", "Imagem enviada com sucesso!");
      }
    } catch (error) {
      showNotification("error", "Erro ao enviar imagem. Tente novamente.");
      console.error("Erro no upload:", error);
    } finally {
      setLoading(prev => ({ ...prev, upload: { ...prev.upload, [index]: false } }));
    }
  };

  const handleAddSlide = () => {
    const newSlide = {
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: ""
    };
    setSlides([...slides, newSlide]);
    setEditingIndex(slides.length);
  };

  const handleRemoveSlide = (index) => {
    if (slides.length === 1) {
      showNotification("error", "Você precisa ter pelo menos 1 slide!");
      return;
    }
    if (window.confirm("Tem certeza que deseja remover este slide?")) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      showNotification("success", "Slide removido!");
    }
  };

  const handleSlideChange = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const handleSave = async () => {
    setLoading(prev => ({ ...prev, saving: true }));

    try {
      const slidesRef = doc(db, "content", "heroSlides");
      await setDoc(slidesRef, { slides });

      showNotification("success", "Hero Carousel salvo com sucesso!");
      setEditingIndex(null);
    } catch (error) {
      showNotification("error", "Erro ao salvar. Tente novamente.");
      console.error("Erro ao salvar:", error);
    } finally {
      setLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const moveSlide = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
  };

  return (
    <div className="edit-hero-slides">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Gerenciar Hero Carousel</h1>
          <p className="subtitle">Configure os slides do banner principal do site</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate("/admin")}>
            Voltar
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading.saving}
          >
            {loading.saving ? (
              <>
                <FiLoader className="spinning" /> Salvando...
              </>
            ) : (
              <>
                <FiSave /> Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>

      <div className="slides-container">
        {slides.map((slide, index) => (
          <div key={index} className={`slide-card ${editingIndex === index ? 'editing' : ''}`}>
            <div className="slide-header">
              <div className="slide-number">Slide {index + 1}</div>
              <div className="slide-actions">
                <button
                  className="btn-icon"
                  onClick={() => moveSlide(index, 'up')}
                  disabled={index === 0}
                  title="Mover para cima"
                >
                  ↑
                </button>
                <button
                  className="btn-icon"
                  onClick={() => moveSlide(index, 'down')}
                  disabled={index === slides.length - 1}
                  title="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                  title={editingIndex === index ? "Recolher" : "Editar"}
                >
                  <FiEdit />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleRemoveSlide(index)}
                  title="Remover"
                  disabled={slides.length === 1}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            {editingIndex === index && (
              <div className="slide-content">
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                    placeholder="Ex: Bem-vindo à 20Buscar Vacation Beach"
                    maxLength={60}
                  />
                  <small>{slide.title.length}/60 caracteres</small>
                </div>

                <div className="form-group">
                  <label>Descrição *</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => handleSlideChange(index, 'description', e.target.value)}
                    placeholder="Ex: Experiências únicas de turismo comunitário"
                    rows={3}
                    maxLength={150}
                  />
                  <small>{slide.description.length}/150 caracteres</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Texto do Botão</label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) => handleSlideChange(index, 'buttonText', e.target.value)}
                      placeholder="Ex: Conheça Nossos Tours"
                    />
                  </div>

                  <div className="form-group">
                    <label>Link do Botão</label>
                    <input
                      type="text"
                      value={slide.buttonLink}
                      onChange={(e) => handleSlideChange(index, 'buttonLink', e.target.value)}
                      placeholder="Ex: /pacotes ou https://..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Imagem de Fundo</label>
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], index)}
                      id={`upload-${index}`}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor={`upload-${index}`} className="upload-button">
                      {loading.upload[index] ? (
                        <>
                          <FiLoader className="spinning" /> Enviando...
                        </>
                      ) : (
                        <>
                          <FiUpload /> Selecionar Imagem
                        </>
                      )}
                    </label>
                    <small>Recomendado: 1920x1080px, formato JPG/PNG, máx 2MB</small>
                  </div>

                  {slide.imageUrl && (
                    <div className="image-preview">
                      <img src={slide.imageUrl} alt={`Slide ${index + 1}`} />
                      <button
                        className="remove-image"
                        onClick={() => handleSlideChange(index, 'imageUrl', '')}
                        title="Remover imagem"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {editingIndex !== index && (
              <div className="slide-preview">
                <div className="preview-content">
                  <h3>{slide.title || "Sem título"}</h3>
                  <p>{slide.description || "Sem descrição"}</p>
                  {slide.buttonText && <span className="preview-button">{slide.buttonText}</span>}
                </div>
                {slide.imageUrl && (
                  <div className="preview-image">
                    <img src={slide.imageUrl} alt={`Preview ${index + 1}`} />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <button className="btn-add-slide" onClick={handleAddSlide}>
          <FiPlus /> Adicionar Novo Slide
        </button>
      </div>

      <div className="save-footer">
        <button
          className="btn-primary btn-large"
          onClick={handleSave}
          disabled={loading.saving}
        >
          {loading.saving ? (
            <>
              <FiLoader className="spinning" /> Salvando Alterações...
            </>
          ) : (
            <>
              <FiSave /> Salvar Todas as Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditHeroSlides;
