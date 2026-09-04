/**
 * PackScan Backend Server — SIH 2026 SIH26034
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('🔥 [CRITICAL UNCAUGHT EXCEPTION]:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [UNHANDLED PROMISE REJECTION]:', reason);
});

const db = require('./database/db');
const { analyzeLegalMetrologyCompliance } = require('./services/legalMetrologyService');
const { evaluateAllergiesAndHealth, getAllergenData, getDiseaseData } = require('./services/allergyHealthService');
const { matchRegulatoryAdditives, loadDatasets } = require('./services/regulatoryService');
const {
  lookupProductByBarcode,
  findSaferAlternatives,
  saveToLocalDB,
  updateProductInLocalDB,
} = require('./services/openFoodFactsService');
const { extractTextFromImage, cleanOCRText } = require('./services/ocrService');
const { isGeminiAvailable, analyzePackagingWithGemini } = require('./services/geminiVisionService');

const app = express();
const PORT = process.env.PORT || 5001;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `label_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(uploadDir));

// ─────────────────────────────────────────────────────────────────────────────
// Shared analysis pipeline (compliance + health + regulatory + alternatives)
// Does NOT touch source / confidence — those come from the product lookup layer.
// ─────────────────────────────────────────────────────────────────────────────
async function runUnifiedAnalysis({
  labelText, productData, userProfile, scanType,
  imagePath, deviceId, barcode, evidenceSources,
}) {
  const combinedText = [
    labelText || '',
    productData?.ingredients_text || '',
    productData?.product_name ? `Product Name: ${productData.product_name}` : '',
    productData?.brands ? `Brand: ${productData.brands}` : '',
    productData?.quantity ? `Net Quantity: ${productData.quantity}` : '',
    productData?.country_of_origin ? `Country of Origin: ${productData.country_of_origin}` : '',
    productData?.generic_name ? `Generic Name: ${productData.generic_name}` : '',
    productData?.manufacturing_places ? `Manufactured by: ${productData.manufacturing_places}` : '',
    productData?.customer_service ? `Consumer Care: ${productData.customer_service}` : '',
  ].filter(Boolean).join('\n');

  const complianceReport = analyzeLegalMetrologyCompliance(combinedText, {
    product_name: productData?.product_name,
    categories: productData?.categories,
    brands: productData?.brands,
    barcode,
    scanType,
    quantity: productData?.quantity,
    country_of_origin: productData?.country_of_origin,
    generic_name: productData?.generic_name,
    manufacturing_places: productData?.manufacturing_places,
    evidenceSources,
  });

  const nutriments = productData?.nutriments || {};
  const healthEvaluation = evaluateAllergiesAndHealth(combinedText, nutriments, userProfile || {});
  const regulatoryAdditives = matchRegulatoryAdditives(combinedText);
  const alternatives = await findSaferAlternatives(
    productData || { categories: 'Snacks' },
    userProfile || {}
  );

  // Persist scan to history
  let scanId = null;
  try {
    const res = await db.run(
      `INSERT INTO scan_history
         (device_id, scan_type, product_name, barcode, image_path,
          compliance_status, compliance_score, compliance_report,
          allergy_alerts, regulatory_flags, data_source, confidence)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        deviceId || 'guest',
        scanType || 'manual',
        productData?.product_name || 'Scanned Commodity',
        barcode || null,
        imagePath || null,
        complianceReport.overallStatus,
        complianceReport.score,
        JSON.stringify(complianceReport),
        JSON.stringify(healthEvaluation),
        JSON.stringify(regulatoryAdditives),
        productData?.dataSource || 'unknown',
        productData?.confidence || 'needs_verification',
      ]
    );
    scanId = res.id;
  } catch (err) {
    console.error('History save error:', err.message);
  }

  return {
    scanId,
    product: {
      name: productData?.product_name || 'Scanned Packaged Commodity',
      brand: productData?.brands || productData?.brand || 'Unknown Brand',
      barcode: barcode || productData?.barcode || null,
      imageUrl: productData?.image_url || null,
      category: productData?.categories || 'Packaged Commodity',
      nutriments,
      // Data provenance fields (used by UI DataSourceBadge)
      dataSource: productData?.dataSource || 'unknown',
      confidence: productData?.confidence || 'needs_verification',
      source: productData?.source || 'UNKNOWN',
    },
    rawExtractedText: combinedText,
    complianceReport,
    healthEvaluation,
    regulatoryAdditives,
    alternatives,
    analyzedAt: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', service: 'PackScan Legal Metrology & Health API', timestamp: new Date().toISOString() })
);

app.get('/api/allergens', (req, res) => res.json(getAllergenData()));
app.get('/api/diseases',  (req, res) => res.json(getDiseaseData()));

app.get('/api/regulatory-dataset', (req, res) => {
  const { regulatoryDataset } = loadDatasets();
  res.json(regulatoryDataset);
});
app.get('/api/substitute-warnings', (req, res) => {
  const { substituteWarnings } = loadDatasets();
  res.json(substituteWarnings);
});

app.get('/api/presets', (req, res) => {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'data/sample_products.json'), 'utf8');
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ error: 'Failed to load presets' });
  }
});

// Profile
app.get('/api/profile/:deviceId', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM user_profiles WHERE device_id = ?', [req.params.deviceId]);
    res.json(row
      ? { ...row, allergies: JSON.parse(row.allergies || '[]'), conditions: JSON.parse(row.conditions || '[]') }
      : { device_id: req.params.deviceId, allergies: [], conditions: [], sugar_threshold: 15, sodium_threshold: 400, sat_fat_threshold: 5 }
    );
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/profile', async (req, res) => {
  const { device_id, allergies, conditions, sugar_threshold, sodium_threshold, sat_fat_threshold } = req.body;
  if (!device_id) return res.status(400).json({ error: 'device_id required' });
  try {
    await db.run(
      `INSERT OR REPLACE INTO user_profiles
         (device_id, allergies, conditions, sugar_threshold, sodium_threshold, sat_fat_threshold, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [device_id, JSON.stringify(allergies || []), JSON.stringify(conditions || []),
       sugar_threshold || 15, sodium_threshold || 400, sat_fat_threshold || 5]
    );
    res.json({ status: 'SUCCESS' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── BARCODE SCAN ──────────────────────────────────────────────────────────────
app.post('/api/scan/barcode', async (req, res) => {
  try {
    const { barcode, userProfile, deviceId } = req.body;
    if (!barcode) return res.status(400).json({ error: 'barcode required' });

    console.log(`[Scan/Barcode] ${barcode}`);
    const productData = await lookupProductByBarcode(barcode);

    if (!productData) {
      return res.status(404).json({
        status: 'NOT_FOUND',
        error: 'PRODUCT_NOT_FOUND',
        barcode,
        message: `Barcode "${barcode}" was not found in OpenFoodFacts or our local database.`,
        action: 'FEEDBACK_FORUM',
      });
    }

    const analysis = await runUnifiedAnalysis({ labelText: '', productData, userProfile, scanType: 'barcode', deviceId, barcode });
    res.json(analysis);
  } catch (err) {
    console.error('Barcode scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── MULTI-EVIDENCE GUIDED CAPTURE (STAGE 2 & 3) ─────────────────────────
app.post(
  '/api/scan/multi-evidence',
  upload.fields([
    { name: 'frontPhoto', maxCount: 1 },
    { name: 'backPhoto', maxCount: 1 },
    { name: 'sidePhoto', maxCount: 1 },
    { name: 'additionalPhoto', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const barcode = req.body.barcode ? req.body.barcode.trim() : null;
      let userProfile = {};
      if (req.body.userProfile) {
        try { userProfile = JSON.parse(req.body.userProfile); } catch (_) {}
      }
      const deviceId = req.body.deviceId || 'guest';

      console.log(`[Multi-Evidence Scan] Barcode: ${barcode}, Uploaded Files:`, Object.keys(req.files || {}));

      // 1. Barcode Lookup Chain (Open Food Facts -> Local DB)
      let productData = null;
      if (barcode) {
        productData = await lookupProductByBarcode(barcode);
      }

      // 2. High-Accuracy Extraction: Try Gemini Vision AI first, fallback to Tesseract OCR
      let combinedOCR = '';
      const ocrResults = [];
      const evidenceSources = {};

      const uploadedImagePaths = [
        req.files?.frontPhoto?.[0]?.path,
        req.files?.backPhoto?.[0]?.path,
        req.files?.sidePhoto?.[0]?.path,
        req.files?.additionalPhoto?.[0]?.path,
      ].filter(Boolean);

      let geminiResult = null;
      if (isGeminiAvailable() && uploadedImagePaths.length > 0) {
        console.log(`[Multi-Evidence Scan] Attempting High-Accuracy Gemini Vision extraction on ${uploadedImagePaths.length} photo(s)...`);
        geminiResult = await analyzePackagingWithGemini(uploadedImagePaths, barcode);
      }

      if (geminiResult) {
        console.log('[Multi-Evidence Scan] Utilizing Gemini Vision structured extraction.');
        combinedOCR = [
          geminiResult.raw_transcribed_text || '',
          geminiResult.mrp_declaration ? `MRP: ${geminiResult.mrp_declaration}` : '',
          geminiResult.net_quantity ? `Net Qty: ${geminiResult.net_quantity}` : '',
          geminiResult.manufacturer_address ? `Manufactured by: ${geminiResult.manufacturer_address}` : '',
          geminiResult.mfg_date ? `Manufacturing Date: ${geminiResult.mfg_date}` : '',
          geminiResult.consumer_care ? `Consumer Care: ${geminiResult.consumer_care}` : '',
          geminiResult.generic_name ? `Generic Name: ${geminiResult.generic_name}` : '',
          geminiResult.unit_sale_price ? `Unit Sale Price: ${geminiResult.unit_sale_price}` : '',
          geminiResult.country_of_origin ? `Country of Origin: ${geminiResult.country_of_origin}` : '',
          geminiResult.ingredients_text ? `INGREDIENTS: ${geminiResult.ingredients_text}` : '',
        ].filter(Boolean).join('\n');

        ocrResults.push({
          angle: 'Multi-Angle Packaging Photos (Gemini Vision AI)',
          text: geminiResult.raw_transcribed_text || combinedOCR,
          confidence: 98,
        });

        productData = {
          product_name: geminiResult.product_name || productData?.product_name || 'Scanned Packaged Commodity',
          brand: geminiResult.brand || productData?.brand || 'Verified Brand',
          barcode: barcode || productData?.barcode,
          categories: productData?.categories || 'Packaged Commodity',
          image_url: productData?.image_url || `/uploads/${path.basename(uploadedImagePaths[0])}`,
          ingredients_text: geminiResult.ingredients_text || productData?.ingredients_text || '',
          nutriments: {
            ...(productData?.nutriments || {}),
            ...(geminiResult.nutriments || {}),
          },
          dataSource: 'GEMINI_VISION_AI',
          confidence: 'high',
          source: 'GEMINI_VISION_AI',
        };
      } else {
        // Fallback to local offline Tesseract.js OCR
        console.log('[OCR] Processing all captured photos with local Tesseract.js engine...');
        const ocrTasks = [
          req.files?.frontPhoto?.[0]
            ? extractTextFromImage(req.files.frontPhoto[0].path)
                .then((r) => ({ key: 'front', angle: 'Front of Pack', r }))
                .catch((err) => ({ key: 'front', angle: 'Front of Pack', r: { cleanedText: '', confidence: 0, error: err.message } }))
            : null,
          req.files?.backPhoto?.[0]
            ? extractTextFromImage(req.files.backPhoto[0].path)
                .then((r) => ({ key: 'back', angle: 'Back of Pack', r }))
                .catch((err) => ({ key: 'back', angle: 'Back of Pack', r: { cleanedText: '', confidence: 0, error: err.message } }))
            : null,
          req.files?.sidePhoto?.[0]
            ? extractTextFromImage(req.files.sidePhoto[0].path)
                .then((r) => ({ key: 'side', angle: 'Side / Edge of Pack', r }))
                .catch((err) => ({ key: 'side', angle: 'Side / Edge of Pack', r: { cleanedText: '', confidence: 0, error: err.message } }))
            : null,
          req.files?.additionalPhoto?.[0]
            ? extractTextFromImage(req.files.additionalPhoto[0].path)
                .then((r) => ({ key: 'additional', angle: 'Additional Photo Angle', r }))
                .catch((err) => ({ key: 'additional', angle: 'Additional Photo Angle', r: { cleanedText: '', confidence: 0, error: err.message } }))
            : null,
        ].filter(Boolean);

        const ocrOutputs = await Promise.all(ocrTasks);
        for (const item of ocrOutputs) {
          evidenceSources[item.key] = item.r.cleanedText;
          ocrResults.push({ angle: item.angle, text: item.r.cleanedText, confidence: item.r.confidence });
        }

        combinedOCR = Object.values(evidenceSources).filter(Boolean).join('\n\n');
      }

      // 4. Run Unified Legal Metrology and Safety Analysis
      const analysis = await runUnifiedAnalysis({
        labelText: combinedOCR,
        productData: productData || {
          product_name: 'Scanned Packaged Commodity',
          brand: 'Verified Packaging',
          categories: 'Packaged Commodity',
          source: 'OCR_MULTI_ANGLE',
        },
        userProfile,
        scanType: 'multi_evidence_ocr',
        deviceId,
        barcode,
        evidenceSources,
        imagePath: req.files?.frontPhoto?.[0]?.path || req.files?.backPhoto?.[0]?.path || null,
      });

      analysis.ocrResults = ocrResults;
      res.json(analysis);
    } catch (err) {
      console.error('[Multi-Evidence Scan Error]:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ── IMAGE / OCR SCAN ─────────────────────────────────────────────────────────
app.post('/api/scan/image', upload.single('labelImage'), async (req, res) => {
  try {
    let imagePath = null;
    let userProfile = {};
    let deviceId = 'guest';
    let barcode = null;

    if (req.body.userProfile) {
      try { userProfile = JSON.parse(req.body.userProfile); } catch (_) {}
    }
    if (req.body.deviceId) deviceId = req.body.deviceId;
    if (req.body.barcode) barcode = req.body.barcode.trim();

    if (req.file) {
      imagePath = req.file.path;
    } else if (req.body.imageBase64) {
      const matches = req.body.imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const buf = Buffer.from(matches ? matches[2] : req.body.imageBase64, 'base64');
      const fname = `label_${Date.now()}.jpg`;
      imagePath = path.join(uploadDir, fname);
      fs.writeFileSync(imagePath, buf);
    } else {
      return res.status(400).json({ error: 'Image file or base64 required' });
    }

    console.log(`[Scan/OCR] ${imagePath}`);
    let geminiResult = null;
    if (isGeminiAvailable()) {
      console.log('[Scan/Image] Attempting Gemini Vision extraction...');
      geminiResult = await analyzePackagingWithGemini([imagePath], barcode);
    }

    let ocrResult = null;
    let labelTextForAnalysis = '';
    if (geminiResult) {
      labelTextForAnalysis = [
        geminiResult.raw_transcribed_text || '',
        geminiResult.mrp_declaration ? `MRP: ${geminiResult.mrp_declaration}` : '',
        geminiResult.net_quantity ? `Net Qty: ${geminiResult.net_quantity}` : '',
        geminiResult.manufacturer_address ? `Manufactured by: ${geminiResult.manufacturer_address}` : '',
        geminiResult.mfg_date ? `Manufacturing Date: ${geminiResult.mfg_date}` : '',
        geminiResult.consumer_care ? `Consumer Care: ${geminiResult.consumer_care}` : '',
        geminiResult.generic_name ? `Generic Name: ${geminiResult.generic_name}` : '',
        geminiResult.unit_sale_price ? `Unit Sale Price: ${geminiResult.unit_sale_price}` : '',
        geminiResult.country_of_origin ? `Country of Origin: ${geminiResult.country_of_origin}` : '',
        geminiResult.ingredients_text ? `INGREDIENTS: ${geminiResult.ingredients_text}` : '',
      ].filter(Boolean).join('\n');
      ocrResult = { cleanedText: labelTextForAnalysis, confidence: 98 };
    } else {
      ocrResult = await extractTextFromImage(imagePath);
      labelTextForAnalysis = ocrResult.cleanedText;
    }

    // Try to match OCR text against catalog to get a better product name
    let productData = null;
    if (barcode) {
      productData = await lookupProductByBarcode(barcode);
    }

    if (!productData) {
      // Build a pure OCR-derived product object
      const lines = ocrResult.cleanedText.split('\n').map((l) => l.trim()).filter(Boolean);
      const lower = ocrResult.cleanedText.toLowerCase();

      let detectedBrand = 'Physical Packaging Label';
      let detectedName = lines.length > 0 ? lines[0].substring(0, 60) : 'Scanned Packaging Label';

      if (lower.includes('maggi')) {
        detectedBrand = 'Nestlé / Maggi';
        if (lower.includes('noodle') || lower.includes('masala')) detectedName = 'MAGGI 2-Minute Masala Noodles';
      } else if (lower.includes('amul')) {
        detectedBrand = 'Amul (GCMMF)';
        if (lower.includes('butter')) detectedName = 'Amul Pasteurised Butter';
        else if (lower.includes('cheese')) detectedName = 'Amul Processed Cheese';
      } else if (lower.includes('britannia')) {
        detectedBrand = 'Britannia Industries';
      } else if (lower.includes('parle')) {
        detectedBrand = 'Parle Products';
      } else if (lower.includes('tata')) {
        detectedBrand = 'Tata Consumer Products';
      } else if (lower.includes('cadbury') || lower.includes('mondelez') || lower.includes('bournvita')) {
        detectedBrand = 'Mondelez / Cadbury';
      } else if (lower.includes('lays') || lower.includes("lay's") || lower.includes('kurkure')) {
        detectedBrand = 'PepsiCo India';
      }

      productData = {
        product_name: detectedName,
        brands: detectedBrand,
        brand: detectedBrand,
        ingredients_text: ocrResult.cleanedText,
        nutriments: {},
        categories: 'Packaged Commodity',
        image_url: `/uploads/${path.basename(imagePath)}`,
        dataSource: geminiResult ? 'GEMINI_VISION_AI' : 'ocr',
        confidence: geminiResult ? 'high' : (ocrResult.confidence >= 70 ? 'high' : 'needs_verification'),
        source: geminiResult ? 'GEMINI_VISION_AI' : 'TESSERACT_OCR',
        barcode: barcode,
      };

      // Save verified result to scanned_products if barcode provided
      if (barcode) {
        await saveToLocalDB({ ...productData, barcode });
      }
    }

    const analysis = await runUnifiedAnalysis({
      labelText: labelTextForAnalysis,
      productData,
      userProfile,
      scanType: 'label_ocr',
      imagePath: `/uploads/${path.basename(imagePath)}`,
      deviceId,
      barcode,
    });
    analysis.ocrConfidence = ocrResult.confidence;
    res.json(analysis);
  } catch (err) {
    console.error('Image scan error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── TEXT SCAN ────────────────────────────────────────────────────────────────
app.post('/api/scan/text', async (req, res) => {
  try {
    const { labelText, userProfile, deviceId, productName } = req.body;
    if (!labelText) return res.status(400).json({ error: 'labelText required' });

    const cleaned = cleanOCRText(labelText);
    const productData = {
      product_name: productName || 'Packaged Commodity Label',
      brands: 'Manual Entry',
      ingredients_text: cleaned,
      nutriments: {},
      categories: 'Packaged Food',
      dataSource: 'manual',
      confidence: 'needs_verification',
      source: 'TEXT_INPUT',
    };

    const analysis = await runUnifiedAnalysis({ labelText: cleaned, productData, userProfile, scanType: 'label_text', deviceId });
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INLINE PRODUCT CORRECTION ────────────────────────────────────────────────
// Called when user clicks "Edit this" on an OCR-extracted field
app.patch('/api/products/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const fields = req.body; // { product_name, brand, ingredients, allergens, nutriments }
    await updateProductInLocalDB(barcode, fields);
    res.json({ status: 'SUCCESS', message: 'Product updated in local database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOCAL DB BROWSER ────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const rows = await db.query('SELECT barcode, product_name, brand, source, confidence, last_updated FROM scanned_products ORDER BY last_updated DESC LIMIT 100');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── FEEDBACK FORUM ───────────────────────────────────────────────────────────
app.get('/api/feedback', async (req, res) => {
  try {
    const rows = await db.query('SELECT * FROM product_feedback ORDER BY upvotes DESC, created_at DESC LIMIT 50');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feedback', async (req, res) => {
  try {
    const { device_id, barcode, product_name, brand, category, notes } = req.body;
    if (!product_name?.trim()) return res.status(400).json({ error: 'Product name required' });
    const result = await db.run(
      `INSERT INTO product_feedback (device_id, barcode, product_name, brand, category, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [device_id || 'guest', barcode || null, product_name.trim(), brand?.trim() || null, category || 'General', notes?.trim() || null]
    );
    res.json({ status: 'SUCCESS', id: result.id, message: 'Product request submitted!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/feedback/:id/upvote', async (req, res) => {
  try {
    await db.run('UPDATE product_feedback SET upvotes = upvotes + 1 WHERE id = ?', [req.params.id]);
    const row = await db.get('SELECT upvotes FROM product_feedback WHERE id = ?', [req.params.id]);
    res.json({ status: 'SUCCESS', upvotes: row?.upvotes || 1 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ENFORCEMENT OFFICIAL DASHBOARD & REPOSITORY ───────────────────────────────
app.get('/api/enforcement/analytics', async (req, res) => {
  try {
    const totalRow = await db.get('SELECT COUNT(*) as count FROM scan_history');
    const compliantRow = await db.get("SELECT COUNT(*) as count FROM scan_history WHERE compliance_status = 'COMPLIANT'");
    const partialRow = await db.get("SELECT COUNT(*) as count FROM scan_history WHERE compliance_status IN ('PARTIALLY_COMPLIANT', 'DIGITAL_RECORD_VERIFIED')");
    const nonCompliantRow = await db.get("SELECT COUNT(*) as count FROM scan_history WHERE compliance_status = 'NON_COMPLIANT'");

    const totalInspections = totalRow?.count || 0;
    const compliantCount = compliantRow?.count || 0;
    const partialCount = partialRow?.count || 0;
    const nonCompliantCount = nonCompliantRow?.count || 0;
    const violationRate = totalInspections > 0 ? Math.round(((partialCount + nonCompliantCount) / totalInspections) * 100) : 0;

    const recentRows = await db.query('SELECT * FROM scan_history ORDER BY created_at DESC LIMIT 50');

    const ruleCounts = {
      'MRP & Tax Declaration (Rule 6(1)(e))': 0,
      'Net Quantity & Metric Units (Rule 6(1)(b))': 0,
      'Manufacturer Name & Address (Rule 6(1)(a))': 0,
      'Month & Year of Mfg/Packing (Rule 6(1)(d))': 0,
      'Consumer Care Channel (Rule 6(1)(n))': 0,
      'Generic Commodity Name (Rule 6(1)(c))': 0,
      'Unit Sale Price / USP (Rule 6(11))': 0,
      'Country of Origin (Rule 6(1)(m))': 0,
      'Font Size & Height (Rule 9 Table-I)': 0,
    };

    const brandViolations = {};

    recentRows.forEach((r) => {
      try {
        const report = JSON.parse(r.compliance_report || '{}');
        if (report.violations) {
          report.violations.forEach((v) => {
            if (v.field?.includes('MRP')) ruleCounts['MRP & Tax Declaration (Rule 6(1)(e))']++;
            else if (v.field?.includes('Quantity') || v.field?.includes('Weight')) ruleCounts['Net Quantity & Metric Units (Rule 6(1)(b))']++;
            else if (v.field?.includes('Manufacturer') || v.field?.includes('Address')) ruleCounts['Manufacturer Name & Address (Rule 6(1)(a))']++;
            else if (v.field?.includes('Date') || v.field?.includes('Month')) ruleCounts['Month & Year of Mfg/Packing (Rule 6(1)(d))']++;
            else if (v.field?.includes('Consumer Care')) ruleCounts['Consumer Care Channel (Rule 6(1)(n))']++;
            else if (v.field?.includes('Generic')) ruleCounts['Generic Commodity Name (Rule 6(1)(c))']++;
            else if (v.field?.includes('Unit Sale Price') || v.field?.includes('USP')) ruleCounts['Unit Sale Price / USP (Rule 6(11))']++;
            else if (v.field?.includes('Origin')) ruleCounts['Country of Origin (Rule 6(1)(m))']++;
            else if (v.field?.includes('Font')) ruleCounts['Font Size & Height (Rule 9 Table-I)']++;
          });
        }

        const brandName = r.product_name?.split(' ')[0] || 'Unknown Brand';
        if (r.compliance_status !== 'COMPLIANT') {
          brandViolations[brandName] = (brandViolations[brandName] || 0) + 1;
        }
      } catch (_) {}
    });

    const topOffendingBrands = Object.entries(brandViolations)
      .map(([brand, count]) => ({ brand, violations: count }))
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);

    res.json({
      totalInspections,
      compliantCount,
      partialCount,
      nonCompliantCount,
      violationRate,
      ruleCounts,
      topOffendingBrands,
      recentInspections: recentRows.map((r) => ({
        ...r,
        compliance_report: JSON.parse(r.compliance_report || '{}'),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/enforcement/inspection/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM scan_history WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Inspection record not found' });
    res.json({
      ...row,
      compliance_report: JSON.parse(row.compliance_report || '{}'),
      allergy_alerts: JSON.parse(row.allergy_alerts || '{}'),
      regulatory_flags: JSON.parse(row.regulatory_flags || '[]'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── HISTORY ──────────────────────────────────────────────────────────────────
app.get('/api/history/:deviceId', async (req, res) => {
  try {
    const rows = await db.query(
      'SELECT * FROM scan_history WHERE device_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.params.deviceId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

async function seedCatalogToDatabase() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, 'data/sample_products.json'), 'utf8');
    const samples = JSON.parse(raw);
    for (const sample of samples) {
      await saveToLocalDB({
        barcode: sample.barcode,
        product_name: sample.name,
        brands: sample.brand,
        ingredients_text: sample.label_text,
        nutriments: sample.nutriments || {},
        allergens: [],
        categories: sample.category,
        image_url: sample.image_url,
        source: 'catalog',
        confidence: 'high',
        raw_data: sample,
      });
    }
    console.log(`[DB] Successfully seeded ${samples.length} catalog products to SQLite database.`);
  } catch (err) {
    console.warn('[DB] Catalog pre-seeding notice:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`\n${'═'.repeat(55)}`);
  console.log(`🚀  PackScan API  →  http://localhost:${PORT}`);
  console.log(`📋  Legal Metrology 2011 Engine:      ACTIVE`);
  console.log(`🩺  Allergy & Disease Engine:         ACTIVE`);
  console.log(`🔗  4-Step Product Lookup Chain:      ACTIVE`);
  console.log(`💬  Community Feedback Forum:         ACTIVE`);
  console.log(`${'═'.repeat(55)}\n`);

  await seedCatalogToDatabase();
});
