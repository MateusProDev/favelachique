import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import Chart from "chart.js/auto";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SalesReports.css";

const SalesReports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [filterType, setFilterType] = useState("custom");
  const revenueChartRef = useRef(null);
  const productChartRef = useRef(null);

  useEffect(() => {
    const salesRef = doc(db, "lojinha", "sales");
    const unsubscribe = onSnapshot(
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
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && sales.length > 0) {
      renderCharts();
    }
    // Limpeza dos gráficos ao desmontar o componente
    return () => {
      if (revenueChartRef.current) revenueChartRef.current.destroy();
      if (productChartRef.current) productChartRef.current.destroy();
    };
  }, [sales, dateRange, filterType]);

  const filterSales = () => {
    const [startDate, endDate] = dateRange;
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      switch (filterType) {
        case "Dia":
          return saleDate.toDateString() === now.toDateString();
        case "Semana":
          const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
          return saleDate >= weekStart;
        case "Mês":
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case "Customizado":
          return saleDate >= startDate && saleDate <= endDate;
        default:
          return true;
      }
    });
  };

  const filteredSales = filterSales();
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0),
    0
  );

  const salesByProduct = filteredSales.reduce((acc, sale) => {
    sale.items.forEach((item) => {
      const key = `${item.name} (${item.variant?.color || "N/A"}, ${item.variant?.size || "N/A"})`;
      acc[key] = (acc[key] || 0) + (item.quantity || 1);
    });
    return acc;
  }, {});

  const salesByDay = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + sale.total;
    return acc;
  }, {});

  const renderCharts = () => {
    // Destruir gráficos existentes
    if (revenueChartRef.current) revenueChartRef.current.destroy();
    if (productChartRef.current) productChartRef.current.destroy();

    // Gráfico de Receita por Dia
    const ctxRevenue = document.getElementById("revenueChart")?.getContext("2d");
    if (ctxRevenue) {
      revenueChartRef.current = new Chart(ctxRevenue, {
        type: "line",
        data: {
          labels: Object.keys(salesByDay),
          datasets: [{
            label: "Receita por Dia (R$)",
            data: Object.values(salesByDay),
            borderColor: "#007bff",
            backgroundColor: "rgba(0, 123, 255, 0.2)",
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
          plugins: { legend: { position: "top" } },
        },
      });
    }

    // Gráfico de Vendas por Produto
    const ctxProducts = document.getElementById("productChart")?.getContext("2d");
    if (ctxProducts) {
      productChartRef.current = new Chart(ctxProducts, {
        type: "bar",
        data: {
          labels: Object.keys(salesByProduct),
          datasets: [{
            label: "Quantidade Vendida",
            data: Object.values(salesByProduct),
            backgroundColor: "#28a745",
          }],
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } },
          plugins: { legend: { position: "top" } },
        },
      });
    }
  };

  if (loading) return <div className="loading-spinner">Carregando relatórios...</div>;

  return (
    <div className="sales-reports-container">
      <h2>Relatórios de Vendas Avançados</h2>
      <div className="filter-section">
        <div className="filter-buttons">
          {["Dia", "Semana", "Mês", "Customizado"].map((type) => (
            <button
              key={type}
              className={filterType === type ? "active" : ""}
              onClick={() => setFilterType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        {filterType === "Customizado" && (
          <div className="calendar-container">
            <Calendar
              selectRange
              onChange={setDateRange}
              value={dateRange}
              className="sales-calendar"
            />
          </div>
        )}
      </div>
      <div className="sales-summary">
        {[
          { title: "Total de Receita", value: `R$${totalRevenue.toFixed(2)}` },
          { title: "Itens Vendidos", value: totalItemsSold },
          { title: "Vendas Registradas", value: filteredSales.length },
        ].map((item, idx) => (
          <div key={idx} className="summary-card">
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="charts-section">
        <div className="chart-container">
          <h3>Receita por Dia</h3>
          <canvas id="revenueChart" />
        </div>
        <div className="chart-container">
          <h3>Vendas por Produto</h3>
          <canvas id="productChart" />
        </div>
      </div>
      <div className="sales-list">
        {filteredSales.length === 0 ? (
          <p>Nenhuma venda registrada no período selecionado.</p>
        ) : (
          <table className="sales-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Itens</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, index) => (
                <tr key={index}>
                  <td>{new Date(sale.timestamp).toLocaleString()}</td>
                  <td>
                    {sale.items.map((item, idx) => (
                      <div key={idx}>
                        {item.name} - R${(item.variant?.price || 0).toFixed(2)} x {item.quantity || 1}
                        {item.variant && ` (Cor: ${item.variant.color}, Tamanho: ${item.variant.size})`}
                      </div>
                    ))}
                  </td>
                  <td>R${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesReports; 