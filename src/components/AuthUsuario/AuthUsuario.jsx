import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiCheck 
} from 'react-icons/fi';
import { FaGoogle, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import { useAutoLogin } from '../../hooks/useAutoLogin';
import './AuthUsuario.css';

const AuthUsuario = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [useRedirect, setUseRedirect] = useState(false);
  const navigate = useNavigate();
  
  // Hook para auto-login se usuário já estiver autenticado
  const { loading: authLoading } = useAutoLogin();

  // Verifica resultado do redirecionamento do Google
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const isNewUser = result.additionalUserInfo?.isNewUser;
          console.log(`${isNewUser ? 'Cadastro' : 'Login'} com Google via redirecionamento realizado:`, result.user.email);
          setSuccess(`${isNewUser ? 'Conta criada' : 'Login realizado'} com Google com sucesso!`);
          
          setTimeout(() => {
            if (onAuthSuccess) {
              onAuthSuccess();
            } else {
              navigate('/usuario/painel');
            }
          }, 1000);
        }
      } catch (err) {
        console.error("Erro no redirecionamento do Google:", err);
        setError('Erro no login com Google. Tente novamente.');
      }
    };

    checkRedirectResult();
  }, [navigate, onAuthSuccess]);

  // Se está carregando a autenticação, mostra loading
  if (authLoading) {
    return (
      <div className="auth-usuario-bg">
        <div className="auth-usuario-container">
          <div className="auth-loading">
            <div className="spinner"></div>
            <p>Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Digite seu email para recuperar a senha.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, form.email);
      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setResetEmailSent(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar email de recuperação:', err);
      if (err.code === 'auth/user-not-found') {
        setError('Email não encontrado.');
      } else {
        setError('Erro ao enviar email de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.senha);
      console.log("Login realizado com sucesso:", userCredential.user.email);
      setSuccess('Login realizado com sucesso!');
      
      // Adiciona um pequeno delay para garantir que o contexto seja atualizado
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          navigate('/usuario/painel');
        }
      }, 1000);
      
    } catch (err) {
      console.error("Erro no login:", err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Usuário não encontrado. Verifique o email ou cadastre-se.');
          break;
        case 'auth/wrong-password':
          setError('Senha incorreta. Tente novamente ou recupere sua senha.');
          break;
        case 'auth/invalid-email':
          setError('Email inválido. Verifique o formato do email.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Tente novamente em alguns minutos.');
          break;
        default:
          setError('Email ou senha inválidos. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!form.nome.trim()) {
      setError('Nome é obrigatório.');
      setLoading(false);
      return;
    }
    
    if (form.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }
    
    try {
      // Cria a conta e automaticamente loga o usuário
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      
      // Atualiza o perfil com o nome
      await updateProfile(userCredential.user, { displayName: form.nome });
      
      console.log("Usuário criado e logado automaticamente:", userCredential.user.email);
      setSuccess('Conta criada com sucesso! Redirecionando...');
      
      // Adiciona um pequeno delay para garantir que o contexto seja atualizado
      setTimeout(() => {
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          navigate('/usuario/painel');
        }
      }, 1500);
      
    } catch (err) {
      console.error("Erro no cadastro:", err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este email já está em uso. Tente fazer login ou use outro email.');
          break;
        case 'auth/weak-password':
          setError('A senha deve ter pelo menos 6 caracteres.');
          break;
        case 'auth/invalid-email':
          setError('Email inválido. Verifique o formato do email.');
          break;
        default:
          setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new GoogleAuthProvider();
      // Adiciona configurações para melhor experiência
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Tenta popup primeiro, se falhar usa redirecionamento
      if (useRedirect) {
        // Usa redirecionamento como alternativa
        setSuccess('Redirecionando para o Google...');
        await signInWithRedirect(auth, provider);
        // O resultado será capturado no useEffect
      } else {
        // Tenta popup primeiro
        try {
          const userCredential = await signInWithPopup(auth, provider);
          const isNewUser = userCredential.additionalUserInfo?.isNewUser;
          console.log(`${isNewUser ? 'Cadastro' : 'Login'} com Google via popup realizado:`, userCredential.user.email);
          setSuccess(`${isNewUser ? 'Conta criada' : 'Login realizado'} com Google com sucesso!`);
          
          // Adiciona um pequeno delay para garantir que o contexto seja atualizado
          setTimeout(() => {
            if (onAuthSuccess) {
              onAuthSuccess();
            } else {
              navigate('/usuario/painel');
            }
          }, 1000);
        } catch (popupError) {
          // Se popup falha por bloqueio, automaticamente tenta redirecionamento
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user') {
            console.log("Popup bloqueado, tentando redirecionamento...");
            setUseRedirect(true);
            setSuccess('Pop-up bloqueado. Redirecionando para o Google...');
            
            // Pequeno delay para mostrar a mensagem antes do redirecionamento
            setTimeout(async () => {
              try {
                await signInWithRedirect(auth, provider);
              } catch (redirectError) {
                console.error("Erro no redirecionamento:", redirectError);
                setError('Erro ao conectar com o Google. Verifique sua conexão.');
                setLoading(false);
              }
            }, 1500);
            return; // Não executa o finally ainda
          } else {
            throw popupError; // Re-lança outros erros
          }
        }
      }
      
    } catch (err) {
      console.error("Erro no login com Google:", err);
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          setError('Login cancelado pelo usuário.');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up bloqueado. Tentando método alternativo...');
          setUseRedirect(true);
          // Tenta redirecionamento automaticamente
          setTimeout(async () => {
            try {
              const provider = new GoogleAuthProvider();
              provider.addScope('email');
              provider.addScope('profile');
              await signInWithRedirect(auth, provider);
            } catch (redirectError) {
              setError('Erro ao conectar com o Google. Tente novamente.');
              setLoading(false);
            }
          }, 1000);
          return;
        case 'auth/network-request-failed':
          setError('Erro de conexão. Verifique sua internet.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas. Aguarde alguns minutos.');
          break;
        default:
          setError('Erro ao autenticar com Google. Tente novamente.');
      }
    } finally {
      if (!useRedirect) {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setShowForgotPassword(false);
    setUseRedirect(false);
    setForm({ nome: '', email: '', senha: '' });
  };

  // Função para validação em tempo real
  const validateForm = () => {
    if (!isLogin && !form.nome.trim()) return false;
    if (!form.email.includes('@')) return false;
    if (form.senha.length < 6) return false;
    return true;
  };

  return (
    <div className="auth-usuario-bg">
      <div className="auth-usuario-container">
        <div className="auth-header">
          <div className="auth-icon">
            {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
          </div>
          <h2>{isLogin ? 'Bem-vindo de volta!' : 'Criar nova conta'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Entre na sua conta para continuar' 
              : 'Preencha os dados para criar sua conta'
            }
          </p>
        </div>

        {showForgotPassword ? (
          <form onSubmit={handlePasswordReset} className="auth-usuario-form">
            <div className="forgot-password-header">
              <FiShield className="forgot-icon" />
              <h3>Recuperar Senha</h3>
              <p>Digite seu email para receber as instruções de recuperação</p>
            </div>
            
            <div className="input-group">
              <FiMail className="input-icon" />
              <input 
                name="email" 
                type="email" 
                placeholder="Seu email cadastrado" 
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <div className="button-group">
              <button type="submit" disabled={loading || !form.email} className="primary-btn">
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Enviar Email
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowForgotPassword(false)} 
                className="secondary-btn"
                disabled={loading}
              >
                Voltar ao Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-usuario-form">
            {!isLogin && (
              <div className="input-group">
                <FiUser className="input-icon" />
                <input 
                  name="nome" 
                  type="text" 
                  placeholder="Nome completo" 
                  value={form.nome} 
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                />
                <div className="input-feedback">
                  {form.nome.trim() && <FiCheck className="valid-icon" />}
                </div>
              </div>
            )}
            
            <div className="input-group">
              <FiMail className="input-icon" />
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                value={form.email} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
              <div className="input-feedback">
                {form.email.includes('@') && <FiCheck className="valid-icon" />}
              </div>
            </div>
            
            <div className="input-group">
              <FiLock className="input-icon" />
              <input 
                name="senha" 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                value={form.senha} 
                onChange={handleChange} 
                required 
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              <div className="input-feedback">
                {form.senha.length >= 6 && <FiCheck className="valid-icon" />}
              </div>
            </div>

            {!isLogin && (
              <div className="password-requirements">
                <small>A senha deve ter pelo menos 6 caracteres</small>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <div className="button-group">
              <button 
                type="submit" 
                disabled={loading || !validateForm()} 
                className="primary-btn"
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    {isLogin ? 'Entrando...' : 'Criando conta...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <FaSignInAlt /> : <FaUserPlus />}
                    {isLogin ? 'Entrar' : 'Criar Conta'}
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className="divider">
                <span>ou</span>
              </div>

              <button 
                type="button" 
                className="google-btn" 
                onClick={handleGoogle} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    {useRedirect ? 'Redirecionando...' : 'Conectando...'}
                  </>
                ) : (
                  <>
                    <FaGoogle className="google-icon" />
                    {useRedirect ? 
                      `Tentar novamente com Google` : 
                      isLogin ? 'Entrar com Google' : 'Criar conta com Google'
                    }
                  </>
                )}
              </button>

              {useRedirect && (
                <div className="redirect-info">
                  <small>
                    💡 Usando método de redirecionamento para contornar bloqueio de pop-ups
                  </small>
                </div>
              )}
            </div>

            {isLogin && (
              <div className="forgot-password-link">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(true)} 
                  className="link-btn"
                  disabled={loading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            )}

            <div className="auth-toggle-link">
              <span>
                {isLogin ? 'Ainda não tem uma conta?' : 'Já possui uma conta?'}
              </span>
              <button 
                type="button" 
                onClick={toggleMode} 
                className="auth-link-btn"
                disabled={loading}
              >
                {isLogin ? 'Cadastre-se gratuitamente' : 'Fazer login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthUsuario;
