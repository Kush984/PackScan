import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CONDITIONS_DATA = [
  {
    id: 'diabetic',
    name: 'Diabetic / Pre-Diabetic',
    subtitle: 'Sugar & Glycemic Interceptors',
    tag: 'Sugar & Simple Carbs',
    tagClass: 'bg-cyan-100/80 border-cyan-200 text-[#0e7490]',
    desc: 'Flags added sugar >15g/100g, maltodextrin, high-fructose corn syrup & liquid glucose.',
    standard: 'FSSAI Carbohydrate Standard',
    rule: 'LM Rule 6(1)(f)',
    standardIcon: 'verified',
    guardedCount: 3,
  },
  {
    id: 'hypertension',
    name: 'Hypertension / High BP',
    subtitle: 'Cardiovascular Sodium Guard',
    tag: 'Sodium & Salt',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags sodium >400mg/100g, added MSG and high-salt preservative bases.',
    standard: 'Sodium & Added Salt Telemetry',
    rule: 'FSSAI REG-2018',
    standardIcon: 'check_circle_outline',
    guardedCount: 2,
  },
  {
    id: 'high_cholesterol',
    alias: 'cholesterol',
    name: 'High Cholesterol / Heart',
    subtitle: 'Lipid & Trans Fat Guard',
    tag: 'Saturated & Trans Fats',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags palm oil, hydrogenated fats, saturated fat >5g and added cholesterol derivatives.',
    standard: 'Hydrogenated Oil Inspection',
    rule: 'LM Rule Sec 36',
    standardIcon: 'check_circle_outline',
    guardedCount: 3,
  },
  {
    id: 'celiac',
    name: 'Celiac Disease',
    subtitle: 'Zero-Gluten Protection',
    tag: 'Gluten Free (<20 ppm)',
    tagClass: 'bg-amber-50 border-amber-200 text-amber-800',
    desc: 'Strict zero-tolerance for wheat, barley, rye, malt and shared-facility traces.',
    standard: 'Allergen Threshold <20 ppm',
    rule: 'CODEX STAN 118',
    standardIcon: 'verified_user',
    guardedCount: 4,
  },
  {
    id: 'kidney_disease',
    alias: 'ckd',
    name: 'Chronic Kidney Disease (CKD)',
    subtitle: 'Renal Mineral Monitor',
    tag: 'Potassium & Phosphorus',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags potassium chloride (INS 508), hidden phosphate additives & high sodium.',
    standard: 'Additive Retention Scanner',
    rule: 'INS 508 / 450',
    standardIcon: 'science',
    guardedCount: 3,
  },
  {
    id: 'lactose_intolerance',
    alias: 'lactose',
    name: 'Lactose Intolerance',
    subtitle: 'Dairy Derivative Guard',
    tag: 'Dairy Solids',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags milk powder, whey solids, casein, curd extract & lactose derivatives.',
    standard: 'Dairy Derivative Detection',
    rule: 'FSSAI DAIRY-4',
    standardIcon: 'medication',
    guardedCount: 4,
  },
  {
    id: 'gout',
    name: 'Gout & Hyperuricemia',
    subtitle: 'Purine & Fructose Monitor',
    tag: 'Purines & HFCS',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags yeast extract, high-fructose syrups, shellfish extracts and hydrolysed animal protein.',
    standard: 'Purine Derivative Warning',
    rule: 'BIO-CHEM-09',
    standardIcon: 'warning_amber',
    guardedCount: 3,
  },
  {
    id: 'ibs',
    name: 'IBS / High FODMAP',
    subtitle: 'Gut Sensitivity Guard',
    tag: 'FODMAPs & Polyols',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags inulin, sorbitol, maltitol, high polyols, concentrated onion & garlic powders.',
    standard: 'Polyol & Prebiotic Intercept',
    rule: 'INS 420 / 965',
    standardIcon: 'blur_on',
    guardedCount: 4,
  },
  {
    id: 'gerd',
    name: 'GERD / Acid Reflux',
    subtitle: 'Gastric Acidity Monitor',
    tag: 'High Acid & Spices',
    tagClass: 'bg-slate-100 border-slate-200 text-slate-700',
    desc: 'Flags excessive citric acid, vinegar, chili oleoresins, high cocoa solids and caffeine.',
    standard: 'pH Irritant Threshold',
    rule: 'INS 330',
    standardIcon: 'local_fire_department',
    guardedCount: 4,
  },
  {
    id: 'pku',
    name: 'Phenylketonuria (PKU)',
    subtitle: 'Aspartame Contraindication',
    tag: 'Aspartame Warning',
    tagClass: 'bg-orange-50 border-orange-200 text-orange-700',
    desc: 'Strict contraindication for Aspartame (INS 951) with mandatory statutory warnings.',
    standard: 'Mandatory Statutory Declaration',
    rule: 'FSSAI CLAUSE 2.4.5',
    standardIcon: 'report_problem',
    guardedCount: 2,
  },
];

