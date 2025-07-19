import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FiUser, FiCheckCircle, FiClock, FiXCircle, FiMail } from 'react-icons/fi';
import PainelUsuarioChat from './PainelUsuarioChat';
import './PainelUsuario.css';
import './PainelUsuarioChat.css';

const PainelUsuario = () => {
  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservas = async () => {
      if (!user) return;
      const q = query(collection(db, 'reservas'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const reservasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(reservasData);
      setLoading(false);
    };
    fetchReservas();
  }, [user]);

  if (!user) {
    return <div className="pu-bg"><div className="pu-container"><p>Faça login para ver suas reservas.</p></div></div>;
  }

  // Resumo
  const total = reservas.length;
  const pendentes = reservas.filter(r => r.status === 'pendente').length;
  const confirmadas = reservas.filter(r => r.status === 'confirmada').length;
  const canceladas = reservas.filter(r => r.status === 'cancelada').length;

  return (
    <div className="pu-bg">
      <div className="pu-dashboard">
        <div className="pu-header">
          <div className="pu-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" />
            ) : (
              <FiUser className="pu-icon" />
            )}
          </div>
          <div className="pu-info">
            <h2>{user.displayName || 'Usuário'}</h2>
            <div className="pu-email"><FiMail /> {user.email}</div>
          </div>
        </div>
        <div className="pu-resumo">
          <div className="pu-resumo-card pu-total">
            <span>Total</span>
            <strong>{total}</strong>
          </div>
          <div className="pu-resumo-card pu-pendente">
            <FiClock />
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
          <div className="pu-resumo-card pu-confirmada">
            <FiCheckCircle />
            <span>Confirmadas</span>
            <strong>{confirmadas}</strong>
          </div>
          <div className="pu-resumo-card pu-cancelada">
            <FiXCircle />
            <span>Canceladas</span>
            <strong>{canceladas}</strong>
          </div>
        </div>
        <div className="pu-lista">
          <h3>Minhas Reservas</h3>
          {loading ? (
            <p>Carregando reservas...</p>
          ) : reservas.length === 0 ? (
            <p>Você ainda não fez nenhuma reserva.</p>
          ) : (
            <div className="pu-reservas-grid">
              {reservas.map(reserva => (
                <div key={reserva.id} className={`pu-reserva-card pu-${reserva.status}`}>
                  <div className="pu-reserva-card-header">
                    <span className="pu-pacote">{reserva.pacoteTitulo}</span>
                    <span className={`pu-status pu-${reserva.status}`}>{reserva.status}</span>
                  </div>
                  <div className="pu-reserva-card-body">
                    <div><strong>Data:</strong> {reserva.data} <strong>Hora:</strong> {reserva.hora}</div>
                    <div><strong>Origem:</strong> {reserva.enderecoOrigem || 'Não informado'}</div>
                    <div><strong>Destino:</strong> {reserva.enderecoDestino || reserva.pacoteTitulo || 'Não informado'}</div>
                    <div><strong>Valor:</strong> R$ {reserva.pacotePreco?.toFixed(2).replace('.', ',')}</div>
                    <div><strong>Pagamento:</strong> {reserva.pagamento}</div>
                    {reserva.observacoes && <div><strong>Obs:</strong> {reserva.observacoes}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <PainelUsuarioChat />
    </div>
  );
};

export default PainelUsuario;
