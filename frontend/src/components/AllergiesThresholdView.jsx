import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  Wheat,
  Nut,
  Flower2,
  Leaf,
  Egg,
  Grid,
  Fish,
  FlaskConical,
  Gauge,
  Dna,
  ShieldCheck,
  Shield,
  RotateCcw,
  Plus,
  X,
  Search,
  Check,
  CheckCircle2,
  Save,
  ArrowRight,
} from 'lucide-react';

function renderAllergenIcon(id, className) {
  switch (id) {
    case 'dairy': return <Droplets className={className} />;
    case 'gluten': return <Wheat className={className} />;
    case 'peanut': return <Nut className={className} />;
    case 'tree nuts': return <Flower2 className={className} />;
    case 'soy': return <Leaf className={className} />;
    case 'egg': return <Egg className={className} />;
    case 'sesame': return <Grid className={className} />;
    case 'mustard': return <Flower2 className={className} />;
    case 'shellfish': return <Fish className={className} />;
    case 'fish': return <Fish className={className} />;
    case 'sulfites': return <FlaskConical className={className} />;
    default: return <Leaf className={className} />;
  }
}

// Standard 11 built-in allergens recognized under FSSAI and international CODEX
const BUILTIN_ALLERGENS = [
  {
    id: 'dairy',
    tag: 'Dairy',
    name: 'Dairy / Milk / Lactose',
    sub: 'Casein, Whey, Curd, Ghee solids',
    icon: 'water_drop',
  },
  {
    id: 'gluten',
    tag: 'Gluten',
    name: 'Gluten / Wheat',
    sub: 'Atta, Spelt, Barley, Malt extract',
    icon: 'grain',
  },
  {
    id: 'peanut',
    tag: 'Peanut',
    name: 'Peanuts',
    sub: 'Groundnut, Cold-pressed peanut oils',
    icon: 'nutrition',
  },
  {
    id: 'tree nuts',
    tag: 'Tree Nuts',
    name: 'Tree Nuts',
    sub: 'Almond, Cashew, Pistachio, Walnut',
    icon: 'spa',
  },
  {
    id: 'soy',
    tag: 'Soy',
    name: 'Soy',
    sub: 'Soy lecithin (INS 322), Soya protein',
    icon: 'eco',
  },
  {
    id: 'egg',
    tag: 'Egg',
    name: 'Egg',
    sub: 'Albumin, Egg yolk, Lysozyme powder',
    icon: 'egg',
  },
  {
    id: 'sesame',
    tag: 'Sesame',
    name: 'Sesame (Til)',
    sub: 'Sesame seeds, Gingelly oil, Tahini',
    icon: 'scatter_plot',
  },
  {
    id: 'mustard',
    tag: 'Mustard',
    name: 'Mustard (Sarson / Rai)',
    sub: 'Mustard seed, Rai powder, Oleoresin',
    icon: 'local_florist',
  },
  {
    id: 'shellfish',
    tag: 'Shellfish',
    name: 'Shellfish / Crustaceans',
    sub: 'Prawns, Shrimp, Crab, Lobster, Chitin',
    icon: 'set_meal',
  },
  {
    id: 'fish',
    tag: 'Fish',
    name: 'Fish & Derivatives',
    sub: 'Fish gelatin, Marine omega-3 oils',
    icon: 'phishing',
  },
  {
    id: 'sulfites',
    tag: 'Sulfites',
    name: 'Sulfites / Sulphur Dioxide (INS 220 - 228)',
    sub: 'Preservatives in dried fruit, wine, processed potatoes (> 10mg/kg)',
    icon: 'science',
    colSpan: 'sm:col-span-2',
  },
];

