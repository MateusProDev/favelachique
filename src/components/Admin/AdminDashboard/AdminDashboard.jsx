// src/components/Admin/AdminDashboard/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { FiMenu, FiX, FiUser, FiLogOut, FiBarChart2, FiUsers, FiClipboard } from "react-icons/fi";
import "./AdminDashboard.css";

Chart.register(ArcElement, Tooltip, Legend);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <section className="dashboard-section">
          <h2>Reservas Recentes</h2>
          <div className="dashboard-list">
            {reservas.length === 0 ? (
              <p>Nenhuma reserva encontrada.</p>
            ) : (
              <ul>
                {reservas.slice(0, 10).map(r => (
                  <li key={r.id}>
                    <div className="reserva-info">
                      <span className="reserva-nome">{r.clienteNome || r.nome || r.nomeCliente}</span>
                      <span className="reserva-detalhe">{r.dataReserva || r.data || ''} {r.hora || r.horario || ''}</span>
                      <span className="reserva-detalhe">{r.pacoteTitulo || r.destino || ''}</span>
                      <span className={`reserva-status ${r.status === 'pendente' ? 'pendente' : r.status === 'delegada' ? 'delegada' : 'outra'}`}>{r.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <section className="dashboard-section">
          <h2>Motoristas Cadastrados</h2>
          <div className="dashboard-list">
            {motoristas.length === 0 ? (
              <p>Nenhum motorista cadastrado.</p>
            ) : (
              <ul>
                {motoristas.slice(0, 10).map(m => (
                  <li key={m.id}>
                    <span className="motorista-nome">{m.nome}</span>
                    <span className="motorista-email">{m.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;