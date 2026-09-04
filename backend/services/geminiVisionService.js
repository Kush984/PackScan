const sharp = require('sharp');
const fs = require('fs');

function isGeminiAvailable() {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim().length > 10);
}

async function prepareImagePart(imagePathOrBuffer) {
  try {
    let buf;
    if (typeof imagePathOrBuffer === 'string') {
      if (!fs.existsSync(imagePathOrBuffer)) return null;
      buf = fs.readFileSync(imagePathOrBuffer);
    } else if (Buffer.isBuffer(imagePathOrBuffer)) {
      buf = imagePathOrBuffer;
    } else {
      return null;
    }

    // Optimize image with Sharp: cap dimensions to 900px and 75% JPEG for blazing fast inference
    const optimized = await sharp(buf)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    return {
      inlineData: {
        mimeType: 'image/jpeg',
        data: optimized.toString('base64'),
      },
    };
  } catch (err) {
    console.warn('[Gemini Vision] Image optimization failed, using raw buffer:', err.message);
    try {
      const rawBuf = typeof imagePathOrBuffer === 'string' ? fs.readFileSync(imagePathOrBuffer) : imagePathOrBuffer;
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: rawBuf.toString('base64'),
        },
      };
    } catch (_) {
      return null;
    }
  }
}

async function analyzePackagingWithGemini(images = [], barcode = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    console.log(`[Gemini Vision] Preparing ${images.length} packaging image(s) for Multimodal AI Analysis...`);

    const imageParts = [];
    for (const img of images) {
      if (!img) continue;
      const part = await prepareImagePart(img);
      if (part) imageParts.push(part);
    }

    if (imageParts.length === 0) {
      console.warn('[Gemini Vision] No valid image buffers to process.');
      return null;
    }

    const systemPrompt = `
You are an expert Indian Legal Metrology and FSSAI Packaging Compliance Auditor.
Your task is to thoroughly analyze the provided packaging image(s) of a consumer packaged commodity sold in India.
The packaging may be wrinkled, shiny, curved, or multi-sided.

Carefully inspect and extract ALL 8 mandatory statutory declarations under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011:
1. Maximum Retail Price (MRP): exact printed text including "inclusive of all taxes" or "incl. of all taxes"
2. Net Quantity / Weight: exact value with standard unit (g, kg, ml, l)
3. Name and complete address of Manufacturer, Packer, or Importer
4. Month and Year of Manufacture / Packing / Import (e.g. MM/YYYY or Month Year)
5. Consumer Care details: telephone number and email address for grievance redressal
6. Common or Generic name of the commodity on Principal Display Panel
7. Unit Sale Price (USP): price per g, per ml, or per standard unit (Rule 6(11))
8. Country of Origin: e.g. "Made in India" or "Country of Origin: India"

Also extract:
- Product Brand Name
- Full Ingredients List
- Nutritional Information per 100g or per 100ml (energy, protein, carbohydrates, total sugars, added sugars, total fat, saturated fat, trans fat, sodium)
- Allergen warnings (e.g. "Contains Wheat", "May contain traces of milk")
- FSSAI License Number
- Additive codes (INS / E numbers, e.g. INS 150d, INS 635)
- All verbatim transcribed text visible on the pack

Return ONLY a valid JSON object matching this schema:
{
  "product_name": "Full product name",
  "brand": "Brand name",
  "barcode": "${barcode || ''}",
  "generic_name": "Common commodity name",
  "mrp_declaration": "Exact MRP text with tax statement or null if missing",
  "mrp_value": 14.0,
  "net_quantity": "70 g",
  "unit_sale_price": "Rs. 0.20 per g",
  "manufacturer_address": "Name and complete address of manufacturer",
  "mfg_date": "MM/YYYY",
  "expiry_date": "MM/YYYY or duration",
  "consumer_care": "Phone and email details",
  "country_of_origin": "India",
  "fssai_license": "14-digit number if present",
  "ingredients_text": "Complete ingredients statement",
  "allergens": ["wheat", "peanut"],
  "additives": ["INS 150d", "INS 635"],
  "nutriments": {
    "energy_100g": 427,
    "proteins_100g": 8.0,
    "fat_100g": 15.7,
    "saturated_fat_100g": 6.8,
    "sugars_100g": 2.2,
    "sodium_100g": 1040
  },
  "raw_transcribed_text": "Full concatenated transcribed text from all packaging sides"
}
`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
          ...imageParts,
        ],
      },
    ];

    // Priority: Fast models first with 16s timeout
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite-preview',
    ];
    let candidateText = null;

    for (const modelName of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      console.log(`[Gemini Vision] Dispatching packaging audit to ${modelName}...`);

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
          signal: AbortSignal.timeout(16000), // 16-second hard timeout
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn(`[Gemini Vision ${modelName} HTTP ${res.status}]:`, errText);
          continue; // Try next model in list
        }

        const data = await res.json();
        candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          console.log(`[Gemini Vision] Model ${modelName} succeeded!`);
          break;
        }
      } catch (reqErr) {
        console.warn(`[Gemini Vision ${modelName} Error]:`, reqErr.message);
      }
    }
    if (!candidateText) {
      console.warn('[Gemini Vision] No text candidate in response');
      return null;
    }

    const parsed = JSON.parse(candidateText);
    console.log(`[Gemini Vision] Successfully extracted structured packaging data for: "${parsed.product_name || parsed.brand || 'Product'}"`);
    return parsed;
  } catch (err) {
    console.error('[Gemini Vision Exception]:', err.message);
    return null;
  }
}

module.exports = {
  isGeminiAvailable,
  analyzePackagingWithGemini,
};
