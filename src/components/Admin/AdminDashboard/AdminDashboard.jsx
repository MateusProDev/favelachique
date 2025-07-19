// src/components/Admin/AdminDashboard/AdminDashboard.jsx


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { FiMenu, FiX, FiUser, FiLogOut, FiBarChart2, FiUsers, FiClipboard } from "react-icons/fi";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import "./AdminDashboard.css";

Chart.register(ArcElement, Tooltip, Legend);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Modal de detalhes da reserva
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [delegarLoading, setDelegarLoading] = useState(false);
  const [delegarMsg, setDelegarMsg] = useState("");

  const handleOpenReserva = (reserva) => {
    setSelectedReserva(reserva);
    setDelegarMsg("");
  };
  const handleCloseReserva = () => {
    setSelectedReserva(null);
    setDelegarMsg("");
  };
  const handleDelegar = async (reservaId, motoristaId) => {
    setDelegarLoading(true);
    try {
      const reservaRef = doc(db, "reservas", reservaId);
      await updateDoc(reservaRef, {
        motoristaId,
        status: "delegada"
      });
      setDelegarMsg("Reserva delegada com sucesso!");
    } catch (e) {
      setDelegarMsg("Erro ao delegar reserva.");
    }
    setDelegarLoading(false);
  };

  // Real time updates
  useEffect(() => {
    const tsToDateString = ts => (ts && typeof ts === 'object' && ts.seconds)
      ? new Date(ts.seconds * 1000).toLocaleString()
      : ts;
    const unsubReservas = onSnapshot(collection(db, 'reservas'), (snapshot) => {
      setReservas(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          dataReserva: tsToDateString(data.dataReserva || data.data),
          dataViagem: tsToDateString(data.dataViagem),
          hora: tsToDateString(data.hora),
          createdAt: tsToDateString(data.createdAt),
          statusHistory: Array.isArray(data.statusHistory)
            ? data.statusHistory.map(item => ({
                ...item,
                date: tsToDateString(item.date)
              }))
            : data.statusHistory
        };
      }));
    });
    const unsubMotoristas = onSnapshot(collection(db, 'motoristas'), (snapshot) => {
      setMotoristas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      unsubReservas();
      unsubMotoristas();
    };
  }, []);

  // Navegação
  const goTo = (path) => {
    setSidebarOpen(false);
    setTimeout(() => navigate(path), 100); // Garante animação suave no mobile
  };
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Resumos
  const totalReservas = reservas.length;
  const totalMotoristas = motoristas.length;
  const reservasPendentes = reservas.filter(r => r.status === 'pendente').length;
  const reservasDelegadas = reservas.filter(r => r.status === 'delegada').length;

  // Gráfico de status das reservas
  const chartData = {
    labels: ['Pendentes', 'Delegadas', 'Outras'],
    datasets: [
      {
        data: [reservasPendentes, reservasDelegadas, totalReservas - reservasPendentes - reservasDelegadas],
        backgroundColor: ['#ffbe0b', '#3a86ff', '#bdbdbd'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="admin-dashboard-pro">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Abrir menu">
        {sidebarOpen ? <FiX size={28} /> : <FiMenu size={28} />}
      </button>
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <h2 className="sidebar-title-pixel"><FiBarChart2 className="sidebar-title-icon" /> <span className="sidebar-title-text">Admin</span></h2>
        <nav>
          <ul>
            <li><button onClick={() => goTo("/admin/edit-header")}> <FiClipboard className="sidebar-icon" /> Editar Logo</button></li>
            <li><button onClick={() => goTo("/admin/edit-banner")}> <FiClipboard className="sidebar-icon" /> Editar Banner</button></li>
            <li><button onClick={() => goTo("/admin/edit-boxes")}> <FiClipboard className="sidebar-icon" /> Editar Boxes</button></li>
            <li><button onClick={() => goTo("/admin/edit-about")}> <FiUser className="sidebar-icon" /> Editar Sobre</button></li>
            <li><button onClick={() => goTo("/admin/edit-footer")}> <FiClipboard className="sidebar-icon" /> Editar Rodapé</button></li>
            <li><button onClick={() => goTo("/admin/edit-hours")}> <FiBarChart2 className="sidebar-icon" /> Editar Horários</button></li>
            <li><button onClick={() => goTo("/admin/edit-whatsapp")}> <FiUsers className="sidebar-icon" /> Editar WhatsApp</button></li>
            <li><button onClick={() => goTo("/admin/edit-carousel")}> <FiBarChart2 className="sidebar-icon" /> Editar Carrossel</button></li>
            <li><button onClick={() => goTo("/admin/pacotes")}> <FiClipboard className="sidebar-icon" /> Pacotes</button></li>
            <li><button onClick={() => goTo("/admin/pacotes/novo")}> <FiClipboard className="sidebar-icon" /> Novo Pacote</button></li>
            <li><button onClick={() => goTo("/")}> <FiBarChart2 className="sidebar-icon" /> Home</button></li>
            <li><button onClick={handleLogout} className="logout"><FiLogOut className="sidebar-icon" /> Sair</button></li>
          </ul>
        </nav>
      </aside>
      {/* Overlay para fechar menu mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="dashboard-main">
        <h1><FiBarChart2 style={{marginRight: 8}} /> Painel de Administração</h1>
        <div className="dashboard-cards">
          <div className="card-resumo card-1">
            <FiClipboard className="card-icon" />
            <h3>Total de Reservas</h3>
            <p>{totalReservas}</p>
          </div>
          <div className="card-resumo card-2">
            <FiBarChart2 className="card-icon" />
            <h3>Reservas Pendentes</h3>
            <p>{reservasPendentes}</p>
          </div>
          <div className="card-resumo card-3">
            <FiBarChart2 className="card-icon" />
            <h3>Reservas Delegadas</h3>
            <p>{reservasDelegadas}</p>
          </div>
          <div className="card-resumo card-4">
            <FiUsers className="card-icon" />
            <h3>Motoristas</h3>
            <p>{totalMotoristas}</p>
          </div>
        </div>
        <div className="dashboard-graph-section">
          <h2>Status das Reservas</h2>
          <div className="dashboard-graph-wrapper">
            <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <section className="dashboard-section modern-reservas">
          <div className="section-header">
            <h2>Reservas Recentes</h2>
            <span className="badge-count">{reservas.length}</span>
          </div>
          <div className="modern-table-container">
            {reservas.length === 0 ? (
              <div className="empty-state">
                <FiClipboard className="empty-icon" />
                <p>Nenhuma reserva encontrada</p>
                <span className="empty-subtitle">As reservas aparecerão aqui quando criadas</span>
              </div>
            ) : (
              <div className="modern-table">
                <div className="table-header">
                  <div className="th">Cliente</div>
                  <div className="th">Data/Hora</div>
                  <div className="th">Trajeto</div>
                  <div className="th">Status</div>
                  <div className="th">Ações</div>
                </div>
                {reservas.slice(0, 10).map(r => (
                  <div key={r.id} className="table-row" onClick={() => handleOpenReserva(r)}>
                    <div className="td">
                      <div className="client-info">
                        <div className="client-avatar">
                          {(r.clienteNome || r.nome || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="client-details">
                          <span className="client-name">{r.clienteNome || r.nome || r.nomeCliente}</span>
                          <span className="client-sub">{r.telefone || r.clienteTelefone || 'Sem telefone'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="td">
                      <div className="date-info">
                        <span className="date">{r.dataReserva || r.data || ''}</span>
                        <span className="time">{r.hora || r.horario || ''}</span>
                      </div>
                    </div>
                    <div className="td">
                      <div className="route-info">
                        <span className="origin">{r.enderecoOrigem || r.origem || 'Origem'}</span>
                        <span className="arrow">→</span>
                        <span className="destination">{r.enderecoDestino || r.destino || r.pacoteTitulo || 'Destino'}</span>
                      </div>
                    </div>
                    <div className="td">
                      <span className={`status-badge status-${r.status}`}>
                        {r.status === 'pendente' ? 'Pendente' : 
                         r.status === 'delegada' ? 'Delegada' : 
                         r.status === 'confirmada' ? 'Confirmada' : r.status}
                      </span>
                    </div>
                    <div className="td">
                      <button className="action-btn primary" onClick={(e) => {e.stopPropagation(); handleOpenReserva(r);}}>
                        Gerenciar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Modal Detalhes da Reserva */}
          <Modal open={!!selectedReserva} onClose={handleCloseReserva}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, minWidth: 320, maxWidth: 420 }}>
              {selectedReserva && (
                <>
                  <Typography variant="h6" mb={2}>Detalhes da Reserva</Typography>
                  <Typography><b>Cliente:</b> {selectedReserva.clienteNome || selectedReserva.nome || selectedReserva.nomeCliente}</Typography>
                  <Typography><b>Data:</b> {selectedReserva.dataReserva || selectedReserva.data || ''}</Typography>
                  <Typography><b>Hora:</b> {selectedReserva.hora || selectedReserva.horario || ''}</Typography>
                  <Typography><b>Origem:</b> {selectedReserva.enderecoOrigem || selectedReserva.origem || 'Não informado'}</Typography>
                  <Typography><b>Destino:</b> {selectedReserva.enderecoDestino || selectedReserva.destino || selectedReserva.pacoteTitulo || 'Não informado'}</Typography>
                  <Typography><b>Status:</b> {selectedReserva.status}</Typography>
                  <Typography><b>Valor:</b> R$ {selectedReserva.valor || selectedReserva.preco || selectedReserva.pacotePreco || ''}</Typography>
                  <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel id="delegar-label">Delegar para motorista</InputLabel>
                    <Select
                      labelId="delegar-label"
                      value={selectedReserva.motoristaId || ''}
                      label="Delegar para motorista"
                      onChange={e => handleDelegar(selectedReserva.id, e.target.value)}
                      disabled={delegarLoading}
                    >
                      <MenuItem value="">Nenhum</MenuItem>
                      {motoristas.map(m => (
                        <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {delegarMsg && <Typography mt={2} color={delegarMsg.includes('sucesso') ? 'primary' : 'error'}>{delegarMsg}</Typography>}
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button onClick={handleCloseReserva} variant="outlined">Fechar</Button>
                  </Box>
                </>
              )}
            </Box>
          </Modal>
        </section>
        
        <section className="dashboard-section modern-motoristas">
          <div className="section-header">
            <h2>Motoristas Cadastrados</h2>
            <span className="badge-count">{motoristas.length}</span>
          </div>
          <div className="motoristas-grid">
            {motoristas.length === 0 ? (
              <div className="empty-state">
                <FiUsers className="empty-icon" />
                <p>Nenhum motorista cadastrado</p>
                <span className="empty-subtitle">Compartilhe o link de cadastro abaixo</span>
              </div>
            ) : (
              motoristas.slice(0, 8).map(m => (
                <div key={m.id} className="motorista-card">
                  <div className="motorista-avatar">
                    {(m.nome || 'M').charAt(0).toUpperCase()}
                  </div>
                  <div className="motorista-info">
                    <h4 className="motorista-name">{m.nome}</h4>
                    <p className="motorista-email">{m.email}</p>
                    <div className="motorista-vehicle">
                      <span className="vehicle-info">{m.modelo} - {m.cor}</span>
                      <span className="vehicle-plate">{m.placa}</span>
                    </div>
                  </div>
                  <div className="motorista-stats">
                    <div className="stat">
                      <span className="stat-number">{reservas.filter(r => r.motoristaId === m.id).length}</span>
                      <span className="stat-label">Corridas</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-section modern-share">
          <div className="share-container">
            <div className="share-header">
              <div className="share-icon">
                <FiUsers />
              </div>
              <div className="share-content">
                <h3>Recrute Novos Motoristas</h3>
                <p>Compartilhe o link de cadastro e expanda sua frota de parceiros</p>
              </div>
            </div>
            <div className="share-link-modern">
              {(() => {
                const baseUrl = window.location.origin;
                const rota = "/motorista/cadastro";
                const link = baseUrl + rota;
                return (
                  <div className="link-container">
                    <div className="link-display">
                      <input
                        type="text"
                        value={link}
                        readOnly
                        className="link-input"
                        onFocus={e => e.target.select()}
                      />
                      <button
                        className="btn-copy"
                        onClick={(e) => {
                          navigator.clipboard.writeText(link);
                          // Feedback visual de copiado
                          const btn = e.target;
                          const originalText = btn.textContent;
                          btn.textContent = 'Copiado!';
                          btn.style.background = '#10b981';
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = '';
                          }, 2000);
                        }}
                      >
                        Copiar Link
                      </button>
                    </div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-preview"
                    >
                      Visualizar Página
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;