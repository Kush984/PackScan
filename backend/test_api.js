const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5001,
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
    const req = http.get(`http://127.0.0.1:5001${path}`, (res) => {
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

async function runApiTests() {
  console.log('Testing PackScan HTTP API Endpoints...');

  const health = await get('/api/health');
  console.log('1. Health Check:', health.data);

  const allergens = await get('/api/allergens');
  console.log(`2. Allergens loaded: ${allergens.data.mappings.length} mappings, ${allergens.data.common_allergens.length} common allergens`);

  const presets = await get('/api/presets');
  console.log(`3. Presets loaded: ${presets.data.length} sample products`);

  const reg = await get('/api/regulatory-dataset');
  console.log(`4. Regulatory dataset loaded: ${reg.data.length} additives`);

  // Test scan with sample 1 (Good Day)
  const scanGoodDay = await post('/api/scan/barcode', {
    barcode: '8901063012487',
    userProfile: {
      allergies: ['dairy', 'peanut'],
      conditions: ['diabetic'],
      sugar_threshold: 15.0,
      sodium_threshold: 400.0,
    },
    deviceId: 'test_dev_01',
  });
  console.log('\n5. Scan Good Day Result:');
  console.log('   - Product:', scanGoodDay.data.product.name);
  console.log('   - Legal Metrology Score:', scanGoodDay.data.complianceReport.score, '/', scanGoodDay.data.complianceReport.totalFields);
  console.log('   - Overall Status:', scanGoodDay.data.complianceReport.overallStatus);
  console.log('   - Allergen Alerts:', scanGoodDay.data.healthEvaluation.allergenAlerts.map(a => a.label));
  console.log('   - Condition Alerts:', scanGoodDay.data.healthEvaluation.conditionAlerts.map(c => `${c.condition}: ${c.value} (${c.status})`));
  console.log('   - Alternatives Suggested:', scanGoodDay.data.alternatives.length);

  // Test scan with defective sample
  const scanDefective = await post('/api/scan/barcode', {
    barcode: '8909999000111',
    userProfile: { allergies: [], conditions: [] },
    deviceId: 'test_dev_01',
  });
  console.log('\n6. Scan Defective Product Result:');
  console.log('   - Legal Metrology Score:', scanDefective.data.complianceReport.score, '/ 8');
  console.log('   - Overall Status:', scanDefective.data.complianceReport.overallStatus);
  console.log('   - Violations count:', scanDefective.data.complianceReport.violations.length);

  console.log('\n✅ All API tests completed successfully!');
}

runApiTests().catch(console.error);
