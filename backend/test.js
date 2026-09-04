/**
 * Automated Verification Test Suite for PackScan Backend Engines
 * Tests:
 * 1. Legal Metrology 2011 Rule 6 (8 Mandatory Fields) Extractor
 * 2. Allergy & Health Threshold Checker (Single-Pass, Direct vs Trace, Diabetic, BP)
 * 3. Regulatory Dataset Multi-Country Cross-Referencing
 * 4. Substitute Warnings Nuance Alerting
 */

const { analyzeLegalMetrologyCompliance } = require('./services/legalMetrologyService');
const { evaluateAllergiesAndHealth } = require('./services/allergyHealthService');
const { matchRegulatoryAdditives, checkSubstituteWarnings } = require('./services/regulatoryService');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 RUNNING PACKSCAN ENGINE VERIFICATION TESTS');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

// -----------------------------------------------------------------------------
// TEST 1: Feature 1 - Legal Metrology (Packaged Commodities) Rules, 2011
// -----------------------------------------------------------------------------
console.log('--- [TEST SUITE 1] Legal Metrology 8-Field Compliance Engine ---');

const fullyCompliantLabel = `
BRITANNIA GOOD DAY CASHEW COOKIES
Net Qty: 120 g
MRP Rs. 30.00 (Incl. of all taxes)
USP: Rs. 0.25 / g
Mfd. By: Britannia Industries Limited, 5/1A Hungerford Street, Kolkata - 700017, West Bengal, India.
Pkd / Mfg Date: 07/2026
Use By: 6 months from packaging
Consumer Care Cell: Executive, Britannia Consumer Care, P.O. Box 7100, Bengaluru - 560047. Phone: 1800-425-4449. Email: feedback@britindia.com
Generic Name: Butter & Nut Cookies
Country of Origin: India
`;

const res1 = analyzeLegalMetrologyCompliance(fullyCompliantLabel);
assert(res1.overallStatus === 'COMPLIANT', 'Fully compliant sample marked as COMPLIANT');
assert(res1.score === 8, 'Compliant sample detected 8/8 fields');
assert(res1.fields.find((f) => f.id === 'mrp')?.status === 'DETECTED', 'MRP detected with tax declaration');
assert(res1.fields.find((f) => f.id === 'net_quantity')?.status === 'DETECTED', 'Net quantity detected in standard grams');
assert(res1.fields.find((f) => f.id === 'manufacturer_address')?.status === 'DETECTED', 'Manufacturer & address detected');
assert(res1.fields.find((f) => f.id === 'mfg_date')?.status === 'DETECTED', 'Mfg Date detected in MM/YYYY format');
assert(res1.fields.find((f) => f.id === 'consumer_care')?.status === 'DETECTED', 'Consumer Care phone & email detected');
assert(res1.fields.find((f) => f.id === 'generic_name')?.status === 'DETECTED', 'Generic commodity name detected');
assert(res1.fields.find((f) => f.id === 'unit_sale_price')?.status === 'DETECTED', 'Unit sale price detected');
assert(res1.fields.find((f) => f.id === 'country_of_origin')?.status === 'DETECTED', 'Country of origin detected');

// Non-compliant label test
const nonCompliantLabel = `
SUPER CRUNCH MASALA CHIPS
Net Wt: 50g
MRP 20
Made in Delhi
INGREDIENTS: Potato, Vegetable Oil, Masala Mix, Salt.
`;

const res2 = analyzeLegalMetrologyCompliance(nonCompliantLabel);
assert(res2.overallStatus === 'NON_COMPLIANT', 'Defective label marked as NON_COMPLIANT');
assert(res2.score < 5, `Defective label score is ${res2.score}/8`);
assert(res2.violations.length >= 3, `Identified ${res2.violations.length} specific legal violations`);
assert(res2.violations.some((v) => v.field.includes('Consumer Care')), 'Flagged missing Consumer Care cell');
assert(res2.violations.some((v) => v.field.includes('Unit Sale Price')), 'Flagged missing Unit Sale Price (Rule 6(11))');

