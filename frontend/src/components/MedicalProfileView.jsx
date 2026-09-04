import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  CheckCircle2,
  ShieldCheck,
  Shield,
  FlaskConical,
  Pill,
  AlertTriangle,
  Sparkles,
  Flame,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Check,
} from 'lucide-react';

function renderStandardIcon(iconName) {
  switch (iconName) {
    case 'verified':
      return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'check_circle_outline':
      return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'verified_user':
      return <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'science':
      return <FlaskConical className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'medication':
      return <Pill className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'warning_amber':
      return <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
    case 'blur_on':
      return <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    case 'local_fire_department':
      return <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    case 'report_problem':
      return <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />;
    default:
      return <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
  }
}

const CONDITIONS_DATA = [
  {
    id: 'diabetic',
    name: 'Diabetic / Pre-Diabetic',
    subtitle: 'Sugar & Glycemic Interceptors',
    tag: 'Sugar & Simple Carbs',
    tagClass: 'bg-[#e6fbf9] border-[#99f6e4] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#f0fdfc] border-[#ccfbf1] text-[#0f766e]',
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
    tagClass: 'bg-[#fff7ed] border-[#fed7aa] text-[#c2410c]',
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 bg-white border border-[#ccfbf1] rounded-2xl shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e0fbf9] border border-[#99f6e4] flex items-center justify-center text-[#0d9488] shrink-0">
            <Stethoscope className="w-7 h-7 text-[#0d9488]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">
              Medical &amp; Chronic Health Conditions
            </h1>
            <p className="text-sm text-[#334155] mt-1 max-w-2xl leading-relaxed">
              Select chronic health profiles to automatically highlight risky ingredients and hidden sugars during label scans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#f0fdfc] border border-[#ccfbf1] px-4 py-2.5 rounded-xl shrink-0 self-start md:self-auto">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-['JetBrains_Mono'] text-[#64748b] uppercase tracking-wider font-semibold">
              Active Protection
            </span>
            <span className="text-xs font-bold text-[#0f172a]">Real-Time Package Alerts</span>
          </div>
          <div className="h-6 w-px bg-[#ccfbf1]"></div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#e6fbf9] border border-[#99f6e4] text-[#0f766e] rounded-md font-['JetBrains_Mono'] text-xs font-semibold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>SYNCED</span>
          </div>
        </div>
      </div>

      {/* Step / Sub-Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tab 1 (Active) */}
        <div className="flex items-center justify-between p-3.5 bg-[#e0fbf9] text-[#0f766e] rounded-xl shadow-xs border-2 border-[#47d1cc] cursor-default">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#47d1cc] text-[#042f2e] flex items-center justify-center font-['JetBrains_Mono'] text-xs font-bold">
              01
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#0f766e]">
              1. Medical Conditions (Active)
            </span>
          </div>
          <motion.span
            key={activeCount}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 rounded bg-[#47d1cc] text-[#042f2e] font-['JetBrains_Mono'] text-xs font-bold"
          >
            {activeCount} SELECTED
          </motion.span>
        </div>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('allergies')}
          className="flex items-center justify-between p-3.5 bg-white border border-[#ccfbf1] text-[#334155] hover:bg-[#f0fdfc] hover:border-[#47d1cc] transition-all rounded-xl shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#f0fdfc] border border-[#ccfbf1] text-[#64748b] group-hover:border-[#47d1cc] group-hover:text-[#0d9488] flex items-center justify-center font-['JetBrains_Mono'] text-xs font-semibold transition-colors">
              02
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#334155] group-hover:text-[#0d9488] transition-colors">
              2. Allergens &amp; Thresholds
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#0d9488] transition-colors" />
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('allergies')}
          className="flex items-center justify-between p-3.5 bg-white border border-[#ccfbf1] text-[#334155] hover:bg-[#f0fdfc] hover:border-[#47d1cc] transition-all rounded-xl shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#f0fdfc] border border-[#ccfbf1] text-[#64748b] group-hover:border-[#47d1cc] group-hover:text-[#0d9488] flex items-center justify-center font-['JetBrains_Mono'] text-xs font-semibold transition-colors">
              03
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#334155] group-hover:text-[#0d9488] transition-colors">
              3. Additives &amp; E-Codes
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#0d9488] transition-colors" />
        </button>
      </div>

      {/* Condition Cards Section Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#0f172a] tracking-tight">
            Select Health Conditions to Guard
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Toggle each condition to configure mandatory label warnings during product scanning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#f0fdfc] border border-[#ccfbf1] text-[#334155] text-xs font-['JetBrains_Mono'] font-semibold rounded-md shadow-xs">
            10 Standards Available
          </span>
        </div>
      </div>

      {/* Condition Cards Grid (10 Refined Cards) */}
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
                  ? 'border-2 border-[#47d1cc] bg-[#e8faf8] shadow-xs'
                  : 'border border-[#ccfbf1] bg-white shadow-xs hover:border-[#47d1cc] hover:bg-[#f8fefe]'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-[#47d1cc] text-[#042f2e] shadow-xs'
                        : 'border-2 border-[#cbd5e1] bg-[#f8fafc] text-transparent group-hover:border-[#47d1cc]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 font-bold stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0f172a]">
                      {c.name}
                    </h3>
                    <span
                      className={`font-['JetBrains_Mono'] text-[10px] font-semibold ${
                        isSelected ? 'text-[#0d9488]' : 'text-[#64748b]'
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
                  isSelected ? 'text-[#1e293b] font-medium' : 'text-[#475569]'
                }`}
              >
                {c.desc}
              </p>

              <div
                className={`flex items-center justify-between pt-2.5 mt-auto pl-9 border-t text-xs ${
                  isSelected ? 'border-[#ccfbf1]' : 'border-[#f1f5f9]'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 ${
                    isSelected ? 'text-[#0d9488]' : 'text-[#64748b]'
                  }`}
                >
                  {renderStandardIcon(c.standardIcon)}
                  <span className="font-['JetBrains_Mono'] text-[11px] font-medium">{c.standard}</span>
                </div>
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#94a3b8] font-medium">
                  {c.rule}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky Bottom High-Contrast Control Bar */}
      <div className="sticky bottom-0 z-40 w-full bg-white/95 backdrop-blur-md border border-[#ccfbf1] shadow-lg py-3 px-4 md:px-6 rounded-xl">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#e0fbf9] border border-[#99f6e4] flex items-center justify-center text-[#0d9488] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0d9488]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] text-base font-bold text-[#0f172a]">
                  {activeCount} {activeCount === 1 ? 'Condition' : 'Conditions'} Active
                </span>
                <span className="text-[#cbd5e1]">•</span>
                <span className="font-['JetBrains_Mono'] text-sm text-[#0d9488] font-bold">
                  {guardedCount} Ingredients Guarded
                </span>
              </div>
              <span className="text-[11px] font-['JetBrains_Mono'] text-[#64748b] uppercase tracking-wider font-semibold">
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
              className="px-4 py-2.5 rounded-lg border border-[#ccfbf1] bg-[#f0fdfc] hover:bg-[#e0fbf9] active:bg-[#ccfbf1] text-[#334155] font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Clear All</span>
            </button>

            {/* Primary Action CTA */}
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2.5 rounded-lg font-['Space_Grotesk'] text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer border ${
                isSavedRecently
                  ? 'bg-emerald-600 text-white border-emerald-700'
                  : 'bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] border-[#2bc4be]'
              }`}
            >
              {isSavedRecently ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isSavedRecently ? 'Profile Saved!' : 'Save Health Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
