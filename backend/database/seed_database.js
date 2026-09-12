const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'packscan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB:', err);
    process.exit(1);
  }
});

const sampleProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sample_products.json'), 'utf8'));

db.serialize(() => {
  console.log('Seeding SQLite database with all sample products and barcode variants...');

  const insertScanned = db.prepare(`
    INSERT OR REPLACE INTO scanned_products 
    (barcode, product_name, brand, ingredients, allergens, nutriments, source, confidence, image_url, categories, raw_data, last_updated)
    VALUES (?, ?, ?, ?, ?, ?, 'catalog', 'high', ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const insertCache = db.prepare(`
    INSERT OR REPLACE INTO products_cache
    (barcode, product_name, brands, ingredients_text, nutriments, categories, image_url, raw_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  let count = 0;
  for (const p of sampleProducts) {
    const allBarcodes = Array.from(new Set([p.barcode, ...(p.barcodes || [])])).filter(Boolean);
    const nutrimentsStr = JSON.stringify(p.nutriments || {});
    const rawDataStr = JSON.stringify(p);
    const allergensStr = JSON.stringify(p.allergens || []);

    for (const bc of allBarcodes) {
      insertScanned.run(
        bc,
        p.name,
        p.brand,
        p.label_text,
        allergensStr,
        nutrimentsStr,
        p.image_url,
        p.category,
        rawDataStr
      );

      insertCache.run(
        bc,
        p.name,
        p.brand,
        p.label_text,
        nutrimentsStr,
        p.category,
        p.image_url,
        rawDataStr
      );
      count++;
    }
  }

  insertScanned.finalize();
  insertCache.finalize();

  console.log(`✅ Successfully seeded ${count} barcode entries across ${sampleProducts.length} verified products!`);

  // Verify the 3 key presentation products:
  const keyBarcodes = ['7622202324871', '8901058017687', '8901764012990'];
  db.all(
    `SELECT barcode, product_name, brand FROM scanned_products WHERE barcode IN (${keyBarcodes.map(() => '?').join(',')})`,
    keyBarcodes,
    (err, rows) => {
      if (err) {
        console.error('Verification error:', err);
      } else {
        console.log('\n--- VERIFIED PRESENTATION PRODUCTS IN SQLITE ---');
        for (const row of rows) {
          console.log(`[${row.barcode}] -> ${row.product_name} (${row.brand})`);
        }
      }
      db.close();
    }
  );
});
