// src/utils/config.js

/**
 * Configuration for educational levels, defining descriptions and instructions
 * Used by buildPrompt to generate content
 */
export const levelConfigs = {
  infantil: {
    description: 'EDUCAÇÃO INFANTIL (3-5 anos)',
    instructions: '• Use linguagem EXTREMAMENTE LÚDICA, SIMPLES e DIVERTIDA\n• Inclua ATIVIDADES com DESENHOS, CORES, JOGOS e ELEMENTOS VISUAIS\n• Frases MUITO CURTAS, OBJETIVAS e ALEGRES\n• Foque em COORDENAÇÃO MOTORA, RECONHECIMENTO BÁSICO e ESTÍMULO SENSORIAL\n• Sempre incentive a CRIATIVIDADE e a DIVERSÃO',
    questionTypes: 'atividades de pintura, ligar pontos, labirintos, reconhecer formas, cores e sons'
  },
  'fundamental-i': {
    description: 'ENSINO FUNDAMENTAL I (1º-5º ano)',
    instructions: '• Use linguagem CLARA, CONCRETA e ACESSÍVEL\n• Inclua contextos do COTIDIANO INFANTIL e HISTÓRIAS SIMPLES\n• Exercícios PRÁTICOS, OBJETIVOS e INTERATIVOS\n• Sempre adicione EXEMPLOS VISUAIS ou ILUSTRAÇÕES DESCRITIVAS\n• Estimule a CURIOSIDADE e o APRENDIZADO ATIVO',
    questionTypes: 'operações básicas com desenhos, interpretação de textos curtos, atividades de recorte e colagem'
  },
  'fundamental-ii': {
    description: 'ENSINO FUNDAMENTAL II (6º-9º ano)',
    instructions: '• Use linguagem FORMAL, mas ACESSÍVEL e MOTIVADORA\n• Explore conceitos BÁSICOS da disciplina com PROFUNDIDADE MODERADA\n• Desenvolva RACIOCÍNIO LÓGICO e RESOLUÇÃO DE PROBLEMAS\n• Inclua contextos REAIS, APLICÁVEIS e RELACIONADOS À VIDA DO ALUNO\n• Incentive a REFLEXÃO e a AUTONOMIA',
    questionTypes: 'questões objetivas com justificativa, problemas do dia a dia, análises simples com dados'
  },
  medio: {
    description: 'ENSINO MÉDIO',
    instructions: '• Use linguagem TÉCNICA PRECISA e ADEQUADA ao nível\n• Aborde conceitos COMPLEXOS, ABRANGENTES e INTERDISCIPLINARES\n• Foque em RACIOCÍNIO CRÍTICO, ANALÍTICO e SINTÉTICO\n• Inclua APLICAÇÕES PRÁTICAS, ESTUDOS DE CASO e DEBATES\n• Estimule a PESQUISA e o PENSAMENTO INDEPENDENTE',
    questionTypes: 'questões dissertativas com argumentos, problemas complexos com múltiplas etapas, análises aprofundadas com evidências'
  }
};

/**
 * Styling configurations for each educational level
 * Used by generatePDF to customize PDF appearance
 */
export const levelStyles = {
  infantil: {
    primaryColor: '#ff6f61', // Coral for playful aesthetic
    secondaryColor: '#fffde7', // Light yellow background
    fontSize: '14px', // Larger font for young children
    questionSpacing: '20px',
    borderStyle: '3px dashed #ff6f61', // Dashed for fun
    background: '#fffde7',
    fontFamily: "'Comic Neue', cursive"
  },
  'fundamental-i': {
    primaryColor: '#4caf50', // Green for accessibility
    secondaryColor: '#e8f5e9', // Light green for sections
    fontSize: '13px',
    questionSpacing: '18px',
    borderStyle: '2px solid #4caf50',
    background: '#ffffff',
    fontFamily: "'Inter', Arial, sans-serif"
  },
  'fundamental-ii': {
    primaryColor: '#2196f3', // Blue for professional yet approachable
    secondaryColor: '#e3f2fd',
    fontSize: '12px',
    questionSpacing: '15px',
    borderStyle: '1px solid #2196f3',
    background: '#ffffff',
    fontFamily: "'Inter', Arial, sans-serif"
  },
  medio: {
    primaryColor: '#2c3e50', // Dark for formal look
    secondaryColor: '#eceff1',
    fontSize: '11px',
    questionSpacing: '12px',
    borderStyle: '1px solid #2c3e50',
    background: '#ffffff',
    fontFamily: "'Inter', Arial, sans-serif"
  }
};