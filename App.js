import React, { useState, useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import TheoryScreen from './src/screens/TheoryScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AccountScreen from './src/screens/AccountScreen';

const Stack = createNativeStackNavigator();

// Componente para verificar se é o primeiro acesso
function FirstLaunchWrapper({ children }) {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@onboarding_completed');
      console.log('Onboarding completed:', hasLaunched);
      
      if (hasLaunched === 'true') {
        setIsFirstLaunch(false);
      } else {
        setIsFirstLaunch(true);
      }
    } catch (error) {
      console.error('Erro ao verificar primeiro acesso:', error);
      setIsFirstLaunch(true);
    }
  };

  const handleOnboardingFinish = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_completed', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Erro ao salvar status do onboarding:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (isFirstLaunch) {
    return <OnboardingScreen onFinish={handleOnboardingFinish} />;
  }

  return children;
}

// Componente para a navegação principal
function AppStack() {
  const { user, loading } = useAuth();

  console.log('AppStack - User:', user ? user.email : 'null', 'Loading:', loading);

  // Mostrar tela de loading enquanto verifica autenticação
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'white',
        },
        headerTintColor: '#4a90e2',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Voltar',
      }}
    >
      {!user ? (
        // Telas de autenticação
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ 
              title: 'Criar Conta',
              headerBackTitle: 'Login'
            }}
          />
        </>
      ) : (
        // Telas principais do app
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="Account" 
            component={AccountScreen}
            options={{ 
              title: 'Minha Conta',
              headerBackTitle: 'Início'
            }}
          />
          <Stack.Screen 
            name="Theory" 
            component={TheoryScreen}
            options={{ 
              title: 'Estudar Teoria',
              headerBackTitle: 'Início'
            }}
          />
          <Stack.Screen 
            name="Questions" 
            component={QuestionsScreen}
            options={({ route }) => ({ 
              title: route.params?.isSimulado ? 'Simulado' : 'Resolver Questões',
              headerBackTitle: 'Início'
            })}
          />
          <Stack.Screen 
            name="Quiz" 
            component={QuizScreen}
            options={{ 
              headerShown: false,
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="Results" 
            component={ResultsScreen}
            options={{ 
              title: 'Resultados',
              headerBackTitle: 'Voltar',
              gestureEnabled: false
            }}
          />
          <Stack.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ 
              title: 'Meu Histórico',
              headerBackTitle: 'Início'
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// Componente principal do app
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
          <StatusBar style="auto" />
          <NavigationContainer>
            <FirstLaunchWrapper>
              <AppStack />
            </FirstLaunchWrapper>
          </NavigationContainer>
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}