// src/components/Admin/AdminDashboard/AdminDashboard.jsx


import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../firebase/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { FiMenu, FiX, FiUser, FiLogOut, FiBarChart2, FiUsers, FiClipboard, FiImage, FiDownload } from "react-icons/fi";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Button from "@mui/material/Button";
import { jsPDF } from 'jspdf';
import ViagemConverter from "../../ViagemConverter/ViagemConverter";
import "./AdminDashboard.css";

Chart.register(ArcElement, Tooltip, Legend);


const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados dos filtros avançados
  const [filtros, setFiltros] = useState({
    status: 'todas',
    periodo: 'todas',
    dataInicio: '',
    dataFim: '',
    motorista: 'todos',
    pagamento: 'todos',
    valor: 'todos',
    busca: ''
  });
  const [reservasFiltradas, setReservasFiltradas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarTodasReservas, setMostrarTodasReservas] = useState(false);
  const [mostrarTodosMotoristas, setMostrarTodosMotoristas] = useState(false);
  
  // Modal de detalhes da reserva
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [delegarLoading, setDelegarLoading] = useState(false);
  const [delegarMsg, setDelegarMsg] = useState("");
  
  // Modal de conversão para viagem
  const [showViagemConverter, setShowViagemConverter] = useState(false);
  const [reservaParaConverter, setReservaParaConverter] = useState(null);

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

  // Função para abrir modal de conversão para viagem
  const handleConverterParaViagem = (reserva) => {
    setReservaParaConverter(reserva);
    setShowViagemConverter(true);
  };

  // Callback para sucesso na conversão
  const handleConversaoSucesso = (resultado) => {
    alert(`✅ Reserva convertida em viagem com sucesso!\n\nID da viagem: ${resultado.id}`);
    setShowViagemConverter(false);
    setReservaParaConverter(null);
  };

  // Função para aprovar viagem concluída pelo motorista
  const aprovarViagem = async (reservaId) => {
    try {
      const reservaRef = doc(db, "reservas", reservaId);
      const agora = new Date();
      
      await updateDoc(reservaRef, {
        status: "aprovada",
        dataAprovacao: agora,
        aprovadoPor: "admin",
        aguardandoAprovacao: false,
        pagamentoLiberado: true,
        lastUpdated: agora,
        statusHistory: {
          status: "aprovada",
          date: agora,
          updatedBy: "admin",
          observation: "Conclusão do motorista aprovada - Pagamento liberado na carteira"
        }
      });
      
      alert("✅ Conclusão do motorista APROVADA!\n\n💰 Pagamento liberado na carteira do motorista.\n🔔 O motorista será notificado automaticamente.");
    } catch (error) {
      console.error("Erro ao aprovar viagem:", error);
      alert("Erro ao aprovar conclusão da viagem. Tente novamente.");
    }
  };

  // Função para rejeitar conclusão da viagem
  const rejeitarViagem = async (reservaId, motivo = '') => {
    try {
      const reservaRef = doc(db, "reservas", reservaId);
      const agora = new Date();
      
      await updateDoc(reservaRef, {
        status: "confirmada", // Volta para confirmada para o motorista corrigir
        dataRejeicao: agora,
        rejeitadoPor: "admin",
        motivoRejeicao: motivo,
        aguardandoAprovacao: false,
        conclusaoRejeitada: true,
        lastUpdated: agora,
        statusHistory: {
          status: "confirmada",
          date: agora,
          updatedBy: "admin",
          observation: `Conclusão rejeitada pelo dono da agência: ${motivo}`
        }
      });
      
      alert(`❌ Conclusão REJEITADA!\n\n📝 Motivo: ${motivo}\n🔄 Status voltou para "Confirmada" para o motorista corrigir.\n🔔 O motorista será notificado.`);
    } catch (error) {
      console.error("Erro ao rejeitar viagem:", error);
      alert("Erro ao rejeitar conclusão da viagem. Tente novamente.");
    }
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

  const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return value ? String(value) : 'R$ 0,00';
    }
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getReservationValor = (reserva) => {
    const rawValor = reserva.valorTotal ?? reserva.valorComDesconto ?? reserva.valor ?? reserva.preco ?? reserva.pacotePreco ?? reserva.valorTotal;
    const number = Number(rawValor);
    return Number.isFinite(number) ? number : null;
  };

  const getReservationValorText = (reserva) => {
    const valor = getReservationValor(reserva);
    return valor === null ? 'Sob consulta' : formatCurrency(valor);
  };

  const exportReservationPdf = async (reserva) => {
    if (!reserva) return;

    const footerRef = doc(db, 'content', 'footer');
    const footerDoc = await getDoc(footerRef);
    const footerData = footerDoc.exists() ? footerDoc.data() : {};

    const companyName = footerData?.companyName || '20 Buscar';
    const companyEmail = footerData?.contact?.email || 'contato@20buscarvacationbeach.com.br';
    const companyPhone = footerData?.contact?.phone || '';
    const companyWhatsApp = footerData?.social?.whatsapp?.link || '';
    const companyAddress = footerData?.contact?.address || '';
    const osNumber = String(reserva.numeroOS || reserva.numeroOs || reserva.osNumero || reserva.os || reserva.ordemServico || '00001').padStart(5, '0');

    const pdfDoc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;
    const dateNow = new Date().toLocaleDateString('pt-BR');
    const notes = reserva.observacoes || reserva.mensagemOrigem || 'Nenhuma observação informada.';

    pdfDoc.setFillColor(14, 86, 157);
    pdfDoc.rect(margin, 32, contentWidth, 64, 'F');

    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(18);
    pdfDoc.text('ORDEM DE SERVIÇO / PROPOSTA DE SERVIÇO', margin + 16, 58);
    pdfDoc.setFontSize(9);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.text(`Emitida em ${dateNow}`, margin + 16, 80);
    pdfDoc.text(`Nº OS ${osNumber}`, pageWidth - margin - 120, 58);

    pdfDoc.setTextColor(80, 80, 80);
    pdfDoc.setFontSize(9);
    pdfDoc.text(companyName, margin + 16, 100);
    pdfDoc.text(`E-mail: ${companyEmail}`, margin + 16, 114);
    if (companyPhone) {
      pdfDoc.text(`Telefone: ${companyPhone}`, margin + 16, 128);
    }
    if (companyWhatsApp) {
      pdfDoc.text(`WhatsApp: ${companyWhatsApp}`, margin + 16, companyPhone ? 142 : 128);
    }
    if (companyAddress) {
      const addressY = companyWhatsApp ? (companyPhone ? 156 : 142) : (companyPhone ? 142 : 128);
      pdfDoc.text(`Endereço: ${companyAddress}`, margin + 16, addressY);
    }

    const cardStyle = (x, y, w, h) => {
      pdfDoc.setFillColor(248, 250, 252);
      pdfDoc.setDrawColor(218, 224, 232);
      pdfDoc.roundedRect(x, y, w, h, 8, 8, 'FD');
    };

    const addSectionTitle = (x, y, text) => {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(11);
      pdfDoc.setTextColor(18, 58, 110);
      pdfDoc.text(text, x, y);
    };

    const addField = (x, y, label, value, maxWidth = 180) => {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.setFontSize(8.5);
      pdfDoc.setTextColor(80, 80, 80);
      pdfDoc.text(`${label}:`, x, y);
      pdfDoc.setFont('helvetica', 'normal');
      const textValue = String(value ?? 'Não informado');
      const wrappedValue = pdfDoc.splitTextToSize(textValue, maxWidth);
      pdfDoc.text(wrappedValue, x + 70, y);
    };

    const leftX = margin;
    const rightX = margin + 260;
    const leftW = 220;
    const rightW = 240;
    const cardY = 128;
    const cardH = 120;

    cardStyle(leftX, cardY, leftW, cardH);
    addSectionTitle(leftX + 14, cardY + 20, 'Dados do cliente');
    addField(leftX + 14, cardY + 42, 'Nome', reserva.clienteNome || reserva.nome || reserva.nomeCliente || 'Não informado', 180);
    addField(leftX + 14, cardY + 60, 'Telefone', reserva.clienteTelefone || reserva.telefone || 'Não informado', 180);
    addField(leftX + 14, cardY + 78, 'E-mail', reserva.clienteEmail || reserva.email || 'Não informado', 180);
    addField(leftX + 14, cardY + 96, 'Tipo', reserva.tipoReserva || reserva.tipoViagem || 'Reserva', 180);

    cardStyle(rightX, cardY, rightW, cardH);
    addSectionTitle(rightX + 14, cardY + 20, 'Dados da reserva');
    addField(rightX + 14, cardY + 42, 'Pacote', reserva.pacoteTitulo || reserva.pacoteId || 'Não informado', 180);
    addField(rightX + 14, cardY + 60, 'Origem', reserva.origem || reserva.enderecoOrigem || 'Não informado', 180);
    addField(rightX + 14, cardY + 78, 'Destino', reserva.destino || reserva.enderecoDestino || reserva.pacoteTitulo || 'Não informado', 180);
    addField(rightX + 14, cardY + 96, 'Passageiros', reserva.totalPassageiros || reserva.passageirosFormatado || '1', 180);

    const valuesY = 270;
    cardStyle(margin, valuesY, contentWidth, 92);
    addSectionTitle(margin + 14, valuesY + 20, 'Valores');
    const valuesX = margin + 14;
    const valuesLineY = valuesY + 44;
    pdfDoc.setFont('helvetica', 'bold');
    pdfDoc.setFontSize(8.5);
    pdfDoc.setTextColor(80, 80, 80);
    pdfDoc.text('Valor total:', valuesX, valuesLineY);
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.text(getReservationValorText(reserva), valuesX + 70, valuesLineY);

    if (reserva.valorOrcamento !== undefined && reserva.valorOrcamento !== null && reserva.valorOrcamento !== '') {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Valor do orçamento:', valuesX + 220, valuesLineY);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(formatCurrency(reserva.valorOrcamento), valuesX + 330, valuesLineY);
    }

    if (reserva.valorSinal !== undefined && reserva.valorSinal !== null) {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Sinal:', valuesX, valuesLineY + 16);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(formatCurrency(reserva.valorSinal), valuesX + 70, valuesLineY + 16);
    }

    if (reserva.valorRestante !== undefined && reserva.valorRestante !== null) {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Restante:', valuesX + 220, valuesLineY + 16);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(formatCurrency(reserva.valorRestante), valuesX + 330, valuesLineY + 16);
    }

    if (reserva.valorComDesconto !== undefined && reserva.valorComDesconto !== null) {
      pdfDoc.setFont('helvetica', 'bold');
      pdfDoc.text('Com desconto:', valuesX, valuesLineY + 32);
      pdfDoc.setFont('helvetica', 'normal');
      pdfDoc.text(formatCurrency(reserva.valorComDesconto), valuesX + 70, valuesLineY + 32);
    }

    const notesY = 390;
    cardStyle(margin, notesY, contentWidth, 96);
    addSectionTitle(margin + 14, notesY + 20, 'Observações');
    pdfDoc.setFont('helvetica', 'normal');
    pdfDoc.setFontSize(8.5);
    const noteLines = pdfDoc.splitTextToSize(notes, 500);
    pdfDoc.text(noteLines, margin + 14, notesY + 44);

    pdfDoc.setFontSize(8);
    pdfDoc.setTextColor(120, 120, 120);
    pdfDoc.text('Este documento é uma proposta de ordem de serviço. Valores podem ser confirmados após o contato com o cliente.', margin, pageHeight - 54);

    const fileName = `Ordem_de_Servico_${reserva.id}_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.pdf`;
    pdfDoc.save(fileName);
  };

  const exportSelectedReservationPdf = () => {
    if (!selectedReserva) {
      alert('Selecione uma reserva para exportar o PDF de ordem de serviço.');
      return;
    }
    exportReservationPdf(selectedReserva);
  };

  const exportReservationsCSV = () => {
    if (!reservasFiltradas.length) {
      alert('Nenhuma reserva para exportar. Ajuste os filtros ou aguarde reservas aparecerem.');
      return;
    }

    const columns = [
      'ID',
      'Cliente',
      'Telefone',
      'E-mail',
      'Tipo de Reserva',
      'Pacote',
      'Data',
      'Hora',
      'Origem',
      'Destino',
      'Pagamento',
      'Passageiros',
      'Valor Total',
      'Valor Sinal',
      'Valor Restante',
      'Valor com Desconto',
      'Status',
      'Motorista',
      'Observações'
    ];

    const rows = reservasFiltradas.map((r) => [
      r.id,
      r.clienteNome || r.nome || r.nomeCliente || '',
      r.telefone || r.clienteTelefone || '',
      r.clienteEmail || r.email || '',
      r.tipoReserva || r.tipoViagem || '',
      r.pacoteTitulo || r.pacoteId || '',
      r.dataReserva || r.data || r.dataIda || '',
      r.hora || r.horario || r.horaIda || '',
      r.origem || r.enderecoOrigem || '',
      r.destino || r.enderecoDestino || r.pontoDestino || '',
      r.pagamento || r.metodoPagamento || '',
      r.totalPassageiros || r.passageirosFormatado || '',
      getReservationValorText(r),
      r.valorSinal !== undefined && r.valorSinal !== null ? formatCurrency(r.valorSinal) : '',
      r.valorRestante !== undefined && r.valorRestante !== null ? formatCurrency(r.valorRestante) : '',
      r.valorComDesconto !== undefined && r.valorComDesconto !== null ? formatCurrency(r.valorComDesconto) : '',
      r.status || '',
      r.motoristaNome || r.motoristaId || '',
      r.observacoes || ''
    ]);

    const csvContent = [columns, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservas_${new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Funções de filtro avançado
  const aplicarFiltros = useCallback(() => {
    let reservasFiltradas = [...reservas];

    // Filtro por status
    if (filtros.status !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(r => r.status === filtros.status);
    }

    // Filtro por período
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    if (filtros.periodo !== 'todas') {
      reservasFiltradas = reservasFiltradas.filter(r => {
        const dataReserva = r.dataReserva || r.data || r.createdAt;
        if (!dataReserva) return false;

        let dataComparacao;
        if (typeof dataReserva === 'string') {
          dataComparacao = new Date(dataReserva);
        } else if (dataReserva.toDate) {
          dataComparacao = dataReserva.toDate();
        } else {
          dataComparacao = new Date(dataReserva);
        }

        switch (filtros.periodo) {
          case 'hoje':
            return dataComparacao >= inicioHoje && dataComparacao <= fimHoje;
          case 'ontem':
            const ontem = new Date(hoje);
            ontem.setDate(hoje.getDate() - 1);
            const inicioOntem = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate());
            const fimOntem = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate(), 23, 59, 59);
            return dataComparacao >= inicioOntem && dataComparacao <= fimOntem;
          case 'semana':
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - 7);
            return dataComparacao >= inicioSemana;
          case 'mes':
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            return dataComparacao >= inicioMes;
          case 'personalizado':
            if (filtros.dataInicio && filtros.dataFim) {
              const inicio = new Date(filtros.dataInicio);
              const fim = new Date(filtros.dataFim);
              fim.setHours(23, 59, 59);
              return dataComparacao >= inicio && dataComparacao <= fim;
            }
            return true;
          default:
            return true;
        }
      });
    }

    // Filtro por motorista
    if (filtros.motorista !== 'todos') {
      if (filtros.motorista === 'sem_motorista') {
        reservasFiltradas = reservasFiltradas.filter(r => !r.motoristaId);
      } else {
        reservasFiltradas = reservasFiltradas.filter(r => r.motoristaId === filtros.motorista);
      }
    }

    // Filtro por pagamento
    if (filtros.pagamento !== 'todos') {
      reservasFiltradas = reservasFiltradas.filter(r => r.pagamento === filtros.pagamento);
    }

    // Filtro por valor
    if (filtros.valor !== 'todos') {
      reservasFiltradas = reservasFiltradas.filter(r => {
        const valor = getReservationValor(r) ?? 0;
        switch (filtros.valor) {
          case 'ate_50':
            return valor <= 50;
          case '50_100':
            return valor > 50 && valor <= 100;
          case '100_200':
            return valor > 100 && valor <= 200;
          case 'acima_200':
            return valor > 200;
          default:
            return true;
        }
      });
    }

    // Filtro por busca textual
    if (filtros.busca.trim()) {
      const busca = filtros.busca.toLowerCase().trim();
      reservasFiltradas = reservasFiltradas.filter(r => 
        (r.clienteNome || r.nome || '').toLowerCase().includes(busca) ||
        (r.clienteEmail || r.email || '').toLowerCase().includes(busca) ||
        (r.telefone || r.clienteTelefone || '').includes(busca) ||
        (r.enderecoOrigem || '').toLowerCase().includes(busca) ||
        (r.enderecoDestino || r.pacoteTitulo || '').toLowerCase().includes(busca) ||
        (r.observacoes || '').toLowerCase().includes(busca)
      );
    }

    setReservasFiltradas(reservasFiltradas);
  }, [reservas, filtros]); // Incluindo dependências do useCallback

  // Aplicar filtros sempre que mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]); // Simplificando as dependências

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltros({
      status: 'todas',
      periodo: 'todas',
      dataInicio: '',
      dataFim: '',
      motorista: 'todos',
      pagamento: 'todos',
      valor: 'todos',
      busca: ''
    });
  };

  // Função para atualizar filtros
  const atualizarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    // Reset do estado "mostrar todas" quando filtros mudam
    setMostrarTodasReservas(false);
  };

  // Controlar quantas reservas mostrar
  const reservasParaMostrar = mostrarTodasReservas 
    ? reservasFiltradas 
    : reservasFiltradas.slice(0, 2);

  const temMaisReservas = reservasFiltradas.length > 2;

  // Controlar quantos motoristas mostrar
  const motoristasParaMostrar = mostrarTodosMotoristas 
    ? motoristas 
    : motoristas.slice(0, 2);

  const temMaisMotoristas = motoristas.length > 2;

  // Resumos - usando dados filtrados e totais
  const totalReservas = reservas.length;
  const totalMotoristas = motoristas.length;
  const reservasPendentes = reservas.filter(r => r.status === 'pendente').length;
  const reservasDelegadas = reservas.filter(r => r.status === 'delegada').length;

  // Resumos das reservas filtradas
  const totalFiltradas = reservasFiltradas.length;
  const pendentesFiltradas = reservasFiltradas.filter(r => r.status === 'pendente').length;
  const delegadasFiltradas = reservasFiltradas.filter(r => r.status === 'delegada').length;
  const confirmadasFiltradas = reservasFiltradas.filter(r => r.status === 'confirmada').length;

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
            {/* <li><button onClick={() => goTo("/admin/edit-banner")}> <FiClipboard className="sidebar-icon" /> Editar Banner</button></li> */}
            <li><button onClick={() => goTo("/admin/edit-boxes")}> <FiClipboard className="sidebar-icon" /> Editar Boxes</button></li>
            <li><button onClick={() => goTo("/admin/edit-about")}> <FiUser className="sidebar-icon" /> Editar Sobre</button></li>
            <li><button onClick={() => goTo("/admin/edit-footer")}> <FiClipboard className="sidebar-icon" /> Editar Rodapé</button></li>
            <li><button onClick={() => goTo("/admin/edit-hours")}> <FiBarChart2 className="sidebar-icon" /> Editar Horários</button></li>
            <li><button onClick={() => goTo("/admin/edit-whatsapp")}> <FiUsers className="sidebar-icon" /> Editar WhatsApp</button></li>
            <li><button onClick={() => goTo("/admin/edit-carousel")}> <FiBarChart2 className="sidebar-icon" /> Editar Carrossel</button></li>
            <li><button onClick={() => goTo("/admin/hero-slides")}> <FiImage className="sidebar-icon" /> Adicionar Banners</button></li>
            <li><button onClick={() => goTo("/admin/pacotes")}> <FiClipboard className="sidebar-icon" /> Pacotes</button></li>
            <li><button onClick={() => goTo("/admin/parceiros")}> <FiUsers className="sidebar-icon" /> Parceiros</button></li>
            {/* <li><button onClick={() => goTo("/admin/viagens")}> <FiUser className="sidebar-icon" /> Viagens</button></li> */}
            <li><button onClick={() => goTo("/admin/blog")}> <FiClipboard className="sidebar-icon" /> Blog</button></li>
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
          <div className="card-resumo card-approval">
            <FiUser className="card-icon" />
            <h3>Aguardando Aprovação</h3>
            <p>{reservas.filter(r => (r.status === 'concluida' && r.aguardandoAprovacao) || r.status === 'aguardando_aprovacao').length}</p>
          </div>
          <div className="card-resumo card-4">
            <FiUsers className="card-icon" />
            <h3>Motoristas</h3>
            <p>{totalMotoristas}</p>
          </div>
        </div>

        {/* Seção de Aprovações Pendentes - DESTAQUE */}
        {reservas.filter(r => (r.status === 'concluida' && r.aguardandoAprovacao) || r.status === 'aguardando_aprovacao').length > 0 && (
          <section className="approval-pending-section">
            <div className="approval-header">
              <h2>🚨 Aprovações Pendentes - Ação Necessária!</h2>
              <span className="approval-count">
                {reservas.filter(r => (r.status === 'concluida' && r.aguardandoAprovacao) || r.status === 'aguardando_aprovacao').length} 
                {' '}viagem(ns) aguardando sua aprovação
              </span>
            </div>
            <div className="approval-list">
              {reservas
                .filter(r => (r.status === 'concluida' && r.aguardandoAprovacao) || r.status === 'aguardando_aprovacao')
                .map(reserva => (
                  <div key={reserva.id} className="approval-card">
                    <div className="approval-info">
                      <div className="approval-main">
                        <h4>🚗 {reserva.clienteNome || 'Cliente'} → {reserva.destino || reserva.enderecoDestino}</h4>
                        <p><strong>Motorista:</strong> {reserva.motoristaNome || 'N/A'}</p>
                        <p><strong>Valor:</strong> {getReservationValorText(reserva)}</p>
                        {reserva.dataConclusao && (
                          <p><strong>Concluída em:</strong> {new Date(reserva.dataConclusao.toDate ? reserva.dataConclusao.toDate() : reserva.dataConclusao).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="approval-actions-quick">
                      <button 
                        className="btn-approve-quick"
                        onClick={() => aprovarViagem(reserva.id)}
                        title="Aprovar e liberar pagamento"
                      >
                        ✅ Aprovar
                      </button>
                      <button 
                        className="btn-reject-quick"
                        onClick={() => {
                          const motivo = prompt('Motivo da rejeição:');
                          if (motivo) rejeitarViagem(reserva.id, motivo);
                        }}
                        title="Rejeitar conclusão"
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        )}

        <div className="dashboard-graph-section">
          <h2>Status das Reservas</h2>
          <div className="dashboard-graph-wrapper">
            <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <section className="dashboard-section latest-reservas">
          <div className="section-header">
            <h2>Últimas Reservas Recebidas</h2>
            <span className="badge-count">{reservasFiltradas.slice(0, 5).length}</span>
          </div>
          <div className="latest-reservas-grid">
            {reservasFiltradas.slice(0, 5).map((r) => (
              <div key={r.id} className="latest-reserva-card">
                <div className="latest-reserva-title">
                  <strong>{r.clienteNome || r.nome || r.nomeCliente || 'Cliente'}</strong>
                  <span>{r.tipoReserva ? r.tipoReserva.charAt(0).toUpperCase() + r.tipoReserva.slice(1) : 'Reserva'}</span>
                </div>
                <div className="latest-reserva-detail">{r.dataReserva || r.data || ''} {r.hora || r.horario || ''}</div>
                <div className="latest-reserva-detail">{r.origem || 'Origem não informada'} → {r.destino || r.enderecoDestino || r.pacoteTitulo || 'Destino não informado'}</div>
                <div className="latest-reserva-status">Status: {r.status || 'pendente'}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="dashboard-section modern-reservas">
          <div className="section-header">
            <h2>Reservas</h2>
            <div className="header-controls">
              <span className="badge-count">{totalFiltradas} de {reservas.length}</span>
              <button 
                className="filter-toggle-btn"
                onClick={exportReservationsCSV}
                title="Exportar reservas filtradas como CSV"
              >
                <FiDownload style={{ marginRight: 6 }} /> Exportar CSV
              </button>
              <button 
                className="filter-toggle-btn"
                onClick={exportSelectedReservationPdf}
                title="Exportar o PDF de ordem de serviço da reserva selecionada"
              >
                <FiDownload style={{ marginRight: 6 }} /> Exportar PDF
              </button>
              <button 
                className="filter-toggle-btn"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
              >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
          </div>
          
          {/* Painel de Filtros Avançados */}
          {mostrarFiltros && (
            <div className="filters-panel">
              <div className="filters-grid">
                {/* Linha 1: Status, Período, Busca */}
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    value={filtros.status} 
                    onChange={(e) => atualizarFiltro('status', e.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="pendente">Pendentes</option>
                    <option value="delegada">Delegadas</option>
                    <option value="confirmada">Confirmadas</option>
                    <option value="cancelada">Canceladas</option>
                    <option value="concluida">Concluídas</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Período:</label>
                  <select 
                    value={filtros.periodo} 
                    onChange={(e) => atualizarFiltro('periodo', e.target.value)}
                  >
                    <option value="todas">Todas</option>
                    <option value="hoje">Hoje</option>
                    <option value="ontem">Ontem</option>
                    <option value="semana">Última semana</option>
                    <option value="mes">Este mês</option>
                    <option value="personalizado">Período personalizado</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Buscar:</label>
                  <input 
                    type="text"
                    placeholder="Nome, email, telefone, endereço..."
                    value={filtros.busca}
                    onChange={(e) => atualizarFiltro('busca', e.target.value)}
                  />
                </div>
                
                {/* Linha 2: Datas personalizadas (se selecionado) */}
                {filtros.periodo === 'personalizado' && (
                  <>
                    <div className="filter-group">
                      <label>Data início:</label>
                      <input 
                        type="date"
                        value={filtros.dataInicio}
                        onChange={(e) => atualizarFiltro('dataInicio', e.target.value)}
                      />
                    </div>
                    <div className="filter-group">
                      <label>Data fim:</label>
                      <input 
                        type="date"
                        value={filtros.dataFim}
                        onChange={(e) => atualizarFiltro('dataFim', e.target.value)}
                      />
                    </div>
                  </>
                )}
                
                {/* Linha 3: Motorista, Pagamento, Valor */}
                <div className="filter-group">
                  <label>Motorista:</label>
                  <select 
                    value={filtros.motorista} 
                    onChange={(e) => atualizarFiltro('motorista', e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="sem_motorista">Sem motorista</option>
                    {motoristas.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Pagamento:</label>
                  <select 
                    value={filtros.pagamento} 
                    onChange={(e) => atualizarFiltro('pagamento', e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Valor:</label>
                  <select 
                    value={filtros.valor} 
                    onChange={(e) => atualizarFiltro('valor', e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="ate_50">Até R$ 50</option>
                    <option value="50_100">R$ 50 - R$ 100</option>
                    <option value="100_200">R$ 100 - R$ 200</option>
                    <option value="acima_200">Acima de R$ 200</option>
                  </select>
                </div>
              </div>
              
              {/* Resumo dos filtros e ações */}
              <div className="filters-summary">
                <div className="filters-results">
                  <span>📊 <strong>{totalFiltradas}</strong> reservas encontradas</span>
                  {pendentesFiltradas > 0 && <span>⏳ {pendentesFiltradas} pendentes</span>}
                  {delegadasFiltradas > 0 && <span>🚗 {delegadasFiltradas} delegadas</span>}
                  {confirmadasFiltradas > 0 && <span>✅ {confirmadasFiltradas} confirmadas</span>}
                </div>
                <button className="clear-filters-btn" onClick={limparFiltros}>
                  Limpar Filtros
                </button>
              </div>
            </div>
          )}
          
          <div className="modern-table-container">
            {reservasFiltradas.length === 0 ? (
              <div className="empty-state">
                <FiClipboard className="empty-icon" />
                <p>Nenhuma reserva encontrada</p>
                <span className="empty-subtitle">
                  {filtros.status !== 'todas' || filtros.periodo !== 'todas' || filtros.busca 
                    ? 'Tente ajustar os filtros para ver mais resultados'
                    : 'As reservas aparecerão aqui quando criadas'
                  }
                </span>
              </div>
            ) : (
              <>
                <div className="modern-table">
                  <div className="table-header">
                    <div className="th">Cliente</div>
                    <div className="th">Passageiros</div>
                    <div className="th">Data/Hora</div>
                    <div className="th">Trajeto</div>
                    <div className="th">Status</div>
                    <div className="th">Valor</div>
                    <div className="th">Ações</div>
                  </div>
                  {reservasParaMostrar.map(r => (
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
                        <div className="passengers-info">
                          <span className="passengers-count">
                            {r.passageirosFormatado || 
                            (r.totalPassageiros && r.adultos !== undefined && r.criancas !== undefined && r.infantis !== undefined) 
                              ? `${r.totalPassageiros}(${r.adultos}-${r.criancas}-${r.infantis})`
                              : '1(1-0-0)'}
                          </span>
                          <span className="passengers-label">Adt-Chd-Inf</span>
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
                           r.status === 'confirmada' ? 'Confirmada' :
                           r.status === 'aguardando_aprovacao' ? 'Aguardando Aprovação' :
                           r.status === 'aprovada' ? 'Aprovada' :
                           r.status === 'pendente_correcao' ? 'Pendente Correção' :
                           r.status}
                        </span>
                      </div>
                      <div className="td">
                        <span className="value-cell">{getReservationValorText(r)}</span>
                      </div>
                      <div className="td">
                        <div className="action-buttons">
                          {(r.status === 'concluida' && r.aguardandoAprovacao) || r.status === 'aguardando_aprovacao' ? (
                            <div className="approval-actions">
                              <button 
                                className="action-btn approve" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  aprovarViagem(r.id);
                                }}
                                title="Aprovar conclusão do motorista e liberar pagamento"
                              >
                                ✅ Aprovar Conclusão
                              </button>
                              <button 
                                className="action-btn reject" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  const motivo = prompt('Motivo da rejeição da conclusão:');
                                  if (motivo) rejeitarViagem(r.id, motivo);
                                }}
                                title="Rejeitar conclusão do motorista"
                              >
                                ❌ Rejeitar Conclusão
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button className="action-btn primary" onClick={(e) => {e.stopPropagation(); handleOpenReserva(r);}}>
                                Gerenciar
                              </button>
                              <button 
                                className="action-btn secondary" 
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  handleConverterParaViagem(r);
                                }}
                                title="Converter em viagem completa"
                              >
                                🚗 Viagem
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Botão Ver Mais / Ver Menos */}
                {temMaisReservas && (
                  <div className="show-more-section">
                    <button 
                      className="show-more-btn"
                      onClick={() => setMostrarTodasReservas(!mostrarTodasReservas)}
                    >
                      {mostrarTodasReservas 
                        ? `Ver menos (ocultar ${reservasFiltradas.length - 2} reservas)` 
                        : `Ver mais ${reservasFiltradas.length - 2} reservas`
                      }
                    </button>
                    <span className="show-more-info">
                      Mostrando {mostrarTodasReservas ? reservasFiltradas.length : 2} de {reservasFiltradas.length} reservas
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Modal Detalhes da Reserva */}
          <Modal open={!!selectedReserva} onClose={handleCloseReserva}>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, minWidth: 320, maxWidth: 420 }}>
              {selectedReserva && (
                <>
                  <Typography variant="h6" mb={2}>Detalhes da Reserva</Typography>
                  <Typography><b>Cliente:</b> {selectedReserva.clienteNome || selectedReserva.nome || selectedReserva.nomeCliente}</Typography>
                  <Typography><b>Passageiros:</b> {
                    selectedReserva.passageirosFormatado || 
                    (selectedReserva.totalPassageiros && selectedReserva.adultos !== undefined && selectedReserva.criancas !== undefined && selectedReserva.infantis !== undefined) 
                      ? `${selectedReserva.totalPassageiros}(${selectedReserva.adultos}-${selectedReserva.criancas}-${selectedReserva.infantis})`
                      : '1(1-0-0)'
                  }</Typography>
                  <Typography><b>Tipo de reserva:</b> {selectedReserva.tipoReserva || selectedReserva.tipoViagem || 'Reserva'}</Typography>
                  <Typography><b>Data de ida:</b> {selectedReserva.dataReserva || selectedReserva.data || ''}</Typography>
                  <Typography><b>Hora de ida:</b> {selectedReserva.hora || selectedReserva.horario || ''}</Typography>
                  <Typography><b>Data de volta:</b> {selectedReserva.dataVolta || selectedReserva.data_retorno || 'Não informada'}</Typography>
                  <Typography><b>Hora de volta:</b> {selectedReserva.horaVolta || selectedReserva.hora_retorno || 'Não informada'}</Typography>
                  <Typography><b>Origem:</b> {selectedReserva.enderecoOrigem || selectedReserva.origem || 'Não informado'}</Typography>
                  <Typography><b>Destino:</b> {selectedReserva.enderecoDestino || selectedReserva.destino || selectedReserva.pacoteTitulo || 'Não informado'}</Typography>
                  <Typography><b>Status:</b> {selectedReserva.status}</Typography>
                  <Typography><b>Valor total:</b> {getReservationValorText(selectedReserva)}</Typography>
                  {selectedReserva.valorOrcamento !== undefined && selectedReserva.valorOrcamento !== null && selectedReserva.valorOrcamento !== '' && (
                    <Typography><b>Valor do orçamento:</b> {formatCurrency(selectedReserva.valorOrcamento)}</Typography>
                  )}
                  {selectedReserva.valorSinal !== undefined && selectedReserva.valorSinal !== null && (
                    <Typography><b>Sinal:</b> {formatCurrency(selectedReserva.valorSinal)}</Typography>
                  )}
                  {selectedReserva.valorRestante !== undefined && selectedReserva.valorRestante !== null && (
                    <Typography><b>Restante:</b> {formatCurrency(selectedReserva.valorRestante)}</Typography>
                  )}
                  {selectedReserva.valorComDesconto !== undefined && selectedReserva.valorComDesconto !== null && (
                    <Typography><b>Valor com desconto:</b> {formatCurrency(selectedReserva.valorComDesconto)}</Typography>
                  )}
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
                  <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                    <Button variant="contained" onClick={() => exportReservationPdf(selectedReserva)}>
                      Exportar Ordem de Serviço
                    </Button>
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
              <>
                {motoristasParaMostrar.map(m => (
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
                ))}
                
                {/* Botão Ver Mais para Motoristas */}
                {temMaisMotoristas && (
                  <div className="show-more-section motoristas-show-more">
                    <button 
                      className="show-more-btn"
                      onClick={() => setMostrarTodosMotoristas(!mostrarTodosMotoristas)}
                    >
                      {mostrarTodosMotoristas 
                        ? `Ver menos (ocultar ${motoristas.length - 2} motoristas)` 
                        : `Ver mais ${motoristas.length - 2} motoristas`
                      }
                    </button>
                    <span className="show-more-info">
                      Mostrando {mostrarTodosMotoristas ? motoristas.length : 2} de {motoristas.length} motoristas
                    </span>
                  </div>
                )}
              </>
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

      {/* Modal de Conversão para Viagem */}
      <ViagemConverter
        reserva={reservaParaConverter}
        open={showViagemConverter}
        onClose={() => {
          setShowViagemConverter(false);
          setReservaParaConverter(null);
        }}
        onSuccess={handleConversaoSucesso}
      />
    </div>
  );
};

export default AdminDashboard;