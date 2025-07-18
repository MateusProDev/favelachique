import React, { useState } from 'react';
import { cadastrarMotorista } from '../../utils/reservaApi';

const MotoristaCadastroPage = () => {
  const [msg, setMsg] = useState('');
  const handleRegister = async (form) => {
    await cadastrarMotorista(form);
    setMsg('Motorista cadastrado com sucesso!');
  };
  return (
    <div>
      <h1>Cadastro de Motorista</h1>
      <MotoristaCadastro onRegister={handleRegister} />
      {msg && <p>{msg}</p>}
    </div>
  );
};
export default MotoristaCadastroPage;
