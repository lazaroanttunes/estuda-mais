import { supabase } from './supabaseClient';

export const authService = {
  async signUp(email, password, fullName) {
    try {
      console.log('Tentando cadastrar usuário:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Erro no signUp:', error);
        
        // Tratamento apenas para erros comuns, SEM verificação de email
        if (error.message.includes('User already registered')) {
          return { 
            data: null, 
            error: 'Este email já está cadastrado.' 
          };
        }
        
        throw error;
      }
      
      console.log('Usuário cadastrado com sucesso:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('Erro capturado no signUp:', error);
      return { data: null, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      console.log('Tentando login:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no signIn:', error);
        
        // Tratamento apenas para credenciais inválidas
        if (error.message.includes('Invalid login credentials')) {
          return { 
            data: null, 
            error: 'Email ou senha incorretos.' 
          };
        }
        
        throw error;
      }
      
      console.log('Login realizado com sucesso:', data.user?.email);
      return { data, error: null };
    } catch (error) {
      console.error('Erro capturado no signIn:', error);
      return { data: null, error: error.message };
    }
  },

  async signOut() {
    try {
      console.log('Tentando logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no signOut:', error);
        throw error;
      }
      
      console.log('Logout realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro capturado no signOut:', error);
      return { error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      console.log('Verificando sessão atual...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        throw error;
      }
      
      if (session) {
        console.log('Sessão encontrada para usuário:', session.user?.email);
        return { user: session.user, error: null };
      }
      
      console.log('Nenhuma sessão ativa encontrada');
      return { user: null, error: null };
    } catch (error) {
      console.error('Erro capturado no getCurrentUser:', error);
      return { user: null, error: error.message };
    }
  },

  async resetPassword(email) {
    try {
      console.log('Solicitando reset de senha para:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('Erro no resetPassword:', error);
        throw error;
      }
      
      console.log('Email de reset de senha enviado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('Erro capturado no resetPassword:', error);
      return { error: error.message };
    }
  }
};