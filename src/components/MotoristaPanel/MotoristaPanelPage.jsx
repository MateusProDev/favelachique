import React, { useEffect, useState } from 'react';
import MotoristaPanel from './MotoristaPanel';
import { listarReservasMotorista } from '../../utils/reservaApi';

const MotoristaPanelPage = ({ motoristaId }) => {
  const [reservas, setReservas] = useState([]);
  const [lucroTotal, setLucroTotal] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const res = await listarReservasMotorista(motoristaId);
      setReservas(res);
      setLucroTotal(res.reduce((acc, r) => acc + Number(r.valor), 0));
    }
    fetchData();
  }, [motoristaId]);

  return <MotoristaPanel reservas={reservas} lucroTotal={lucroTotal} />;
};
export default MotoristaPanelPage;
