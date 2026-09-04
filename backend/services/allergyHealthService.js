/**
 * Enhanced Allergy & Multi-Disease Health Condition Evaluation Engine
 * Evaluates 11+ medical conditions from disease_database.json and custom user diseases,
 * combined with single-pass multi-allergen cross-checking.
 */

const fs = require('fs');
const path = require('path');

let allergenData = null;
let diseaseData = null;

function getAllergenData() {
  if (!allergenData) {
    const raw = fs.readFileSync(path.join(__dirname, '../data/ingredient_allergen_map.json'), 'utf8');
    allergenData = JSON.parse(raw);
  }
  return allergenData;
}

function getDiseaseData() {
  if (!diseaseData) {
    const raw = fs.readFileSync(path.join(__dirname, '../data/disease_database.json'), 'utf8');
    diseaseData = JSON.parse(raw);
  }
  return diseaseData;
}

function evaluateAllergiesAndHealth(ingredientsText, nutriments = {}, userProfile = {}) {
  const { mappings, common_allergens } = getAllergenData();
  const { conditions: diseaseCatalog } = getDiseaseData();
  const text = (ingredientsText || '').toLowerCase();

  const userAllergies = Array.isArray(userProfile.allergies)
    ? userProfile.allergies.map((a) => a.trim().toLowerCase())
    : [];
  const userConditions = Array.isArray(userProfile.conditions)
    ? userProfile.conditions.map((c) => c.trim().toLowerCase())
    : [];

  const sugarThreshold = Number(userProfile.sugar_threshold) || 15.0;
  const sodiumThreshold = Number(userProfile.sodium_threshold) || 400.0;
  const satFatThreshold = Number(userProfile.sat_fat_threshold) || 5.0;

  // Split ingredients and precautionary statements
  const mayContainMatches =
    text.match(
      /(?:may\s*contain(?:\s*traces\s*of)?|manufactured\s*(?:in\s*a\s*facility|on\s*equipment)\s*that\s*also\s*processes|allergen\s*advice|trace\s*elements\s*of)\s*[:\-\s]*([^\.]+)/gi
    ) || [];
  const mayContainText = mayContainMatches.join(' ');

  let directIngredientsText = text;
  mayContainMatches.forEach((m) => {
    directIngredientsText = directIngredientsText.replace(m, ' ');
  });

  const detectedAllergens = [];
  const matchedAllergenIds = new Set();

  // 1. Single-pass cross-check across all mapped ingredient terms
  for (const mapping of mappings) {
    const term = mapping.term.toLowerCase();
    const allergenId = mapping.allergen.toLowerCase();

    const isUserAllergic =
      userAllergies.length === 0 ||
      userAllergies.some((userAllergy) => {
        if (userAllergy === allergenId) return true;
        const allergenDef = common_allergens.find((ca) => ca.id === allergenId);
        if (allergenDef && allergenDef.synonyms.some((s) => s === userAllergy || userAllergy.includes(s))) {
          return true;
        }
        return false;
      });

    if (!isUserAllergic) continue;

    const termRegex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    const inDirect = termRegex.test(directIngredientsText);
    const inMayContain = termRegex.test(mayContainText);

    if (inDirect) {
      const existing = detectedAllergens.find((a) => a.allergen === allergenId && a.type === 'DIRECT');
      if (!existing) {
        detectedAllergens.push({
          allergen: allergenId,
          type: 'DIRECT',
          severity: 'CRITICAL',
          label: `CONTAINS ${allergenId.toUpperCase()}`,
          triggeredBy: mapping.term,
          message: `Direct ingredient detected: "${mapping.term}" matches your ${allergenId} allergy profile.`,
          userAlert: true,
        });
        matchedAllergenIds.add(allergenId);
      }
    } else if (inMayContain && !matchedAllergenIds.has(allergenId)) {
      const existing = detectedAllergens.find((a) => a.allergen === allergenId && a.type === 'TRACE');
      if (!existing) {
        detectedAllergens.push({
          allergen: allergenId,
          type: 'TRACE',
          severity: 'WARNING',
          label: `MAY CONTAIN TRACES OF ${allergenId.toUpperCase()}`,
          triggeredBy: mapping.term,
          message: `Cross-contamination warning: Facility or product packaging flags traces of "${mapping.term}".`,
          userAlert: true,
        });
      }
    }
  }

  // 2. Custom freeform user allergies
  for (const userAllergy of userAllergies) {
    if (!matchedAllergenIds.has(userAllergy)) {
      const customRegex = new RegExp(`\\b${escapeRegExp(userAllergy)}\\b`, 'i');
      if (customRegex.test(directIngredientsText)) {
        detectedAllergens.push({
          allergen: userAllergy,
          type: 'DIRECT',
          severity: 'CRITICAL',
          label: `CONTAINS ${userAllergy.toUpperCase()}`,
          triggeredBy: userAllergy,
          message: `Ingredient matching your custom allergy "${userAllergy}" was detected in the product.`,
          userAlert: true,
        });
      } else if (customRegex.test(mayContainText)) {
        detectedAllergens.push({
          allergen: userAllergy,
          type: 'TRACE',
          severity: 'WARNING',
          label: `MAY CONTAIN TRACES OF ${userAllergy.toUpperCase()}`,
          triggeredBy: userAllergy,
          message: `Cross-contamination warning flags possible traces of "${userAllergy}".`,
          userAlert: true,
        });
      }
    }
  }

  // 3. Multi-Disease & Condition Evaluation
  const healthConditionAlerts = [];

  for (const userCond of userConditions) {
    const catalogEntry = diseaseCatalog.find(
      (dc) => dc.id === userCond || dc.name.toLowerCase().includes(userCond)
    );

    if (catalogEntry) {
      // Evaluate based on specific condition rules
      if (catalogEntry.id === 'diabetic') {
        const sugars = nutriments.sugars_100g !== undefined ? Number(nutriments.sugars_100g) : null;
        if (sugars !== null) {
          const exceeds = sugars > sugarThreshold;
          healthConditionAlerts.push({
            conditionId: catalogEntry.id,
            condition: catalogEntry.id,
            conditionName: catalogEntry.name,
            metric: 'Total Sugars',
            value: `${sugars}g / 100g`,
            threshold: `${sugarThreshold}g / 100g`,
            status: exceeds ? 'FLAGGED' : 'SAFE',
            severity: exceeds ? (sugars > 25 ? 'CRITICAL' : 'WARNING') : 'GOOD',
            message: exceeds
              ? `High sugar alert: Contains ${sugars}g sugar per 100g (exceeds your ${sugarThreshold}g threshold). May trigger rapid glycemic spike.`
              : `Sugar content (${sugars}g/100g) is within your safe threshold of ${sugarThreshold}g/100g.`,
          });
        }
      } else if (catalogEntry.id === 'hypertension') {
        let sodium = nutriments.sodium_100g !== undefined ? Number(nutriments.sodium_100g) : null;
        if (sodium === null && nutriments.salt_100g !== undefined) {
          sodium = Math.round((Number(nutriments.salt_100g) / 2.5) * 1000);
        }
        if (sodium !== null) {
          const exceeds = sodium > sodiumThreshold;
          healthConditionAlerts.push({
            conditionId: catalogEntry.id,
            condition: catalogEntry.id,
            conditionName: catalogEntry.name,
            metric: 'Sodium Content',
            value: `${sodium}mg / 100g`,
            threshold: `${sodiumThreshold}mg / 100g`,
            status: exceeds ? 'FLAGGED' : 'SAFE',
            severity: exceeds ? (sodium > 800 ? 'CRITICAL' : 'WARNING') : 'GOOD',
            message: exceeds
              ? `High sodium alert: Contains ${sodium}mg sodium per 100g (exceeds ${sodiumThreshold}mg threshold). Excessive intake elevates blood pressure.`
              : `Sodium level (${sodium}mg/100g) is within healthy guidelines.`,
          });
        }
      } else if (catalogEntry.id === 'high_cholesterol') {
        const satFat = nutriments.saturated_fat_100g !== undefined ? Number(nutriments.saturated_fat_100g) : null;
        const matchedTriggers = (catalogEntry.flagged_ingredients || []).filter((fi) =>
          new RegExp(`\\b${escapeRegExp(fi)}\\b`, 'i').test(directIngredientsText)
        );

        if (satFat !== null && satFat > satFatThreshold) {
          healthConditionAlerts.push({
            conditionId: catalogEntry.id,
            condition: catalogEntry.id,
            conditionName: catalogEntry.name,
            metric: 'Saturated Fat',
            value: `${satFat}g / 100g`,
            threshold: `${satFatThreshold}g / 100g`,
            status: 'FLAGGED',
            severity: 'CRITICAL',
            message: `High saturated fat (${satFat}g/100g) and ingredients [${matchedTriggers.join(', ') || 'palm oil'}] raise LDL cholesterol.`,
          });
        } else if (matchedTriggers.length > 0) {
          healthConditionAlerts.push({
            conditionId: catalogEntry.id,
            condition: catalogEntry.id,
            conditionName: catalogEntry.name,
            metric: 'Atherogenic Fats',
            value: matchedTriggers.join(', '),
            status: 'FLAGGED',
            severity: 'WARNING',
            message: `Contains saturated or refined fats (${matchedTriggers.join(', ')}) not recommended for lipid management.`,
          });
        }
      } else {
        // Generic ingredient pattern match for other catalog diseases (Celiac, CKD, Gout, PKU, Lactose, IBS, GERD, etc.)
        const matchedTriggers = (catalogEntry.flagged_ingredients || []).filter((fi) =>
          new RegExp(`\\b${escapeRegExp(fi)}\\b`, 'i').test(directIngredientsText)
        );

        if (matchedTriggers.length > 0) {
          healthConditionAlerts.push({
            conditionId: catalogEntry.id,
            condition: catalogEntry.id,
            conditionName: catalogEntry.name,
            metric: 'Contraindicated Ingredients',
            value: matchedTriggers.slice(0, 3).join(', '),
            status: 'FLAGGED',
            severity: catalogEntry.id === 'pku' || catalogEntry.id === 'celiac' || catalogEntry.id === 'kidney_disease' ? 'CRITICAL' : 'WARNING',
            message: `${catalogEntry.warning_message} (Triggered by: ${matchedTriggers.join(', ')})`,
          });
        } else {
          healthConditionAlerts.push({
            condition: catalogEntry.name,
            metric: 'Safety Check',
            value: 'Clear',
            status: 'SAFE',
            severity: 'GOOD',
            message: `No contraindicated ingredients detected for ${catalogEntry.name}.`,
          });
        }
      }
    } else {
      // Custom freeform disease check
      const customRegex = new RegExp(`\\b${escapeRegExp(userCond)}\\b`, 'i');
      if (customRegex.test(directIngredientsText)) {
        healthConditionAlerts.push({
          condition: userCond.toUpperCase(),
          metric: 'Custom Condition Match',
          value: userCond,
          status: 'FLAGGED',
          severity: 'WARNING',
          message: `Product ingredients match your custom health flag "${userCond}".`,
        });
      }
    }
  }

  const isSafeForUser =
    detectedAllergens.filter((a) => a.severity === 'CRITICAL').length === 0 &&
    healthConditionAlerts.filter((h) => h.severity === 'CRITICAL').length === 0;

  return {
    isSafeForUser,
    allergenAlerts: detectedAllergens,
    conditionAlerts: healthConditionAlerts,
    totalAllergensDetected: detectedAllergens.length,
    directAllergensCount: detectedAllergens.filter((a) => a.type === 'DIRECT').length,
    traceAllergensCount: detectedAllergens.filter((a) => a.type === 'TRACE').length,
  };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  evaluateAllergiesAndHealth,
  getAllergenData,
  getDiseaseData,
};
