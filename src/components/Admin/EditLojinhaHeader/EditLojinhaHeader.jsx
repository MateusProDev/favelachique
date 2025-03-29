import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import "./EditLojinhaHeader.css";

const EditLojinhaHeader = () => {
  const [title, setTitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchLojinhaData = async () => {
      try {
        const lojaRef = doc(db, "config", "lojinhaHeader");
        const lojaDoc = await getDoc(lojaRef);

        if (lojaDoc.exists()) {
          const data = lojaDoc.data();
          setTitle(data.title || "");
          setLogoUrl(data.logoUrl || "");
        } else {
          console.log("Dados da lojinha não encontrados!");
        }
      } catch (error) {
        console.error("Erro ao buscar dados do Firestore:", error);
        setError("Erro ao buscar dados da loja.");
      }
    };

    fetchLojinhaData();
  }, []);

  const handleLogoUpload = async (file) => {
    if (!file || loading) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "qc7tkpck");
    formData.append("cloud_name", "doeiv6m4h");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );
      setLogoUrl(response.data.secure_url);
    } catch (error) {
      setError("Erro ao enviar logo.");
      console.error("Erro ao enviar logo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title) {
      setError("O título da loja é obrigatório.");
      return;
    }

    if (!logoUrl) {
      setError("A logo da loja não foi carregada.");
      return;
    }

    setLoading(true);
    try {
      const lojaRef = doc(db, "config", "lojinhaHeader");
      await setDoc(lojaRef, { title, logoUrl }, { merge: true });

      setSuccess("Loja atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      setError("Erro ao salvar dados da loja.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-lojinha-header">
      <h2 className="edit-lojinha-header__title">Editar Lojinha</h2>

      {error && <div className="edit-lojinha-header__error">{error}</div>}
      {success && <div className="edit-lojinha-header__success">{success}</div>}

      <form onSubmit={handleSave} className="edit-lojinha-header__form">
        <label className="edit-lojinha-header__label">Título da Loja</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título da loja"
          className="edit-lojinha-header__input"
          required
        />

        <label className="edit-lojinha-header__label">Logo da Loja</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleLogoUpload(e.target.files[0])}
          disabled={loading}
          className="edit-lojinha-header__input"
        />
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo da Loja"
            className="edit-lojinha-header__logo-preview"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="edit-lojinha-header__button"
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
};

export default EditLojinhaHeader;