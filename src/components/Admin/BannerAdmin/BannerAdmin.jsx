import React, { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./BannerAdmin.css";

const BannerAdmin = () => {
  const [file, setFile] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const bannersCollection = collection(db, "bannersLojinha");
      const snapshot = await getDocs(bannersCollection);
      const bannersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        imageUrl: doc.data().imageUrl,
      }));
      setBanners(bannersData);
    } catch (error) {
      console.error("Erro ao carregar banners:", error);
    }
  };

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      // Verifica o formato (apenas WebP ou JPG)
      const validFormats = ["image/webp", "image/jpeg"];
      if (!validFormats.includes(file.type)) {
        reject("A imagem deve estar no formato WebP ou JPG.");
        return;
      }

      // Verifica as dimensões (1920 x 1080)
      const img = new Image();
      img.onload = () => {
        if (img.width !== 1920 || img.height !== 1080) {
          reject("A imagem deve ter exatamente 1920 x 1080 pixels.");
        } else {
          resolve();
        }
      };
      img.onerror = () => reject("Erro ao carregar a imagem para validação.");
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione uma imagem antes de enviar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Valida a imagem antes do upload (sem limite de tamanho)
      await validateImage(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "qc7tkpck"); // Seu upload preset do Cloudinary
      formData.append("cloud_name", "doeiv6m4h"); // Seu Cloud Name do Cloudinary

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/doeiv6m4h/image/upload",
        formData
      );

      const imageUrl = response.data.secure_url;

      await addDoc(collection(db, "bannersLojinha"), { imageUrl });

      setFile(null);
      fetchBanners(); // Atualiza a lista após upload
    } catch (error) {
      setError(error.message || "Erro ao enviar imagem.");
      console.error("Erro ao enviar imagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bannersLojinha", id));
      fetchBanners(); // Atualiza lista após exclusão
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
    }
  };

  return (
    <div className="banner-admin">
      <h2>Gerenciar Banners</h2>
      <p className="instructions">
        Especificações: 1920 x 1080 pixels (16:9), formato WebP ou JPG.
      </p>

      <input
        type="file"
        accept="image/webp,image/jpeg" // Restringe a seleção a WebP e JPG
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Enviando..." : "Adicionar Banner"}
      </button>
      {error && <p className="error">{error}</p>}

      <ul>
        {banners.map((banner) => (
          <li key={banner.id}>
            <img src={banner.imageUrl} alt="Banner" className="banner-preview" />
            <button onClick={() => handleDelete(banner.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BannerAdmin;