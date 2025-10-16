import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuizScreen = ({ navigation, route }) => {
  const { type, content, questions, subject, topic, level, isSimulado, userAnswers: initialAnswers, isReview } = route.params || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState(initialAnswers || []);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(isSimulado ? 3600 : 0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempSelectedAnswer, setTempSelectedAnswer] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isTheoryMode = type === 'theory';
  const quizQuestions = isTheoryMode ? [] : (questions || []);

  useEffect(() => {
    if (isSimulado && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isSimulado && timeLeft === 0) {
      handleFinishQuiz();
    }
  }, [timeLeft, isSimulado]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setTempSelectedAnswer(answerIndex);
    setShowConfirmation(true);
  };

  const confirmAnswer = () => {
    setSelectedAnswer(tempSelectedAnswer);
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = tempSelectedAnswer;
    setUserAnswers(newAnswers);

    setShowConfirmation(false);
    setTempSelectedAnswer(null);

    if (!isTheoryMode && !isReview) {
      setShowExplanation(true);
    }
  };

  const cancelAnswer = () => {
    setShowConfirmation(false);
    setTempSelectedAnswer(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (isTheoryMode ? 0 : quizQuestions.length - 1)) {
      setCurrentQuestion(current => current + 1);
      setSelectedAnswer(userAnswers[currentQuestion + 1] || null);
      setShowExplanation(false);
      fadeAnim.setValue(0);
    } else {
      handleFinishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(current => current - 1);
      setSelectedAnswer(userAnswers[currentQuestion - 1] || null);
      setShowExplanation(false);
      fadeAnim.setValue(0);
    }
  };

  const handleFinishQuiz = () => {
    if (isTheoryMode) {
      navigation.navigate('Results', {
        type: 'theory',
        content,
        subject,
        topic,
        level
      });
    } else {
      const score = userAnswers.filter((answer, index) => 
        answer === quizQuestions[index]?.correctAnswer
      ).length;

      navigation.navigate('Results', {
        type: 'questions',
        questions: quizQuestions,
        userAnswers,
        score,
        total: quizQuestions.length,
        subject,
        topic,
        level,
        timeSpent: isSimulado ? 3600 - timeLeft : 0
      });
    }
  };

  const renderTheoryContent = () => (
    <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
      <ScrollView style={styles.theoryContent}>
        <Text style={styles.theoryText}>{content}</Text>
      </ScrollView>
      
      <View style={styles.theoryActions}>
        <TouchableOpacity style={styles.quizButton} onPress={handleFinishQuiz}>
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.quizButtonText}>Finalizar Estudo</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderQuestion = () => {
    if (!quizQuestions || !quizQuestions[currentQuestion]) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="#e74c3c" />
          <Text style={styles.errorText}>Erro ao carregar a questão</Text>
          <Text style={styles.errorSubtext}>
            Não foi possível carregar esta questão. Tente novamente.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const question = quizQuestions[currentQuestion];
    
    return (
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Questão {currentQuestion + 1} de {quizQuestions.length}
          </Text>
          {isSimulado && (
            <View style={styles.timer}>
              <Ionicons name="time" size={16} color="#e74c3c" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.questionContent}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.alternativesContainer}>
            {question.alternatives && question.alternatives.map((alternative, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alternativeButton,
                  selectedAnswer === index && styles.selectedAlternative,
                  showExplanation && index === question.correctAnswer && styles.correctAlternative,
                  showExplanation && selectedAnswer === index && index !== question.correctAnswer && styles.wrongAlternative,
                  isReview && index === question.correctAnswer && styles.correctAlternative,
                  isReview && userAnswers[currentQuestion] === index && index !== question.correctAnswer && styles.wrongAlternative,
                ]}
                onPress={() => !showExplanation && !isReview && handleAnswerSelect(index)}
                disabled={showExplanation || isReview}
              >
                <Text style={styles.alternativeLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={styles.alternativeText}>{alternative}</Text>
                {(showExplanation || isReview) && index === question.correctAnswer && (
                  <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                )}
                {(showExplanation || isReview) && selectedAnswer === index && index !== question.correctAnswer && (
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {(showExplanation || isReview) && question.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explicação:</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]}
            onPress={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <Ionicons name="chevron-back" size={20} color={currentQuestion === 0 ? '#ccc' : '#4a90e2'} />
            <Text style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>
              Anterior
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>
              {currentQuestion === quizQuestions.length - 1 ? 'Finalizar' : 'Próxima'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#4a90e2" />
          </TouchableOpacity>
        </View>

        {/* Modal de Confirmação */}
        <Modal
          visible={showConfirmation}
          transparent={true}
          animationType="slide"
          onRequestClose={cancelAnswer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Ionicons name="help-circle" size={50} color="#4a90e2" />
              <Text style={styles.confirmationTitle}>Confirmar Resposta</Text>
              <Text style={styles.confirmationText}>
                Você selecionou a alternativa {String.fromCharCode(65 + tempSelectedAnswer)}. 
                Deseja confirmar esta resposta?
              </Text>
              <View style={styles.confirmationButtons}>
                <TouchableOpacity 
                  style={[styles.confirmationButton, styles.cancelButton]}
                  onPress={cancelAnswer}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmationButton, styles.confirmButton]}
                  onPress={confirmAnswer}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => 
          Alert.alert(
            'Sair do Quiz',
            'Tem certeza que deseja sair? Seu progresso será perdido.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => navigation.goBack() }
            ]
          )
        }>
          <Ionicons name="arrow-back" size={24} color="#4a90e2" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.subject}>{subject || 'Matéria'}</Text>
          <Text style={styles.topic}>{topic || 'Tópico'}</Text>
        </View>
        
        <View style={styles.progress}>
          {!isTheoryMode && (
            <Text style={styles.progressText}>
              {currentQuestion + 1}/{quizQuestions.length}
            </Text>
          )}
        </View>
      </View>

      {isTheoryMode ? renderTheoryContent() : renderQuestion()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  topic: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  progress: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  theoryContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  theoryText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  theoryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quizButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    minWidth: 200,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quizButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    color: '#d97706',
    fontWeight: '700',
    marginLeft: 6,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#1e293b',
    marginBottom: 24,
    fontWeight: '600',
  },
  alternativesContainer: {
    marginBottom: 24,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  selectedAlternative: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  correctAlternative: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  wrongAlternative: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  alternativeLetter: {
    fontWeight: '700',
    color: '#6366f1',
    marginRight: 16,
    minWidth: 24,
    fontSize: 16,
  },
  alternativeText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  explanationContainer: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
    marginTop: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    minWidth: 120,
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  navButtonText: {
    color: '#6366f1',
    fontWeight: '700',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#cbd5e1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmationModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmationButton: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '700',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
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
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QuizScreen;