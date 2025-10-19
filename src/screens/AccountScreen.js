import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../src/services/supabaseClient';

const AccountScreen = ({ navigation }) => {
  const { user, signOut, checkCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!fullName.trim()) {
      Alert.alert('Erro', 'Por favor, digite um nome válido.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });

      if (error) {
        throw error;
      }

      await checkCurrentUser();
      Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o nome. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o seu histórico de estudos? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Limpando histórico...');
              
              // Método 1: Tentar limpar via storageService (Android)
              try {
                const { storeData } = await import('../services/storageService');
                await storeData('studyHistory', []);
                console.log('✅ Histórico limpo via storageService');
              } catch (e1) {
                console.log('⚠️ storageService falhou, tentando AsyncStorage direto...');
                // Método 2: AsyncStorage direto
                try {
                  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
                  await AsyncStorage.removeItem('studyHistory');
                  console.log('✅ Histórico limpo via AsyncStorage');
                } catch (e2) {
                  console.log('⚠️ AsyncStorage falhou, usando localStorage (web)...');
                  // Método 3: localStorage para web
                  if (Platform.OS === 'web' || typeof window !== 'undefined') {
                    localStorage.removeItem('studyHistory');
                    console.log('✅ Histórico limpo via localStorage');
                  }
                }
              }
              
              Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
            } catch (error) {
              console.error('❌ Erro ao limpar histórico:', error);
              Alert.alert('Erro', 'Não foi possível limpar o histórico.');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚪 Fazendo logout...');
              
              // Logout via AuthContext (Android)
              await signOut();
              
              // Logout direto do Supabase (Web)
              await supabase.auth.signOut();
              
              console.log('✅ Logout executado');
              
              // Para Android: usar navegação
              if (Platform.OS !== 'web') {
                try {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } catch (e) {
                  console.error('Erro na navegação Android:', e);
                }
              } else {
                // Para Web: recarregar página para limpar estado
                console.log('🔄 Recarregando página para web...');
                window.location.href = window.location.origin + window.location.pathname;
              }
              
            } catch (error) {
              console.error('💥 Erro no logout:', error);
              Alert.alert('Erro', 'Erro ao fazer logout. Tentando recarregar...');
              
              // Fallback: recarregar página de qualquer forma
              if (Platform.OS === 'web') {
                window.location.reload();
              }
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Conta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#4a90e2" />
        </View>
        <Text style={styles.userName}>
          {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome Completo</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nameInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Digite seu nome"
                autoFocus={true}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setFullName(user?.user_metadata?.full_name || '');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdateName}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.infoValue}>
                {user?.user_metadata?.full_name || 'Não informado'}
              </Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="pencil" size={16} color="#4a90e2" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleClearHistory}>
          <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          <Text style={styles.menuItemText}>Limpar Histórico</Text>
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={[styles.menuItemText, styles.logoutText]}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 32,
    backgroundColor: 'white',
    marginBottom: 16,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  profileSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
  },
  editContainer: {
    marginTop: 8,
  },
  nameInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#1e293b',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#4a90e2',
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutText: {
    color: '#e74c3c',
  },
});

export default AccountScreen;