import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getData, storeData } from '../services/storageService';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const studyHistory = await getData('studyHistory') || [];
      setHistory(studyHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
  if (history.length === 0) return;
  
  Alert.alert(
    'Limpar Histórico',
    'Tem certeza que deseja excluir todo o histórico?',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar Tudo',
        style: 'destructive',
        onPress: async () => {
          await storeData('studyHistory', []);
          setHistory([]);
          Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
        },
      },
    ]
  );
};

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return '#27ae60';
    if (percentage >= 70) return '#3498db';
    if (percentage >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 90) return 'trophy';
    if (percentage >= 70) return 'trending-up';
    if (percentage >= 50) return 'checkmark';
    return 'alert-circle';
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'excellent') return item.percentage >= 90;
    if (filter === 'good') return item.percentage >= 70 && item.percentage < 90;
    if (filter === 'regular') return item.percentage >= 50 && item.percentage < 70;
    if (filter === 'poor') return item.percentage < 50;
    return true;
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.itemHeader}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subject}>{item.subject}</Text>
          <Text style={styles.topic}>{item.topic}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: getPerformanceColor(item.percentage) }]}>
          <Ionicons 
            name={getPerformanceIcon(item.percentage)} 
            size={16} 
            color="white" 
          />
          <Text style={styles.scoreText}>{item.percentage}%</Text>
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.detailText}>
          {item.score}/{item.total} questões
        </Text>
        <Text style={styles.detailText}>{item.date}</Text>
        {item.timeSpent > 0 && (
          <Text style={styles.detailText}>
            Tempo: {Math.floor(item.timeSpent / 60)}min {item.timeSpent % 60}s
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meu Histórico</Text>
        <Text style={styles.subtitle}>
          {history.length} {history.length === 1 ? 'sessão' : 'sessões'} de estudo
        </Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={80} color="#bdc3c7" />
          <Text style={styles.emptyTitle}>Nenhuma sessão de estudo</Text>
          <Text style={styles.emptyText}>
            Suas sessões de estudo e resultados de quiz aparecerão aqui
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Questions')}
          >
            <Text style={styles.emptyButtonText}>Começar a Estudar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.filters}>
            <Text style={styles.filterTitle}>Filtrar por desempenho:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'excellent' && styles.filterButtonActive]}
                onPress={() => setFilter('excellent')}
              >
                <Text style={[styles.filterText, filter === 'excellent' && styles.filterTextActive]}>
                  Excelente (90%+)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'good' && styles.filterButtonActive]}
                onPress={() => setFilter('good')}
              >
                <Text style={[styles.filterText, filter === 'good' && styles.filterTextActive]}>
                  Bom (70%+)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'regular' && styles.filterButtonActive]}
                onPress={() => setFilter('regular')}
              >
                <Text style={[styles.filterText, filter === 'regular' && styles.filterTextActive]}>
                  Regular (50%+)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, filter === 'poor' && styles.filterButtonActive]}
                onPress={() => setFilter('poor')}
              >
                <Text style={[styles.filterText, filter === 'poor' && styles.filterTextActive]}>
                  Precisa Melhorar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>
              {filteredHistory.length} {filteredHistory.length === 1 ? 'item' : 'itens'}
            </Text>
            <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
  <Text style={styles.clearButtonText}>Limpar Tudo</Text>
</TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredHistory}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
};

// Adicionando ScrollView import e styles faltantes
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  filters: {
    padding: 24,
    backgroundColor: 'white',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 16,
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
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
  },
  clearButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subjectInfo: {
    flex: 1,
    marginRight: 16,
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  topic: {
    fontSize: 14,
    color: '#64748b',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 13,
    color: '#64748b',
    marginRight: 16,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HistoryScreen;