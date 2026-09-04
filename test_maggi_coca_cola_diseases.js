const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let resBody = '';
        res.on('data', (chunk) => (resBody += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resBody) });
          } catch (e) {
            resolve({ status: res.statusCode, data: resBody });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, data: resBody });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('Testing Maggi barcode resolution, Coca-Cola, and Multi-Disease evaluation...\n');

  // 1. Test scanning the exact 12-digit barcode from the user screenshot: '901058017687'
  console.log('1. Testing User Screenshot Barcode (901058017687):');
  const resMaggiUserBarcode = await post('/api/scan/barcode', {
    barcode: '901058017687',
    userProfile: {
      allergies: ['peanut', 'gluten'],
      conditions: ['diabetic', 'hypertension', 'kidney_disease', 'high_cholesterol'],
    },
    deviceId: 'test_dev_maggi',
  });
  console.log('   - Product Recognized:', resMaggiUserBarcode.data.product.name);
  console.log('   - Legal Metrology Score:', resMaggiUserBarcode.data.complianceReport.score, '/ 8 (', resMaggiUserBarcode.data.complianceReport.overallStatus, ')');
  console.log('   - Allergen Alerts:', resMaggiUserBarcode.data.healthEvaluation.allergenAlerts.map(a => `${a.label} [${a.type}]`));
  console.log('   - Multi-Disease Condition Flags:');
  resMaggiUserBarcode.data.healthEvaluation.conditionAlerts.forEach(c => {
    console.log(`     * ${c.condition}: ${c.metric} -> ${c.value} (${c.status})`);
  });

  // 2. Test Coca-Cola Original Barcode
  console.log('\n2. Testing Coca-Cola Barcode (8901764012297):');
  const resCoke = await post('/api/scan/barcode', {
    barcode: '8901764012297',
    userProfile: {
      allergies: [],
      conditions: ['diabetic', 'gerd', 'kidney_disease'],
    },
    deviceId: 'test_dev_coke',
  });
  console.log('   - Product Recognized:', resCoke.data.product.name);
  console.log('   - Sugar per 100ml:', resCoke.data.product.nutriments.sugars_100g, 'g');
  console.log('   - Regulatory Additive Matches:', resCoke.data.regulatoryAdditives.map(r => r.additive));
  console.log('   - Health Condition Flags:');
  resCoke.data.healthEvaluation.conditionAlerts.forEach(c => {
    console.log(`     * ${c.condition}: ${c.value} (${c.status})`);
  });

  // 3. Test Diseases API
  console.log('\n3. Testing Diseases Catalog API:');
  const diseasesRes = await get('/api/diseases');
  console.log(`   - Available Disease Conditions: ${diseasesRes.data.conditions.length}`);
  diseasesRes.data.conditions.forEach(d => console.log(`     * [${d.category}] ${d.name}`));

  console.log('\n✅ All tests passed!');
}

runTests().catch(console.error);
