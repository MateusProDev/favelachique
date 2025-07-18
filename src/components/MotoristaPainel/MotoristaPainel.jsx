import React from 'react';
import './MotoristaPainel.css';

const MotoristaPainel = () => {
  // Aqui você pode buscar as reservas do motorista logado
  return (
    <div className="mpainel-bg">
      <div className="mpainel-container">
        <h2>Bem-vindo ao seu painel, motorista!</h2>
        <p>Aqui você verá suas reservas e informações.</p>
        {/* Lista de reservas e ações futuras */}
      </div>
    </div>
  );
};

export default MotoristaPainel;