// -----------------------------------------------------------------------------
// TEST 2: Feature 2 - Personalized Allergy & Health Alerts
// -----------------------------------------------------------------------------
console.log('\n--- [TEST SUITE 2] Personalized Allergy & Health Alert Engine ---');

const userProfile = {
  allergies: ['dairy', 'peanut', 'soy'],
  conditions: ['diabetic', 'hypertension'],
  sugar_threshold: 15.0,
  sodium_threshold: 400.0,
};

const productIngredients = `
Refined Wheat Flour (Maida), Sugar, Butter (Milk Solids), Soy Lecithin (INS 322).
May contain traces of peanuts and sesame.
`;

const nutriments = {
  sugars_100g: 28.5,
  sodium_100g: 650,
};

const healthRes = evaluateAllergiesAndHealth(productIngredients, nutriments, userProfile);
assert(!healthRes.isSafeForUser, 'Unsafe product flagged for user profile');
assert(healthRes.directAllergensCount >= 2, 'Detected direct allergens (dairy, soy)');
assert(healthRes.traceAllergensCount >= 1, 'Detected trace allergen (peanut)');

const dairyAlert = healthRes.allergenAlerts.find((a) => a.allergen === 'dairy');
assert(dairyAlert && dairyAlert.type === 'DIRECT' && dairyAlert.severity === 'CRITICAL', 'Direct dairy allergen flagged CRITICAL');

const peanutAlert = healthRes.allergenAlerts.find((a) => a.allergen === 'peanut');
assert(peanutAlert && peanutAlert.type === 'TRACE' && peanutAlert.severity === 'WARNING', 'Trace peanut allergen flagged WARNING');

const sugarAlert = healthRes.conditionAlerts.find((c) => c.condition === 'diabetic');
assert(sugarAlert && sugarAlert.status === 'FLAGGED' && sugarAlert.value === '28.5g / 100g', 'Diabetic alert with exact sugar value 28.5g/100g');

const sodiumAlert = healthRes.conditionAlerts.find((c) => c.condition === 'hypertension');
assert(sodiumAlert && sodiumAlert.status === 'FLAGGED' && sodiumAlert.value === '650mg / 100g', 'Hypertension alert with exact sodium value 650mg/100g');

// -----------------------------------------------------------------------------
// TEST 3: Feature 4 - Curated Multi-Country Regulatory Dataset
// -----------------------------------------------------------------------------
console.log('\n--- [TEST SUITE 3] Multi-Country Regulatory Additives Matching ---');

const ingredientsWithAdditives = `
Potatoes, Edible Oil, Tartrazine E102, Titanium Dioxide E171, Monosodium Glutamate E621, Antioxidant INS 320 (BHA).
`;

const matchedAdditives = matchRegulatoryAdditives(ingredientsWithAdditives);
assert(matchedAdditives.length >= 3, `Matched ${matchedAdditives.length} regulatory additives`);
const e171 = matchedAdditives.find((a) => a.additive.includes('Titanium Dioxide'));
assert(e171 && e171.eu_status.includes('Banned'), 'E171 EU ban accurately referenced');
const e102 = matchedAdditives.find((a) => a.additive.includes('Tartrazine'));
assert(e102 && e102.eu_status.includes('warning'), 'Tartrazine EU warning label accurately referenced');

// -----------------------------------------------------------------------------
// TEST 4: Feature 5 - Substitute Warnings Nuance Caveats
// -----------------------------------------------------------------------------
console.log('\n--- [TEST SUITE 4] Substitute Warnings & Nuance Caveats ---');

const alternativeProductIngredients = `
Almond Flour, Whey Protein, Maltodextrin (15%), Sucralose (INS 955).
`;

const caveats = checkSubstituteWarnings(alternativeProductIngredients);
assert(caveats.length >= 2, `Identified ${caveats.length} substitute nuance caveats`);
assert(caveats.some((c) => c.common_substitute.includes('Maltodextrin')), 'Flagged Maltodextrin high-GI caveat');
assert(caveats.some((c) => c.common_substitute.includes('Sucralose')), 'Flagged Sucralose gut-microbiome caveat');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
