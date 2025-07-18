import React, { useState } from 'react';

const MotoristaCadastro = ({ onRegister }) => {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  return (
    <div className="motorista-cadastro">
      <h2>Cadastro de Motorista</h2>
      <input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
      <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      <input placeholder="Senha" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} />
      <button onClick={() => onRegister(form)}>Cadastrar</button>
    </div>
  );
};
export default MotoristaCadastro;
