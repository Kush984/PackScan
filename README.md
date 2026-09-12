# PackScan: Legal Metrology (Packaged Commodities) Rules, 2011 Compliance and Health Guardian

**SIH 2026 Problem Statement SIH26034**  
*Full-Stack Mobile-First Progressive Web Application (PWA)*

---

## Overview

**PackScan** is an automated compliance verification and consumer safety system engineered for India's **Legal Metrology (Packaged Commodities) Rules, 2011**. By scanning packaged commodity barcodes or photographing back-of-pack labels, PackScan conducts a deterministic 8-field statutory audit under Rule 6, combined with personalized single-pass allergen cross-checking, diabetic/hypertension safety thresholds, international regulatory additive comparisons (India FSSAI vs EU EFSA vs Australia FSANZ), and healthier alternative suggestions with substitute nuance caveats.

---

## Core Features

### 1. Legal Metrology Compliance Checker (Core Problem Statement - Top Priority)
Verifies the presence, formatting, and validity of all **8 mandatory statutory declarations under Rule 6**:
1. **Maximum Retail Price (MRP)**: Format validation, currency, and mandatory *"inclusive of all taxes"* clause (`Rule 6(1)(e)`).
2. **Net Quantity / Weight**: Verification of standard metric units (g, kg, ml, l, count) under the `Second Schedule` and `Rule 6(1)(b)`.
3. **Manufacturer / Packer / Importer Details**: Name, full postal address, and PIN code (`Rule 6(1)(a)`).
4. **Month & Year of Manufacture / Packing**: `MM/YYYY` or `PKD/MFD` date detection (`Rule 6(1)(d)`).
5. **Consumer Care Details**: Mandatory grievance helpline phone, toll-free number, and email address (`Rule 6(1)(n)`).
6. **Common / Generic Name of Commodity**: Explicit commodity designation on principle display panel (`Rule 6(1)(c)`).
7. **Unit Sale Price (USP)**: Mandatory price per standard metric unit (e.g., `₹ 0.25 / g` or `Rs. 55 / 100g`) under `Rule 6(11)`.
8. **Country of Origin**: Mandatory origin declaration for domestic and imported packages (`Rule 6(1)(m)` / `Rule 6(10)`).

**Output**: Prominent Top-Level Scorecard (`COMPLIANT` / `PARTIALLY COMPLIANT` / `NON-COMPLIANT`), detected score (e.g., `8/8`), 8-field status grid (`DETECTED` / `MISSING` / `UNCLEAR`) with extracted text snippets and statutory violation citations.

### 2. Personalized Health & Allergen Safety Alerts
- **One-Time Profile Setup**: 10+ common allergens (dairy/lactose, gluten/wheat, peanuts, tree nuts, soy, egg, sesame, mustard, shellfish, fish, sulfites) + freeform autocomplete tag adder.
- **Single-Pass Multi-Allergen Cross-Check**: Evaluates entire user allergy profile in a single pass against `ingredient_allergen_map.json` (50+ seeded variations).
- **Direct vs Trace Distinction**:
  - `CONTAINS [ALLERGEN]`: Direct ingredient match (High/Critical Red Alert).
  - `MAY CONTAIN TRACES OF [ALLERGEN]`: Cross-contamination / facility warning (Medium Amber Alert).
- **Diabetic & Hypertension Gauges**:
  - Checks exact sugar grams against configurable threshold (default `15g / 100g`).
  - Checks exact sodium milligrams against configurable threshold (default `400mg / 100g`).

### 3. Multi-Country Regulatory Additives Comparison
- Curated structured dataset (`regulatory_dataset.json`) cross-referencing food additives across:
  - **India (FSSAI)**
  - **European Union (EFSA)**
  - **Australia (FSANZ)**
- Surfaces bans (e.g., Titanium Dioxide E171 banned in EU) and mandatory child hyperactivity warning labels (e.g., Tartrazine E102, Allura Red E129).

### 4. Safer Alternatives & Substitute Nuance Warnings
- Suggests 1–3 healthier alternatives within the same product category.
- **"Safer Substitute" Nuance Warnings (`substitute_warnings.json`)**: Surfaces caveats when alternatives use high-GI substitutes (e.g., Maltodextrin in "Sugar-Free" snacks) rather than presenting them as universally clean.

