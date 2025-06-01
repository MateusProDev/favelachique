import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import { FiUpload, FiSave, FiLoader } from "react-icons/fi";
import "./EditLojinhaHeader.css";

const EditLojinhaHeader = () => {
  const [formData, setFormData] = useState({
    title: "",
    logoUrl: "",
    showRainbowBorder: true
  });
  const [loading, setLoading] = useState({
    upload: false,
    save: false
  });
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: ""
  });

  useEffect(() => {
    const fetchLojinhaData = async () => {
      try {
        const lojaRef = doc(db, "config", "lojinhaHeader");
        const lojaDoc = await getDoc(lojaRef);

        if (lojaDoc.exists()) {
          const data = lojaDoc.data();
          setFormData({
            title: data.title || "",
            logoUrl: data.logoUrl || "",
            showRainbowBorder: data.showRainbowBorder !== false
          });
        }
      } catch (error) {
        showNotification("error", "Erro ao buscar dados da loja");
        console.error("Erro ao buscar dados do Firestore:", error);
      }
    };

    fetchLojinhaData();
  }, []);

  const showNotification = (type, message, duration = 5000) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, duration);
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    // Verifica se o arquivo é uma imagem
    if (!file.type.match("image.*")) {
      showNotification("error", "Por favor, selecione um arquivo de imagem");
      return;
    }

    // Verifica tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification("error", "A imagem deve ter no máximo 2MB");
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
      setFormData({ ...formData, logoUrl: response.data.secure_url });
      showNotification("success", "Logo enviada com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao enviar logo");
      console.error("Erro ao enviar logo:", error);
    } finally {
      setLoading({ ...loading, upload: false });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showNotification("error", "O título da loja é obrigatório");
      return;
    }

    if (!formData.logoUrl) {
      showNotification("error", "Por favor, envie uma logo para a loja");
      return;
    }

    setLoading({ ...loading, save: true });

    try {
      const lojaRef = doc(db, "config", "lojinhaHeader");
      await setDoc(lojaRef, formData, { merge: true });
      showNotification("success", "Configurações salvas com sucesso!");
    } catch (error) {
      showNotification("error", "Erro ao salvar configurações");
      console.error("Erro ao salvar dados:", error);
    } finally {
      setLoading({ ...loading, save: false });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  return (
    <div className="edit-lojinha-container">
      <div className="edit-lojinha-card">
        <h2 className="edit-lojinha-title">Configurações do Cabeçalho</h2>
        
        {notification.show && (
          <div className={`notification notification--${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSave} className="edit-lojinha-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Título da Loja
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Digite o título da loja"
              className="form-input"
              required
              maxLength={30}
            />
            <small className="form-hint">Máximo 30 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="logo" className="form-label">
              Logo da Loja
            </label>
            <div className="file-upload">
              <label htmlFor="logo" className="file-upload-label">
                <FiUpload className="file-upload-icon" />
                <span>
                  {loading.upload ? "Enviando..." : "Selecionar Imagem"}
                </span>
                <input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files[0])}
                  disabled={loading.upload}
                  className="file-upload-input"
                />
              </label>
            </div>
            {formData.logoUrl && (
              <div className="logo-preview-container">
                <img
                  src={formData.logoUrl}
                  alt="Preview da Logo"
                  className="logo-preview"
                />
                <div className="logo-preview-overlay">
                  <span>Pré-visualização</span>
                </div>
              </div>
            )}
            <small className="form-hint">Tamanho recomendado: 200x60px</small>
          </div>

          <div className="form-group form-group--checkbox">
            <input
              id="showRainbowBorder"
              name="showRainbowBorder"
              type="checkbox"
              checked={formData.showRainbowBorder}
              onChange={handleChange}
              className="form-checkbox"
            />
            <label htmlFor="showRainbowBorder" className="form-checkbox-label">
              Mostrar borda colorida no cabeçalho
            </label>
          </div>

          <button
            type="submit"
            disabled={loading.save || loading.upload}
            className="submit-button"
          >
            {loading.save ? (
              <>
                <FiLoader className="button-loader" />
                Salvando...
              </>
            ) : (
              <>
                <FiSave className="button-icon" />
                Salvar Configurações
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditLojinhaHeader;