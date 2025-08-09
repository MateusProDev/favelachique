import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { 
  FiUser, FiCheckCircle, FiClock, FiXCircle, 
  FiMail, FiTruck, FiCheck, FiFilter, FiSearch,
  FiChevronDown, FiChevronUp, FiInfo, FiCalendar
} from 'react-icons/fi';
import PainelUsuarioChat from './PainelUsuarioChat';
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton';
import './PainelUsuario.css';
import './PainelUsuarioChat.css';

// Componente de Filtros Avançados
const FiltrosReservas = ({ filtros, setFiltros, statusOptions }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="filtros-container">
      <div className="filtros-header" onClick={() => setExpandido(!expandido)}>
        <FiFilter />
        <span>Filtrar Reservas</span>
        {expandido ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      
      {expandido && (
        <div className="filtros-conteudo">
          <div className="filtro-grupo">
            <label>Status</label>
            <div className="filtro-opcoes">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  className={`filtro-botao ${filtros.status.includes(status.value) ? 'ativo' : ''}`}
                  onClick={() => {
                    setFiltros(prev => {
                      const newStatus = prev.status.includes(status.value)
                        ? prev.status.filter(s => s !== status.value)
                        : [...prev.status, status.value];
                      return { ...prev, status: newStatus };
                    });
                  }}
                >
                  {status.icon} {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filtro-grupo">
            <label>Período</label>
            <div className="filtro-periodo">
              <div className="filtro-input">
                <FiCalendar />
                <input 
                  type="date" 
                  value={filtros.dataInicio || ''}
                  onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                />
              </div>
              <span>até</span>
              <div className="filtro-input">
                <FiCalendar />
                <input 
                  type="date" 
                  value={filtros.dataFim || ''}
                  onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="filtro-grupo">
            <label>Buscar</label>
            <div className="filtro-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Pesquisar reservas..."
                value={filtros.termoBusca}
                onChange={(e) => setFiltros({...filtros, termoBusca: e.target.value})}
              />
            </div>
          </div>

          <button 
            className="filtro-limpar"
            onClick={() => setFiltros({
              status: [],
              dataInicio: '',
              dataFim: '',
              termoBusca: ''
            })}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

// Componente para exibir informações de pagamento
const PagamentoInfo = ({ reserva }) => {
  const { pagamento, metodoPagamento, statusPagamento, valorPago } = reserva;
  
  // ... (mantido igual ao original)
};

const PainelUsuario = () => {
  const safeValue = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    if (typeof val === 'object') return JSON.stringify(val);
    return val;
  };

  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    status: [],
    dataInicio: '',
    dataFim: '',
    termoBusca: ''
  });

  // Opções de status para os filtros
  const statusOptions = useMemo(() => [
    { value: 'pendente', label: 'Pendentes', icon: '⏳', color: '#fbbf24' },
    { value: 'delegada', label: 'Delegadas', icon: '🚗', color: '#3b82f6' },
    { value: 'confirmada', label: 'Confirmadas', icon: '✅', color: '#10b981' },
    { value: 'concluida', label: 'Concluídas', icon: '🎉', color: '#059669' },
    { value: 'cancelada', label: 'Canceladas', icon: '❌', color: '#ef4444' },
    { value: 'aguardando_aprovacao', label: 'Em Aprovação', icon: '🔄', color: '#f97316' },
    { value: 'pendente_correcao', label: 'Em Revisão', icon: '🔍', color: '#ef4444' }
  ], []);

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

  // Filtrar reservas com base nos filtros selecionados
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      // Filtro por status
      if (filtros.status.length > 0 && !filtros.status.includes(reserva.status)) {
        return false;
      }
      
      // Filtro por termo de busca
      if (filtros.termoBusca) {
        const termo = filtros.termoBusca.toLowerCase();
        const camposBusca = [
          reserva.pacoteTitulo,
          reserva.pontoPartida,
          reserva.pontoDestino,
          reserva.observacoes,
          reserva.motivoCancelamento
        ].join(' ').toLowerCase();
        
        if (!camposBusca.includes(termo)) {
          return false;
        }
      }
      
      // Filtro por data
      if (filtros.dataInicio || filtros.dataFim) {
        const dataReserva = new Date(reserva.dataIda);
        const inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        const fim = filtros.dataFim ? new Date(filtros.dataFim) : null;
        
        if (inicio && dataReserva < inicio) return false;
        if (fim && dataReserva > fim) return false;
      }
      
      return true;
    });
  }, [reservas, filtros]);

  // Calcular totais
  const { total, pendentes, delegadas, confirmadas, concluidas, canceladas } = useMemo(() => {
    return {
      total: reservas.length,
      pendentes: reservas.filter(r => r.status === 'pendente').length,
      delegadas: reservas.filter(r => r.status === 'delegada').length,
      confirmadas: reservas.filter(r => r.status === 'confirmada').length,
      concluidas: reservas.filter(r => 
        r.status === 'concluida' || 
        r.status === 'aguardando_aprovacao' || 
        r.status === 'aprovada'
      ).length,
      canceladas: reservas.filter(r => 
        r.status === 'cancelada' || 
        r.status === 'pendente_correcao'
      ).length
    };
  }, [reservas]);

  // ... (getStatusInfo mantido igual)

  if (!user) {
    return <div className="pu-bg"><div className="pu-container"><p>Faça login para ver suas reservas.</p></div></div>;
  }

  return (
    <div className="pu-bg">
      <div className="pu-dashboard">
        <div className="pu-header">
          <div className="pu-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="pu-avatar-img" />
            ) : (
              <FiUser className="pu-icon" />
            )}
          </div>
          <div className="pu-info">
            <h2>{user.displayName || 'Usuário'}</h2>
            <div className="pu-email"><FiMail /> {user.email}</div>
            <div className="pu-stats-badge">
              <span>{total} reservas</span>
              <span>{concluidas} concluídas</span>
            </div>
          </div>
        </div>

        <div className="pu-resumo">
          {/* Cards de resumo (mantido igual) */}
        </div>

        <div className="pu-lista-container">
          <div className="pu-lista-header">
            <h3>Minhas Reservas</h3>
            <div className="pu-lista-info">
              <span>{reservasFiltradas.length} de {reservas.length} reservas</span>
              <FiltrosReservas 
                filtros={filtros}
                setFiltros={setFiltros}
                statusOptions={statusOptions}
              />
            </div>
          </div>

          {loading ? (
            <div className="pu-loading">
              <div className="pu-loading-spinner"></div>
              <p>Carregando suas reservas...</p>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="pu-empty-state">
              <FiInfo size={48} />
              <h4>Nenhuma reserva encontrada</h4>
              <p>
                {filtros.status.length > 0 || filtros.termoBusca || filtros.dataInicio || filtros.dataFim
                  ? "Tente ajustar seus filtros de busca"
                  : "Você ainda não fez nenhuma reserva"}
              </p>
            </div>
          ) : (
            <div className="pu-reservas-grid">
              {reservasFiltradas.map(reserva => {
                const statusInfo = getStatusInfo(reserva.status);
                return (
                  <div key={reserva.id} className={`pu-reserva-card pu-${safeValue(reserva.status)}`}>
                    {/* Conteúdo da reserva (mantido igual) */}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <PainelUsuarioChat />
      <WhatsAppButton />
    </div>
  );
};

export default PainelUsuario;