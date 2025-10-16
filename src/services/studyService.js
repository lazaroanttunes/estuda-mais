import { buildStudyPrompt } from '../utils/studyTemplates';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const generateTheoryContent = async ({ subject, topic, level }) => {
  try {
    const prompt = buildStudyPrompt({ type: 'theory', subject, topic, level });

    console.log('Enviando requisição para Gemini (Teoria)...');
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro HTTP:', response.status, errorData);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da API recebida com sucesso!');

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      
      console.log('══════════════════════════════════════════════════');
      console.log('📚 CONTEÚDO DE TEORIA GERADO:');
      console.log('══════════════════════════════════════════════════');
      console.log(generatedText.substring(0, 500) + '...');
      console.log('══════════════════════════════════════════════════');
      
      return generatedText;
    } else {
      throw new Error('Estrutura inesperada na resposta da API');
    }
  } catch (error) {
    console.error('Erro ao gerar teoria:', error);
    return generateFallbackTheory({ subject, topic, level });
  }
};

export const generateQuestions = async ({ subject, topic, level, numberOfQuestions, isSimulado }) => {
  try {
    const prompt = buildStudyPrompt({ 
      type: 'questions', 
      subject, 
      topic, 
      level, 
      numberOfQuestions,
      isSimulado 
    });

    console.log('Enviando requisição para Gemini (Questões)...');
    console.log('Prompt:', prompt.substring(0, 200) + '...');
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro HTTP:', response.status, errorData);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da API recebida com sucesso!');

    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('📝 Resposta completa:', generatedText);
      
      let questions = parseQuestionsFromResponse(generatedText, numberOfQuestions);
      
      // Balancear as respostas corretas (embaralhar alternativas)
      questions = balanceCorrectAnswers(questions);
      
      console.log('✅ Questões balanceadas:', questions.length);
      
      return questions;
    } else {
      throw new Error('Estrutura inesperada na resposta da API');
    }
  } catch (error) {
    console.error('Erro ao gerar questões:', error);
    return generateFallbackQuestions({ subject, topic, level, numberOfQuestions });
  }
};

// Versão simplificada - apenas embaralha alternativas
const balanceCorrectAnswers = (questions) => {
  if (!questions || questions.length === 0) return questions;

  console.log('🔄 Embaralhando alternativas...');

  return questions.map(question => {
    if (!question.alternatives || question.alternatives.length !== 4) {
      return question;
    }

    // Salva a alternativa correta original
    const correctAlternative = question.alternatives[question.correctAnswer];
    
    // Embaralha todas as alternativas
    const shuffledAlternatives = [...question.alternatives]
      .map((alt, index) => ({ alt, index }))
      .sort(() => Math.random() - 0.5)
      .map(item => item.alt);
    
    // Encontra a nova posição da resposta correta
    const newCorrectAnswer = shuffledAlternatives.indexOf(correctAlternative);
    
    console.log(`↔️ Resposta correta movida para posição ${newCorrectAnswer}`);
    
    return {
      ...question,
      alternatives: shuffledAlternatives,
      correctAnswer: newCorrectAnswer
    };
  });
};

const parseQuestionsFromResponse = (text, numberOfQuestions) => {
  try {
    console.log('🔍 Tentando parsear questões do texto...');
    
    // Tenta encontrar JSON na resposta
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      console.log('📄 JSON encontrado na resposta');
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Valida se o parse retornou um array válido
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
          console.log('✅ JSON válido encontrado');
          return parsed;
        }
      } catch (jsonError) {
        console.log('❌ Erro ao parsear JSON, tentando método alternativo');
      }
    }

    // Fallback: gera questões manualmente do texto
    console.log('🔄 Gerando questões do texto manualmente');
    return generateQuestionsFromText(text, numberOfQuestions);
    
  } catch (error) {
    console.error('❌ Erro ao parsear questões:', error);
    return generateFallbackQuestions({ numberOfQuestions });
  }
};

