import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import Chart from "chart.js/auto";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import zoomPlugin from "chartjs-plugin-zoom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./SalesReports.css";

// Registrar componentes do Chart.js e plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
  zoomPlugin
);

const SalesReports = () => {
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState({});
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filterType, setFilterType] = useState("custom");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Novo estado para barra de pesquisa
  const [presentationMode, setPresentationMode] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const revenueChartRef = useRef(null);
  const productChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const variantChartRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const salesRef = doc(db, "lojinha", "sales");
    const productsRef = doc(db, "lojinha", "produtos");
    const clientsRef = doc(db, "lojinha", "clients");

    const unsubscribeSales = onSnapshot(
      salesRef,
      (docSnap) => {
        setSales(docSnap.exists() ? docSnap.data().sales || [] : []);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar vendas:", error);
        setLoading(false);
      }
    );

    const unsubscribeProducts = onSnapshot(
      productsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const categoriesData = docSnap.data().categories || {};
          setCategories(categoriesData);
        }
      },
      (error) => {
        console.error("Erro ao carregar categorias:", error);
      }
    );

    const unsubscribeClients = onSnapshot(
      clientsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const clientsData = docSnap.data().clients || [];
          setClients(clientsData.sort((a, b) => a.name.localeCompare(b.name)));
        }
      },
      (error) => {
        console.error("Erro ao carregar clientes:", error);
      }
    );

    return () => {
      unsubscribeSales();
      unsubscribeProducts();
      unsubscribeClients();
    };
  }, []);

  useEffect(() => {
    if (!loading && sales.length > 0) {
      renderCharts();
    }
    return () => {
      if (revenueChartRef.current) revenueChartRef.current.destroy();
      if (productChartRef.current) productChartRef.current.destroy();
      if (categoryChartRef.current) categoryChartRef.current.destroy();
      if (variantChartRef.current) variantChartRef.current.destroy();
    };
  }, [sales, dateRange, filterType, selectedCategory, selectedClient, searchTerm]);

  const filterSales = () => {
    const [startDate, endDate] = dateRange;
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      let matchesDate = false;
      switch (filterType) {
        case "Dia":
          matchesDate = saleDate.toDateString() === now.toDateString();
          break;
        case "Semana":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          matchesDate = saleDate >= weekStart;
          break;
        case "Mês":
          matchesDate =
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear();
          break;
        case "Customizado":
          matchesDate = saleDate >= startDate && saleDate <= endDate;
          break;
        default:
          matchesDate = true;
      }

      const matchesCategory =
        selectedCategory === "all" ||
        sale.items.some((item) => {
          const category = Object.keys(categories).find((cat) => {
            return categories[cat]?.products && categories[cat].products[item.name];
          });
          return category === selectedCategory;
        });

      const matchesClient =
        selectedClient === "all" ||
        (sale.client && sale.client.id === selectedClient);

      const matchesSearch = searchTerm
        ? sale.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (sale.note && sale.note.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      return matchesDate && matchesCategory && matchesClient && matchesSearch;
    });
  };

  const filteredSales = filterSales();

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = filteredSales.reduce(
    (sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0),
    0
  );
  const averageTicket = totalRevenue / (filteredSales.length || 1);
  const receivedRevenue = filteredSales
    .filter((sale) => sale.paymentStatus === "paid")
    .reduce((sum, sale) => sum + sale.total, 0);
  const pendingRevenue = filteredSales
    .filter((sale) => sale.paymentStatus === "pending")
    .reduce((sum, sale) => sum + sale.total, 0);
  const salesByProduct = filteredSales.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      const key = `${item.name} (${item.variant?.color || "N/A"}, ${
        item.variant?.size || "N/A"
      })`;
      acc[key] = (acc[key] || 0) + (item.quantity || 1);
    });
    return acc;
  }, {});
  const salesByDay = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {});
  const salesByCategory = filteredSales.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      const category = Object.keys(categories).find((cat) => {
        return categories[cat]?.products && categories[cat].products[item.name];
      });
      if (category) {
        acc[category] =
          (acc[category] || 0) + (item.quantity || 1) * (item.variant?.price || 0);
      }
    });
    return acc;
  }, {});
  const salesByVariant = filteredSales.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      const key = `${item.variant?.color || "N/A"} (${item.variant?.size || "N/A"})`;
      acc[key] = (acc[key] || 0) + (item.quantity || 1);
    });
    return acc;
  }, {});

  const forecastSales = () => {
    const dailyRevenues = Object.values(salesByDay);
    if (dailyRevenues.length < 3) return 0;
    const movingAverage =
      dailyRevenues.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    return movingAverage;
  };

  const generateInsights = () => {
    const insights = [];
    const topProduct = Object.entries(salesByProduct).sort((a, b) => b[1] - a[1])[0];
    if (topProduct) {
      insights.push(`Produto mais vendido: ${topProduct[0]} com ${topProduct[1]} unidades.`);
    }
    const topCategory = Object.entries(salesByCategory).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push(
        `Categoria mais lucrativa: ${topCategory[0]} com R$${topCategory[1].toFixed(2)} em vendas.`
      );
    }
    const previousPeriodSales = sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      const [startDate] = dateRange;
      const previousStart = new Date(startDate);
      previousStart.setDate(startDate.getDate() - (dateRange[1] - dateRange[0]));
      return saleDate >= previousStart && saleDate < startDate;
    });
    const previousRevenue = previousPeriodSales.reduce(
      (sum, sale) => sum + sale.total,
      0
    );
    const revenueChange =
      ((totalRevenue - previousRevenue) / (previousRevenue || 1)) * 100;
    if (revenueChange > 0) {
      insights.push(
        `As vendas aumentaram ${revenueChange.toFixed(1)}% em relação ao período anterior.`
      );
    } else if (revenueChange < 0) {
      insights.push(
        `As vendas diminuíram ${Math.abs(revenueChange).toFixed(1)}% em relação ao período anterior.`
      );
    }
    return insights;
  };

  const renderCharts = () => {
    if (revenueChartRef.current) revenueChartRef.current.destroy();
    if (productChartRef.current) productChartRef.current.destroy();
    if (categoryChartRef.current) categoryChartRef.current.destroy();
    if (variantChartRef.current) variantChartRef.current.destroy();

    const ctxRevenue = document.getElementById("revenueChart")?.getContext("2d");
    if (ctxRevenue) {
      revenueChartRef.current = new Chart(ctxRevenue, {
        type: "line",
        data: {
          labels: Object.keys(salesByDay),
          datasets: [
            {
              label: "Receita por Dia (R$)",
              data: Object.values(salesByDay),
              borderColor: "#3498db",
              backgroundColor: "rgba(52, 152, 219, 0.1)",
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#2c3e50",
              titleFont: { size: 12, family: "'Roboto', sans-serif" },
              bodyFont: { size: 10, family: "'Roboto', sans-serif" },
              padding: 6,
            },
            datalabels: { display: false },
            zoom: { zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" } },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#ecf0f1", drawBorder: false },
              ticks: { color: "#7f8c8d", font: { size: 11, family: "'Roboto', sans-serif" } },
            },
            x: {
              grid: { display: false },
              ticks: {
                color: "#7f8c8d",
                font: { size: 11, family: "'Roboto', sans-serif" },
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
          animation: { duration: 800, easing: "easeOutCubic" },
        },
      });
    }

    const ctxProducts = document.getElementById("productChart")?.getContext("2d");
    if (ctxProducts) {
      productChartRef.current = new Chart(ctxProducts, {
        type: "bar",
        data: {
          labels: Object.keys(salesByProduct),
          datasets: [
            {
              label: "Quantidade Vendida",
              data: Object.values(salesByProduct),
              backgroundColor: "#28a745",
              borderWidth: 0,
              barThickness: 18,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#2c3e50",
              titleFont: { size: 12, family: "'Roboto', sans-serif" },
              bodyFont: { size: 10, family: "'Roboto', sans-serif" },
              padding: 6,
            },
            datalabels: {
              anchor: "end",
              align: "top",
              color: "#2c3e50",
              font: { size: 10, family: "'Roboto', sans-serif" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#ecf0f1", drawBorder: false },
              ticks: { color: "#7f8c8d", font: { size: 11, family: "'Roboto', sans-serif" } },
            },
            x: {
              grid: { display: false },
              ticks: {
                color: "#7f8c8d",
                font: { size: 11, family: "'Roboto', sans-serif" },
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
          animation: { duration: 800, easing: "easeOutCubic" },
        },
      });
    }

    const ctxCategory = document.getElementById("categoryChart")?.getContext("2d");
    if (ctxCategory) {
      categoryChartRef.current = new Chart(ctxCategory, {
        type: "pie",
        data: {
          labels: Object.keys(salesByCategory),
          datasets: [
            {
              label: "Receita por Categoria (R$)",
              data: Object.values(salesByCategory),
              backgroundColor: ["#3498db", "#28a745", "#e74c3c", "#f1c40f", "#2c3e50"],
              borderWidth: 1,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                font: { size: 11, family: "'Roboto', sans-serif" },
                color: "#2c3e50",
                padding: 15,
              },
            },
            tooltip: {
              backgroundColor: "#2c3e50",
              titleFont: { size: 12, family: "'Roboto', sans-serif" },
              bodyFont: { size: 10, family: "'Roboto', sans-serif" },
              callbacks: {
                label: (context) => `${context.label}: R$${context.raw.toFixed(2)}`,
              },
            },
            datalabels: { display: false },
          },
          animation: { duration: 800, easing: "easeOutCubic" },
        },
      });
    }

    const ctxVariant = document.getElementById("variantChart")?.getContext("2d");
    if (ctxVariant) {
      variantChartRef.current = new Chart(ctxVariant, {
        type: "bar",
        data: {
          labels: Object.keys(salesByVariant),
          datasets: [
            {
              label: "Quantidade Vendida",
              data: Object.values(salesByVariant),
              backgroundColor: "#e74c3c",
              borderWidth: 0,
              barThickness: 18,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#2c3e50",
              titleFont: { size: 12, family: "'Roboto', sans-serif" },
              bodyFont: { size: 10, family: "'Roboto', sans-serif" },
              padding: 6,
            },
            datalabels: {
              anchor: "end",
              align: "top",
              color: "#2c3e50",
              font: { size: 10, family: "'Roboto', sans-serif" },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: "#ecf0f1", drawBorder: false },
              ticks: { color: "#7f8c8d", font: { size: 11, family: "'Roboto', sans-serif" } },
            },
            x: {
              grid: { display: false },
              ticks: {
                color: "#7f8c8d",
                font: { size: 11, family: "'Roboto', sans-serif" },
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
          animation: { duration: 800, easing: "easeOutCubic" },
        },
      });
    }
  };

  const handleMarkAsPaid = async (saleIndex) => {
    if (!window.confirm("Confirmar o pagamento desta venda?")) return;

    const salesRef = doc(db, "lojinha", "sales");
    const updatedSales = [...sales];
    updatedSales[saleIndex].paymentStatus = "paid";
    await updateDoc(salesRef, { sales: updatedSales });
    alert("Pagamento registrado com sucesso!");
  };

  const generateInvoice = (sale, index) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nota Fiscal", 20, 20);
    doc.setFontSize(12);
    doc.text(`Venda #${index + 1}`, 20, 30);
    doc.text(`Data: ${new Date(sale.timestamp).toLocaleString()}`, 20, 40);
    doc.text(
      `Cliente: ${sale.client?.name || "N/A"} (${sale.client?.email || "N/A"})`,
      20,
      50
    );
    doc.text(
      `Status do Pagamento: ${sale.paymentStatus === "paid" ? "Pago" : "A Prazo"}`,
      20,
      60
    );
    doc.text("Itens:", 20, 70);
    let y = 80;
    sale.items.forEach((item, idx) => {
      doc.text(
        `${idx + 1}. ${item.name} - R$${item.variant?.price || 0} x ${item.quantity || 1}`,
        30,
        y
      );
      if (item.variant) {
        doc.text(`   Variante: ${item.variant.color}, ${item.variant.size}`, 30, y + 5);
        y += 10;
      } else {
        y += 5;
      }
    });
    doc.text(`Total: R$${sale.total.toFixed(2)}`, 20, y + 10);
    doc.save(`nota_fiscal_venda_${index + 1}.pdf`);
  };

  const generateConsolidatedInvoice = (period) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Notas Fiscais - ${period}`, 20, 20);
    let y = 30;
    filteredSales.forEach((sale, index) => {
      doc.setFontSize(12);
      doc.text(
        `Venda #${index + 1} - ${new Date(sale.timestamp).toLocaleString()}`,
        20,
        y
      );
      doc.text(
        `Cliente: ${sale.client?.name || "N/A"} (${sale.client?.email || "N/A"})`,
        20,
        y + 10
      );
      doc.text(
        `Status do Pagamento: ${sale.paymentStatus === "paid" ? "Pago" : "A Prazo"}`,
        20,
        y + 20
      );
      y += 30;
      sale.items.forEach((item, idx) => {
        doc.text(
          `${idx + 1}. ${item.name} - R$${item.variant?.price || 0} x ${item.quantity || 1}`,
          30,
          y
        );
        if (item.variant) {
          doc.text(`   Variante: ${item.variant.color}, ${item.variant.size}`, 30, y + 5);
          y += 10;
        } else {
          y += 5;
        }
      });
      doc.text(`Total: R$${sale.total.toFixed(2)}`, 20, y + 10);
      y += 20;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save(
      `notas_fiscais_${period.toLowerCase()}_${new Date().toISOString().split("T")[0]}.pdf`
    );
  };

  const exportFullReport = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const reportElement = reportRef.current;
    const canvas = await html2canvas(reportElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgProps = doc.getImageProperties(imgData);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    doc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    doc.save(`relatorio_vendas_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const resetFilters = () => {
    setShowResetModal(true);
  };

  const confirmResetFilters = () => {
    setFilterType("custom");
    setDateRange([new Date(), new Date()]);
    setSelectedCategory("all");
    setSelectedClient("all");
    setSearchTerm(""); // Reseta a barra de pesquisa
    setShowResetModal(false);
  };

  const cancelResetFilters = () => {
    setShowResetModal(false);
  };

  if (loading) return <div className="sales-loading-spinner">Carregando...</div>;

  return (
    <div className={`sales-reports-container ${presentationMode ? "presentation-mode" : ""}`}>
      <div className="sales-reports-header">
        <h2>Relatórios de Vendas</h2>
        <div className="sales-reports-actions">
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className="sales-presentation-btn"
          >
            {presentationMode ? "Sair do Modo Apresentação" : "Modo Apresentação"}
          </button>
          <button onClick={exportFullReport} className="sales-export-btn">
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="sales-filter-section">
        <div className="sales-search-bar">
          <input
            type="text"
            placeholder="Pesquisar por cliente, produto ou observação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sales-filter-buttons">
          {["Dia", "Semana", "Mês", "Customizado"].map((type) => (
            <button
              key={type}
              className={`sales-filter-btn ${filterType === type ? "active" : ""}`}
              onClick={() => setFilterType(type)}
            >
              {type}
            </button>
          ))}
          <button onClick={resetFilters} className="sales-reset-btn">
            Resetar
          </button>
        </div>
        <div className="sales-filter-row">
          <div className="sales-category-filter">
            <label>Categoria:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas</option>
              {Object.keys(categories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="sales-client-filter">
            <label>Cliente:</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="all">Todos</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {filterType === "Customizado" && (
          <div className="sales-calendar-container">
            <Calendar
              selectRange
              onChange={setDateRange}
              value={dateRange}
              className="sales-calendar"
            />
          </div>
        )}
      </div>

      {showResetModal && (
        <div className="sales-reset-modal">
          <div className="sales-reset-modal-content">
            <h3>Resetar Filtros</h3>
            <p>Tem certeza que deseja resetar todos os filtros?</p>
            <div className="sales-reset-modal-buttons">
              <button onClick={confirmResetFilters} className="sales-reset-confirm-btn">
                Sim
              </button>
              <button onClick={cancelResetFilters} className="sales-reset-cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sales-summary">
        {[
          { title: "Receita Total", value: `R$${totalRevenue.toFixed(2)}` },
          { title: "Recebido", value: `R$${receivedRevenue.toFixed(2)}` },
          { title: "A Receber", value: `R$${pendingRevenue.toFixed(2)}` },
          { title: "Itens Vendidos", value: totalItemsSold },
          { title: "Vendas", value: filteredSales.length },
          { title: "Ticket Médio", value: `R$${averageTicket.toFixed(2)}` },
          { title: "Previsão (Dia)", value: `R$${forecastSales().toFixed(2)}` },
        ].map((item, idx) => (
          <div key={idx} className="sales-summary-card">
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="sales-insights">
        <h3>Insights</h3>
        {generateInsights().length > 0 ? (
          <ul>
            {generateInsights().map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum insight disponível.</p>
        )}
      </div>

      <div className="sales-charts-section">
        <div className="sales-chart-container">
          <h3>Receita por Dia</h3>
          <canvas id="revenueChart" />
        </div>
        <div className="sales-chart-container">
          <h3>Vendas por Produto</h3>
          <canvas id="productChart" />
        </div>
        <div className="sales-chart-container">
          <h3>Receita por Categoria</h3>
          <canvas id="categoryChart" />
        </div>
        <div className="sales-chart-container">
          <h3>Vendas por Variante</h3>
          <canvas id="variantChart" />
        </div>
      </div>

      <div className="sales-invoices-section">
        <h3>Notas Fiscais</h3>
        <div className="sales-invoice-buttons">
          <button
            onClick={() => generateConsolidatedInvoice("Diário")}
            className="sales-invoice-btn"
          >
            Notas Diárias
          </button>
          <button
            onClick={() => generateConsolidatedInvoice("Semanal")}
            className="sales-invoice-btn"
          >
            Notas Semanais
          </button>
          <button
            onClick={() => generateConsolidatedInvoice("Mensal")}
            className="sales-invoice-btn"
          >
            Notas Mensais
          </button>
        </div>
      </div>

      <div className="sales-list" ref={reportRef}>
        <h3>Lista de Vendas</h3>
        {filteredSales.length === 0 ? (
          <p>Nenhuma venda encontrada.</p>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale, index) => (
                  <tr key={index}>
                    <td data-label="Data">
                      {new Date(sale.timestamp).toLocaleString()}
                    </td>
                    <td data-label="Cliente">
                      {sale.client?.name || "N/A"} ({sale.client?.email || "N/A"})
                    </td>
                    <td data-label="Itens">
                      {sale.items.map((item, idx) => (
                        <div key={idx}>
                          {item.name} - R${(item.variant?.price || 0).toFixed(2)} x{" "}
                          {item.quantity || 1}
                          {item.variant &&
                            ` (${item.variant.color}, ${item.variant.size})`}
                        </div>
                      ))}
                    </td>
                    <td data-label="Total">R${sale.total.toFixed(2)}</td>
                    <td data-label="Status">
                      {sale.paymentStatus === "paid" ? "Pago" : "A Prazo"}
                    </td>
                    <td data-label="Ações" className="actions-cell">
                      <button
                        onClick={() => generateInvoice(sale, index)}
                        className="sales-generate-invoice-btn"
                      >
                        Nota
                      </button>
                      {sale.paymentStatus === "pending" && (
                        <button
                          onClick={() => handleMarkAsPaid(index)}
                          className="sales-mark-paid-btn"
                        >
                          Pago
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesReports;