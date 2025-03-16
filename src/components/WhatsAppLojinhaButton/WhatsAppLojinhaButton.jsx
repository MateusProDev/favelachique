import React, { useState, useEffect } from "react";
import "./WhatsAppLojinhaButton.css";
import whatsappIcon from "../../assets/WhatsApp.png"; // Ajuste o caminho conforme necessário

const WhatsAppLojinhaButton = ({ phoneNumber }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Após 5 segundos, exibe a notificação
    const timer = setTimeout(() => {
      setShowNotification(true);
      // Após mais 5 segundos, esconde a notificação automaticamente
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }, 5000);

    // Limpa o timer ao desmontar o componente
    return () => clearTimeout(timer);
  }, []);

  if (!phoneNumber) return null; // Não exibe o botão se o número não estiver disponível

  const message = "Oi! Gostaria de saber mais sobre os produtos da Lojinha.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    setShowNotification(false); // Esconde a notificação ao clicar no botão
  };

  return (
    <div className="whatsapp-lojinha-container">
      {showNotification && (
        <div className="whatsapp-notification">
          <span>Precisa de ajuda?</span>
        </div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-lojinha-button"
        onClick={handleClick}
      >
        <img src={whatsappIcon} alt="WhatsApp Lojinha" />
      </a>
    </div>
  );
};

export default WhatsAppLojinhaButton;