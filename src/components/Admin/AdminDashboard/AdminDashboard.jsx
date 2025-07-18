// src/components/Admin/AdminDashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

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
  const goTo = (path) => navigate(path);
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

  return (
    <div className="admin-dashboard-pro">
      <aside className="sidebar">
        <h2>Admin</h2>
        <nav>
          <ul>
            <li><button onClick={() => goTo("/admin/edit-header")}>Editar Logo</button></li>
            <li><button onClick={() => goTo("/admin/edit-banner")}>Editar Banner</button></li>
            <li><button onClick={() => goTo("/admin/edit-boxes")}>Editar Boxes</button></li>
            <li><button onClick={() => goTo("/admin/edit-about")}>Editar Sobre</button></li>
            <li><button onClick={() => goTo("/admin/edit-footer")}>Editar Rodapé</button></li>
            <li><button onClick={() => goTo("/admin/edit-hours")}>Editar Horários</button></li>
            <li><button onClick={() => goTo("/admin/edit-whatsapp")}>Editar WhatsApp</button></li>
            <li><button onClick={() => goTo("/admin/edit-carousel")}>Editar Carrossel</button></li>
            <li><button onClick={() => goTo("/admin/pacotes")}>Pacotes</button></li>
            <li><button onClick={() => goTo("/admin/pacotes/novo")}>Novo Pacote</button></li>
            <li><button onClick={() => goTo("/")}>Home</button></li>
            <li><button onClick={handleLogout} className="logout">Sair</button></li>
          </ul>
        </nav>
      </aside>
      <main className="dashboard-main">
        <h1>Painel de Administração</h1>
        <div className="dashboard-cards">
          <div className="card-resumo">
            <h3>Total de Reservas</h3>
            <p>{totalReservas}</p>
          </div>
          <div className="card-resumo">
            <h3>Reservas Pendentes</h3>
            <p>{reservasPendentes}</p>
          </div>
          <div className="card-resumo">
            <h3>Reservas Delegadas</h3>
            <p>{reservasDelegadas}</p>
          </div>
          <div className="card-resumo">
            <h3>Motoristas</h3>
            <p>{totalMotoristas}</p>
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
                    <strong>{r.clienteNome || r.nome || r.nomeCliente}</strong> - {r.dataReserva || r.data || ''} {r.hora || r.horario || ''} - {r.pacoteTitulo || r.destino || ''} - Status: {r.status}
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
                    <strong>{m.nome}</strong> - {m.email}
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