export default function AllergiesThresholdView({
  userProfile = {},
  onSaveProfile,
  onNavigateTab,
}) {
  // Normalize incoming allergies
  const initialAllergies = useMemo(() => {
    return (userProfile.allergies || []).map((a) => a.trim().toLowerCase());
  }, [userProfile.allergies]);

  // Normalize incoming conditions
  const initialConditions = useMemo(() => {
    return (userProfile.conditions || []).map((c) => c.trim().toLowerCase());
  }, [userProfile.conditions]);

  const [selectedAllergens, setSelectedAllergens] = useState(initialAllergies);
  const [selectedConditions, setSelectedConditions] = useState(initialConditions);
  const [customAllergenInput, setCustomAllergenInput] = useState('');
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [customConditions, setCustomConditions] = useState([]);
  const [sugarThreshold, setSugarThreshold] = useState(
    Number(userProfile.sugar_threshold) || 15
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when profile prop updates
  useEffect(() => {
    setSelectedAllergens((userProfile.allergies || []).map((a) => a.trim().toLowerCase()));
    
    const conds = (userProfile.conditions || []).map((c) => c.trim().toLowerCase());
    setSelectedConditions(conds);

    // Extract custom conditions that aren't the standard 10 or fatty_liver
    const knownIds = [
      'diabetic', 'hypertension', 'high_cholesterol', 'celiac',
      'kidney_disease', 'lactose_intolerance', 'gout', 'ibs',
      'gerd', 'pku', 'fatty_liver', 'cholesterol', 'ckd', 'lactose'
    ];
    const custom = conds.filter((c) => !knownIds.includes(c));
    setCustomConditions(custom);

    if (userProfile.sugar_threshold !== undefined) {
      setSugarThreshold(Number(userProfile.sugar_threshold));
    }
  }, [userProfile]);

  const isNafldActive = selectedConditions.includes('fatty_liver');

  const toggleNAFLD = () => {
    setSelectedConditions((prev) =>
      prev.includes('fatty_liver')
        ? prev.filter((c) => c !== 'fatty_liver')
        : [...prev, 'fatty_liver']
    );
  };

  const isAllergenActive = (id) => {
    const norm = id.toLowerCase();
    return selectedAllergens.some((a) => a === norm || a.includes(norm) || norm.includes(a));
  };

  const toggleAllergen = (id) => {
    const norm = id.toLowerCase();
    setSelectedAllergens((prev) => {
      if (prev.some((a) => a === norm || a.includes(norm) || norm.includes(a))) {
        return prev.filter((a) => a !== norm && !a.includes(norm) && !norm.includes(a));
      } else {
        return [...prev, norm];
      }
    });
  };

  const handleAddCustomAllergen = (e) => {
    if (e) e.preventDefault();
    const val = customAllergenInput.trim();
    if (!val) return;
    const norm = val.toLowerCase();
    if (!selectedAllergens.includes(norm)) {
      setSelectedAllergens((prev) => [...prev, norm]);
    }
    setCustomAllergenInput('');
  };

  const handleRemoveAllergen = (norm) => {
    setSelectedAllergens((prev) =>
      prev.filter((a) => a !== norm && !a.includes(norm) && !norm.includes(a))
    );
  };

  const handleAddCustomCondition = (e) => {
    if (e) e.preventDefault();
    const val = customConditionInput.trim();
    if (!val) return;
    if (!customConditions.includes(val)) {
      setCustomConditions((prev) => [...prev, val]);
      setSelectedConditions((prev) => [...prev, val.toLowerCase()]);
    }
    setCustomConditionInput('');
  };

  const handleRemoveCustomCondition = (condName) => {
    setCustomConditions((prev) => prev.filter((c) => c !== condName));
    setSelectedConditions((prev) =>
      prev.filter((c) => c !== condName.toLowerCase())
    );
  };

  const handleDeselectAllAllergens = () => {
    setSelectedAllergens([]);
  };

  const handleResetAll = () => {
    setSelectedAllergens([]);
    setSelectedConditions((prev) => prev.filter((c) => c !== 'fatty_liver'));
    setCustomConditions([]);
    setSugarThreshold(15);
  };

  const handleSave = () => {
    if (onSaveProfile) {
      // Re-assemble complete conditions list
      const combinedConditions = Array.from(
        new Set([
          ...selectedConditions,
          ...customConditions.map((c) => c.toLowerCase()),
        ])
      );

      const updated = {
        ...userProfile,
        allergies: selectedAllergens,
        conditions: combinedConditions,
        sugar_threshold: Number(sugarThreshold),
      };

      onSaveProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Telemetry metric styling
  const sugarColorClass =
    sugarThreshold <= 10
      ? 'text-[#0e7490]'
      : sugarThreshold <= 25
      ? 'text-[#ea580c]'
      : 'text-rose-600';

  const impactPct = useMemo(() => {
    if (sugarThreshold <= 5) return 88;
    if (sugarThreshold <= 10) return 78;
    if (sugarThreshold <= 15) return 68;
    if (sugarThreshold <= 20) return 54;
    if (sugarThreshold <= 25) return 42;
    if (sugarThreshold <= 35) return 28;
    return 14;
  }, [sugarThreshold]);

  const totalAllergensCount = selectedAllergens.length;
  const totalCustomConditionsCount =
    (isNafldActive ? 1 : 0) + customConditions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-16 space-y-6"
    >
      {/* HEADER CARD */}
      <div className="w-full bg-white rounded-xl p-6 sm:p-7 shadow-xs border border-[#e7e0d6]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#fdf2ec] border border-[#f5d5c6] text-[#b8532f] font-['Space_Grotesk'] text-[11px] font-semibold uppercase rounded">
                Personal Safety Profile
              </span>
              <span className="text-[#e7e0d6]">•</span>
              <span className="text-[#786e65] font-['Space_Grotesk'] text-xs font-medium">
                Local Device Configuration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#2a2622] tracking-tight">
              Allergies &amp; Custom Threshold Matrix
            </h1>
            <p className="text-[#574f46] text-sm mt-1 max-w-3xl leading-relaxed">
              Configure food allergies and personal sugar limits for instant on-device warnings when scanning.
            </p>
          </div>

          {/* Clean Privacy / Local Storage Badge */}
          <div className="flex items-center gap-3 bg-[#faf7f2] border border-[#e7e0d6] px-4 py-2.5 rounded-xl shrink-0 self-start sm:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c99a3e] animate-pulse"></span>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-[#2a2622]">
                On-Device Storage
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] text-[#786e65]">
                Private &amp; Offline Verification
              </span>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#b8532f] ml-1" />
          </div>
        </div>
      </div>

      {/* SUB-NAVIGATION STEP TABS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('medical')}
          className="flex items-center justify-between p-3.5 bg-white border border-[#e7e0d6] text-[#2a2622] hover:bg-[#faf7f2] hover:border-[#b8532f]/40 transition-all rounded-xl shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#faf7f2] border border-[#e7e0d6] text-[#786e65] group-hover:border-[#b8532f] group-hover:text-[#b8532f] flex items-center justify-center font-['Space_Grotesk'] text-xs font-semibold transition-colors">
              01
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#2a2622] group-hover:text-[#b8532f] transition-colors">
              1. Medical Conditions
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#786e65] group-hover:text-[#b8532f] transition-colors" />
        </button>

        {/* Step 2 (Active) */}
        <div className="flex items-center justify-between p-3.5 bg-[#fdf2ec] text-[#b8532f] rounded-xl shadow-xs border-2 border-[#b8532f] cursor-default">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#b8532f] text-white flex items-center justify-center font-['Space_Grotesk'] text-xs font-bold">
              02
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#b8532f]">
              2. Allergens &amp; Thresholds (Active)
            </span>
          </div>
          <motion.span
            key={totalAllergensCount}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 rounded bg-[#b8532f] text-white font-['Space_Grotesk'] text-xs font-bold"
          >
            {totalAllergensCount} ACTIVE
          </motion.span>
        </div>

        {/* Step 3 */}
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab('forum')}
          className="flex items-center justify-between p-3.5 bg-white border border-[#e7e0d6] text-[#2a2622] hover:bg-[#faf7f2] hover:border-[#b8532f]/40 transition-all rounded-xl shadow-xs group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-[#faf7f2] border border-[#e7e0d6] text-[#786e65] group-hover:border-[#b8532f] group-hover:text-[#b8532f] flex items-center justify-center font-['Space_Grotesk'] text-xs font-semibold transition-colors">
              03
            </span>
            <span className="font-['Space_Grotesk'] text-sm font-semibold text-[#2a2622] group-hover:text-[#b8532f] transition-colors">
              3. Forum &amp; Metrology Ledger
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#786e65] group-hover:text-[#b8532f] transition-colors" />
        </button>
      </div>

      {/* MAIN SPLIT CONSOLE (12-Col Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Auxiliary metabolism & Sugar Threshold */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section: Auxiliary Metabolism Triggers */}
          <section className="bg-white rounded-xl p-6 shadow-xs border border-[#e7e0d6] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e7e0d6]">
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-[#b8532f]" />
                <h2 className="font-['Space_Grotesk'] text-base font-bold text-[#2a2622] uppercase tracking-wide">
                  Metabolic Sensitivities
                </h2>
              </div>
              <span className="font-['Space_Grotesk'] text-[11px] text-[#786e65] font-medium uppercase">
                Advisory Watch
              </span>
            </div>

            {/* Fatty Liver (NAFLD) Card - Interactive Toggle */}
            <div
              onClick={toggleNAFLD}
              className={`group flex items-start gap-3.5 p-3.5 rounded-xl cursor-pointer transition-all ${
                isNafldActive
                  ? 'bg-[#fdf7f4] border-2 border-[#b8532f] shadow-xs'
                  : 'bg-[#faf7f2] hover:bg-[#f5ecdf] border border-[#e7e0d6]'
              }`}
            >
              <div className="pt-0.5">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                    isNafldActive
                      ? 'bg-[#b8532f] text-white shadow-xs'
                      : 'border border-[#e7e0d6] bg-white text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 font-bold stroke-[3]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#2a2622]">
                    Fatty Liver (NAFLD)
                  </span>
                  <span className="px-2 py-0.5 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] font-['Space_Grotesk'] text-[10px] rounded font-bold uppercase tracking-wider">
                    Fructose &amp; Trans Fats
                  </span>
                </div>
                <p className="text-xs text-[#574f46] mt-1 leading-relaxed">
                  Flags high fructose corn syrup solids, liquid glucose, chemically inverted sugars &amp; hydrogenated palm oils.
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="font-['Space_Grotesk'] text-[11px] text-[#786e65] font-medium">
                    TRIGGER: HFCS &gt; 0% | TRANS-FAT &gt; 0.2g
                  </span>
                </div>
              </div>
            </div>

            {/* Add Custom Disease / Metabolic Sensitivity */}
            <div className="pt-2 space-y-2">
              <label
                className="block font-['Space_Grotesk'] text-xs font-semibold uppercase text-[#786e65]"
                htmlFor="custom-disease-input"
              >
                Add Custom Metabolic Sensitivity
              </label>
              <form onSubmit={handleAddCustomCondition} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Shield className="w-4 h-4 text-[#786e65] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-disease-input"
                    type="text"
                    value={customConditionInput}
                    onChange={(e) => setCustomConditionInput(e.target.value)}
                    placeholder="Type condition (e.g. Migraine, Histamine)..."
                    className="w-full bg-[#faf7f2] border border-[#e7e0d6] text-[#2a2622] placeholder:text-[#786e65] pl-9 pr-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:border-[#b8532f] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#b8532f] hover:bg-[#a34a2b] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer border border-[#a34a2b]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Custom Conditions Tag List */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <AnimatePresence>
                  {customConditions.map((cond) => (
                    <motion.span
                      key={cond}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fdf9ee] border border-[#f2e5be] text-[#8a651e] font-['Space_Grotesk'] text-xs font-medium rounded-md"
                    >
                      <span>{cond}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomCondition(cond)}
                        className="text-[#8a651e] hover:text-[#2a2622] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Section: Sugar Flagging Sensitivity Slider */}
          <section className="bg-white rounded-xl p-6 shadow-xs border border-[#e7e0d6] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#b8532f]" />
                  <h2 className="font-['Space_Grotesk'] text-base font-bold text-[#2a2622] uppercase tracking-wide">
                    Sugar Flagging Sensitivity
                  </h2>
                </div>
                <p className="text-xs text-[#574f46] mt-1 leading-relaxed">
                  Alert triggers instantly if scanned product total sugar content exceeds this threshold.
                </p>
              </div>
              {/* Readout Pill */}
              <div className="bg-[#faf7f2] border border-[#e7e0d6] px-3.5 py-1.5 rounded-xl flex flex-col items-end shrink-0">
                <span className="font-['Space_Grotesk'] text-[10px] text-[#786e65] uppercase tracking-wider font-bold">
                  Active Limit
                </span>
                <span className={`font-['Space_Grotesk'] text-xl font-bold leading-none mt-0.5 ${sugarColorClass}`}>
                  {sugarThreshold} g/100g
                </span>
              </div>
            </div>

            {/* Slider Track */}
            <div className="py-2 space-y-2">
              <div className="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={sugarThreshold}
                  onChange={(e) => setSugarThreshold(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#e7e0d6] rounded-lg appearance-none cursor-pointer border border-[#d6ccc0] accent-[#b8532f]"
                />
              </div>
              {/* Calibration Hash Marks */}
              <div className="flex justify-between font-['Space_Grotesk'] text-[11px] text-[#786e65] px-1 pt-1">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-[#2a2622]">0g</span>
                  <span className="text-[9px] text-[#786e65]">Strict</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#2a2622] font-bold">10g</span>
                  <span className="text-[9px] text-[#786e65]">Low Sugar</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#b8532f] font-bold">15g</span>
                  <span className="text-[9px] text-[#b8532f] font-semibold">Standard Limit</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-[#2a2622]">25g</span>
                  <span className="text-[9px] text-[#786e65]">Moderate</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[#2a2622] font-bold">50g</span>
                  <span className="text-[9px] text-[#786e65]">Confectionery</span>
                </div>
              </div>
            </div>

            {/* Telemetry Comparison Card */}
            <div className="bg-[#faf7f2] border border-[#e7e0d6] p-3.5 rounded-xl flex items-center justify-between gap-4">
              <div className="flex flex-col min-w-0">
                <span className="font-['Space_Grotesk'] text-xs text-[#2a2622] uppercase font-bold">
                  Inspection Impact
                </span>
                <span className="text-xs text-[#786e65] truncate mt-0.5">
                  At {sugarThreshold}g/100g, ~{impactPct}% of packaged cereals &amp; sodas trigger instant warning flags.
                </span>
              </div>
              <svg className="w-24 h-9 shrink-0 text-[#b8532f]" fill="none" viewBox="0 0 100 40">
                <path
                  d="M0 35 Q 25 32, 45 20 T 75 14 T 100 4"
                  fill="none"
                  stroke="#b8532f"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle
                  cx={Math.min(95, Math.max(5, (sugarThreshold / 50) * 100))}
                  cy={Math.max(5, 35 - (sugarThreshold / 50) * 30)}
                  fill="#b8532f"
                  r="3.5"
                />
                <line
                  stroke="#b8532f"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                  x1={Math.min(95, Math.max(5, (sugarThreshold / 50) * 100))}
                  x2={Math.min(95, Math.max(5, (sugarThreshold / 50) * 100))}
                  y1="0"
                  y2="40"
                />
              </svg>
            </div>
          </section>

          {/* Context Reference Card */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e7e0d6] flex gap-3.5 items-center">
            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#fdf2ec] border border-[#f5d5c6] flex items-center justify-center text-[#b8532f]">
              <Dna className="w-7 h-7 text-[#b8532f]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-['Space_Grotesk'] text-[10px] text-[#b8532f] uppercase font-bold tracking-wider">
                Statutory Reference
              </span>
              <p className="font-['Space_Grotesk'] text-sm font-bold text-[#2a2622] truncate">
                Legal Metrology Packaged Rule 12
              </p>
              <p className="text-xs text-[#574f46] line-clamp-2 mt-0.5">
                Mandatory declaration of sugars, added sucrose, and artificial sweeteners per 100g serving size.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Allergen Grid & Custom Tag Tray */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white rounded-xl p-6 shadow-xs border border-[#e7e0d6] space-y-5">
            {/* Header with Active Allergen Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e7e0d6] gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#b8532f]" />
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-[#2a2622] uppercase tracking-tight">
                    Select Active Allergens
                  </h2>
                </div>
                <p className="text-xs text-[#786e65] mt-0.5">
                  Automated ingredient cross-referencing on every packaging scan
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1 bg-[#fdf2ec] border border-[#f5d5c6] text-[#b8532f] font-['Space_Grotesk'] text-xs rounded-md font-bold uppercase tracking-wider">
                  {totalAllergensCount} ACTIVE ALLERGEN{totalAllergensCount === 1 ? '' : 'S'}
                </span>
              </div>
            </div>

            {/* Allergen Grid (2 columns) with spring-based bounce */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BUILTIN_ALLERGENS.map((item) => {
                const active = isAllergenActive(item.id);
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAllergen(item.id)}
                    className={`cursor-pointer p-3.5 rounded-xl flex items-center justify-between group transition-all ${
                      item.colSpan || ''
                    } ${
                      active
                        ? 'bg-[#fdf7f4] text-[#2a2622] shadow-xs border-2 border-[#b8532f]'
                        : 'bg-[#faf7f2] border border-[#e7e0d6] hover:bg-[#f5ecdf] text-[#574f46]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          active
                            ? 'bg-[#fdf2ec] border border-[#f5d5c6]'
                            : 'bg-white border border-[#e7e0d6]'
                        }`}
                      >
                        {renderAllergenIcon(item.id, `w-5 h-5 ${active ? 'text-[#b8532f]' : 'text-[#786e65]'}`)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold truncate ${
                            active ? 'text-[#2a2622]' : 'text-[#574f46] group-hover:text-[#2a2622]'
                          }`}
                        >
                          {item.name}
                        </p>
                        <p
                          className={`font-['Space_Grotesk'] text-[11px] truncate ${
                            active ? 'text-[#b8532f]' : 'text-[#786e65]'
                          }`}
                        >
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        active
                          ? 'bg-[#b8532f] text-white shadow-xs'
                          : 'bg-white border border-[#e7e0d6] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 font-bold stroke-[3]" />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Custom Allergen Input Section */}
            <div className="pt-3 space-y-3">
              <label
                className="block font-['Space_Grotesk'] text-xs font-semibold uppercase text-[#786e65]"
                htmlFor="custom-allergen-input"
              >
                Add Custom Allergen or Ingredient
              </label>
              <form onSubmit={handleAddCustomAllergen} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#786e65] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-allergen-input"
                    type="text"
                    value={customAllergenInput}
                    onChange={(e) => setCustomAllergenInput(e.target.value)}
                    placeholder="Type custom allergen (e.g. Strawberry, MSG, Cashew)..."
                    className="w-full bg-[#faf7f2] border border-[#e7e0d6] text-[#2a2622] placeholder:text-[#786e65] pl-9 pr-3 py-2 rounded-lg text-xs font-medium focus:outline-none focus:border-[#b8532f] focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 bg-[#b8532f] hover:bg-[#a34a2b] text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer border border-[#a34a2b]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Active Chips Tray */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#786e65] font-semibold">
                    Active Enforcement Chips:
                  </span>
                  <button
                    type="button"
                    onClick={handleDeselectAllAllergens}
                    className="font-['Space_Grotesk'] text-[11px] text-[#b8532f] hover:text-[#a34a2b] font-semibold cursor-pointer underline"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AnimatePresence>
                    {selectedAllergens.map((tag) => {
                      // Find matching display label if built-in
                      const matched = BUILTIN_ALLERGENS.find(
                        (b) => b.id === tag || b.tag.toLowerCase() === tag
                      );
                      const displayLabel = matched ? matched.tag : tag;
                      return (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fdf2ec] text-[#b8532f] font-['Space_Grotesk'] text-xs font-semibold rounded-lg border border-[#f5d5c6]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#b8532f]" />
                          <span className="capitalize">{displayLabel}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAllergen(tag)}
                            className="text-[#b8532f] hover:text-[#2a2622] transition-colors ml-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      );
                    })}
                  </AnimatePresence>
                  {selectedAllergens.length === 0 && (
                    <span className="font-['Space_Grotesk'] text-xs text-[#786e65] italic">
                      No allergens currently active. Select above or add a custom term.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Inspection Verification Callout */}
          <div className="bg-white rounded-xl p-4 shadow-xs border border-[#e7e0d6] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#fdf2ec] border border-[#f5d5c6] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#b8532f]" />
              </div>
              <div className="min-w-0">
                <p className="font-['Space_Grotesk'] text-sm font-bold text-[#2a2622] truncate">
                  Instant Optical Ingredient Cross-Check
                </p>
                <p className="text-xs text-[#574f46] truncate">
                  Configured allergens automatically match text on scanned nutrition and ingredient panels.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="px-2.5 py-1 bg-[#fdfbf7] border border-[#f2e5be] text-[#8a651e] font-['Space_Grotesk'] text-xs font-bold rounded uppercase">
                READY
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION FOOTER BANNER */}
      <aside
        aria-label="Profile actions"
        className="w-full bg-white/95 backdrop-blur-md border border-[#e7e0d6] shadow-lg p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#b8532f]" />
            <span className="font-['Space_Grotesk'] text-sm font-bold text-[#2a2622]">
              Current Status:
            </span>
            <span className="font-['Space_Grotesk'] text-xs text-[#b8532f] font-bold px-2.5 py-1 bg-[#fdf2ec] border border-[#f5d5c6] rounded">
              {totalAllergensCount} Allergen{totalAllergensCount === 1 ? '' : 's'} •{' '}
              {totalCustomConditionsCount} Custom Condition{totalCustomConditionsCount === 1 ? '' : 's'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetAll}
            className="text-[#786e65] hover:text-[#2a2622] font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#786e65]" />
            <span>Clear All</span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('scan')}
            className="px-5 py-2.5 rounded-lg border border-[#e7e0d6] bg-[#faf7f2] text-[#2a2622] hover:bg-[#f5ecdf] font-semibold text-sm transition-all cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm shadow-xs active:scale-95 flex items-center gap-2 transition-all cursor-pointer border ${
              saveSuccess
                ? 'bg-[#8c3b1e] text-white border-[#702f18]'
                : 'bg-[#b8532f] hover:bg-[#a34a2b] text-white border-[#a34a2b]'
            }`}
          >
            {saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveSuccess ? 'Preferences Saved Successfully!' : 'Save Allergen Preferences'}</span>
          </motion.button>
        </div>
      </aside>
    </motion.div>
  );
}
