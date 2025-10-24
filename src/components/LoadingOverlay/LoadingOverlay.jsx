// src/components/LoadingOverlay/LoadingOverlay.jsx
import React, { useState, useEffect } from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = ({ children }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Palavras que vão aparecer com efeito de digitação
  const words = [
    'ÚNICAS',
    'SEGURAS',
    'MARCANTES',
    'AUTÊNTICAS',
    'INESQUECÍVEIS',
    'TRANSFORMADORAS',
    'ESPECIAIS',
    'IMPACTANTES'
  ];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const delayBetweenWords = 2000;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Digitando
        if (displayedText.length < currentWord.length) {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        } else {
          // Palavra completa, aguarda e depois começa a deletar
          setTimeout(() => setIsDeleting(true), delayBetweenWords);
        }
      } else {
        // Deletando
        if (displayedText.length > 0) {
          setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        } else {
          // Palavra deletada, passa para próxima
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex, words]);

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {children || (
          <>
            <div className="loading-logo-animation">
              {/* Ícone moderno de localização com montanhas */}
              <div className="travel-icon">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Círculo externo decorativo */}
                  <circle cx="100" cy="100" r="95" stroke="url(#gradient1)" strokeWidth="2" fill="none" opacity="0.3"/>
                  
                  {/* Pin de localização principal */}
                  <path d="M100 30C80 30 65 45 65 65C65 85 100 120 100 120C100 120 135 85 135 65C135 45 120 30 100 30Z" 
                        fill="url(#gradient2)" 
                        stroke="#2c3e50" 
                        strokeWidth="2"/>
                  
                  {/* Círculo interno do pin */}
                  <circle cx="100" cy="65" r="12" fill="white" opacity="0.9"/>
                  
                  {/* Montanhas dentro do círculo */}
                  <path d="M94 60L100 52L106 60L100 66Z" fill="#3498db" opacity="0.8"/>
                  
                  {/* Ondas/estradas na base */}
                  <path d="M50 140C60 135 70 145 80 140C90 135 95 145 100 140C105 135 110 145 120 140C130 135 140 145 150 140" 
                        stroke="url(#gradient3)" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.6"/>
                  
                  <path d="M50 155C60 150 70 160 80 155C90 150 95 160 100 155C105 150 110 160 120 155C130 150 140 160 150 155" 
                        stroke="url(#gradient3)" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeLinecap="round"
                        opacity="0.4"/>
                  
                  {/* Gradientes */}
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3498db" stopOpacity="0.8"/>
                      <stop offset="50%" stopColor="#2ecc71" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="#9b59b6" stopOpacity="0.8"/>
                    </linearGradient>
                    
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3498db"/>
                      <stop offset="100%" stopColor="#2980b9"/>
                    </linearGradient>
                    
                    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2ecc71"/>
                      <stop offset="100%" stopColor="#3498db"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            
            <div className="loading-text-container">
              <h2 className="loading-title">Experiências</h2>
              <div className="loading-typed-wrapper">
                <span className="loading-typed-text">{displayedText}</span>
                <span className="loading-cursor">|</span>
              </div>
            </div>

            {/* Barra de progresso animada */}
            <div className="loading-progress-bar">
              <div className="loading-progress-fill"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;