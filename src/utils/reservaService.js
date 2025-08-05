// src/utils/reservaService.js
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Salvar nova reserva no Firestore
export const salvarReserva = async (dadosReserva, paymentData, userId) => {
  try {
    console.log('💾 Salvando reserva no Firestore:', {
      dadosReserva,
      paymentData,
      userId
    });

    const reservaCompleta = {
      // Dados do cliente
      clienteId: userId,
      clienteNome: dadosReserva.nomePassageiro,
      clienteEmail: dadosReserva.emailPassageiro,
      clienteTelefone: dadosReserva.telefonePassageiro,
      clienteCpf: dadosReserva.cpfPassageiro,

      // Dados da viagem
      pacoteId: dadosReserva.pacoteId,
      pacoteTitulo: dadosReserva.pacoteTitulo,
      dataIda: dadosReserva.dataIda,
      dataVolta: dadosReserva.dataVolta,
      adultos: dadosReserva.adultos,
      criancas: dadosReserva.criancas,

      // Dados do pagamento
      paymentId: paymentData.id,
      paymentStatus: paymentData.status,
      paymentMethod: paymentData.payment_method_id,
      valorTotal: paymentData.transaction_amount,
      metodoPagamento: paymentData.payment_method_id === 'pix' ? 'pix' : 'cartao',

      // Status e controle
      status: paymentData.status === 'approved' ? 'confirmado' : 'pendente',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),

      // Dados extras
      observacoes: dadosReserva.observacoes || '',
      localEmbarque: dadosReserva.localEmbarque || '',
      
      // Dados do Mercado Pago
      mercadoPagoData: {
        paymentId: paymentData.id,
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        transactionAmount: paymentData.transaction_amount,
        paymentMethodId: paymentData.payment_method_id,
        dateCreated: paymentData.date_created,
        dateApproved: paymentData.date_approved
      }
    };

    // Salvar no Firestore
    const docRef = await addDoc(collection(db, 'reservas'), reservaCompleta);
    
    console.log('✅ Reserva salva com sucesso! ID:', docRef.id);
    
    return {
      success: true,
      reservaId: docRef.id,
      reservaData: {
        id: docRef.id,
        ...reservaCompleta
      }
    };
    
  } catch (error) {
    console.error('❌ Erro ao salvar reserva:', error);
    throw error;
  }
};

// Atualizar status da reserva
export const atualizarStatusReserva = async (reservaId, novoStatus, paymentData = null) => {
  try {
    const reservaRef = doc(db, 'reservas', reservaId);
    
    const updateData = {
      status: novoStatus,
      atualizadoEm: serverTimestamp()
    };

    // Se houver dados de pagamento, atualizar também
    if (paymentData) {
      updateData.paymentStatus = paymentData.status;
      updateData.mercadoPagoData = {
        ...updateData.mercadoPagoData,
        status: paymentData.status,
        statusDetail: paymentData.status_detail,
        dateApproved: paymentData.date_approved
      };
    }

    await updateDoc(reservaRef, updateData);
    
    console.log('✅ Status da reserva atualizado:', reservaId, novoStatus);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar status da reserva:', error);
    throw error;
  }
};

// Buscar reserva por ID
export const buscarReserva = async (reservaId) => {
  try {
    const reservaDoc = await getDoc(doc(db, 'reservas', reservaId));
    
    if (reservaDoc.exists()) {
      return {
        id: reservaDoc.id,
        ...reservaDoc.data()
      };
    } else {
      throw new Error('Reserva não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar reserva:', error);
    throw error;
  }
};

// Criar estrutura de dados da reserva a partir dos dados do modal
export const criarDadosReserva = (formData, pacote, precos) => {
  return {
    // Dados do passageiro principal
    nomePassageiro: formData.nome,
    emailPassageiro: formData.email,
    telefonePassageiro: formData.telefone,
    cpfPassageiro: formData.cpf,

    // Dados da viagem
    pacoteId: pacote.id,
    pacoteTitulo: pacote.titulo,
    dataIda: formData.dataIda,
    dataVolta: formData.dataVolta,
    adultos: parseInt(formData.adultos),
    criancas: parseInt(formData.criancas),

    // Dados de preço
    valorAdulto: precos.precoAdulto,
    valorCrianca: precos.precoCrianca,
    valorTotal: precos.total,

    // Dados extras
    observacoes: formData.observacoes || '',
    localEmbarque: formData.localEmbarque || ''
  };
};
