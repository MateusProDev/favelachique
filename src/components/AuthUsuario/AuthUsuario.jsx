import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
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
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
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
  const navigate = useNavigate();
  
  // Hook para auto-login se usuário já estiver autenticado
  const { loading: authLoading } = useAutoLogin();

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

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setShowForgotPassword(false);
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
              <div className="senha-input-wrapper">
                <input 
                  name="senha" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Senha" 
                  value={form.senha} 
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                  className="senha-input-field"
                />
                <button
                  type="button"
                  className="senha-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
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
