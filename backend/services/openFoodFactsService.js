/**
 * PackScan — 4-Step Product Lookup Chain
 *
 * Step 1: scanned_products SQLite table (fastest — products we've seen before)
 * Step 2: local sample_products.json catalog (pre-seeded FMCG)
 * Step 3: Open Food Facts API (world + India endpoints)
 * Step 4: returns null → caller handles OCR / manual fallback
 *
 * Results from Step 3 are saved into scanned_products automatically.
 * OCR results are saved by server.js after OCR runs.
 */

const axios = require('axios');
const db = require('../database/db');
const fs = require('fs');
const path = require('path');
const { checkSubstituteWarnings } = require('./regulatoryService');

// ─────────────────────────────────────────────────────────────────────────────
// EAN-13 / UPC-A check digit validator
// Returns true if the barcode number is mathematically valid.
// ─────────────────────────────────────────────────────────────────────────────
function isValidEAN(barcode) {
  const s = barcode.toString().trim();
  if (!/^\d+$/.test(s)) return false;
  if (s.length !== 13 && s.length !== 12 && s.length !== 8) return false;

  // Pad to 13 digits if UPC-A (12 digits)
  const digits = s.length === 12 ? `0${s}` : s;
  if (digits.length !== 13 && digits.length !== 8) return true; // don't reject non-standard lengths

  const arr = digits.split('').map(Number);
  const check = arr.pop(); // last digit is check digit
  const sum = arr.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const computed = (10 - (sum % 10)) % 10;
  return computed === check;
}

