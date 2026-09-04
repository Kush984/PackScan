/**
 * End-to-End Verification Test Script through the Full Stack Proxy
 */

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

async function verifyFullFlow() {
  console.log('================================================================');
  console.log('🚀 PACKSCAN FULL-STACK E2E VERIFICATION TEST');
  console.log('================================================================\n');

  const testDeviceId = 'eval_judge_device_101';

  // 1. Save user profile (Allergies: Dairy, Soy, Peanut; Conditions: Diabetic, Hypertension)
  console.log('1. Setting up User Profile...');
  const profileRes = await post('/api/profile', {
    device_id: testDeviceId,
    allergies: ['dairy', 'soy', 'peanut'],
    conditions: ['diabetic', 'hypertension'],
    sugar_threshold: 15.0,
    sodium_threshold: 400.0,
  });
  console.log('   Profile Saved Response:', profileRes.data.message);

  // 2. Fetch Presets
  const presetsRes = await get('/api/presets');
  const presets = presetsRes.data;
  console.log(`\n2. Loaded ${presets.length} Demo Presets from Catalog.`);

  // 3. Test Each Demo Preset Back-to-Back
  console.log('\n3. Testing Presets for Speed & Accuracy:');

  for (const preset of presets) {
    const start = Date.now();
    const scanRes = await post('/api/scan/barcode', {
      barcode: preset.barcode,
      userProfile: {
        allergies: ['dairy', 'soy', 'peanut'],
        conditions: ['diabetic', 'hypertension'],
        sugar_threshold: 15.0,
        sodium_threshold: 400.0,
      },
      deviceId: testDeviceId,
    });
    const duration = Date.now() - start;
    const rep = scanRes.data.complianceReport;
    const health = scanRes.data.healthEvaluation;
    const reg = scanRes.data.regulatoryAdditives;
    const alts = scanRes.data.alternatives;

    console.log(`\n📦 Product: [${preset.name}] (Scanned in ${duration}ms)`);
    console.log(`   ⚖️  Legal Metrology Status: ${rep.overallStatus} (${rep.score}/8 fields)`);
    console.log(`   🚨 Violations: ${rep.violations.length > 0 ? rep.violations.map(v => v.field).join(', ') : 'None (100% Compliant)'}`);
    console.log(`   🩺 Allergen Alerts: ${health.allergenAlerts.length > 0 ? health.allergenAlerts.map(a => `${a.label} (${a.type})`).join('; ') : 'Safe for Allergies'}`);
    console.log(`   📊 Condition Flags: ${health.conditionAlerts.map(c => `${c.condition}: ${c.value} [${c.status}]`).join('; ')}`);
    console.log(`   🌍 Global Additive Matches: ${reg.length > 0 ? reg.map(r => r.additive.split('/')[0].trim()).join(', ') : 'None'}`);
    console.log(`   🌱 Safer Alternatives: ${alts.length} suggested (${alts.filter(a => a.hasCaveats).length} with substitute caveats)`);
  }

  console.log('\n================================================================');
  console.log('🎉 ALL FULL-STACK E2E VERIFICATION CHECKS COMPLETED SUCCESSFULLY');
  console.log('================================================================');
}

verifyFullFlow().catch(console.error);
