import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { FiShoppingBag } from "react-icons/fi"; // Importando o ícone do carrinho
import "./LojinhaHeader.css";

const LojinhaHeader = ({ cart, onCartToggle }) => {
  const [title, setTitle] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const lojaDocRef = doc(db, "config", "lojinhaHeader");
        const docSnap = await getDoc(lojaDocRef);

        if (docSnap.exists()) {
          setTitle(docSnap.data().title);
          setLogoUrl(docSnap.data().logoUrl);
          console.log("Logo URL:", docSnap.data().logoUrl);
        } else {
          console.log("Documento 'lojinhaHeader' não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do cabeçalho:", error);
      }
    };

    fetchHeaderData();
  }, []);

  return (
    <header className="lojinha-header">
      <div className="lojinha-header-content">
        {logoUrl && <img src={logoUrl} alt="Logo da Lojinha" className="lojinha-logo" />}
        {title && <h1 className="lojinha-title">{title}</h1>}
      </div>
      <div className="boxCar" onClick={onCartToggle}>
        <FiShoppingBag className="cartIcon" />
        {cart.length > 0 && <span className="cartCount">{cart.length}</span>}
      </div>
    </header>
  );
};

export default LojinhaHeader;