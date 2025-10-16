import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getData, storeData } from '../services/storageService';
import { useAuth } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const [userStats, setUserStats] = useState({
    questionsCorrect: 0,
    performance: 0,
    totalQuestions: 0
  });

  const { user } = useAuth();

  const menuItems = [
    {
      title: 'Estudar Teoria',
      icon: 'book',
      screen: 'Theory',
      color: '#4CAF50',
      description: 'Aprenda conceitos e teoria das matérias'
    },
    {
      title: 'Resolver Questões',
      icon: 'school',
      screen: 'Questions',
      color: '#2196F3',
      description: 'Pratique com questões de vestibular'
    },
    {
      title: 'Meu Histórico',
      icon: 'time',
      screen: 'History',
      color: '#FF9800',
      description: 'Acompanhe seu progresso'
    },
    {
      title: 'Simulados',
      icon: 'clipboard',
      screen: 'Questions',
      params: { isSimulado: true },
      color: '#9C27B0',
      description: 'Simulados completos cronometrados'
    },
  ];

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const history = await getData('studyHistory') || [];
      
      // Calcular estatísticas do usuário
      let totalCorrect = 0;
      let totalQuestions = 0;
      
      history.forEach(item => {
        totalCorrect += item.score || 0;
        totalQuestions += item.total || 0;
      });

      const performance = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      setUserStats({
        questionsCorrect: totalCorrect,
        performance: performance,
        totalQuestions: totalQuestions
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handlePress = (item) => {
    if (item.params) {
      navigation.navigate(item.screen, item.params);
    } else {
      navigation.navigate(item.screen);
    }
  };

  const handleAccountPress = () => {
    navigation.navigate('Account');
  };

  const getPerformanceColor = (performance) => {
    if (performance >= 80) return '#4CAF50';
    if (performance >= 60) return '#FF9800';
    return '#e74c3c';
  };

  const getPerformanceIcon = (performance) => {
    if (performance >= 80) return 'trophy';
    if (performance >= 60) return 'trending-up';
    return 'alert-circle';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.accountButton} onPress={handleAccountPress}>
          <Ionicons name="person-circle-outline" size={32} color="#4a90e2" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Estuda+</Text>
          <Text style={styles.subtitle}>
            Olá, {user?.full_name || user?.email?.split('@')[0] || 'Estudante'}!
          </Text>
          <Text style={styles.welcomeText}>Bem-vindo de volta</Text>
        </View>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{userStats.questionsCorrect}</Text>
          <Text style={styles.statLabel}>Questões Acertadas</Text>
          <Text style={styles.statSubtext}>de {userStats.totalQuestions} no total</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons 
            name={getPerformanceIcon(userStats.performance)} 
            size={24} 
            color={getPerformanceColor(userStats.performance)} 
          />
          <Text style={[styles.statNumber, { color: getPerformanceColor(userStats.performance) }]}>
            {userStats.performance}%
          </Text>
          <Text style={styles.statLabel}>Desempenho</Text>
          <Text style={styles.statSubtext}>taxa de acertos</Text>
        </View>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => handlePress(item)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={32} color="white" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Recursos Disponíveis</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <Ionicons name="cloud-download" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>Geração com IA</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="create" size={24} color="#2196F3" />
            <Text style={styles.featureText}>Questões Personalizadas</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="timer" size={24} color="#FF9800" />
            <Text style={styles.featureText}>Simulados Cronometrados</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={24} color="#9C27B0" />
            <Text style={styles.featureText}>Acompanhamento de Progresso</Text>
          </View>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accountButton: {
    padding: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  placeholder: {
    width: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6366f1',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    marginHorizontal: 6,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  featuresSection: {
    padding: 24,
    backgroundColor: 'white',
    marginTop: 16,
    marginBottom: 32,
    marginHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
});

export default HomeScreen;