const generateQuestionsFromText = (text, numberOfQuestions) => {
  const questions = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  let currentQuestion = null;
  
  for (let i = 0; i < lines.length && questions.length < numberOfQuestions; i++) {
    const line = lines[i].trim();
    
    // Detecta início de uma nova questão
    if (line.match(/^(\d+[\.\)]|Questão|\*)/) && line.length > 10) {
      if (currentQuestion && currentQuestion.alternatives.length >= 4) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        question: line.replace(/^(\d+[\.\)]|\*|\-)\s*/, '').trim(),
        alternatives: [],
        correctAnswer: 0,
        explanation: 'Explicação padrão - a IA não retornou uma explicação detalhada para esta questão.'
      };
    }
    // Detecta alternativas (A), B), etc.)
    else if (currentQuestion && line.match(/^[A-D][\.\)]\s/)) {
      const alternative = line.replace(/^[A-D][\.\)]\s*/, '').trim();
      if (alternative) {
        currentQuestion.alternatives.push(alternative);
      }
    }
    // Detecta gabarito ou explicação
    else if (currentQuestion && currentQuestion.alternatives.length >= 4 && 
             (line.toLowerCase().includes('gabarito') || line.toLowerCase().includes('resposta'))) {
      // Tenta identificar a resposta correta
      const gabaritoMatch = line.match(/[A-D]/i);
      if (gabaritoMatch) {
        const correctLetter = gabaritoMatch[0].toUpperCase();
        currentQuestion.correctAnswer = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
      }
      
      // Pega a explicação das próximas linhas
      let explanation = '';
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        if (lines[j].trim() && !lines[j].match(/^[A-D][\.\)]\s/)) {
          explanation += lines[j].trim() + ' ';
        }
      }
      if (explanation) {
        currentQuestion.explanation = explanation.trim();
      }
      break;
    }
  }
  
  // Adiciona a última questão se estiver completa
  if (currentQuestion && currentQuestion.alternatives.length >= 4) {
    questions.push(currentQuestion);
  }
  
  // Se não conseguiu extrair questões do texto, usa fallback
  if (questions.length === 0) {
    console.log('❌ Não foi possível extrair questões do texto, usando fallback');
    return generateFallbackQuestions({ numberOfQuestions });
  }
  
  console.log(`✅ Geradas ${questions.length} questões do texto`);
  return questions;
};

const generateFallbackTheory = ({ subject, topic, level }) => {
  const content = `TEORIA: ${topic} - ${subject}

Nível: ${level}
Data: ${new Date().toLocaleDateString('pt-BR')}

CONCEITOS FUNDAMENTAIS:

📚 O que é ${topic}?
${topic} é um conceito fundamental em ${subject} que envolve...

⚡ Principais Características:
• Característica 1: Descrição detalhada
• Característica 2: Explicação completa  
• Característica 3: Aplicações práticas

🎯 Aplicações no Vestibular:
Este tópico aparece frequentemente em questões de vestibulares e ENEM, especialmente em...

📝 Exemplo Prático:
Vamos analisar um exemplo concreto de aplicação de ${topic}:

[Exemplo detalhado passo a passo]

💡 Dicas de Estudo:
• Dica 1 para memorizar
• Dica 2 para resolver exercícios
• Dica 3 para evitar erros comuns

🔄 Resumo:
Em resumo, ${topic} é essencial para compreender [conceito relacionado] e sua aplicação prática.

Bons estudos!`;

  return content;
};

const generateFallbackQuestions = ({ subject, topic, numberOfQuestions = 5 }) => {
  const questions = [];
  const alternatives = ['A', 'B', 'C', 'D'];
  
  for (let i = 0; i < numberOfQuestions; i++) {
    const correctAnswer = Math.floor(Math.random() * 4); // Resposta aleatória 0-3
    
    questions.push({
      question: `${i + 1}. Sobre ${topic} em ${subject}, qual das alternativas abaixo está CORRETA?`,
      alternatives: [
        `Alternativa A: Conceito correto sobre ${topic}`,
        `Alternativa B: Conceito relacionado mas incorreto`, 
        `Alternativa C: Informação parcialmente verdadeira`,
        `Alternativa D: Conceito completamente equivocado`
      ],
      correctAnswer: correctAnswer,
      explanation: `A alternativa ${alternatives[correctAnswer]} está correta porque representa adequadamente o conceito de ${topic}. As demais alternativas contêm informações incorretas ou imprecisas sobre o tema.`
    });
  }
  
  console.log(`✅ Geradas ${questions.length} questões de fallback`);
  return questions;
};