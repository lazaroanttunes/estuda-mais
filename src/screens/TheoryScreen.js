import React, { useState } from 'react';
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
import { generateTheoryContent } from '../services/studyService';

const TheoryScreen = ({ navigation }) => {
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('medio');
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

  const getSelectedSubject = () => {
    return subject === 'Outro' ? customSubject : subject;
  };

  const handleGenerateTheory = async () => {
    const selectedSubject = getSelectedSubject();
    
    if (!selectedSubject || !topic.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma matéria e digite um tópico.');
      return;
    }

    if (subject === 'Outro' && !customSubject.trim()) {
      Alert.alert('Erro', 'Por favor, especifique qual é a matéria.');
      return;
    }

    setLoading(true);
    try {
      const content = await generateTheoryContent({ 
        subject: selectedSubject, 
        topic, 
        level 
      });
      
      navigation.navigate('Quiz', {
        type: 'theory',
        content,
        subject: selectedSubject,
        topic,
        level
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o conteúdo. Tente novamente.');
      console.error('Theory generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tópico Específico *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Teorema de Pitágoras, Segunda Guerra Mundial, Princípio da Isonomia..."
            value={topic}
            onChangeText={setTopic}
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nível de Dificuldade</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={level}
              onValueChange={setLevel}
              style={styles.picker}
            >
              <Picker.Item label="Básico" value="basico" />
              <Picker.Item label="Intermediário" value="medio" />
              <Picker.Item label="Avançado" value="avancado" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Gerando conteúdo...</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateTheory}>
            <Ionicons name="book" size={24} color="white" />
            <Text style={styles.generateButtonText}>Gerar Conteúdo de Estudo</Text>
          </TouchableOpacity>
        )}

        <View style={styles.examplesSection}>
          <Text style={styles.examplesTitle}>Exemplos de Tópicos:</Text>
          <View style={styles.examplesGrid}>
            <TouchableOpacity 
              style={styles.exampleCard}
              onPress={() => {
                setSubject('Direito Constitucional');
                setTopic('Princípios Fundamentais da Constituição');
              }}
            >
              <Text style={styles.exampleText}>Princípios Constitucionais</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleCard}
              onPress={() => {
                setSubject('Matemática');
                setTopic('Funções de Primeiro Grau');
              }}
            >
              <Text style={styles.exampleText}>Funções de 1º Grau</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleCard}
              onPress={() => {
                setSubject('Direito Administrativo');
                setTopic('Poderes Administrativos');
              }}
            >
              <Text style={styles.exampleText}>Poderes Administrativos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.exampleCard}
              onPress={() => {
                setSubject('Português');
                setTopic('Figuras de Linguagem');
              }}
            >
              <Text style={styles.exampleText}>Figuras de Linguagem</Text>
            </TouchableOpacity>
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
  generateButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    marginVertical: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  examplesSection: {
    marginTop: 24,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exampleCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exampleText: {
    color: '#475569',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default TheoryScreen;