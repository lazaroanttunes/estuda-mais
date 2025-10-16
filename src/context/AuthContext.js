import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

// Criar o contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      console.log('🔄 Verificando usuário atual...');
      const { user: currentUser, error } = await authService.getCurrentUser();
      
      if (error) {
        console.error('❌ Erro ao verificar usuário:', error);
      } else {
        console.log('✅ Usuário verificado:', currentUser ? currentUser.email : 'null');
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error('💥 Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finalizado');
    }
  };

  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      console.log('📝 Iniciando cadastro...');
      const { data, error } = await authService.signUp(email, password, fullName);
      
      if (error) throw error;
      
      console.log('✅ Cadastro bem-sucedido');
      
      if (data.user) {
        setUser(data.user);
        console.log('🔄 Estado do usuário atualizado após cadastro');
      }
      
      return { error: null };
    } catch (error) {
      console.error('💥 Erro no cadastro:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      console.log('🔐 Iniciando login...');
      const { data, error } = await authService.signIn(email, password);
      
      if (error) throw error;
      
      console.log('✅ Login bem-sucedido, usuário:', data.user?.email);
      
      setUser(data.user);
      console.log('🔄 Estado do usuário atualizado após login');
      
      return { error: null };
    } catch (error) {
      console.error('💥 Erro no login:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🚪 Iniciando logout...');
      const { error } = await authService.signOut();
      
      if (error) throw error;
      
      console.log('✅ Logout bem-sucedido');
      setUser(null);
      console.log('🔄 Estado do usuário limpo após logout');
      
      return { error: null };
    } catch (error) {
      console.error('💥 Erro no logout:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    checkCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};