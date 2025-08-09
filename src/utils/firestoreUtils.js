// src/utils/firestoreUtils.js
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Inicializa automaticamente as coleções e estruturas necessárias no Firestore
 */
export const initializeFirestoreCollections = async () => {
  try {
    console.log('🔧 Inicializando estruturas do Firestore...');

    // 1. Configuração de viagens
    await initializeViagemSettings();
    
    // 2. Coleção de viagens
    await initializeViagensCollection();
    
    // 3. Coleção de pacotes com campos de ida e volta
    await initializePacotesIdaVolta();
    
    console.log('✅ Estruturas do Firestore inicializadas com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firestore:', error);
    return false;
  }
};

/**
 * Configura as configurações padrão para viagens
 */
const initializeViagemSettings = async () => {
  const settingsRef = doc(db, 'settings', 'viagens');
  const settingsDoc = await getDoc(settingsRef);
  
  if (!settingsDoc.exists()) {
    const defaultSettings = {
      porcentagemSinalPadrao: 40,
      statusDisponiveis: [
        'reservado',
        'ida_iniciada', 
        'ida_finalizada',
        'volta_iniciada',
        'volta_finalizada',
        'cancelado'
      ],
      statusPagamento: [
        'pendente',
        'sinal_pago',
        'pago_completo'
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(settingsRef, defaultSettings);
    console.log('📝 Configurações de viagem criadas');
  }
};

/**
 * Cria um documento de exemplo na coleção viagens para garantir que ela existe
 */
const initializeViagensCollection = async () => {
  const viagensRef = collection(db, 'viagens');
  const exemploRef = doc(viagensRef, 'exemplo_estrutura');
  const exemploSnap = await getDoc(exemploRef);
  if (!exemploSnap.exists()) {
    const exemploViagem = {
      isExemplo: true,
      pacoteId: 'string',
      clienteId: 'string',
      isIdaEVolta: false,
      dataIda: '',
      dataVolta: '',
      horaIda: '',
      horaVolta: '',
      motoristaIdaId: '',
      motoristaVoltaId: '',
      status: 'string',
      valorTotal: 0,
      porcentagemSinal: 0,
      valorSinal: 0,
      valorRestante: 0,
      statusPagamento: 'pendente',
      pontoPartida: '',
      pontoDestino: '',
      observacoesIda: '',
      observacoesVolta: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await setDoc(exemploRef, exemploViagem);
    console.log('🗂️ Documento de exemplo da coleção viagens criado com todos os campos.');
  } else {
    // Atualiza o documento para garantir que todos os campos estejam presentes
    const data = exemploSnap.data();
    const requiredFields = {
      isExemplo: true,
      pacoteId: 'string',
      clienteId: 'string',
      isIdaEVolta: false,
      dataIda: '',
      dataVolta: '',
      horaIda: '',
      horaVolta: '',
      motoristaIdaId: '',
      motoristaVoltaId: '',
      status: 'string',
      valorTotal: 0,
      porcentagemSinal: 0,
      valorSinal: 0,
      valorRestante: 0,
      statusPagamento: 'pendente',
      pontoPartida: '',
      pontoDestino: '',
      observacoesIda: '',
      observacoesVolta: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    let needsUpdate = false;
    for (const key in requiredFields) {
      if (!(key in data)) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      await setDoc(exemploRef, { ...requiredFields, ...data }, { merge: true });
      console.log('🗂️ Documento de exemplo da coleção viagens atualizado com campos obrigatórios.');
    }
  }
};

/**
 * Atualiza pacotes existentes para incluir campos de ida e volta
 */
const initializePacotesIdaVolta = async () => {
  const pacotesRef = collection(db, 'pacotes');
  const pacotesSnapshot = await getDocs(pacotesRef);
  
  let pacotesAtualizados = 0;
  
  for (const pacoteDoc of pacotesSnapshot.docs) {
    const pacoteData = pacoteDoc.data();
    
    // Verifica se já tem os campos de ida e volta
    if (!pacoteData.hasOwnProperty('isIdaEVolta')) {
      const updatedPacote = {
        ...pacoteData,
        // Campos para ida e volta
        isIdaEVolta: false,
        precoIda: pacoteData.preco || 0,
        precoVolta: pacoteData.preco || 0,
        precoIdaEVolta: pacoteData.preco ? pacoteData.preco * 1.8 : 0, // 10% desconto na combinação
        porcentagemSinal: 40,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(pacoteDoc.ref, updatedPacote);
      pacotesAtualizados++;
    }
  }
  
  if (pacotesAtualizados > 0) {
    console.log(`📦 ${pacotesAtualizados} pacotes atualizados com campos ida/volta`);
  }
};

/**
 * Cria uma nova viagem no Firestore
 */
export const criarViagem = async (viagemData) => {
  try {
    const viagensRef = collection(db, 'viagens');
    const novaViagemRef = doc(viagensRef);
    
    const viagem = {
      id: novaViagemRef.id,
      ...viagemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(novaViagemRef, viagem);
    console.log('✅ Viagem criada:', novaViagemRef.id);
    
    return {
      success: true,
      id: novaViagemRef.id,
      data: viagem
    };
  } catch (error) {
    console.error('❌ Erro ao criar viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Atualiza uma viagem existente
 */
export const atualizarViagem = async (viagemId, updates) => {
  try {
    const viagemRef = doc(db, 'viagens', viagemId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(viagemRef, updateData, { merge: true });
    console.log('✅ Viagem atualizada:', viagemId);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao atualizar viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Busca viagens com filtros
 */
export const buscarViagens = async (filtros = {}) => {
  try {
    let viagensQuery = collection(db, 'viagens');
    
    // Aplica filtros se fornecidos
    if (filtros.status) {
      viagensQuery = query(viagensQuery, where('status', '==', filtros.status));
    }
    
    if (filtros.clienteId) {
      viagensQuery = query(viagensQuery, where('clienteId', '==', filtros.clienteId));
    }
    
    if (filtros.motoristaId) {
      viagensQuery = query(viagensQuery, where('motoristaIdaId', '==', filtros.motoristaId));
    }
    
    // Ordena por data de criação (mais recentes primeiro)
    viagensQuery = query(viagensQuery, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(viagensQuery);
    const viagens = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(viagem => !viagem.isExemplo); // Remove documento de exemplo
    
    return {
      success: true,
      data: viagens
    };
  } catch (error) {
    console.error('❌ Erro ao buscar viagens:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Converte uma reserva existente em viagem
 */
export const converterReservaParaViagem = async (reservaId, reservaData) => {
  try {
    // Busca dados do pacote se disponível
    let pacoteData = {};
    if (reservaData.pacoteId) {
      const pacoteRef = doc(db, 'pacotes', reservaData.pacoteId);
      const pacoteDoc = await getDoc(pacoteRef);
      if (pacoteDoc.exists()) {
        pacoteData = pacoteDoc.data();
      }
    }
    
    // Cria dados da viagem baseado na reserva
    const viagemData = {
      pacoteId: reservaData.pacoteId || null,
      clienteId: reservaData.userId || reservaData.clienteId,
      
      // Configuração da viagem
      isIdaEVolta: pacoteData.isIdaEVolta || false,
      dataIda: reservaData.data || reservaData.dataReserva,
      dataVolta: null,
      horaIda: reservaData.hora || reservaData.horario,
      horaVolta: null,
      
      // Motoristas
      motoristaIdaId: reservaData.motoristaId || null,
      motoristaVoltaId: null,
      
      // Status
      status: 'reservado',
      
      // Financeiro
      valorTotal: parseFloat(reservaData.valor || reservaData.preco || pacoteData.preco || 0),
      porcentagemSinal: pacoteData.porcentagemSinal || 40,
      statusPagamento: 'pendente',
      
      // Localização
      pontoPartida: reservaData.enderecoOrigem || reservaData.origem || '',
      pontoDestino: reservaData.enderecoDestino || reservaData.destino || pacoteData.titulo || '',
      
      // Observações
      observacoesIda: reservaData.observacoes || '',
      observacoesVolta: '',
      
      // Dados do cliente
      clienteNome: reservaData.nome || reservaData.clienteNome,
      clienteEmail: reservaData.email || reservaData.clienteEmail,
      clienteTelefone: reservaData.telefone || reservaData.clienteTelefone,
      
      // Referência à reserva original
      reservaOriginalId: reservaId,
      
      // Metadados
      origem: 'conversao_reserva'
    };
    
    // Calcula valores do sinal
    const { valorSinal, valorRestante } = calcularValores(
      viagemData.valorTotal, 
      viagemData.porcentagemSinal
    );
    
    viagemData.valorSinal = valorSinal;
    viagemData.valorRestante = valorRestante;
    
    return await criarViagem(viagemData);
  } catch (error) {
    console.error('❌ Erro ao converter reserva para viagem:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calcula valores de sinal e restante
 */
export const calcularValores = (valorTotal, porcentagemSinal) => {
  const valorSinal = (valorTotal * porcentagemSinal) / 100;
  const valorRestante = valorTotal - valorSinal;
  
  return {
    valorSinal: parseFloat(valorSinal.toFixed(2)),
    valorRestante: parseFloat(valorRestante.toFixed(2))
  };
};

/**
 * Inicialização automática quando o módulo for importado
 */
export const autoInitialize = () => {
  // Executa a inicialização após um pequeno delay para garantir que o Firebase esteja pronto
  setTimeout(() => {
    initializeFirestoreCollections().catch(console.error);
  }, 1000);
};
