import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import "./SalesReports.css";

const SalesReports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("daily");

  useEffect(() => {
    const salesRef = doc(db, "lojinha", "sales");

    const unsubscribe = onSnapshot(salesRef, (docSnap) => {
      if (docSnap.exists()) {
        setSales(docSnap.data().sales || []);
      } else {
        setSales([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar vendas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filterSales = () => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.timestamp);
      if (filter === "daily") {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter === "weekly") {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return saleDate >= weekStart;
      } else if (filter === "monthly") {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = filterSales();
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = filteredSales.reduce((sum, sale) => 
    sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0), 0
  );

  if (loading) return <div className="loading-spinner">Carregando relatórios...</div>;

  return (
    <div className="sales-reports-container">
      <h2>Relatórios de Vendas</h2>
      <div className="filter-buttons">
        <button className={filter === "daily" ? "active" : ""} onClick={() => setFilter("daily")}>
          Diário
        </button>
        <button className={filter === "weekly" ? "active" : ""} onClick={() => setFilter("weekly")}>
          Semanal
        </button>
        <button className={filter === "monthly" ? "active" : ""} onClick={() => setFilter("monthly")}>
          Mensal
        </button>
      </div>
      <div className="sales-summary">
        <p><strong>Total de Receita:</strong> R${totalRevenue.toFixed(2)}</p>
        <p><strong>Itens Vendidos:</strong> {totalItemsSold}</p>
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