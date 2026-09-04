/**
 * Multi-Country Regulatory Dataset & Substitute Warning Service
 * Cross-references product ingredients against curated regulatory records (India, EU, AU)
 * and substitute caveat records.
 */

const fs = require('fs');
const path = require('path');

let regulatoryDataset = null;
let substituteWarnings = null;

function loadDatasets() {
  if (!regulatoryDataset) {
    const rawReg = fs.readFileSync(path.join(__dirname, '../data/regulatory_dataset.json'), 'utf8');
    regulatoryDataset = JSON.parse(rawReg);
  }
  if (!substituteWarnings) {
    const rawSub = fs.readFileSync(path.join(__dirname, '../data/substitute_warnings.json'), 'utf8');
    substituteWarnings = JSON.parse(rawSub);
  }
  return { regulatoryDataset, substituteWarnings };
}

function matchRegulatoryAdditives(ingredientsText) {
  const { regulatoryDataset } = loadDatasets();
  const text = (ingredientsText || '').toLowerCase();
  const matched = [];

  for (const entry of regulatoryDataset) {
    const aliases = entry.aliases || [entry.additive.toLowerCase()];
    let isMatched = false;
    let matchedKeyword = '';

    for (const alias of aliases) {
      const aliasLower = alias.toLowerCase();
      const regex = new RegExp(`\\b${escapeRegExp(aliasLower)}\\b`, 'i');
      if (regex.test(text)) {
        isMatched = true;
        matchedKeyword = alias;
        break;
      }
    }

    if (isMatched) {
      matched.push({
        additive: entry.additive,
        matchedKeyword,
        india_status: entry.india_status,
        eu_status: entry.eu_status,
        au_status: entry.au_status,
        note: entry.note,
        source: entry.source,
      });
    }
  }

  return matched;
}

function checkSubstituteWarnings(productIngredientsText) {
  const { substituteWarnings } = loadDatasets();
  const text = (productIngredientsText || '').toLowerCase();
  const flaggedWarnings = [];

  for (const sub of substituteWarnings) {
    const term = sub.common_substitute.toLowerCase();
    const keywords = term.split(/[/(),]/).map((k) => k.trim()).filter((k) => k.length > 2);

    const matches = keywords.some((kw) => {
      const regex = new RegExp(`\\b${escapeRegExp(kw)}\\b`, 'i');
      return regex.test(text);
    });

    if (matches) {
      flaggedWarnings.push({
        original_ingredient: sub.original_ingredient,
        common_substitute: sub.common_substitute,
        caveat: sub.caveat,
        source: sub.source,
      });
    }
  }

  return flaggedWarnings;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  loadDatasets,
  matchRegulatoryAdditives,
  checkSubstituteWarnings,
};
