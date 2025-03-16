import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig"; // Ajuste o caminho
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./EditMercadoPagoKey.css";

const EditMercadoPagoKey = () => {
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const docRef = doc(db, "settings", "mercadopago");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPublicKey(data.publicKey || "");
          setSecretKey(data.secretKey || "");
        }
      } catch (err) {
        console.error("Erro ao carregar chaves:", err);
      }
    };
    fetchKeys();
  }, []);

  const handleSaveKeys = async () => {
    setLoading(true);
    setMessage("");
    try {
      const docRef = doc(db, "settings", "mercadopago");
      await setDoc(docRef, { publicKey, secretKey }, { merge: true });
      setMessage("Chaves salvas com sucesso!");
    } catch (error) {
      setMessage("Erro ao salvar as chaves.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="edit-mercadopago-key">
      <h2>Editar Chaves do Mercado Pago</h2>
      {message && <p className={message.includes("Erro") ? "error" : "success"}>{message}</p>}
      <div className="form-group">
        <label>Chave Pública:</label>
        <input
          type="text"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="Digite a chave pública"
        />
      </div>
      <div className="form-group">
        <label>Chave Secreta (Access Token):</label>
        <input
          type="text"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="Digite a chave secreta"
        />
      </div>
      <button onClick={handleSaveKeys} disabled={loading || !publicKey || !secretKey}>
        {loading ? "Salvando..." : "Salvar Chaves"}
      </button>
    </div>
  );
};

export default EditMercadoPagoKey;