// src/pages/PacoteDetailPage/PacoteDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import './PacoteDetailPage.css';

const PacoteDetailPage = () => {
  const { pacoteId } = useParams();
  const [pacote, setPacote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacote = async () => {
      try {
        const docRef = doc(db, 'pacotes', pacoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPacote({
            ...data,
            preco: Number(data.preco),
            precoOriginal: data.precoOriginal ? Number(data.precoOriginal) : null
          });
        } else {
          setError("Pacote não encontrado");
        }
      } catch (err) {
        setError("Erro ao carregar pacote");
        console.error("Erro ao buscar pacote:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPacote();
  }, [pacoteId]);

  if (loading) return <div className="loading">Carregando pacote...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!pacote) return <div className="not-found">Pacote não encontrado</div>;

  return (
    <div className="pacote-detail-container">
      <h1>{pacote.titulo}</h1>
      
      <div className="pacote-content">
        <div className="pacote-images">
          {pacote.imagens && pacote.imagens.length > 0 ? (
            <>
              <div className="main-image">
                <img src={pacote.imagens[0]} alt={pacote.titulo} />
              </div>
              {pacote.imagens.length > 1 && (
                <div className="thumbnail-container">
                  {pacote.imagens.slice(1).map((img, index) => (
                    <div key={index} className="thumbnail">
                      <img src={img} alt={`${pacote.titulo} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image">
              <span>Sem imagem disponível</span>
            </div>
          )}
        </div>

        <div className="pacote-info">
          <div className="price-section">
            {pacote.precoOriginal && (
              <span className="original-price">
                De: R$ {pacote.precoOriginal.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="current-price">
              Por: R$ {pacote.preco.toFixed(2).replace('.', ',')}
            </span>
            {pacote.precoOriginal && (
              <span className="discount">
                {Math.round((1 - pacote.preco / pacote.precoOriginal) * 100)}% OFF
              </span>
            )}
          </div>

          <div className="description-section">
            <h3>Descrição</h3>
            <p>{pacote.descricao}</p>
          </div>

          <button className="reserve-button">Reservar Agora</button>
        </div>
      </div>
    </div>
  );
};

export default PacoteDetailPage;