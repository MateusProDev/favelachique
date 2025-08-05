// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { signInAnonymously, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Função para criar/logar usuário automaticamente após reserva
  const loginOrCreateUser = async (dadosUsuario) => {
    try {
      console.log('🔐 Fazendo login automático do usuário:', dadosUsuario);
      
      // Login anônimo (funciona como login temporário)
      const userCredential = await signInAnonymously(auth);
      const userAuth = userCredential.user;

      console.log('✅ Login anônimo realizado:', userAuth.uid);

      // Atualizar o perfil do usuário
      await updateProfile(userAuth, {
        displayName: dadosUsuario.nome
      });

      console.log('✅ Perfil atualizado');

      // Salvar dados completos no Firestore
      await setDoc(doc(db, 'usuarios', userAuth.uid), {
        uid: userAuth.uid,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
        telefone: dadosUsuario.telefone,
        cpf: dadosUsuario.cpf,
        tipo: 'cliente',
        criadoEm: new Date(),
        ativo: true
      }, { merge: true });

      console.log('✅ Dados salvos no Firestore');
      console.log('✅ Usuário logado automaticamente:', userAuth.uid);
      return userAuth;
    } catch (error) {
      console.error('❌ Erro ao fazer login automático:', error);
      throw error;
    }
  };

  // Função para buscar dados do usuário
  const getUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      loginOrCreateUser,
      getUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
