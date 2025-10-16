import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Importando as imagens
const firstImage = require('../../assets/first.png');
const secondImage = require('../../assets/second.png');
const thirdImage = require('../../assets/third.png');

const OnboardingScreen = ({ navigation, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const slidesRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: '1',
      title: 'Bem-vindo ao Estuda+',
      description: 'Sua plataforma completa de estudos para vestibulares e concursos',
      image: firstImage,
      titleColor: '#4a90e2',
      descriptionColor: '#666666',
    },
    {
      id: '2',
      title: 'Teoria e Questões',
      description: 'Aprenda com conteúdo gerado por IA e pratique com questões personalizadas',
      image: secondImage,
      titleColor: '#4a90e2',
      descriptionColor: '#666666',
    },
    {
      id: '3',
      title: 'Acompanhe Seu Progresso',
      description: 'Monitore seu desempenho e evolua nos seus estudos',
      image: thirdImage,
      titleColor: '#4a90e2',
      descriptionColor: '#666666',
    },
  ];

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNavigateToAuth = () => {
    setIsLoading(true);
    // Simula um tempo de carregamento
    setTimeout(() => {
      if (onFinish) {
        onFinish(); // Chama a função para marcar que onboarding foi concluído
      } else {
        navigation.replace('Login'); // Fallback para navegação tradicional
      }
      setIsLoading(false);
    }, 1000);
  };

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleNavigateToAuth();
    }
  };

  const skipOnboarding = () => {
    handleNavigateToAuth();
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.content}>
          <Image 
            source={item.image} 
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: item.titleColor }]}>{item.title}</Text>
          <Text style={[styles.description, { color: item.descriptionColor }]}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDot = (_, index) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 20, 8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    const backgroundColor = scrollX.interpolate({
      inputRange,
      outputRange: ['#ccc', '#4a90e2', '#ccc'],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            width: dotWidth,
            opacity: opacity,
            backgroundColor: backgroundColor,
          },
        ]}
      />
    );
  };

  // Tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Preparando sua experiência...</Text>
        <Text style={styles.loadingSubtext}>Isso levará apenas alguns segundos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão pular */}
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      {/* Slides */}
      <View style={styles.sliderContainer}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>

      {/* Indicadores */}
      <View style={styles.indicatorContainer}>
        <View style={styles.dots}>
          {slides.map((_, index) => renderDot(_, index))}
        </View>

        {/* Botão de próxima */}
        <TouchableOpacity style={styles.nextButton} onPress={scrollToNext}>
          <Ionicons 
            name={currentIndex === slides.length - 1 ? "checkmark" : "chevron-forward"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    flex: 1,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  image: {
    width: width * 0.75,
    height: height * 0.35,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    color: '#666',
  },
  indicatorContainer: {
    height: 140,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#e0e0e0',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default OnboardingScreen;