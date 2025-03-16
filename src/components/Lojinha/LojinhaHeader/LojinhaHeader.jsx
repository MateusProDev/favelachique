import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./LojinhaHeader.css";

const LojinhaHeader = () => {
  const [title, setTitle] = useState("");
  const [logoUrl, setLogoUrl] = useState(""); // Agora usamos logoUrl para armazenar a URL da logo

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        // Caminho correto para o Firestore
        const lojaDocRef = doc(db, "config", "lojinhaHeader"); // Caminho atualizado para "config/lojinhaHeader"
        const docSnap = await getDoc(lojaDocRef);

        if (docSnap.exists()) {
          // Atribui os dados do Firestore ao estado
          setTitle(docSnap.data().title);
          setLogoUrl(docSnap.data().logoUrl); // Agora você está buscando a URL do Cloudinary
          console.log("Logo URL:", docSnap.data().logoUrl); // Log para depuração
        } else {
          console.log("Documento 'lojinhaHeader' não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cabeçalho:", error);
      }
    };

    fetchHeaderData();
  }, []); // Esse useEffect será executado apenas uma vez ao montar o componente

  return (
    <header className="lojinha-header">
      {/* Exibe a logo, se a URL da logo estiver disponível */}
      {logoUrl && <img src={logoUrl} alt="Logo da Lojinha" className="lojinha-logo" />}
      {/* Exibe o título da lojinha */}
      {title && <h1 className="lojinha-title">{title}</h1>}
    </header>
  );
};

export default LojinhaHeader;
