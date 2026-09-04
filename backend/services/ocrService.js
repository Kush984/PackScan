const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');

let workerInstance = null;

async function getWorker() {
  if (!workerInstance) {
    workerInstance = await createWorker('eng');
  }
  return workerInstance;
}

async function preprocessImage(inputPath) {
  try {
    // 1. Grayscale + Normalized Contrast + Sharpened
    const enhancedBuffer = await sharp(inputPath)
      .resize({ width: 2800, withoutEnlargement: false, fit: 'inside' })
      .grayscale()
      .normalize()
      .sharpen({ sigma: 2.0, m1: 2.0, m2: 0.8 })
      .toBuffer();

    // 2. High-contrast binarized (Threshold)
    const binarizedBuffer = await sharp(inputPath)
      .resize({ width: 2800, withoutEnlargement: false, fit: 'inside' })
      .grayscale()
      .threshold(135)
      .toBuffer();

    // 3. Dot-Matrix Inkjet Dot-Connector (bridges gaps between inkjet dots)
    const dotMatrixBuffer = await sharp(inputPath)
      .resize({ width: 2800, withoutEnlargement: false, fit: 'inside' })
      .grayscale()
      .linear(2.0, -40)
      .blur(0.6)
      .threshold(150)
      .toBuffer();

    return { enhancedBuffer, binarizedBuffer, dotMatrixBuffer };
  } catch (err) {
    console.error('[Image Preprocessing Error]', err.message);
    return null;
  }
}

async function extractTextFromImage(imagePathOrBuffer) {
  try {
    console.log('[OCR] Preprocessing image with Sharp & running Tesseract.js...');
    const worker = await getWorker();

    let text1 = '';
    let text2 = '';
    let text3 = '';
    let conf1 = 0;
    let conf2 = 0;
    let conf3 = 0;

    if (typeof imagePathOrBuffer === 'string' && fs.existsSync(imagePathOrBuffer)) {
      const processed = await preprocessImage(imagePathOrBuffer);
      if (processed) {
        // Pass 1: Enhanced Grayscale + Normalized
        const res1 = await worker.recognize(processed.enhancedBuffer);
        text1 = res1.data.text || '';
        conf1 = res1.data.confidence || 0;

        // Pass 2: High Contrast Binarized
        const res2 = await worker.recognize(processed.binarizedBuffer);
        text2 = res2.data.text || '';
        conf2 = res2.data.confidence || 0;

        // Pass 3: Dot Matrix Connector
        const res3 = await worker.recognize(processed.dotMatrixBuffer);
        text3 = res3.data.text || '';
        conf3 = res3.data.confidence || 0;
      } else {
        const res = await worker.recognize(imagePathOrBuffer);
        text1 = res.data.text || '';
        conf1 = res.data.confidence || 0;
      }
    } else {
      const res = await worker.recognize(imagePathOrBuffer);
      text1 = res.data.text || '';
      conf1 = res.data.confidence || 0;
    }

    const combinedRaw = [text1, text2, text3].filter(Boolean).join('\n');
    const cleanedText = cleanOCRText(combinedRaw);
    const bestConfidence = Math.max(conf1, conf2, conf3);

    return {
      rawText: combinedRaw,
      cleanedText,
      confidence: bestConfidence,
    };
  } catch (err) {
    console.error('[OCR Error]', err.message);
    return {
      rawText: '',
      cleanedText: '',
      confidence: 0,
      error: err.message,
    };
  }
}

function cleanOCRText(text) {
  if (!text) return '';

  return (
    text
      // Standardize quotes and hyphens
      .replace(/[“”"']/g, '"')
      .replace(/[–—−]/g, '-')
      // Fix common OCR misreads on Indian currency & symbols
      .replace(/\bM[\s\.]*R[\s\.]*P[\s\.:;]*/gi, 'MRP ')
      .replace(/\b(?:Rs|Re)[\s\.:;]*/gi, 'Rs. ')
      .replace(/\bN[\s\.]*e[\s\.]*t[\s\.]*(?:Qty|Quantity|Weight|Wt)[\s\.:;]*/gi, 'Net Qty: ')
      .replace(/\bM[\s\.]*f[\s\.]*d[\s\.:;]*(?:by)?/gi, 'Mfd. By: ')
      .replace(/\bP[\s\.]*k[\s\.]*d[\s\.:;]*/gi, 'Pkd: ')
      .replace(/\bU[\s\.]*S[\s\.]*P[\s\.:;]*/gi, 'USP: ')
      .replace(/\bC[\s\.]*o[\s\.]*u[\s\.]*n[\s\.]*t[\s\.]*r[\s\.]*y[\s\.]*o[\s\.]*f[\s\.]*O[\s\.]*r[\s\.]*i[\s\.]*g[\s\.]*i[\s\.]*n/gi, 'Country of Origin: ')
      // Clean up multiple spaces and empty lines
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  );
}

module.exports = {
  extractTextFromImage,
  cleanOCRText,
};
