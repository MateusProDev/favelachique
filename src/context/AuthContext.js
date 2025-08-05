// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { 
  signInAnonymously, 
  updateProfile, 
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Configurar persistência do login
    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('🔐 Persistência de login configurada');
      } catch (error) {
        console.error('❌ Erro ao configurar persistência:', error);
      }
    };
    
    setupAuth();

    // Listener de mudança de estado de autenticação
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('🔄 Estado de autenticação alterado:', currentUser?.uid);
      
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      
      if (currentUser) {
        // Buscar dados completos do usuário
        const dadosUsuario = await getUserData(currentUser.uid);
        setUserData(dadosUsuario);
        console.log('✅ Usuário logado:', currentUser.uid, dadosUsuario?.nome);
      } else {
        setUserData(null);
        console.log('❌ Usuário deslogado');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para fazer login/cadastro do usuário
  const loginOrCreateUser = async (dadosUsuario) => {
    try {
      console.log('🔐 Iniciando login/cadastro:', dadosUsuario.nome);
      
      // Verificar se já existe usuário logado
      if (user) {
        console.log('✅ Usuário já está logado:', user.uid);
        await atualizarDadosUsuario(user.uid, dadosUsuario);
        return user;
      }

      // Login anônimo (Firebase permite persistência automática)
      const userCredential = await signInAnonymously(auth);
      const userAuth = userCredential.user;

      console.log('✅ Login anônimo realizado:', userAuth.uid);

      // Atualizar perfil
      await updateProfile(userAuth, {
        displayName: dadosUsuario.nome
      });

      // Salvar dados completos no Firestore
      await atualizarDadosUsuario(userAuth.uid, dadosUsuario);

      console.log('✅ Usuário logado e dados salvos:', userAuth.uid);
      return userAuth;
    } catch (error) {
      console.error('❌ Erro no login/cadastro:', error);
      throw error;
    }
  };

  // Função para atualizar dados do usuário
  const atualizarDadosUsuario = async (userId, dadosUsuario) => {
    try {
      const dadosParaSalvar = {
        uid: userId,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        telefone: dadosUsuario.telefone,
        cpf: dadosUsuario.cpf,
        tipo: 'cliente',
        ultimaAtualizacao: new Date(),
        ativo: true
      };

      // Verificar se é primeira vez (adicionar data de criação)
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (!userDoc.exists()) {
        dadosParaSalvar.criadoEm = new Date();
      }

      await setDoc(doc(db, 'usuarios', userId), dadosParaSalvar, { merge: true });
      
      setUserData(dadosParaSalvar);
      console.log('✅ Dados do usuário atualizados');
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error);
      throw error;
    }
  };

  // Função para buscar dados do usuário
  const getUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
      console.log('✅ Logout realizado');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  // Função para verificar se usuário está logado
  const verificarLogin = () => {
    return isAuthenticated && user && userData;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      loading, 
      isAuthenticated,
      loginOrCreateUser,
      getUserData,
      logout,
      verificarLogin,
      atualizarDadosUsuario
    }}>
      {children}
    </AuthContext.Provider>
  );
};
