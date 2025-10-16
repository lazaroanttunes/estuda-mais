import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export const generateSimplePDF = async (content, metadata = {}) => {
  const { theme } = metadata;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 30px;
          padding: 0;
          color: #000000;
          line-height: 1.5;
          background: #ffffff;
          font-size: 12px;
          white-space: pre-line;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ 
      html,
      width: 595,
      height: 842,
      margins: { left: 40, right: 40, top: 40, bottom: 40 }
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Baixar ${theme} - PDF`,
        UTI: 'com.adobe.pdf'
      });
    }

    return uri;
  } catch (error) {
    throw new Error('Falha ao gerar PDF: ' + error.message);
  }
};