### 5. 1-Click Demo Presets Mode (<1s Response)
- Built-in realistic Indian packaged goods samples for judging and presentations:
  - *Britannia Good Day Cookies* (Dairy/Gluten/Soy alert, High Sugar, Missing USP)
  - *Haldiram's Aloo Bhujia* (Compliant, High Sodium, Peanut trace)
  - *Amul Butter 500g* (100% Compliant)
  - *Defective Local Snack* (Missing Tax clause, Missing Care cell, Missing Mfg Date, Missing USP)
  - *Sugar-Free Protein Bar* (Triggers Maltodextrin caveat)
  - *Maggi 2-Minute Noodles* (MSG / Caramel IV regulatory flags)

---

## Architecture and Technology Stack

```
packscan/
├── backend/
│   ├── server.js                        # Express API & routing
│   ├── database/
│   │   ├── db.js                        # SQLite schema & query helper
│   │   ├── seed_database.js             # Database seeding script
│   │   └── packscan.db                  # Local SQLite database
│   ├── data/
│   │   ├── regulatory_dataset.json      # Multi-country additive standards
│   │   ├── substitute_warnings.json     # Substitute caveats
│   │   ├── ingredient_allergen_map.json # 50+ normalized allergen mappings
│   │   └── sample_products.json         # Realistic demo presets
│   ├── services/
│   │   ├── legalMetrologyService.js     # Rule 6 deterministic engine
│   │   ├── allergyHealthService.js      # Multi-allergen & condition checker
│   │   ├── regulatoryService.js         # Regulatory cross-referencing
│   │   ├── openFoodFactsService.js      # OFF API client & cache
│   │   └── ocrService.js                # Tesseract.js OCR pipeline
│   └── test.js                          # Automated test suite (28 test cases)
└── frontend/
    ├── index.html                       # PWA shell
    ├── public/
    │   ├── manifest.json                # PWA manifest
    │   ├── sw.js                        # Service worker caching
    │   └── favicon.svg
    └── src/
        ├── App.jsx                      # Main UI coordinator
        └── components/
            ├── Header.jsx               # Navigation & profile trigger
            ├── Scanner.jsx              # Camera barcode, OCR photo & text input
            ├── ComplianceReport.jsx     # Feature 1 Scorecard (Top Priority)
            ├── HealthAlerts.jsx         # Feature 2 Allergen & condition alerts
            ├── RegulatoryComparison.jsx # Feature 4 Global additive table
            ├── AlternativeSuggestions.jsx # Feature 3 & 5 Alternatives + caveats
            ├── DemoPresetBar.jsx        # Instant 1-click test bar
            ├── ProfileModal.jsx         # User allergy settings
            └── RawLabelViewer.jsx       # Raw text & metadata inspector
```

---

## Quickstart Guide

### Prerequisites
- Node.js v18+ (tested on Node v26)
- npm v9+

### 1. Start the Backend Server
```bash
cd packscan/backend
npm install
npm start
```
*Backend runs on `http://localhost:5001` (SQLite initialized automatically).*

### 2. Run the Verification Test Suite
```bash
cd packscan/backend
npm test
```
*Runs all 28 automated tests covering Legal Metrology Rule 6 validation, allergen matching, regulatory cross-referencing, and substitute caveats.*

### 3. Start the Frontend Application
```bash
cd packscan/frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with live API proxying.*

---

## Progressive Web Application (PWA) Deployment
1. Open `http://localhost:3000` on Chrome or Safari on mobile.
2. Tap **Add to Home Screen** / **Install PackScan**.
3. Launch directly as a standalone app with offline asset caching.

---

## MVP Scope and Future Roadmap

| Feature Area | MVP Scoped (Hackathon Deliverable) | Future Roadmap (Production Scale) |
|---|---|---|
| **Legal Metrology** | 8 Rule 6 mandatory fields with regex & NLP heuristic audit | Multi-lingual label OCR (Hindi, Tamil, Bengali, Telugu) & font size / font height ratio verification |
| **Allergy Engine** | 50+ common Indian ingredient mappings, direct vs trace, diabetic/hypertension thresholds | Micro-ingredient spectrometry integration, personalized cross-reactivity mapping (e.g., birch pollen allergy) |
| **Regulatory Dataset** | 16 curated high-impact food additives across India, EU, and Australia | Automated scrapers for FSSAI Gazette notifications, EFSA journal updates, and US FDA GRAS notices |
| **Database** | Lightweight zero-config SQLite with automated caching | Distributed PostgreSQL / Cloud Firestore with user authentication & multi-tenant enterprise sync |
| **Scanning** | In-browser Barcode scanner + Tesseract OCR + Instant demo presets | On-device WebAssembly YOLOv8 object detection for real-time bounding box highlighting on live camera feed |