export default function MedicalProfileView({
  userProfile = {},
  onSaveProfile,
  onNavigateTab,
}) {
  // Normalize existing conditions into a set of active IDs
  const initialActive = new Set();
  (userProfile.conditions || []).forEach((cond) => {
    initialActive.add(cond);
    // map aliases
    if (cond === 'diabetic') initialActive.add('diabetic');
    if (cond === 'cholesterol' || cond === 'high_cholesterol') {
      initialActive.add('high_cholesterol');
      initialActive.add('cholesterol');
    }
    if (cond === 'ckd' || cond === 'kidney_disease') {
      initialActive.add('kidney_disease');
      initialActive.add('ckd');
    }
    if (cond === 'lactose' || cond === 'lactose_intolerance') {
      initialActive.add('lactose_intolerance');
      initialActive.add('lactose');
    }
  });

  const [selectedConditions, setSelectedConditions] = useState(initialActive);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync if prop updates
  useEffect(() => {
    const updated = new Set();
    (userProfile.conditions || []).forEach((cond) => {
      updated.add(cond);
      if (cond === 'cholesterol' || cond === 'high_cholesterol') {
        updated.add('high_cholesterol');
        updated.add('cholesterol');
      }
      if (cond === 'ckd' || cond === 'kidney_disease') {
        updated.add('kidney_disease');
        updated.add('ckd');
      }
      if (cond === 'lactose' || cond === 'lactose_intolerance') {
        updated.add('lactose_intolerance');
        updated.add('lactose');
      }
    });
    setSelectedConditions(updated);
  }, [userProfile.conditions]);

  const toggleCondition = (condId, alias) => {
    setSelectedConditions((prev) => {
      const next = new Set(prev);
      const isCurrentlySelected = next.has(condId) || (alias && next.has(alias));
      if (isCurrentlySelected) {
        next.delete(condId);
        if (alias) next.delete(alias);
      } else {
        next.add(condId);
        if (alias) next.add(alias);
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setSelectedConditions(new Set());
  };

  const handleSave = () => {
    // Array of unique canonical conditions for backend
    const canonical = Array.from(selectedConditions);
    if (onSaveProfile) {
      onSaveProfile({
        ...userProfile,
        conditions: canonical,
      });
    }

    setIsSavedRecently(true);
    setTimeout(() => {
      setIsSavedRecently(false);
    }, 1800);
  };

  // Calculate telemetry counts
  const activeCards = CONDITIONS_DATA.filter(
    (c) => selectedConditions.has(c.id) || (c.alias && selectedConditions.has(c.alias))
  );
  const activeCount = activeCards.length;
  const guardedCount = activeCards.reduce((acc, c) => acc + c.guardedCount, 0);

  return (
    <div className="flex flex-col w-full gap-6 pb-20">
      {/* Header Banner: Elevated White Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0e7490] shrink-0">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              medical_information
            </span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Medical &amp; Chronic Health Conditions
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Select chronic health profiles to automatically highlight risky ingredients and hidden sugars during label scans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shrink-0 self-start md:self-auto">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-['JetBrains_Mono'] text-slate-500 uppercase tracking-wider font-semibold">
              Active Protection
            </span>
            <span className="text-xs font-bold text-slate-800">Real-Time Package Alerts</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-cyan-300 text-[#0e7490] rounded-md font-['JetBrains_Mono'] text-xs font-semibold shadow-2xs">
            <span className="material-symbols-outlined text-[16px] text-[#0e7490]">verified</span>
            <span>SYNCED</span>
          </div>
        </div>
      </div>

      {/* Step / Sub-Navigation: Light Elevated Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tab 1 (Active) */}
        <div className="flex items-center justify-between p-3.5 bg-[#0e7490] text-white rounded-xl shadow-sm border border-cyan-800 cursor-default">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center font-['JetBrains_Mono'] text-xs font-bold">
              01
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-white">
              1. Medical Conditions (Active)
            </span>
          </div>
          <motion.span
            key={activeCount}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 rounded bg-black/20 text-cyan-100 font-['JetBrains_Mono'] text-xs font-bold"
          >
            {activeCount} SELECTED
          </motion.span>
        </div>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('allergies')}
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-xl shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 group-hover:border-cyan-500 group-hover:text-[#0e7490] flex items-center justify-center font-['JetBrains_Mono'] text-xs font-semibold transition-colors">
              02
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 group-hover:text-[#0e7490] transition-colors">
              2. Allergens &amp; Thresholds
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#0e7490] transition-colors">
            arrow_forward
          </span>
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('allergies')}
          className="flex items-center justify-between p-3.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all rounded-xl shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 group-hover:border-cyan-500 group-hover:text-[#0e7490] flex items-center justify-center font-['JetBrains_Mono'] text-xs font-semibold transition-colors">
              03
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-800 group-hover:text-[#0e7490] transition-colors">
              3. Additives &amp; E-Codes
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#0e7490] transition-colors">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Condition Cards Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 tracking-tight">
            Select Health Conditions to Guard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle each condition to configure mandatory label warnings during product scanning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-['JetBrains_Mono'] font-semibold rounded-md shadow-2xs">
            10 Standards Available
          </span>
        </div>
      </div>

      {/* Condition Cards Grid (10 Refined Light Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONDITIONS_DATA.map((c, index) => {
          const isSelected = selectedConditions.has(c.id) || (c.alias && selectedConditions.has(c.alias));

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              onClick={() => toggleCondition(c.id, c.alias)}
              className={`relative flex flex-col p-5 rounded-xl cursor-pointer transition-all group ${
                isSelected
                  ? 'border-2 border-[#0e7490] bg-[#f0fdfa] shadow-sm'
                  : 'border border-slate-200 bg-white shadow-2xs hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#0e7490] text-white shadow-2xs'
                        : 'border-2 border-slate-300 bg-white text-transparent group-hover:border-[#0e7490]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px] font-bold">check</span>
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                      {c.name}
                    </h3>
                    <span
                      className={`font-['JetBrains_Mono'] text-[10px] font-semibold ${
                        isSelected ? 'text-[#0e7490]' : 'text-slate-500'
                      }`}
                    >
                      {c.subtitle}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-md border font-['JetBrains_Mono'] text-[11px] font-semibold ${
                    c.tagClass
                  }`}
                >
                  {c.tag}
                </span>
              </div>

              <p
                className={`text-sm pl-9 mb-3 leading-relaxed ${
                  isSelected ? 'text-slate-700 font-medium' : 'text-slate-600'
                }`}
              >
                {c.desc}
              </p>

              <div
                className={`flex items-center justify-between pt-2.5 mt-auto pl-9 border-t text-xs ${
                  isSelected ? 'border-cyan-100' : 'border-slate-100'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 ${
                    isSelected ? 'text-[#0e7490]' : 'text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{c.standardIcon}</span>
                  <span className="font-['JetBrains_Mono'] text-[11px] font-medium">{c.standard}</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-slate-400 font-medium">
                  {c.rule}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom High-Contrast Control Bar */}
      <div className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg py-3 px-4 md:px-6 rounded-xl">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0e7490] shrink-0">
              <span className="material-symbols-outlined text-[24px]">verified</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                  {activeCount} {activeCount === 1 ? 'Condition' : 'Conditions'} Active
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#0e7490] font-bold">
                  {guardedCount} Ingredients Guarded
                </span>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-slate-500 uppercase tracking-wider font-semibold">
                Active scanner alert thresholds
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">restart_alt</span>
              <span>Clear All</span>
            </button>

            {/* Primary Action CTA */}
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-lg font-['Space_Grotesk'] text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0e7490] hover:bg-[#155e75] active:bg-[#005a71] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSavedRecently ? 'check_circle' : 'check'}
              </span>
              <span>{isSavedRecently ? 'Profile Saved!' : 'Save Health Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
