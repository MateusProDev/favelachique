import { db } from '../firebase/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Criar reserva
export async function criarReserva(reserva) {
  const docRef = await addDoc(collection(db, 'reservas'), { ...reserva, status: 'pendente', motoristaId: null });
  return docRef.id;
}

// Listar reservas
export async function listarReservas() {
  const q = query(collection(db, 'reservas'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    // Função auxiliar para converter Timestamp para string
    const tsToDate = ts => (ts && typeof ts === 'object' && ts.seconds)
      ? new Date(ts.seconds * 1000)
      : ts;

    // Converte campos de data/hora
    let dataReserva = data.dataReserva || data.data;
    let dataViagem = data.dataViagem;
    let horaReserva = data.hora;
    let createdAt = data.createdAt;

    if (dataReserva && typeof dataReserva === 'object' && dataReserva.seconds) {
      const d = tsToDate(dataReserva);
      dataReserva = d.toLocaleString();
    }
    if (dataViagem && typeof dataViagem === 'object' && dataViagem.seconds) {
      const d = tsToDate(dataViagem);
      dataViagem = d.toLocaleString();
    }
    if (horaReserva && typeof horaReserva === 'object' && horaReserva.seconds) {
      const d = tsToDate(horaReserva);
      horaReserva = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (createdAt && typeof createdAt === 'object' && createdAt.seconds) {
      const d = tsToDate(createdAt);
      createdAt = d.toLocaleString();
    }

    // Corrige statusHistory se existir
    let statusHistory = data.statusHistory;
    if (Array.isArray(statusHistory)) {
      statusHistory = statusHistory.map(item => ({
        ...item,
        date: (item.date && typeof item.date === 'object' && item.date.seconds)
          ? tsToDate(item.date).toLocaleString()
          : item.date
      }));
    }

    return {
      id: docSnap.id,
      ...data,
      dataReserva,
      dataViagem,
      hora: horaReserva,
      createdAt,
      statusHistory
    };
  });
}

// Delegar reserva para motorista
export async function delegarReserva(reservaId, motoristaId) {
  const reservaRef = doc(db, 'reservas', reservaId);
  await updateDoc(reservaRef, { status: 'delegada', motoristaId });
}

// Listar reservas de um motorista
export async function listarReservasMotorista(motoristaId) {
  const q = query(collection(db, 'reservas'), where('motoristaId', '==', motoristaId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Cadastrar motorista
export async function cadastrarMotorista(motorista) {
  const docRef = await addDoc(collection(db, 'motoristas'), { ...motorista, lucroTotal: 0 });
  return docRef.id;
}

// Listar motoristas
export async function listarMotoristas() {
  const q = query(collection(db, 'motoristas'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
