import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  getCountFromServer
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'avaliacoes';

class AvaliacoesService {
  // Criar nova avaliação
  async criarAvaliacao(avaliacaoData) {
    try {
      if (!avaliacaoData.nota || !avaliacaoData.comentario || !avaliacaoData.nomeUsuario) {
        throw new Error('Dados obrigatórios não fornecidos (nota, comentário e nome)');
      }

      if (avaliacaoData.nota < 1 || avaliacaoData.nota > 5) {
        throw new Error('Nota deve estar entre 1 e 5');
      }

      const novaAvaliacao = {
        nota: Number(avaliacaoData.nota),
        comentario: avaliacaoData.comentario.trim(),
        nomeUsuario: avaliacaoData.nomeUsuario.trim(),
        userId: avaliacaoData.userId || null,
        emailUsuario: avaliacaoData.emailUsuario || null,
        avatarUsuario: avaliacaoData.avatarUsuario || null,
        status: 'aprovada', // aprovada por padrão para simplicidade
        likes: 0,
        denuncias: 0,
        verificado: false, // Não verificado para avaliações anônimas
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), novaAvaliacao);
      console.log('Avaliação criada com sucesso:', { id: docRef.id, nota: novaAvaliacao.nota, nome: novaAvaliacao.nomeUsuario });
      return { id: docRef.id, ...novaAvaliacao };
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      throw error;
    }
  }

  // Buscar avaliações
  async getAvaliacoes(options = {}) {
    try {
      const {
        limit: pageLimit = 6,
        filtroNota,
        status = 'aprovada'
      } = options;

      let q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(pageLimit)
      );

      if (filtroNota && filtroNota >= 1 && filtroNota <= 5) {
        q = query(
          collection(db, COLLECTION_NAME),
          where('status', '==', status),
          where('nota', '==', filtroNota),
          orderBy('createdAt', 'desc'),
          limit(pageLimit)
        );
      }

      const snapshot = await getDocs(q);
      
      const avaliacoes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Contar total
      const countQuery = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', status)
      );
      const countSnapshot = await getCountFromServer(countQuery);
      const total = countSnapshot.data().count;

      return { avaliacoes, total };
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
      throw error;
    }
  }

  // Buscar estatísticas
  async getEstatisticas() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'aprovada')
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return {
          media: 0,
          total: 0,
          distribuicao: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const avaliacoes = snapshot.docs.map(doc => doc.data());
      const total = avaliacoes.length;
      
      // Calcular distribuição por nota
      const distribuicao = avaliacoes.reduce((acc, avaliacao) => {
        const nota = Math.round(avaliacao.nota);
        acc[nota] = (acc[nota] || 0) + 1;
        return acc;
      }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

      // Calcular média
      const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
      const media = somaNotas / total;

      return {
        media: Math.round(media * 10) / 10,
        total,
        distribuicao
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const avaliacoesService = new AvaliacoesService();