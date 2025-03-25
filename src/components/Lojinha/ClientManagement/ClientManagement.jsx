import React, { useState, useEffect } from "react";
import { db } from "../../../firebase/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./ClientManagement.css";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [editingClientId, setEditingClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsRef = doc(db, "lojinha", "clients");
        const docSnap = await getDoc(clientsRef);
        if (docSnap.exists()) {
          const clientsData = docSnap.data().clients || [];
          setClients(clientsData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setError("Erro ao carregar clientes.");
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleAddOrEditClient = async () => {
    if (!name || !phone) {
      setError("Preencha os campos obrigatórios (nome e telefone).");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, insira um email válido ou deixe em branco.");
      return;
    }

    const clientsRef = doc(db, "lojinha", "clients");
    try {
      const clientsSnap = await getDoc(clientsRef);
      let clientsData = clientsSnap.exists() ? clientsSnap.data().clients || [] : [];

      if (!clientsSnap.exists()) {
        await setDoc(clientsRef, { clients: [] });
        clientsData = [];
      }

      if (editingClientId) {
        const index = clientsData.findIndex(c => c.id === editingClientId);
        if (index !== -1) {
          clientsData[index] = { 
            id: editingClientId, 
            name, 
            email: email || "", 
            phone, 
            address,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        const newClient = { 
          id: Date.now().toString(), 
          name, 
          email: email || "", 
          phone, 
          address,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        clientsData.push(newClient);
      }

      await updateDoc(clientsRef, { clients: clientsData });
      setClients(clientsData);
      alert(editingClientId ? "Cliente atualizado com sucesso!" : "Cliente adicionado com sucesso!");
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      setError("Erro ao salvar cliente.");
    }
  };

  const handleEditClient = (client) => {
    setEditingClientId(client.id);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone);
    setAddress(client.address || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;

    const clientsRef = doc(db, "lojinha", "clients");
    try {
      const clientsSnap = await getDoc(clientsRef);
      let clientsData = clientsSnap.exists() ? clientsSnap.data().clients || [] : [];

      clientsData = clientsData.filter(c => c.id !== clientId);
      await updateDoc(clientsRef, { clients: clientsData });

      setClients(clientsData);
      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      setError("Erro ao excluir cliente.");
    }
  };

  const resetForm = () => {
    setEditingClientId(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setError("");
  };

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      client.phone.toLowerCase().includes(searchLower) ||
      (client.address && client.address.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <div className="loading-spinner">Carregando clientes...</div>;

  return (
    <div className="client-management">
      <h2 className="client-management__title">Gerenciamento de Clientes</h2>
      
      {error && <div className="client-management__error">{error}</div>}

      <div className="client-form">
        <h3 className="client-form__title">
          {editingClientId ? "Editar Cliente" : "Adicionar Cliente"}
        </h3>
        
        <div className="client-form__group">
          <label className="client-form__label" htmlFor="name">Nome *</label>
          <input
            className="client-form__input"
            id="name"
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="client-form__group">
          <label className="client-form__label" htmlFor="email">Email</label>
          <input
            className="client-form__input"
            id="email"
            type="email"
            placeholder="exemplo@email.com (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="client-form__group">
          <label className="client-form__label" htmlFor="phone">Telefone *</label>
          <input
            className="client-form__input"
            id="phone"
            type="text"
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div className="client-form__group">
          <label className="client-form__label" htmlFor="address">Endereço</label>
          <input
            className="client-form__input"
            id="address"
            type="text"
            placeholder="Rua, Número, Bairro (opcional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        
        <div className="client-form__actions">
          <button 
            className="client-form__button client-form__button--primary"
            onClick={handleAddOrEditClient}
          >
            {editingClientId ? "Atualizar Cliente" : "Adicionar Cliente"}
          </button>
          
          {editingClientId && (
            <button 
              className="client-form__button client-form__button--secondary"
              onClick={resetForm}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="client-list">
        <div className="client-list__header">
          <h3 className="client-list__title">Lista de Clientes</h3>
          
          <div className="client-list__search">
            <input
              className="client-list__search-input"
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="client-list__count">
              {filteredClients.length} {filteredClients.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="client-list__empty">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
        ) : (
          <div className="client-list__table-wrapper">
            <table className="client-list__table">
              <thead className="client-list__table-head">
                <tr className="client-list__table-row">
                  <th className="client-list__table-header">Nome</th>
                  <th className="client-list__table-header">Email</th>
                  <th className="client-list__table-header">Telefone</th>
                  <th className="client-list__table-header">Endereço</th>
                  <th className="client-list__table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="client-list__table-body">
                {filteredClients.map((client) => (
                  <tr className="client-list__table-row" key={client.id}>
                    <td className="client-list__table-cell" data-label="Nome">{client.name}</td>
                    <td className="client-list__table-cell" data-label="Email">{client.email || "N/A"}</td>
                    <td className="client-list__table-cell" data-label="Telefone">{client.phone}</td>
                    <td className="client-list__table-cell" data-label="Endereço">{client.address || "N/A"}</td>
                    <td className="client-list__table-cell client-list__table-cell--actions" data-label="Ações">
                      <button 
                        className="client-list__action-button client-list__action-button--edit"
                        onClick={() => handleEditClient(client)}
                      >
                        Editar
                      </button>
                      <button 
                        className="client-list__action-button client-list__action-button--delete"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        Excluir
                      </button>
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

export default ClientManagement;