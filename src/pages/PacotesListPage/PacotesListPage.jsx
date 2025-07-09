// src/pages/PacotesListPage/PacotesListPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import PacoteCard from '../../components/PacoteCard/PacoteCard';
import './PacotesListPage.css';

const PacotesListPage = () => {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacotes = async () => {
      try {
        const q = query(collection(db, 'pacotes'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const pacotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPacotes(pacotesData);
      } catch (err) {
        setError("Erro ao carregar pacotes");
        console.error("Erro ao buscar pacotes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPacotes();
  }, []);

  if (loading) return <div className="loading">Carregando pacotes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="pacotes-list-container">
      <h1>Nossos Pacotes de Viagem</h1>
      <p className="subtitle">Descubra as melhores experiências que preparamos para você</p>
      
      <div className="pacotes-grid">
        {pacotes.length > 0 ? (
          pacotes.map(pacote => (
            <PacoteCard key={pacote.id} pacote={pacote} />
          ))
        ) : (
          <div className="no-packages">
            <p>Nenhum pacote disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacotesListPage;