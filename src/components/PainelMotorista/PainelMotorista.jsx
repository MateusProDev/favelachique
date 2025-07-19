


import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase/firebaseConfig';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { FaUserTie, FaCarSide, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaHotel, FaPlaneDeparture, FaBars, FaChartBar, FaMoneyBillWave, FaListUl } from 'react-icons/fa';
import './PainelMotorista.css';


const PainelMotorista = () => {

  const [motorista, setMotorista] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroData, setFiltroData] = useState('');
  const [aba, setAba] = useState('reservas');
  const [navbarOpen, setNavbarOpen] = useState(window.innerWidth > 900);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  // Fecha navbar ao clicar fora no mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (window.innerWidth > 900) setNavbarOpen(true);
      else setNavbarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Escuta dados do motorista em tempo real
        const motoristaRef = doc(db, 'motoristas', user.uid);
        const unsubscribeMotorista = onSnapshot(motoristaRef, (docSnap) => {
          if (docSnap.exists()) {
            setMotorista(docSnap.data());
          } else {
            setMotorista(null);
          }
        });

        // Escuta reservas atribuídas ao motorista em tempo real
        const reservasQuery = query(
          collection(db, 'reservas'),
          where('motoristaId', '==', user.uid)
        );
        const unsubscribeReservas = onSnapshot(reservasQuery, (querySnapshot) => {
          const reservasData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log('Reserva data:', data); // Debug para ver a estrutura
            return {
              id: doc.id,
              ...data,
            };
          });
          setReservas(reservasData);
          setLoading(false);
        });

        // Cleanup
        return () => {
          unsubscribeMotorista();
          unsubscribeReservas();
        };
      } else {
        setMotorista(null);
        setReservas([]);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  if (loading) return <div className="pm-container">Carregando...</div>;

  if (!motorista)
    return (
      <div className="pm-container">
        <h2>Motorista não encontrado</h2>
        <p>Faça login novamente ou cadastre-se.</p>
      </div>
    );


  // Função para notificar cliente com mensagem personalizada
  const notificarCliente = (reserva, tipo) => {
    const nomeMotorista = motorista.nome;
    const modelo = motorista.modelo;
    const cor = motorista.cor;
    const placa = motorista.placa;
    const origem = reserva.enderecoOrigem || reserva.origem || 'local de origem';
    const destino = reserva.enderecoDestino || reserva.destino || reserva.pacoteTitulo || 'destino';
    const cliente = reserva.clienteNome || reserva.nome || 'cliente';
    
    let mensagem = '';
    
    if (tipo === 'hotel') {
      mensagem = `*Olá, ${cliente}!* 

_Sua transferência com a 20 Buscar - Agência de Turismo_

*CHEGADA NO LOCAL DE ORIGEM*
Já estou te aguardando em: *${origem}*

*INFORMAÇÕES DO SEU MOTORISTA:*
• Nome: *${nomeMotorista}*
• Veículo: *${modelo}*
• Cor: *${cor}*  
• Placa: *${placa}*

*DESTINO:* ${destino}

_Caso precise de algo ou não me encontre, entre em contato imediatamente pelo WhatsApp._

*Tenha uma excelente viagem!*

---
*20 Buscar - Agência de Turismo*
_Viagens incríveis com praticidade e segurança_`;
    } else if (tipo === 'aeroporto') {
      mensagem = `*Olá, ${cliente}!* 

_Sua transferência com a 20 Buscar - Agência de Turismo_

*CHEGANDO AO DESTINO*
Estamos chegando em: *${destino}*
Saímos de: *${origem}*

*SEU MOTORISTA:*
• *${nomeMotorista}*
• Veículo: *${modelo} ${cor}*
• Placa: *${placa}*

_Obrigado por escolher nossos serviços!_
_Avalie nossa experiência e nos recomende._

*Até a próxima viagem!*

---
*20 Buscar - Agência de Turismo*
_Viagens incríveis com praticidade e segurança_`;
    }
    // Busca telefone em vários campos possíveis e formata corretamente
    let phone = reserva.clienteTelefone || 
                reserva.telefone || 
                reserva.whatsapp || 
                reserva.phone ||
                reserva.clientePhone ||
                (reserva.cliente && reserva.cliente.telefone) || 
                (reserva.cliente && reserva.cliente.whatsapp) ||
                (reserva.dados && reserva.dados.telefone) ||
                '';
                
    // Remove tudo que não é número
    phone = phone.replace(/\D/g, '');
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (phone && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    console.log('Telefone original:', reserva.clienteTelefone || reserva.telefone);
    console.log('Telefone formatado:', phone);
    
    if (!phone || phone.length < 12) {
      alert('Telefone/WhatsApp do cliente não informado ou inválido.');
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Filtro de reservas
  const reservasFiltradas = reservas.filter((reserva) => {
    let statusOk = filtroStatus === 'todos' || reserva.status === filtroStatus;
    let dataOk = true;
    if (filtroData) {
      // Suporta tanto string quanto Timestamp
      let dataReserva = reserva.dataReserva;
      let dataSimples = '';
      if (dataReserva && dataReserva.toDate) {
        dataSimples = dataReserva.toDate().toISOString().slice(0, 10);
      } else if (typeof dataReserva === 'string') {
        dataSimples = dataReserva.slice(0, 10);
      }
      // Também verifica o campo reserva.data (caso dataReserva não exista)
      let dataCampoData = '';
      if (reserva.data && typeof reserva.data === 'string') {
        // Tenta converter para formato yyyy-mm-dd
        const partes = reserva.data.split(/[\/\-]/);
        if (partes.length >= 3) {
          // Suporta formatos dd/mm/yyyy, yyyy-mm-dd, etc
          if (partes[0].length === 4) {
            // yyyy-mm-dd
            dataCampoData = `${partes[0]}-${partes[1].padStart(2, '0')}-${partes[2].padStart(2, '0')}`;
          } else {
            // dd/mm/yyyy
            dataCampoData = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
          }
        }
      }
      dataOk = (dataSimples === filtroData) || (dataCampoData === filtroData);
    }
    return statusOk && dataOk;
  });

  // Lista de status únicos para filtro
  const statusList = Array.from(new Set(reservas.map(r => r.status))).filter(Boolean);

  return (
    <div className="pm-bg">
      {/* Botão menu mobile fixo no topo */}
      <button className="pm-mobile-menu-btn" onClick={() => setNavbarOpen(!navbarOpen)}>
        <FaBars size={20} />
      </button>
      
      {/* Overlay para fechar menu no mobile */}
      {navbarOpen && isMobile && (
        <div className="pm-mobile-overlay active" onClick={() => setNavbarOpen(false)}></div>
      )}
      
      <aside className={`pm-navbar ${navbarOpen ? 'active' : ''}`}>
        <div className="pm-navbar-header">
          <span className="pm-navbar-title">Painel do Motorista</span>
        </div>
        <nav className="pm-navbar-list">
          <button className={aba === 'reservas' ? 'active' : ''} onClick={() => { setAba('reservas'); if(isMobile) setNavbarOpen(false); }}>
            <FaListUl /> Reservas
          </button>
          <button className={aba === 'ganhos' ? 'active' : ''} onClick={() => { setAba('ganhos'); if(isMobile) setNavbarOpen(false); }}>
            <FaMoneyBillWave /> Ganhos
          </button>
          <button className={aba === 'graficos' ? 'active' : ''} onClick={() => { setAba('graficos'); if(isMobile) setNavbarOpen(false); }}>
            <FaChartBar /> Gráficos
          </button>
        </nav>
      </aside>
      
      <main className="pm-container pm-motorista-panel">
        {/* Perfil do Motorista - Reorganizado */}
        <div className="pm-motorista-profile">
          <div className="pm-motorista-avatar">
            <span className="pm-motorista-avatar-circle">
              <FaUserTie size={24} />
            </span>
          </div>
          <div className="pm-motorista-info">
            <h2>{motorista.nome}</h2>
            <div className="pm-motorista-dados">
              <div className="pm-motorista-dado">
                <FaEnvelope className="pm-icon" />
                <span>{motorista.email}</span>
              </div>
              <div className="pm-motorista-dado">
                <FaPhoneAlt className="pm-icon" />
                <span>{motorista.telefone}</span>
              </div>
              <div className="pm-motorista-dado">
                <FaCarSide className="pm-icon" />
                <span>{motorista.modelo} | {motorista.cor} | {motorista.placa}</span>
              </div>
            </div>
          </div>
        </div>
        <hr className="pm-motorista-divider" />
        {aba === 'reservas' && (
          <>
            <div className="pm-motorista-filtros">
              <label>
                <b>Status:</b>
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="pm-motorista-select">
                  <option value="todos">Todos</option>
                  {statusList.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
              </label>
              <label>
                <b>Data:</b>
                <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} className="pm-motorista-date" />
              </label>
            </div>
            <h3 className="pm-motorista-title">Reservas atribuídas</h3>
            {reservasFiltradas.length === 0 ? (
              <p className="pm-motorista-empty">Nenhuma reserva encontrada para o filtro selecionado.</p>
            ) : (
              <div className="pm-motorista-reservas-list">
                {reservasFiltradas.map((reserva) => (
                  <div key={reserva.id} className="pm-motorista-reserva-card">
                    <div className="pm-motorista-reserva-info">
                      <div><FaUserTie className="pm-icon" /> <b>Cliente:</b> {reserva.clienteNome || reserva.nome || reserva.clienteEmail || reserva.cliente || '-'}</div>
                      <div><FaPhoneAlt className="pm-icon" /> <b>Telefone:</b> {
                        reserva.clienteTelefone || 
                        reserva.telefone || 
                        reserva.whatsapp || 
                        reserva.phone ||
                        reserva.clientePhone ||
                        reserva.userPhone ||
                        (reserva.cliente && reserva.cliente.telefone) || 
                        (reserva.cliente && reserva.cliente.whatsapp) ||
                        (reserva.cliente && reserva.cliente.phone) ||
                        (reserva.dados && reserva.dados.telefone) ||
                        (reserva.dados && reserva.dados.whatsapp) ||
                        '-'
                      }</div>
                      <div><FaMapMarkerAlt className="pm-icon" /> <b>Origem:</b> {
                        reserva.enderecoOrigem || 
                        reserva.origem ||
                        reserva.enderecoColeta ||
                        'Não informado'
                      }</div>
                      <div><FaMapMarkerAlt className="pm-icon" /> <b>Destino:</b> {
                        reserva.enderecoDestino ||
                        reserva.destino ||
                        reserva.pacoteTitulo || 
                        reserva.pacoteNome ||
                        reserva.titulo ||
                        reserva.enderecoEntrega ||
                        'Não informado'
                      }</div>
                      <div><FaCalendarAlt className="pm-icon" /> <b>Data:</b> {reserva.dataReserva?.toDate ? reserva.dataReserva.toDate().toLocaleString() : reserva.dataReserva || reserva.data}</div>
                      <div><FaMoneyBillWave className="pm-icon" /> <b>Valor:</b> {
                        reserva.valor ? `R$ ${Number(reserva.valor).toFixed(2)}` :
                        reserva.preco ? `R$ ${Number(reserva.preco).toFixed(2)}` :
                        reserva.precoTotal ? `R$ ${Number(reserva.precoTotal).toFixed(2)}` :
                        reserva.pacotePreco ? `R$ ${Number(reserva.pacotePreco).toFixed(2)}` :
                        reserva.price ? `R$ ${Number(reserva.price).toFixed(2)}` :
                        reserva.amount ? `R$ ${Number(reserva.amount).toFixed(2)}` :
                        reserva.total ? `R$ ${Number(reserva.total).toFixed(2)}` :
                        (reserva.dados && reserva.dados.valor) ? `R$ ${Number(reserva.dados.valor).toFixed(2)}` :
                        (reserva.dados && reserva.dados.preco) ? `R$ ${Number(reserva.dados.preco).toFixed(2)}` :
                        (reserva.cliente && reserva.cliente.valor) ? `R$ ${Number(reserva.cliente.valor).toFixed(2)}` :
                        'Não informado'
                      }</div>
                      <div><FaCheckCircle className="pm-icon" /> <b>Status:</b> {reserva.status}</div>
                    </div>
                    <div className="pm-motorista-btns">
                      <button className="pm-btn-hotel" title="Notificar: Chegada no local de origem" onClick={() => notificarCliente(reserva, 'hotel')}>
                        <FaHotel className="pm-icon" />
                      </button>
                      <button className="pm-btn-aeroporto" title="Notificar: Chegada no destino final" onClick={() => notificarCliente(reserva, 'aeroporto')}>
                        <FaPlaneDeparture className="pm-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {aba === 'ganhos' && (
          <section className="pm-motorista-ganhos">
            <h3 className="pm-motorista-title"><FaMoneyBillWave className="pm-icon" /> Ganhos</h3>
            <div className="pm-motorista-filtros">
              <label>
                <b>Período:</b>
                <input type="month" className="pm-motorista-date" />
              </label>
            </div>
            <div className="pm-motorista-ganhos-resumo">
              <div className="pm-motorista-ganhos-total">
                <span>Total recebido:</span>
                <b>R$ --,--</b>
              </div>
              <div className="pm-motorista-ganhos-lucro">
                <span>Lucro esperado:</span>
                <b>R$ --,--</b>
              </div>
            </div>
            <div className="pm-motorista-ganhos-lista">
              <p style={{color:'#888'}}>Em breve: lista detalhada de corridas e gráficos de ganhos.</p>
            </div>
          </section>
        )}
        {aba === 'graficos' && (
          <div className="pm-motorista-graficos">
            <h3 className="pm-motorista-title"><FaChartBar className="pm-icon" /> Gráficos</h3>
            <p style={{color:'#888'}}>Em breve: gráficos de desempenho e corridas.</p>
          </div>
        )}
      </main>
    </div>
  );
};
export default PainelMotorista;
