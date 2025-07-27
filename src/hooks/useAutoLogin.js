// Hook para gerenciar login automático e persistência
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAutoLogin = () => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Se já tem usuário logado e não está carregando, redireciona para o painel
    if (!loading && user) {
      const currentPath = window.location.pathname;
      
      // Se está na página de login/cadastro, redireciona para o painel
      if (currentPath === '/usuario/login' || currentPath === '/auth/usuario') {
        console.log("Usuário já logado, redirecionando para painel");
        navigate('/usuario/painel', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return { user, loading };
};

// Hook para proteger rotas que requerem autenticação
export const useRequireAuth = (redirectTo = '/usuario/login') => {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      console.log("Usuário não autenticado, redirecionando para login");
      navigate(redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading };
};
