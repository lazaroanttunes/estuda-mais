// src/utils/generatePDF.js
import * as Sharing from 'expo-sharing';
import { Linking } from 'react-native';
import { levelStyles } from './config';

// PDF.co API Key
const PDF_CO_API_KEY = 'lazaroanttunes@gmail.com_nxdyvA4ISHYVoj2VH4bk0BeFnBVzGaoP83bxlSryRxMGhfLyTb6806MNdMCcFRXy';
const PDF_CO_URL = 'https://api.pdf.co/v1/pdf/convert/from/html';

/**
 * Generates a PDF from content with level-specific styling and optimized templates
 * @param {string} content - The content from buildPrompt
 * @param {Object} metadata - Metadata including theme, level, type, levelDescription, and optional fields
 * @returns {Promise<string>} - URL of the generated PDF
 */
export const generatePDF = async (content, metadata = {}) => {
  // Default metadata values for robustness
  const {
    theme = 'Tema Não Especificado',
    level = 'fundamental-ii',
    type = 'prova',
    levelDescription = 'ENSINO FUNDAMENTAL II',
    schoolName = 'Sistema Educacional',
    logoUrl = null,
    customInstructions = ''
  } = metadata;

  console.log('📄 GERANDO PDF COM PDF.CO...');

  // Get level-specific styling
  const styleConfig = levelStyles[level] || levelStyles['fundamental-ii'];

  /**
   * Validates metadata to ensure required fields are present
   */
  const validateMetadata = (metadata) => {
    if (!metadata.theme || !metadata.level || !metadata.type) {
      throw new Error('Metadata incompleta: theme, level e type são obrigatórios');
    }
    if (!levelStyles[metadata.level]) {
      console.warn(`Nível ${metadata.level} não encontrado, usando fundamental-ii como fallback`);
    }
    return true;
  };

  /**
   * Processes content based on type (atividade or teoria)
   */
  const processContent = (content, type) => {
    if (type === 'lista') {
      return processTheoryContent(content);
    } else if (type === 'atividade') {
      return processActivityContent(content);
    } else {
      return processDefaultContent(content);
    }
  };

  /**
   * Process theory content - foco em explicação detalhada
   */
  const processTheoryContent = (content) => {
    const sections = content.split('\n\n\n');
    
    return sections.map(section => {
      // Seção de conceitos fundamentais
      if (section.includes('CONCEITOS FUNDAMENTAIS')) {
        return `
          <div class="theory-section">
            <h2>Conceitos Fundamentais</h2>
            <div class="concepts">
              ${section.replace('CONCEITOS FUNDAMENTAIS:', '')
                       .replace('CONCEITOS FUNDAMENTAIS', '')
                       .split('\n')
                       .filter(line => line.trim())
                       .map(line => {
                         if (line.includes('•') || line.includes('-')) {
                           return `<div class="concept-item">${line.replace('•', '').replace('-', '').trim()}</div>`;
                         }
                         return `<p>${line}</p>`;
                       })
                       .join('')}
            </div>
          </div>
        `;
      }
      
      // Seção de exemplos práticos
      if (section.includes('EXEMPLOS PRÁTICOS')) {
        const examples = section.split('\n\n').filter(example => example.trim() && example.includes('. '));
        return `
          <div class="theory-section">
            <h2>Exemplos Práticos</h2>
            <div class="examples">
              ${examples.map(example => {
                const lines = example.split('\n');
                const title = lines[0];
                const content = lines.slice(1).join('<br>');
                return `
                  <div class="example-item">
                    <div class="example-title">${title}</div>
                    <div class="example-content">${content}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }
      
      // Seção de resumo
      if (section.includes('RESUMO E DICAS FINAIS')) {
        return `
          <div class="theory-section summary">
            <h2>Resumo e Dicas Finais</h2>
            <div class="summary-content">
              ${section.replace('RESUMO E DICAS FINAIS:', '')
                       .replace('RESUMO E DICAS FINAIS', '')
                       .split('\n')
                       .filter(line => line.trim())
                       .map(line => {
                         if (line.includes('PRINCIPAIS PONTOS') || line.includes('PARA APRENDER MAIS')) {
                           return `<h3>${line.replace(':', '').trim()}</h3>`;
                         }
                         if (line.includes('•') || line.includes('-')) {
                           return `<div class="summary-item">${line.replace('•', '').replace('-', '').trim()}</div>`;
                         }
                         return `<p>${line}</p>`;
                       })
                       .join('')}
            </div>
          </div>
        `;
      }
      
      // Outras seções (introdução, objetivo)
      return `<div class="theory-section">${section.replace(/\n/g, '<br>')}</div>`;
    }).join('');
  };

  /**
   * Process activity content - foco em exercícios práticos
   */
  const processActivityContent = (content) => {
    const sections = content.split('\n\n\n');
    
    return sections.map(section => {
      // Introdução e explicação
      if (section.includes('INTRODUÇÃO') || section.includes('OBJETIVO')) {
        return `
          <div class="activity-intro">
            <h2>${section.includes('INTRODUÇÃO') ? 'Introdução' : 'Objetivo da Atividade'}</h2>
            <div class="intro-content">
              ${section.split('\n')
                       .filter(line => !line.includes('INTRODUÇÃO') && !line.includes('OBJETIVO'))
                       .map(line => `<p>${line}</p>`)
                       .join('')}
            </div>
          </div>
        `;
      }
      
      // Questões
      if (section.includes('QUESTÃO') || section.includes('COMPLETE') || section.includes('VERDADEIRO')) {
        const questions = section.split('\n\n').filter(q => q.trim() && (q.includes('. ') || q.includes('QUESTÃO')));
        return `
          <div class="questions-section">
            <h2>Atividades Práticas</h2>
            ${questions.map((question, index) => {
              const lines = question.split('\n');
              const questionType = lines[0].includes('QUESTÃO OBJETIVA') ? 'objective' :
                                  lines[0].includes('COMPLETE') ? 'fill-in' :
                                  lines[0].includes('VERDADEIRO') ? 'true-false' :
                                  lines[0].includes('ASSOCIE') ? 'match' :
                                  lines[0].includes('RESPOSTA CURTA') ? 'short-answer' : 'default';
              
              return `
                <div class="question ${questionType}">
                  <div class="question-header">
                    <span class="question-number">${index + 1}.</span>
                    <span class="question-type">${lines[0].split(':')[0]}</span>
                  </div>
                  <div class="question-content">
                    ${lines.slice(1).map(line => {
                      if (line.match(/^[A-D]\)/)) {
                        return `<div class="alternative">${line}</div>`;
                      }
                      return line;
                    }).join('<br>')}
                  </div>
                  <div class="answer-space"></div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }
      
      // Gabarito/respostas
      if (section.includes('RESPOSTAS') || section.includes('GABARITO')) {
        return `
          <div class="answer-key">
            <h2>Gabarito e Respostas</h2>
            ${section.split('\n\n')
                     .filter(item => item.trim() && !item.includes('RESPOSTAS'))
                     .map(item => `<div class="answer-item">${item.replace(/\n/g, '<br>')}</div>`)
                     .join('')}
          </div>
        `;
      }
      
      return `<div class="section">${section.replace(/\n/g, '<br>')}</div>`;
    }).join('');
  };

  /**
   * Process default content (fallback)
   */
  const processDefaultContent = (content) => {
    return `<div class="content">${content.replace(/\n/g, '<br>')}</div>`;
  };

  /**
   * Generates simplified header based on type
   */
  const generateHeader = (type, theme) => {
    if (type === 'lista') {
      return `
        <div class="header theory-header">
          <h1>${theme}</h1>
          <div class="subtitle">Material de Estudo - Teoria e Exemplos</div>
        </div>
      `;
    } else if (type === 'atividade') {
      return `
        <div class="header activity-header">
          <h1>${theme}</h1>
          <div class="subtitle">Atividade Prática</div>
          <div class="activity-info">
            <span>Nome: ___________________</span>
            <span>Data: ___________________</span>
            <span>Nota: ___________________</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="header default-header">
          <h1>${type.toUpperCase()} - ${theme}</h1>
          <div class="level-info">Nível: ${levelDescription}</div>
        </div>
      `;
    }
  };

  // Validate metadata
  validateMetadata(metadata);

  // Process content based on type
  const processedContent = processContent(content, type);

  // Create HTML with type-specific template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="${type} sobre ${theme} para ${levelDescription}">
      <title>${type === 'lista' ? `Teoria - ${theme}` : `${type.toUpperCase()} - ${theme}`}</title>
      <style>
        /* Import Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Comic+Neue:wght@400;700&display=swap');

        /* Base styles */
        body {
          font-family: ${styleConfig.fontFamily};
          margin: 15mm;
          padding: 0;
          color: ${styleConfig.primaryColor};
          line-height: 1.6;
          background: white;
          font-size: ${styleConfig.fontSize};
        }

        /* Header styles */
        .header {
          text-align: center;
          padding-bottom: 15px;
          margin-bottom: 20px;
          page-break-after: avoid;
        }

        .theory-header {
          border-bottom: 2px solid #4a90e2;
        }

        .activity-header {
          border-bottom: 2px solid #e74c3c;
        }

        .default-header {
          border-bottom: 2px solid #2c3e50;
        }

        .header h1 {
          font-size: ${type === 'lista' ? '24px' : '20px'};
          margin: 0 0 8px 0;
          color: ${styleConfig.primaryColor};
          font-weight: 700;
        }

        .subtitle {
          font-size: 14px;
          color: #666;
          font-style: italic;
          margin-bottom: 10px;
        }

        .activity-info {
          display: flex;
          justify-content: space-around;
          font-size: 12px;
          color: #777;
          margin-top: 10px;
        }

        /* THEORY SPECIFIC STYLES */
        .theory-section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .theory-section h2 {
          color: #4a90e2;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 5px;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .theory-section h3 {
          color: #2c3e50;
          margin: 15px 0 10px 0;
          font-size: 16px;
        }

        .concepts {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #4a90e2;
        }

        .concept-item {
          margin-bottom: 8px;
          padding-left: 15px;
          position: relative;
        }

        .concept-item:before {
          content: "•";
          color: #4a90e2;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        .examples {
          margin-top: 15px;
        }

        .example-item {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .example-title {
          font-weight: 600;
          color: #e74c3c;
          margin-bottom: 8px;
          font-size: 15px;
        }

        .example-content {
          line-height: 1.5;
        }

        .summary {
          background: #e8f4fd;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #4a90e2;
        }

        .summary-item {
          margin-bottom: 6px;
          padding-left: 15px;
          position: relative;
        }

        .summary-item:before {
          content: "✓";
          color: #27ae60;
          font-weight: bold;
          position: absolute;
          left: 0;
        }

        /* ACTIVITY SPECIFIC STYLES */
        .activity-intro {
          background: #fff9e6;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #f39c12;
          margin-bottom: 25px;
        }

        .activity-intro h2 {
          color: #e67e22;
          margin-top: 0;
        }

        .questions-section {
          margin-top: 25px;
        }

        .questions-section h2 {
          color: #e74c3c;
          border-bottom: 2px solid #e74c3c;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }

        .question {
          margin-bottom: 25px;
          padding: 15px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }

        .question-number {
          font-weight: 700;
          color: #e74c3c;
          font-size: 16px;
        }

        .question-type {
          font-size: 12px;
          color: #666;
          background: #f8f9fa;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .question-content {
          line-height: 1.5;
        }

        .alternative {
          margin: 5px 0;
          padding-left: 10px;
        }

        .answer-space {
          height: 40px;
          border-bottom: 1px dashed #ccc;
          margin-top: 15px;
        }

        .answer-key {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #27ae60;
          margin-top: 30px;
          page-break-before: always;
        }

        .answer-key h2 {
          color: #27ae60;
          margin-top: 0;
        }

        .answer-item {
          margin-bottom: 15px;
          padding: 10px;
          background: white;
          border-radius: 4px;
        }

        /* Page styling - REMOVIDO O FOOTER */
        @page {
          margin: 15mm;
          @bottom-center {
            content: ""; /* Remove a numeração de página também */
          }
        }

        /* Responsive */
        @media screen and (max-width: 600px) {
          body {
            margin: 10mm;
          }
        }
      </style>
    </head>
    <body>
      ${generateHeader(type, theme)}
      <div class="content">
        ${processedContent}
      </div>
      <!-- FOOTER REMOVIDO -->
    </body>
    </html>
  `;

  console.log('🔄 Enviando para PDF.co API...');

  try {
    const response = await fetch(PDF_CO_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PDF_CO_API_KEY,
      },
      body: JSON.stringify({
        html: htmlContent,
        name: `${type === 'lista' ? `Teoria_${theme}` : `${type}_${theme}`}.pdf`,
        margin: '15mm',
        paperSize: 'A4',
        orientation: 'portrait',
        printBackground: true,
        async: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na PDF.co:', response.status, errorData.message || errorData);
      throw new Error(`Erro na PDF.co: ${response.status} - ${errorData.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da PDF.co:', data);

    if (!data.url) {
      throw new Error('URL do PDF não retornada pela API');
    }

    console.log('📥 PDF gerado com sucesso:', data.url);

    // Open PDF directly in browser
    const canOpen = await Linking.canOpenURL(data.url);

    if (canOpen) {
      await Linking.openURL(data.url);
      console.log('✅ PDF aberto no navegador!');
      return data.url;
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(data.url, {
          mimeType: 'application/pdf',
          dialogTitle: `Baixar ${type === 'lista' ? `Teoria_${theme}` : `${type}_${theme}`}.pdf`,
          UTI: 'com.adobe.pdf'
        });
        console.log('✅ PDF compartilhado!');
      }
      return data.url;
    }
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error.message);

    if (error.message.includes('https://')) {
      const urlMatch = error.message.match(/(https:\/\/[^\s]+)/);
      if (urlMatch) {
        const pdfUrl = urlMatch[0];
        await Linking.openURL(pdfUrl);
        console.log('✅ PDF aberto via fallback:', pdfUrl);
        return pdfUrl;
      }
    }

    throw new Error(`Falha ao gerar PDF com PDF.co: ${error.message}`);
  }
};