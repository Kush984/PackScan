const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'packscan.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // User health & allergy profiles
    db.run(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        device_id TEXT PRIMARY KEY,
        allergies TEXT,
        conditions TEXT,
        sugar_threshold REAL DEFAULT 15.0,
        sodium_threshold REAL DEFAULT 400.0,
        sat_fat_threshold REAL DEFAULT 5.0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // LOCAL PRODUCT DATABASE — persists all scanned products for instant future lookup
    // source: 'openfoodfacts' | 'catalog' | 'ocr' | 'manual'
    // confidence: 'high' | 'needs_verification'
    db.run(`
      CREATE TABLE IF NOT EXISTS scanned_products (
        barcode TEXT PRIMARY KEY,
        product_name TEXT,
        brand TEXT,
        ingredients TEXT,
        allergens TEXT,
        nutriments TEXT,
        source TEXT DEFAULT 'manual',
        confidence TEXT DEFAULT 'needs_verification',
        image_url TEXT,
        categories TEXT,
        raw_data TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Legacy cache (kept for backward compat — scanned_products supersedes this)
    db.run(`
      CREATE TABLE IF NOT EXISTS products_cache (
        barcode TEXT PRIMARY KEY,
        product_name TEXT,
        brands TEXT,
        ingredients_text TEXT,
        nutriments TEXT,
        categories TEXT,
        image_url TEXT,
        raw_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Scan history & compliance reports
    db.run(`
      CREATE TABLE IF NOT EXISTS scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        scan_type TEXT,
        product_name TEXT,
        barcode TEXT,
        image_path TEXT,
        compliance_status TEXT,
        compliance_score INTEGER,
        compliance_report TEXT,
        allergy_alerts TEXT,
        regulatory_flags TEXT,
        data_source TEXT,
        confidence TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns exist if table was created in an older version
    db.run(`ALTER TABLE scan_history ADD COLUMN data_source TEXT`, () => {});
    db.run(`ALTER TABLE scan_history ADD COLUMN confidence TEXT`, () => {});

    // Community product requests & feedback forum
    db.run(`
      CREATE TABLE IF NOT EXISTS product_feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        barcode TEXT,
        product_name TEXT NOT NULL,
        brand TEXT,
        category TEXT,
        notes TEXT,
        image_url TEXT,
        upvotes INTEGER DEFAULT 1,
        status TEXT DEFAULT 'UNDER_REVIEW',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });

module.exports = { db, query, get, run };
