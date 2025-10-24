import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Serviço para gerenciar posts do blog
 */

const POSTS_COLLECTION = 'posts';

/**
 * Criar novo post
 */
export const createPost = async (postData) => {
  try {
    const post = {
      ...postData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      publicado: postData.publicado ?? true,
      views: 0,
      likes: 0
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), post);
    return { id: docRef.id, ...post };
  } catch (error) {
    console.error('Erro ao criar post:', error);
    throw error;
  }
};

/**
 * Atualizar post existente
 */
export const updatePost = async (postId, postData) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const updateData = {
      ...postData,
      updatedAt: Timestamp.now()
    };

    await updateDoc(postRef, updateData);
    return { id: postId, ...updateData };
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    throw error;
  }
};

/**
 * Deletar post
 */
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, POSTS_COLLECTION, postId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    throw error;
  }
};

/**
 * Buscar post por ID
 */
export const getPostById = async (postId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      return { id: postSnap.id, ...postSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    throw error;
  }
};

/**
 * Buscar post por slug
 */
export const getPostBySlug = async (slug) => {
  try {
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('slug', '==', slug),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar post por slug:', error);
    throw error;
  }
};

/**
 * Listar todos os posts (com filtros)
 */
export const getPosts = async (options = {}) => {
  try {
    const {
      categoria = null,
      publicados = true,
      orderByField = 'createdAt',
      direction = 'desc',
      limitCount = 50
    } = options;

    let q = collection(db, POSTS_COLLECTION);
    const constraints = [];

    if (categoria) {
      constraints.push(where('categoria', '==', categoria));
    }

    if (publicados !== null) {
      constraints.push(where('publicado', '==', publicados));
    }

    constraints.push(orderBy(orderByField, direction));
    constraints.push(limit(limitCount));

    q = query(q, ...constraints);

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    return posts;
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
};

/**
 * Incrementar views do post
 */
export const incrementPostViews = async (postId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const currentViews = postSnap.data().views || 0;
      await updateDoc(postRef, { views: currentViews + 1 });
    }
  } catch (error) {
    console.error('Erro ao incrementar views:', error);
  }
};

/**
 * Toggle like do post
 */
export const togglePostLike = async (postId) => {
  try {
    const postRef = doc(db, POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const currentLikes = postSnap.data().likes || 0;
      await updateDoc(postRef, { likes: currentLikes + 1 });
      return currentLikes + 1;
    }
    return 0;
  } catch (error) {
    console.error('Erro ao dar like:', error);
    throw error;
  }
};

export const postsService = {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getPostBySlug,
  getPosts,
  incrementPostViews,
  togglePostLike
};
