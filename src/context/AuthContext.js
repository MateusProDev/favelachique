// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Estado de autenticação mudou:", currentUser ? "Logado" : "Deslogado");
      setUser(currentUser);
      setLoading(false);
      
      // Armazena informação no localStorage para persistência adicional
      if (currentUser) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', currentUser.email);
      } else {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userEmail');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
