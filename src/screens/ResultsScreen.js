import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getData, storeData } from '../services/storageService';

const ResultsScreen = ({ navigation, route }) => {
  const { type, questions, userAnswers, score, total, subject, topic, level, timeSpent, content } = route.params;
  const [performance, setPerformance] = useState('');
  const [performanceColor, setPerformanceColor] = useState('#4a90e2');
  const [textColor, setTextColor] = useState('#2c3e50');

  useEffect(() => {
    calculatePerformance();
    saveToHistory();
  }, []);

  const calculatePerformance = () => {
    if (type === 'questions') {
      const percentage = (score / total) * 100;
      
      // Definir cores baseadas na performance
      if (percentage >= 80) {
        setPerformanceColor('#27ae60'); // Verde - Excelente
        setTextColor('#27ae60');
        setPerformance('Excelente! 🎉');
      } else if (percentage >= 60) {
        setPerformanceColor('#f39c12'); // Amarelo - Bom
        setTextColor('#f39c12');
        setPerformance('Bom! 👍');
      } else if (percentage >= 40) {
        setPerformanceColor('#e67e22'); // Laranja - Regular
        setTextColor('#e67e22');
        setPerformance('Regular! 😊');
      } else {
        setPerformanceColor('#e74c3c'); // Vermelho - Precisa melhorar
        setTextColor('#e74c3c');
        setPerformance('Precisa melhorar 📚');
      }
    }
  };

  const saveToHistory = async () => {
    if (type === 'questions') {
      const historyItem = {
        id: Date.now().toString(),
        type: 'quiz',
        subject,
        topic,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toLocaleDateString('pt-BR'),
        timestamp: Date.now(),
        timeSpent,
        level
      };

      const currentHistory = await getData('studyHistory') || [];
      const newHistory = [historyItem, ...currentHistory].slice(0, 100);
      await storeData('studyHistory', newHistory);
    }
  };

  const handleShare = async () => {
    try {
      const message = `🎯 Acabei de completar um ${type === 'theory' ? 'estudo' : 'quiz'} no Estuda+!\n\n` +
        `Matéria: ${subject}\n` +
        `Tópico: ${topic}\n` +
        (type === 'questions' ? `Resultado: ${score}/${total} (${Math.round((score/total)*100)}%)` : '') +
        `\n\nBaixe o Estuda+ e comece a estudar também!`;

      await Share.share({
        message,
        title: 'Meu resultado no Estuda+',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleReviewQuestions = () => {
    navigation.navigate('Quiz', {
      type: 'questions',
      questions,
      subject,
      topic,
      level,
      userAnswers,
      isReview: true
    });
  };

  const handleNewQuiz = () => {
    navigation.navigate('Questions', { subject, topic: '' });
  };

  const handlePracticeQuestions = () => {
    navigation.navigate('Questions', { 
      subject: subject,
      topic: topic,
      fromTheory: true
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min ${remainingSeconds}s`;
  };

  // Tela de resultados para teoria
  if (type === 'theory') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Estudo Concluído! 📚</Text>
          <Text style={styles.subtitle}>Você completou o estudo de {topic}</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>Conteúdo Estudado com Sucesso!</Text>
            <Text style={styles.successText}>
              Você revisou os conceitos importantes de {topic}. 
              Agora pratique com questões para fixar o conhecimento.
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handlePracticeQuestions}
            >
              <Ionicons name="school" size={20} color="white" />
              <Text style={styles.actionButtonText}>Fazer Questões deste Assunto</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={20} color="#4a90e2" />
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                Compartilhar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.outlineButton]}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="home" size={20} color="#4a90e2" />
              <Text style={[styles.actionButtonText, styles.outlineButtonText]}>
                Página Inicial
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Tela de resultados para questões/quiz
  const percentage = Math.round((score / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resultado do Quiz</Text>
        <Text style={styles.subtitle}>{subject} - {topic}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: performanceColor }]}>
            <Text style={[styles.scorePercentage, { color: performanceColor }]}>{percentage}%</Text>
            <Text style={styles.scoreText}>{score}/{total}</Text>
          </View>
          
          <Text style={[styles.performanceText, { color: performanceColor }]}>{performance}</Text>
          
          {timeSpent > 0 && (
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.timeText}>Tempo: {formatTime(timeSpent)}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{score}</Text>
            <Text style={styles.statLabel}>Corretas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{total - score}</Text>
            <Text style={styles.statLabel}>Incorretas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: performanceColor }]}>{percentage}%</Text>
            <Text style={styles.statLabel}>Aproveitamento</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleReviewQuestions}>
            <Ionicons name="eye" size={20} color="white" />
            <Text style={styles.actionButtonText}>Revisar Questões</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social" size={20} color="white" />
            <Text style={styles.actionButtonText}>Compartilhar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleNewQuiz}
          >
            <Ionicons name="refresh" size={20} color="#4a90e2" />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Novo Quiz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.outlineButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={20} color="#4a90e2" />
            <Text style={[styles.actionButtonText, styles.outlineButtonText]}>
              Página Inicial
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Dicas para Melhorar:</Text>
          {percentage < 40 && (
            <Text style={styles.tipText}>
              • Revise a teoria antes de fazer mais exercícios{'\n'}
              • Faça questões mais básicas primeiro{'\n'}
              • Estude os conceitos fundamentais{'\n'}
              • Pratique regularmente para ganhar confiança
            </Text>
          )}
          {percentage >= 40 && percentage < 60 && (
            <Text style={styles.tipText}>
              • Continue praticando regularmente{'\n'}
              • Revise os erros cometidos{'\n'}
              • Tente questões de nível mais avançado{'\n'}
              • Faça resumos dos conceitos principais
            </Text>
          )}
          {percentage >= 60 && percentage < 80 && (
            <Text style={styles.tipText}>
              • Ótimo progresso! Continue assim{'\n'}
              • Desafie-se com questões complexas{'\n'}
              • Ensine o conteúdo para consolidar{'\n'}
              • Participe de simulados completos
            </Text>
          )}
          {percentage >= 80 && (
            <Text style={styles.tipText}>
              • Excelente desempenho! 🎉{'\n'}
              • Continue com essa frequência{'\n'}
              • Ajude outros estudantes{'\n'}
              • Explore tópicos avançados
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
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
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  scoreContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scorePercentage: {
    fontSize: 28,
    fontWeight: '800',
  },
  scoreText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '600',
  },
  performanceText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '600',
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  outlineButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  secondaryButtonText: {
    color: '#6366f1',
  },
  outlineButtonText: {
    color: '#6366f1',
  },
  tipsSection: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
export default ResultsScreen;