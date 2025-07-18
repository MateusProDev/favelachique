import React from 'react';
import './PainelMotorista.css';

const PainelMotorista = () => {
  // Aqui você pode buscar as reservas do motorista logado futuramente
  return (
    <div className="pm-bg">
      <div className="pm-container">
        <h2>Bem-vindo ao seu painel, motorista!</h2>
        <p>Aqui você verá suas reservas e informações pessoais.</p>
        {/* Lista de reservas e ações futuras */}
      </div>
    </div>
  );
};

export default PainelMotorista;
