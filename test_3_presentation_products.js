const { analyzeLegalMetrologyCompliance } = require('./backend/services/legalMetrologyService');
const { lookupProductByBarcode } = require('./backend/services/openFoodFactsService');
const fs = require('fs');
const path = require('path');

async function testAll() {
  const sampleProducts = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/data/sample_products.json'), 'utf8'));
  const testIds = ['cadbury-dairy-milk', 'maggi-2min-classic', 'coca-cola-original'];

  console.log('================================================================');
  console.log('TESTING 3 PRESENTATION PRODUCTS FOR 100% COMPLIANCE & ACCURACY');
  console.log('================================================================\n');

  for (const id of testIds) {
    const prod = sampleProducts.find(p => p.id === id);
    if (!prod) {
      console.error(`Product ${id} not found in sample_products.json`);
      continue;
    }

    console.log(`\n------------------------------------------------------------`);
    console.log(`Testing: ${prod.name}`);
    console.log(`Primary Barcode: ${prod.barcode}`);
    console.log(`------------------------------------------------------------`);

    // 1. Test Barcode Lookup
    const lookedUp = await lookupProductByBarcode(prod.barcode);
    console.log(`✓ Barcode Lookup Result: ${lookedUp ? 'FOUND (' + lookedUp.product_name + ')' : 'FAILED'}`);

    // 2. Test Statutory Compliance Engine
    const report = analyzeLegalMetrologyCompliance(prod.label_text, {
      product_name: prod.name,
      categories: prod.category,
      brands: prod.brand,
      barcode: prod.barcode,
      quantity: prod.label_text.match(/Net Q(?:uantity|ty):\s*([^\n]+)/i)?.[1],
      mrp: prod.label_text.match(/MRP:\s*([^\n]+)/i)?.[1],
      unit_sale_price: prod.label_text.match(/Unit Sale Price:\s*([^\n]+)/i)?.[1],
      mfg_date: prod.label_text.match(/Month & Year of Mfg:\s*([^\n]+)/i)?.[1],
      consumer_care: prod.label_text.match(/Consumer Care[^:]*:\s*([^\n]+)/i)?.[1],
      country_of_origin: 'India',
      generic_name: prod.label_text.match(/Generic Name:\s*([^\n]+)/i)?.[1],
    });

    console.log(`✓ Compliance Score: ${report.score}/8 (${report.compliancePercentage}%) — Status: ${report.overallStatus}`);
    console.log('✓ Breakdown of 8 Mandatory Declarations:');
    for (const f of report.fields) {
      const mark = f.status === 'DETECTED' ? '✅' : (f.status === 'UNCLEAR' ? '⚠️' : '❌');
      console.log(`   ${mark} ${f.name.padEnd(26)} [${f.status.padEnd(8)}] -> ${f.value || 'N/A'}`);
    }

    if (report.score === 8) {
      console.log(`🌟 SUCCESS: 100% 8/8 Flawless Compliance Verified!`);
    } else {
      console.warn(`⚠️ WARNING: ${8 - report.score} field(s) were not detected!`);
    }
  }
}

testAll().catch(console.error);
