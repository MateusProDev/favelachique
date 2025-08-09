import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { FiUser, FiCheckCircle, FiClock, FiXCircle, FiMail, FiTruck, FiCheck } from 'react-icons/fi';
import PainelUsuarioChat from './PainelUsuarioChat';
import './PainelUsuario.css';
import './PainelUsuarioChat.css';

const PainelUsuario = () => {
  // Função utilitária para garantir que o valor é string ou primitivo
  const safeValue = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };
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

  // Resumo - Agrupando status relacionados para melhor experiência do usuário
  const total = reservas.length;
  const pendentes = reservas.filter(r => r.status === 'pendente').length;
  const delegadas = reservas.filter(r => r.status === 'delegada').length;
  const confirmadas = reservas.filter(r => r.status === 'confirmada').length;
  const concluidas = reservas.filter(r => 
    r.status === 'concluida' || 
    r.status === 'aguardando_aprovacao' || 
    r.status === 'aprovada'
  ).length;
  const canceladas = reservas.filter(r => 
    r.status === 'cancelada' || 
    r.status === 'pendente_correcao'
  ).length;

  // Função para obter informações detalhadas do status
  const getStatusInfo = (status) => {
    const statusData = {
      'pendente': {
        label: 'Pendente',
        message: 'Sua reserva foi recebida e está sendo processada. Em breve será delegada para um de nossos motoristas.',
        icon: '⏳',
        color: '#fbbf24'
      },
      'delegada': {
        label: 'Delegada',
        message: 'Sua reserva foi atribuída a um motorista. Aguarde a confirmação.',
        icon: '🚗',
        color: '#3b82f6'
      },
      'confirmada': {
        label: 'Confirmada',
        message: 'Excelente! Um dos nossos motoristas confirmou sua viagem e já a tem em sua agenda. Você receberá informações de contato em breve.',
        icon: '✅',
        color: '#10b981'
      },
      'aguardando_aprovacao': {
        label: 'Viagem Realizada',
        message: 'Sua viagem foi realizada! Estamos processando os dados finais da viagem para conclusão.',
        icon: '🔄',
        color: '#f97316'
      },
      'aprovada': {
        label: 'Concluída',
        message: 'Sua viagem foi concluída com sucesso! Esperamos que tenha tido uma ótima experiência conosco.',
        icon: '🎉',
        color: '#16a34a'
      },
      'concluida': {
        label: 'Concluída',
        message: 'Sua viagem foi concluída com sucesso! Esperamos que tenha tido uma ótima experiência conosco.',
        icon: '🎉',
        color: '#059669'
      },
      'pendente_correcao': {
        label: 'Em Revisão',
        message: 'Estamos revisando alguns detalhes da sua viagem. Em breve entraremos em contato.',
        icon: '🔍',
        color: '#ef4444'
      },
      'cancelada': {
        label: 'Cancelada',
        message: 'Esta reserva foi cancelada. Entre em contato conosco se precisar de esclarecimentos.',
        icon: '❌',
        color: '#ef4444'
      }
    };
    return statusData[status] || {
      label: status,
      message: 'Status da reserva atualizado.',
      icon: 'ℹ️',
      color: '#6b7280'
    };
  };

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
          <div className="pu-resumo-card pu-delegada">
            <FiTruck />
            <span>Delegadas</span>
            <strong>{delegadas}</strong>
          </div>
          <div className="pu-resumo-card pu-confirmada">
            <FiCheckCircle />
            <span>Confirmadas</span>
            <strong>{confirmadas}</strong>
          </div>
          <div className="pu-resumo-card pu-concluida">
            <FiCheck />
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
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
              {reservas.map(reserva => {
                const statusInfo = getStatusInfo(reserva.status);
                return (
                  <div key={reserva.id} className={`pu-reserva-card pu-${safeValue(reserva.status)}`}>
                    <div className="pu-reserva-card-header">
                      <span className="pu-pacote">{safeValue(reserva.pacoteTitulo)}</span>
                      <span 
                        className={`pu-status pu-${safeValue(reserva.status)}`}
                        style={{ backgroundColor: statusInfo.color }}
                      >
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="pu-status-message">
                      <p>{statusInfo.message}</p>
                    </div>

                    <div className="pu-reserva-card-body">
                      <div><strong>Data:</strong> {safeValue(reserva.dataIda)} <strong>Hora:</strong> {safeValue(reserva.horaIda)}</div>
                      <div><strong>Origem:</strong> {safeValue(reserva.pontoPartida) || safeValue(reserva.origem) || 'Não informado'}</div>
                      <div><strong>Destino:</strong> {safeValue(reserva.pontoDestino) || safeValue(reserva.pacoteTitulo) || 'Não informado'}</div>
                      <div><strong>Valor:</strong> R$ {typeof reserva.valorTotal === 'number' ? reserva.valorTotal.toFixed(2).replace('.', ',') : safeValue(reserva.valorTotal)}</div>
                      <div><strong>Pagamento:</strong> {typeof reserva.pagamento === 'object' ? JSON.stringify(reserva.pagamento) : safeValue(reserva.pagamento)}</div>
                      {reserva.observacoes && <div><strong>Obs:</strong> {safeValue(reserva.observacoes)}</div>}
                    </div>

                    {(reserva.status === 'confirmada' || reserva.status === 'delegada') && (
                      <div className="pu-contact-info">
                        <h4>📞 Informações de Contato</h4>
                        <p>Em breve você receberá os dados de contato do motorista responsável.</p>
                      </div>
                    )}

                    {reserva.motivoCancelamento && (
                      <div className="pu-cancelamento-info">
                        <h4>Motivo do Cancelamento:</h4>
                        <p>{safeValue(reserva.motivoCancelamento)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <PainelUsuarioChat />
    </div>
  );
};

export default PainelUsuario;
