// src/components/PacoteCard/PacoteCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './PacoteCard.css';

const PacoteCard = ({ pacote }) => {
  return (
    <Link to={`/pacote/${pacote.slug || pacote.id}`} className="pacote-card-link">
      <div className="pacote-card">
        <div className="image-container">
          <img 
            src={pacote.imagens?.[0] || 'https://via.placeholder.com/300x200'} 
            alt={pacote.titulo} 
          />
        </div>
        <div className="pacote-info">
          <h3>{pacote.titulo}</h3>
          <p className="description">{pacote.descricaoCurta}</p>
          <div className="price-container">
            <span className="price-cta">
              Preço sob consulta. Solicite cotação.
            </span>
          </div>
          <button className="details-button">📩 Solicitar Cotação</button>
        </div>
      </div>
    </Link>
  );
};

export default PacoteCard;