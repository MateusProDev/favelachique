
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FiUser, FiMail, FiPhone, FiCheckCircle } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import './PainelMotoristaPanel.css';

const PainelMotorista = () => {

  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifica, setNotifica] = useState({});
  const [motorista, setMotorista] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      // Busca reservas atribuídas ao motorista logado
      const q = query(collection(db, 'reservas'), where('motoristaId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const reservasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(reservasData);

      // Busca dados do motorista no Firestore
      const motoristaRef = doc(db, 'motoristas', user.uid);
      const motoristaSnap = await getDoc(motoristaRef);
      if (motoristaSnap.exists()) {
        setMotorista(motoristaSnap.data());
      } else {
        setMotorista(null);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user) {
    return <div className="pmp-bg"><div className="pmp-dashboard"><p>Faça login para ver suas reservas.</p></div></div>;
  }


  // Dados do motorista vindos do Firestore
  const dadosMotorista = motorista ? {
    nome: motorista.nome || 'Motorista',
    email: user.email,
    telefone: motorista.telefone || '(00) 00000-0000',
    carro: motorista.modelo || 'Carro não informado',
    cor: motorista.cor || 'Cor não informada',
    placa: motorista.placa || 'Placa não informada',
  } : {
    nome: user.displayName || 'Motorista',
    email: user.email,
    telefone: user.phoneNumber || '(00) 00000-0000',
    carro: user.carro || 'Carro não informado',
    cor: user.cor || 'Cor não informada',
    placa: user.placa || 'Placa não informada',
  };

  const handleNotificar = (reserva) => {
    if (!reserva.whatsapp) {
      alert('O WhatsApp do cliente não está cadastrado nesta reserva.');
      return;
    }
    const msg =
      `Olá, aqui é seu motorista!\n` +
      `Nome: ${dadosMotorista.nome}\n` +
      `Carro: ${dadosMotorista.carro} | Cor: ${dadosMotorista.cor} | Placa: ${dadosMotorista.placa}\n` +
      `Estou ${reserva.local === 'aeroporto' ? 'no aeroporto aguardando você' : 'no hotel aguardando você'}!`;
    setNotifica({ ...notifica, [reserva.id]: msg });
    // Abrir WhatsApp Web/app com mensagem pronta
    const phone = reserva.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pmp-bg">
      <div className="pmp-dashboard">
        <div className="pmp-header">
          <div className="pmp-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" />
            ) : (
              <FiUser className="pmp-icon" />
            )}
          </div>
          <div className="pmp-info">
            <h2>{dadosMotorista.nome}</h2>
            <div className="pmp-email"><FiMail /> {dadosMotorista.email}</div>
            <div className="pmp-email"><FiPhone /> {dadosMotorista.telefone}</div>
            <div className="pmp-email"><FaCar /> {dadosMotorista.carro} | {dadosMotorista.cor} | {dadosMotorista.placa}</div>
          </div>
        </div>
        <h3>Reservas Atribuídas</h3>
        {loading ? (
          <p>Carregando reservas...</p>
        ) : reservas.length === 0 ? (
          <p>Nenhuma reserva atribuída a você ainda.</p>
        ) : (
          <div className="pmp-reservas-grid">
            {reservas.map(reserva => (
              <div key={reserva.id} className="pmp-reserva-card">
                <div className="pmp-reserva-card-header">
                  <span>{reserva.pacoteTitulo}</span>
                  <span className={`pmp-status ${reserva.status}`}>{reserva.status}</span>
                </div>
                <div className="pmp-reserva-card-body">
                  <div><strong>Cliente:</strong> {reserva.nome}</div>
                  <div><strong>WhatsApp:</strong> {reserva.whatsapp || <span style={{color:'#d32f2f'}}>Não informado</span>}</div>
                  <div><strong>Data:</strong> {reserva.data} <strong>Hora:</strong> {reserva.hora}</div>
                  <div><strong>Local:</strong> {reserva.local || 'Não informado'}</div>
                  <div><strong>Pagamento:</strong> {reserva.pagamento}</div>
                  <button className="pmp-btn-notificar" onClick={() => handleNotificar(reserva)}>
                    Notificar Cliente
                  </button>
                  {notifica[reserva.id] && (
                    <div className="pmp-notificacao">
                      <strong>Mensagem pronta:</strong><br />
                      <pre style={{whiteSpace:'pre-line'}}>{notifica[reserva.id]}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelMotorista;
