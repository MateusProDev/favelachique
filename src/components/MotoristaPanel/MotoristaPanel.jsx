import React from 'react';

const MotoristaPanel = ({ reservas, lucroTotal }) => (
  <div className="motorista-panel">
    <h2>Minhas Reservas Delegadas</h2>
    <ul>
      {reservas.map(r => (
        <li key={r.id}>
          {r.nomeCliente} - {r.data} {r.horario} - {r.destino} - R$ {r.valor} - Status: {r.status}
        </li>
      ))}
    </ul>
    <h3>Lucro Total: R$ {lucroTotal}</h3>
  </div>
);
export default MotoristaPanel;
