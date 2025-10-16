import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { generateQuestions } from '../services/studyService';

const QuestionsScreen = ({ navigation, route }) => {
  const isSimulado = route.params?.isSimulado || false;
  const fromTheory = route.params?.fromTheory || false;
  const theorySubject = route.params?.subject || '';
  const theoryTopic = route.params?.topic || '';
  
  const [subject, setSubject] = useState(theorySubject);
  const [customSubject, setCustomSubject] = useState('');
  const [topic, setTopic] = useState(theoryTopic);
  const [level, setLevel] = useState('medio');
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Matemática',
    'Português',
    'História',
    'Geografia',
    'Biologia',
    'Química',
    'Física',
    'Inglês',
    'Filosofia',
    'Sociologia',
    'Direito Constitucional',
    'Direito Administrativo',
    'Direito Penal',
    'Direito Civil',
    'Direito do Trabalho',
    'Administração Pública',
    'Contabilidade Pública',
    'Informática',
    'Raciocínio Lógico',
    'Atualidades',
    'Outro'
  ];

  // Efeito para quando vier da teoria
  useEffect(() => {
    if (fromTheory && theorySubject && theoryTopic) {
      console.log('📚 Vindo da teoria:', theorySubject, theoryTopic);
      // Já preenche automaticamente os campos
    }
  }, [fromTheory, theorySubject, theoryTopic]);

  const getSelectedSubject = () => {
    return subject === 'Outro' ? customSubject : subject;
  };

  const handleGenerateQuestions = async () => {
    const selectedSubject = getSelectedSubject();
    
    if (!selectedSubject || (!topic.trim() && !isSimulado)) {
      Alert.alert('Erro', 'Por favor, selecione uma matéria' + (isSimulado ? '.' : ' e digite um tópico.'));
      return;
    }

    setLoading(true);
    try {
      const questions = await generateQuestions({ 
        subject: selectedSubject, 
        topic: isSimulado ? 'Simulado Completo' : topic, 
        level, 
        numberOfQuestions,
        isSimulado 
      });

      if (!questions || questions.length === 0) {
        throw new Error('Não foi possível gerar questões');
      }

      console.log('✅ Questões geradas com sucesso:', questions.length);
      
      navigation.navigate('Quiz', {
        type: 'questions',
        questions,
        subject: selectedSubject,
        topic: isSimulado ? 'Simulado Completo' : topic,
        level,
        isSimulado
      });
    } catch (error) {
      console.error('Questions generation error:', error);
      Alert.alert(
        'Erro', 
        'Não foi possível gerar as questões. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {fromTheory ? 'Praticar Questões' : (isSimulado ? 'Simulado Completo' : 'Resolver Questões')}
        </Text>
        <Text style={styles.subtitle}>
          {fromTheory 
            ? `Pratique ${theoryTopic} em ${theorySubject}`
            : (isSimulado 
                ? 'Teste seus conhecimentos com um simulado cronometrado' 
                : 'Pratique com questões específicas'
              )
          }
        </Text>
        
        {fromTheory && (
          <View style={styles.theoryBadge}>
            <Ionicons name="book" size={16} color="white" />
            <Text style={styles.theoryBadgeText}>Continuando do estudo</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Matéria *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={subject}
              onValueChange={setSubject}
              style={styles.picker}
            >
              <Picker.Item label="Selecione uma matéria" value="" />
              {subjects.map((subj, index) => (
                <Picker.Item key={index} label={subj} value={subj} />
              ))}
            </Picker>
          </View>
        </View>

        {subject === 'Outro' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especifique a matéria *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Direito Tributário, Engenharia Civil, Medicina..."
              value={customSubject}
              onChangeText={setCustomSubject}
            />
          </View>
        )}

        {!isSimulado && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tópico Específico</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Geometria Espacial, Literatura Brasileira, Crimes contra a Administração Pública..."
              value={topic}
              onChangeText={setTopic}
              multiline
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nível de Dificuldade</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={level}
              onValueChange={setLevel}
              style={styles.picker}
            >
              <Picker.Item label="Fácil" value="facil" />
              <Picker.Item label="Médio" value="medio" />
              <Picker.Item label="Difícil" value="dificil" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número de Questões</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              style={styles.picker}
            >
              <Picker.Item label="5 questões" value="5" />
              <Picker.Item label="10 questões" value="10" />
              <Picker.Item label="15 questões" value="15" />
              <Picker.Item label="20 questões" value="20" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Gerando questões...</Text>
            <Text style={styles.loadingSubtext}>Isso pode levar alguns segundos</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.generateButton, 
              isSimulado ? styles.simuladoButton : 
              fromTheory ? styles.theoryButton : styles.questionsButton
            ]} 
            onPress={handleGenerateQuestions}
          >
            <Ionicons 
              name={fromTheory ? "play-circle" : (isSimulado ? "timer" : "school")} 
              size={24} 
              color="white" 
            />
            <Text style={styles.generateButtonText}>
              {fromTheory 
                ? `Começar Questões de ${theoryTopic}` 
                : (isSimulado ? 'Iniciar Simulado' : 'Gerar Questões')
              }
            </Text>
          </TouchableOpacity>
        )}

        {fromTheory && (
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Ações Rápidas:</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setNumberOfQuestions('5')}
              >
                <Text style={styles.quickActionText}>5 questões</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setNumberOfQuestions('10')}
              >
                <Text style={styles.quickActionText}>10 questões</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setLevel('facil')}
              >
                <Text style={styles.quickActionText}>Fácil</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setLevel('medio')}
              >
                <Text style={styles.quickActionText}>Médio</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Dicas:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={16} color="#FF9800" />
            <Text style={styles.tipText}>
              {fromTheory 
                ? 'Pratique logo após estudar a teoria para melhor fixação'
                : 'Selecione matérias específicas para focar seus estudos'
              }
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={16} color="#FF9800" />
            <Text style={styles.tipText}>
              {fromTheory
                ? 'Comece com menos questões e nível mais fácil'
                : 'Use "Outro" para matérias não listadas'
              }
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="bulb-outline" size={16} color="#FF9800" />
            <Text style={styles.tipText}>
              {fromTheory
                ? 'Aumente a dificuldade conforme for evoluindo'
                : 'Simulados são ideais para testar conhecimentos gerais'
              }
            </Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  theoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  theoryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  form: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    minHeight: 56,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  picker: {
    height: 56,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginVertical: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  questionsButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
  },
  simuladoButton: {
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
  },
  theoryButton: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  quickActions: {
    backgroundColor: '#f0fdf4',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#dcfce7',
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#bbf7d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
  },
  tipsSection: {
    marginTop: 24,
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#475569',
    flex: 1,
    lineHeight: 20,
  },
});

export default QuestionsScreen;