// ─────────────────────────────────────────────────────────────────────────────
// Barcode variant generator — tries common Indian EAN-13 normalisations
// ─────────────────────────────────────────────────────────────────────────────
function getBarcodeVariants(rawBarcode) {
  const clean = (rawBarcode || '').toString().trim().replace(/[\s\-]/g, '');
  const candidates = new Set([clean]);

  // 12-digit starting with 90 → prepend 8 (Indian GS1 prefix)
  if (clean.length === 12 && clean.startsWith('90')) candidates.add(`8${clean}`);

  // Any 12-digit starting with 9 → try 8-prefix variants
  if (clean.length === 12 && clean.startsWith('9')) {
    candidates.add(`8${clean}`);
    candidates.add(`89${clean.substring(1)}`);
  }

  // 13-digit 890... → also try the 12-digit form
  if (clean.startsWith('890') && clean.length === 13) {
    candidates.add(clean.substring(1));
    candidates.add(`0${clean}`);
  }

  // Leading zero strip / add
  if (clean.startsWith('0')) candidates.add(clean.replace(/^0+/, ''));
  if (clean.length === 12) candidates.add(`0${clean}`);

  // Corrupted 13-digit: replace first digit with 8
  if (clean.length === 13 && !clean.startsWith('8')) candidates.add(`8${clean.substring(1)}`);

  // Drop check digit (13→12)
  if (clean.length === 13) candidates.add(clean.substring(0, 12));

  return Array.from(candidates);
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 helper — lookup in scanned_products SQLite table
// ─────────────────────────────────────────────────────────────────────────────
async function lookupInLocalDB(barcodeCandidates) {
  for (const b of barcodeCandidates) {
    try {
      const row = await db.get('SELECT * FROM scanned_products WHERE barcode = ?', [b]);
      if (row) {
        console.log(`[DB] scanned_products hit: ${b} (source: ${row.source})`);
        const raw = row.raw_data ? JSON.parse(row.raw_data) : null;
        return {
          source: row.source === 'openfoodfacts' ? 'OPEN_FOOD_FACTS' :
                  row.source === 'catalog'       ? 'CATALOG_DB'      :
                  row.source === 'ocr'           ? 'OCR_CACHE'       : 'MANUAL',
          dataSource: row.source,
          confidence: row.confidence || 'high',
          barcode: row.barcode,
          product_name: row.product_name,
          brands: row.brand,
          ingredients_text: row.ingredients,
          label_text: row.ingredients,
          mfg_date: raw?.mfg_date,
          expiry_date: raw?.expiry_date || raw?.use_by,
          mrp: raw?.mrp,
          unit_sale_price: raw?.unit_sale_price,
          quantity: raw?.quantity || raw?.net_quantity,
          nutriments: row.nutriments ? JSON.parse(row.nutriments) : {},
          allergens: row.allergens ? JSON.parse(row.allergens) : [],
          categories: row.categories,
          image_url: row.image_url,
          raw_data: raw,
        };
      }
    } catch (err) {
      console.warn('[DB] scanned_products lookup error:', err.message);
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 helper — lookup in local sample_products.json catalog
// ─────────────────────────────────────────────────────────────────────────────
function lookupInCatalog(barcodeCandidates) {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../data/sample_products.json'), 'utf8');
    const samples = JSON.parse(raw);
    for (const b of barcodeCandidates) {
      const match = samples.find(
        (s) => s.barcode === b || (Array.isArray(s.barcodes) && s.barcodes.includes(b))
      );
      if (match) {
        console.log(`[Catalog] Matched: ${b} → ${match.name}`);
        return {
          source: 'CATALOG_DB',
          dataSource: 'catalog',
          confidence: 'high',
          barcode: b,
          product_name: match.name,
          brands: match.brand,
          ingredients_text: match.label_text,
          label_text: match.label_text,
          mfg_date: match.mfg_date,
          expiry_date: match.expiry_date || match.use_by,
          mrp: match.mrp,
          unit_sale_price: match.unit_sale_price,
          quantity: match.net_quantity || match.quantity,
          generic_name: match.generic_name,
          country_of_origin: match.country_of_origin,
          customer_service: match.customer_service,
          manufacturing_places: match.manufacturing_places,
          nutriments: match.nutriments || {},
          allergens: match.allergens || [],
          categories: match.category,
          image_url: match.image_url,
          raw_data: match,
        };
      }
    }
  } catch (err) {
    console.error('[Catalog] Read error:', err.message);
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 helper — Open Food Facts API
// ─────────────────────────────────────────────────────────────────────────────
async function lookupOnOpenFoodFacts(barcodeCandidates) {
  for (const b of barcodeCandidates) {
    const endpoints = [
      `https://world.openfoodfacts.org/api/v2/product/${b}.json`,
      `https://in.openfoodfacts.org/api/v2/product/${b}.json`,
    ];
    for (const url of endpoints) {
      try {
        console.log(`[OFF] Querying: ${url}`);
        const res = await axios.get(url, {
          timeout: 4000,
          headers: {
            'User-Agent': 'PackScan-SIH2026/1.0 (github.com/packscan; contact@packscan.in)',
          },
        });
        if (res.data?.status === 1 && res.data.product) {
          const p = res.data.product;
          const product = {
            source: 'OPEN_FOOD_FACTS',
            dataSource: 'openfoodfacts',
            confidence: 'high',
            barcode: b,
            product_name: p.product_name || p.product_name_en || 'Packaged Commodity',
            brands: p.brands || p.brand_owner || '',
            ingredients_text: p.ingredients_text || p.ingredients_text_en || '',
            quantity: p.quantity || p.product_quantity || '',
            country_of_origin: p.countries || p.origins || (p.countries_tags?.some((c) => c.includes('india')) ? 'India' : 'India'),
            generic_name: p.generic_name || p.generic_name_en || p.product_name || '',
            manufacturing_places: p.manufacturing_places || p.brand_owner || p.brands || '',
            packaging: p.packaging_text || p.packaging || '',
            customer_service: p.customer_service || '',
            nutriments: {
              sugars_100g: p.nutriments?.sugars_100g ?? null,
              sodium_100g: p.nutriments?.sodium_100g
                ? Math.round(p.nutriments.sodium_100g * 1000)
                : p.nutriments?.salt_100g
                ? Math.round(p.nutriments.salt_100g * 400)
                : null,
              fat_100g: p.nutriments?.fat_100g ?? null,
              saturated_fat_100g: p.nutriments?.['saturated-fat_100g'] ?? null,
              proteins_100g: p.nutriments?.proteins_100g ?? null,
              energy_100g: p.nutriments?.['energy-kcal_100g'] ?? p.nutriments?.energy_100g ?? null,
            },
            allergens: p.allergens_tags || [],
            categories: p.categories || '',
            image_url: p.image_front_url || p.image_url || '',
            raw_data: p,
          };
          console.log(`[OFF] Success: "${product.product_name}" from ${url}`);
          return product;
        }
      } catch (_) {
        // try next endpoint
      }
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Save or Merge a product into scanned_products SQLite table (Persistent Forever)
// Ensures only correct, high-quality information is stored and never downgraded.
// ─────────────────────────────────────────────────────────────────────────────
async function saveToLocalDB(product) {
  if (!product || !product.barcode) return;
  const barcode = String(product.barcode).trim();
  if (barcode.length < 6) return; // Discard invalid/short barcodes

  try {
    const existing = await db.get('SELECT * FROM scanned_products WHERE barcode = ?', [barcode]);

    const productName =
      product.product_name &&
      product.product_name !== 'Packaged Commodity' &&
      product.product_name !== 'Scanned Product Label' &&
      product.product_name !== 'Scanned Packaged Commodity'
        ? product.product_name
        : existing?.product_name || product.product_name || 'Packaged Commodity';

    const brand = product.brands || product.brand || existing?.brand || '';

    // Preserve richer, longer ingredients & statutory text
    let ingredients = product.ingredients_text || product.ingredients || '';
    if (existing?.ingredients && existing.ingredients.length > ingredients.length) {
      ingredients = existing.ingredients;
    }

    // Preserve nutriments if new is empty
    let nutriments = product.nutriments || {};
    if (Object.keys(nutriments).length === 0 && existing?.nutriments) {
      try {
        nutriments = JSON.parse(existing.nutriments);
      } catch (_) {}
    }

    // Preserve allergens if new is empty
    let allergens = product.allergens || [];
    if (allergens.length === 0 && existing?.allergens) {
      try {
        allergens = JSON.parse(existing.allergens);
      } catch (_) {}
    }

    // Never downgrade confidence from 'high'
    const confidence =
      existing?.confidence === 'high' || product.confidence === 'high'
        ? 'high'
        : product.confidence || 'needs_verification';

    const source =
      existing?.source === 'manual' || existing?.source === 'catalog' || existing?.source === 'GEMINI_VISION_AI'
        ? existing.source
        : product.dataSource || product.source || 'openfoodfacts';

    const imageUrl = product.image_url || existing?.image_url || '';
    const categories = product.categories || existing?.categories || '';

    if (existing) {
      await db.run(
        `UPDATE scanned_products
         SET product_name = ?, brand = ?, ingredients = ?, allergens = ?, nutriments = ?, source = ?, confidence = ?, image_url = ?, categories = ?, last_updated = CURRENT_TIMESTAMP
         WHERE barcode = ?`,
        [
          productName,
          brand,
          ingredients,
          JSON.stringify(allergens),
          JSON.stringify(nutriments),
          source,
          confidence,
          imageUrl,
          categories,
          barcode,
        ]
      );
      console.log(`[DB] Merged & preserved clean record for: ${barcode} (${productName})`);
    } else {
      await db.run(
        `INSERT INTO scanned_products
           (barcode, product_name, brand, ingredients, allergens, nutriments, source, confidence, image_url, categories, raw_data, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          barcode,
          productName,
          brand,
          ingredients,
          JSON.stringify(allergens),
          JSON.stringify(nutriments),
          source,
          confidence,
          imageUrl,
          categories,
          JSON.stringify(product.raw_data || {}),
        ]
      );
      console.log(`[DB] Stored new verified product in scanned_products: ${barcode} (${productName})`);
    }
  } catch (err) {
    console.error('[DB] Save error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point — Authentic Product Lookup Chain
// ─────────────────────────────────────────────────────────────────────────────
async function lookupProductByBarcode(rawBarcode) {
  if (!rawBarcode) return null;
  const barcodeCandidates = getBarcodeVariants(rawBarcode);
  console.log(`[Lookup] Candidates for "${rawBarcode}":`, barcodeCandidates);

  // Step 1: Curated & Verified Indian FMCG Catalog (sample_products.json)
  const catalogHit = lookupInCatalog(barcodeCandidates);
  if (catalogHit) {
    await saveToLocalDB(catalogHit);
    return catalogHit;
  }

  // Step 2: scanned_products local DB (previously scanned/saved products)
  const dbHit = await lookupInLocalDB(barcodeCandidates);
  if (dbHit) return dbHit;

  // Step 3: Live Open Food Facts API (India & Global)
  const offHit = await lookupOnOpenFoodFacts(barcodeCandidates);
  if (offHit) {
    await saveToLocalDB(offHit);
    return offHit;
  }

  // Step 4: Not found in database — caller triggers Not Found UI / Forum Request / Label OCR
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Update a product in scanned_products (inline edit from UI)
// ─────────────────────────────────────────────────────────────────────────────
async function updateProductInLocalDB(barcode, fields) {
  const allowed = ['product_name', 'brand', 'ingredients', 'allergens', 'nutriments', 'confidence'];
  const setClauses = [];
  const values = [];

  for (const [k, v] of Object.entries(fields)) {
    if (!allowed.includes(k)) continue;
    setClauses.push(`${k} = ?`);
    values.push(typeof v === 'object' ? JSON.stringify(v) : v);
  }
  if (setClauses.length === 0) return;

  setClauses.push('last_updated = CURRENT_TIMESTAMP');
  // If user manually corrected, mark confidence high
  if (!fields.confidence) {
    setClauses.push("confidence = 'high'");
    setClauses.push("source = 'manual'");
  }
  values.push(barcode);

  await db.run(
    `UPDATE scanned_products SET ${setClauses.join(', ')} WHERE barcode = ?`,
    values
  );
  console.log(`[DB] Updated scanned_products: ${barcode}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Safer alternatives (unchanged from previous version)
// ─────────────────────────────────────────────────────────────────────────────
const curatedAlternatives = [
  {
    category: 'Biscuits & Cookies',
    alternatives: [
      { name: 'Whole Wheat & Ragi Diabetic Friendly Crisps', brand: 'NutriChoice Health', sugars_100g: 2.5, sodium_100g: 140, allergens: ['gluten'], freeOf: ['dairy', 'soy', 'peanut', 'sugar'], ingredients_text: 'Whole Wheat Flour, Ragi Flour, Oats, Cold Pressed Sesame Oil, Rock Salt, Baking Powder.', reason: '91% less sugar, zero dairy/soy, high dietary fiber.' },
      { name: 'Gluten-Free Almond & Coconut Crunch (Zero Added Sugar)', brand: 'EarthBake', sugars_100g: 3.2, sodium_100g: 110, allergens: ['tree nuts'], freeOf: ['gluten', 'dairy', 'peanut', 'soy'], ingredients_text: 'Almond Flour, Desiccated Coconut, Erythritol, Coconut Oil, Vanilla Extract, Sea Salt.', reason: 'Gluten-free, dairy-free, diabetic-friendly low glycemic index.' },
    ],
  },
  {
    category: 'Instant Noodles & Quick Meals',
    alternatives: [
      { name: 'Millet & Whole Wheat Veggie Hakka Noodles (Non-Fried)', brand: 'Slurrp Farm Superfoods', sugars_100g: 1.5, sodium_100g: 380, allergens: ['gluten'], freeOf: ['peanut', 'dairy', 'soy', 'msg'], ingredients_text: 'Foxtail Millet Flour, Whole Wheat Flour, Salt. Seasoning: Dehydrated Vegetables, Onion, Garlic, Turmeric, Black Pepper.', reason: '63% lower sodium, non-fried, free from MSG and synthetic dyes.' },
    ],
  },
  {
    category: 'Carbonated Beverages & Soft Drinks',
    alternatives: [
      { name: 'Raw Sparkling Tender Coconut Water', brand: 'Raw Pressery', sugars_100g: 4.2, sodium_100g: 25, allergens: [], freeOf: ['caffeine', 'phosphoric acid', 'caramel color iv', 'artificial sweeteners'], ingredients_text: '100% Tender Coconut Water, Carbon Dioxide, Bio-preservative (INS 234).', reason: 'Zero refined sugars, zero phosphoric acid or caramel color, rich in natural electrolytes.' },
    ],
  },
  {
    category: 'Savory Snacks & Namkeen',
    alternatives: [
      { name: 'Roasted Makhanas (Fox Nuts) - Himalayan Salt & Pepper', brand: 'FarmCraft Organic', sugars_100g: 0.5, sodium_100g: 220, allergens: [], freeOf: ['peanut', 'gluten', 'dairy', 'soy', 'tree nuts'], ingredients_text: 'Roasted Lotus Seeds (Makhana), Cold Pressed Olive Oil, Himalayan Pink Salt, Black Pepper.', reason: '74% lower sodium, allergen-free, non-fried whole food.' },
    ],
  },
];

async function findSaferAlternatives(currentProduct, userProfile = {}) {
  const category = (currentProduct?.categories || currentProduct?.category || '').toLowerCase();
  const userAllergies = (userProfile.allergies || []).map((a) => a.toLowerCase());

  let candidateGroup = null;
  for (const group of curatedAlternatives) {
    if (category.includes(group.category.toLowerCase()) || group.category.toLowerCase().includes(category)) {
      candidateGroup = group.alternatives;
      break;
    }
  }
  if (!candidateGroup) candidateGroup = curatedAlternatives[0].alternatives;

  return candidateGroup
    .filter((alt) => !userAllergies.length || !alt.allergens.some((a) => userAllergies.includes(a)))
    .slice(0, 3)
    .map((alt) => {
      const substituteCaveats = checkSubstituteWarnings(alt.ingredients_text);
      return { ...alt, substituteCaveats, hasCaveats: substituteCaveats.length > 0 };
    });
}

module.exports = {
  lookupProductByBarcode,
  findSaferAlternatives,
  saveToLocalDB,
  updateProductInLocalDB,
  isValidEAN,
  getBarcodeVariants,
};
