export const buildStudyPrompt = ({ type, subject, topic, level, numberOfQuestions = '5', isSimulado = false }) => {
  const levelConfigs = {
    'facil': {
      description: 'NÍVEL FÁCIL',
      instructions: '• Use linguagem CLARA e ACESSÍVEL\n• Foque em CONCEITOS BÁSICOS e FUNDAMENTAIS\n• Inclua EXEMPLOS SIMPLES do cotidiano\n• Use analogias familiares para explicar conceitos complexos\n• Destaque aplicações práticas imediatas'
    },
    'medio': {
      description: 'NÍVEL MÉDIO',
      instructions: '• Use linguagem TÉCNICA MODERADA\n• Explore conceitos com PROFUNDIDADE INTERMEDIÁRIA\n• Inclua contextos de VESTIBULARES e CONCURSOS\n• Desenvolva RACIOCÍNIO LÓGICO e ANALÍTICO\n• Relacione com outras áreas do conhecimento'
    },
    'dificil': {
      description: 'NÍVEL DIFÍCIL',
      instructions: '• Use linguagem TÉCNICA ESPECÍFICA\n• Aborde conceitos COMPLEXOS e AVANÇADOS\n• Foque em APLICAÇÕES PRÁTICAS complexas\n• Inclua problemas desafiadores e multi-etapas\n• Prepare para questões de alto nível de dificuldade'
    },
    'basico': {
      description: 'NÍVEL BÁSICO',
      instructions: '• Use linguagem EXTREMAMENTE SIMPLES\n• Foque na COMPREENSÃO dos fundamentos\n• Use MUITOS EXEMPLOS visuais e práticos\n• Explique PASSO A PASSO cada conceito\n• Destaque apenas o ESSENCIAL'
    },
    'avancado': {
      description: 'NÍVEL AVANÇADO',
      instructions: '• Use linguagem TÉCNICA PRECISA\n• Aborde tópicos ESPECIALIZADOS e ATUAIS\n• Inclua APLICAÇÕES PRÁTICAS avançadas\n• Foque em RESOLUÇÃO DE PROBLEMAS complexos\n• Prepare para questões de alta seletividade'
    }
  };

  const config = levelConfigs[level] || levelConfigs['medio'];

  const basePrompt = `IMPORTANTE: VOCÊ É UM ESPECIALISTA EM VESTIBULARES E CONCURSOS COM +20 ANOS DE EXPERIÊNCIA, CRIANDO CONTEÚDO DE ESTUDO DE ALTA QUALIDADE.

REGRAS ABSOLUTAS:
1. 🚫 NUNCA use markdown, asteriscos, traços ou qualquer formatação
2. ✅ Use APENAS texto puro com quebras de linha estratégicas
3. ✅ Seja 100% PRECISO e ATUALIZADO conceitualmente
4. ✅ ESTRUTURE de forma LÓGICA, PROGRESSIVA e PEDAGÓGICA
5. ✅ GARANTA ORIGINALIDADE e RELEVÂNCIA para vestibulares
6. ✅ FOQUE em EFICÁCIA pedagógica

${isSimulado ? 'TIPO: SIMULADO COMPLETO' : `MATÉRIA: ${subject}`}
TÓPICO: ${topic}
NÍVEL: ${config.description}
QUANTIDADE: ${numberOfQuestions} ${type === 'questions' ? 'questões' : 'tópicos'}

DIRETRIZES PEDAGÓGICAS:
${config.instructions}

`;

  if (type === 'theory') {
    return `${basePrompt}
CRIE UM MATERIAL DE TEORIA COMPLETO SOBRE "${topic}" NA DISCIPLINA DE ${subject}.

ESTRUTURA OBRIGATÓRIA:

INTRODUÇÃO AO TÓPICO
[Contextualize o tema e sua importância para vestibulares]

CONCEITOS FUNDAMENTAIS
[Explique os conceitos básicos de forma progressiva]

APLICAÇÕES PRÁTICAS
[Mostre como o tema é aplicado em problemas reais]

EXEMPLOS RESOLVIDOS
[Inclua exemplos passo a passo com explicações detalhadas]

DICAS PARA VESTIBULAR
[Estratégias específicas para questões sobre este tema]

RESUMO E PONTOS-CHAVE
[Síntese dos conceitos mais importantes para memorização]

EXERCÍCIOS SUGERIDOS
[Sugestões de prática para fixar o conteúdo]

IMPORTANTE: O conteúdo deve ser completo, atualizado e focado nas necessidades de estudantes de vestibular/concurso.`;
  }

  if (type === 'questions') {
    return `${basePrompt}
CRIE ${numberOfQuestions} QUESTÕES DE MÚLTIPLA ESCOLA SOBRE "${topic}" ${isSimulado ? 'EM DIVERSAS MATÉRIAS' : `NA DISCIPLINA DE ${subject}`}.

FORMATO OBRIGATÓRIO (JSON):

[
  {
    "question": "Texto claro e direto da questão",
    "alternatives": [
      "Alternativa A completa",
      "Alternativa B plausível", 
      "Alternativa C distrator",
      "Alternativa D incorreta"
    ],
    "correctAnswer": 0,
    "explanation": "Explicação detalhada do porquê a resposta está correta"
  }
]

REGRAS DAS QUESTÕES:
• Nível de dificuldade: ${level}
• Contexto: Vestibulares e concursos públicos
• Alternativas: Uma correta, três plausíveis mas incorretas
• Explicação: Detalhada e educativa
• Linguagem: Clara e precisa

${isSimulado ? '• Distribua as questões entre diferentes matérias: Matemática, Português, História, Geografia, Biologia, etc.' : ''}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto adicional.`;
  }

  return basePrompt;
};