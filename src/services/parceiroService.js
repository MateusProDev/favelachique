import { db } from '../firebase/firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import Parceiro from '../models/Parceiro';
import { uploadImageToCloudinary, uploadMultipleImages } from '../utils/cloudinaryHelper';

const COLLECTION_NAME = 'parceiros';

/**
 * Serviço para gerenciar parceiros no Firebase
 */
class ParceiroService {
  /**
   * Busca todos os parceiros
   */
  async buscarTodos() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('ordem', 'asc'),
        orderBy('nome', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => Parceiro.fromFirestore(doc));
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
      throw error;
    }
  }

  /**
   * Busca parceiros ativos
   */
  async buscarAtivos() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('ativo', '==', true),
        orderBy('ordem', 'asc'),
        orderBy('nome', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => Parceiro.fromFirestore(doc));
    } catch (error) {
      console.error('Erro ao buscar parceiros ativos:', error);
      throw error;
    }
  }

  /**
   * Busca parceiros em destaque
   */
  async buscarDestaques(limite = 6) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('ativo', '==', true),
        where('destaque', '==', true),
        orderBy('ordem', 'asc'),
        limit(limite)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => Parceiro.fromFirestore(doc));
    } catch (error) {
      console.error('Erro ao buscar parceiros em destaque:', error);
      throw error;
    }
  }

  /**
   * Busca parceiro por ID
   */
  async buscarPorId(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return Parceiro.fromFirestore(docSnap);
      } else {
        throw new Error('Parceiro não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar parceiro:', error);
      throw error;
    }
  }

  /**
   * Busca parceiros por categoria
   */
  async buscarPorCategoria(categoria) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('categoria', '==', categoria),
        where('ativo', '==', true),
        orderBy('ordem', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => Parceiro.fromFirestore(doc));
    } catch (error) {
      console.error('Erro ao buscar parceiros por categoria:', error);
      throw error;
    }
  }

  /**
   * Cria um novo parceiro
   */
  async criar(dadosParceiro, arquivos = {}) {
    try {
      // Validação básica antes do upload
      if (!dadosParceiro.nome || !dadosParceiro.nome.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!dadosParceiro.categoria || !dadosParceiro.categoria.trim()) {
        throw new Error('Categoria é obrigatória');
      }
      if (!arquivos.logo) {
        throw new Error('Logo é obrigatório');
      }

      const parceiro = new Parceiro(dadosParceiro);

      // Upload de logo (obrigatório)
      if (arquivos.logo) {
        parceiro.logo = await uploadImageToCloudinary(arquivos.logo, 'parceiros/logos');
      }

      // Upload de imagens adicionais se fornecidas
      if (arquivos.imagens && arquivos.imagens.length > 0) {
        const urls = await uploadMultipleImages(arquivos.imagens, 'parceiros/galeria');
        parceiro.imagens = urls;
      }

      // Validação final após uploads
      const validacao = parceiro.validar();
      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
      }

      const docRef = await addDoc(
        collection(db, COLLECTION_NAME),
        parceiro.toFirestore()
      );

      return {
        id: docRef.id,
        ...parceiro
      };
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      throw error;
    }
  }

  /**
   * Atualiza um parceiro existente
   */
  async atualizar(id, dadosAtualizados, arquivos = {}) {
    try {
      const parceiroExistente = await this.buscarPorId(id);
      const parceiro = new Parceiro({ ...parceiroExistente, ...dadosAtualizados });
      const validacao = parceiro.validar();

      if (!validacao.valido) {
        throw new Error(`Dados inválidos: ${validacao.erros.join(', ')}`);
      }

      // Upload de nova logo se fornecida
      if (arquivos.logo) {
        parceiro.logo = await uploadImageToCloudinary(arquivos.logo, 'parceiros/logos');
      }

      // Upload de nova imagem de capa se fornecida
      if (arquivos.imagemCapa) {
        parceiro.imagemCapa = await uploadImageToCloudinary(arquivos.imagemCapa, 'parceiros/capas');
      }

      // Upload de novas imagens adicionais se fornecidas
      if (arquivos.imagens && arquivos.imagens.length > 0) {
        const urls = await uploadMultipleImages(arquivos.imagens, 'parceiros/galeria');
        parceiro.imagens = [...(parceiro.imagens || []), ...urls];
      }

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, parceiro.toFirestore());

      return parceiro;
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      throw error;
    }
  }

  /**
   * Deleta um parceiro
   */
  async deletar(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      throw error;
    }
  }

  /**
   * Remove uma imagem específica do array de imagens
   */
  async removerImagem(id, urlImagem) {
    try {
      const parceiro = await this.buscarPorId(id);
      const imagensAtualizadas = parceiro.imagens.filter(img => img !== urlImagem);
      
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        imagens: imagensAtualizadas,
        dataAtualizacao: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  }

  /**
   * Atualiza apenas o status ativo/inativo
   */
  async toggleAtivo(id) {
    try {
      const parceiro = await this.buscarPorId(id);
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ativo: !parceiro.ativo,
        dataAtualizacao: new Date().toISOString()
      });

      return !parceiro.ativo;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  /**
   * Atualiza apenas o status de destaque
   */
  async toggleDestaque(id) {
    try {
      const parceiro = await this.buscarPorId(id);
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        destaque: !parceiro.destaque,
        dataAtualizacao: new Date().toISOString()
      });

      return !parceiro.destaque;
    } catch (error) {
      console.error('Erro ao atualizar destaque:', error);
      throw error;
    }
  }

  /**
   * Atualiza a ordem de exibição
   */
  async atualizarOrdem(id, novaOrdem) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ordem: novaOrdem,
        dataAtualizacao: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar ordem:', error);
      throw error;
    }
  }
}

export default new ParceiroService();
