import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Heart,
  Activity,
  Check,
  Plus,
  AlertCircle,
  Sparkles,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

const COMMON_ALLERGENS = [
  { id: 'dairy', label: 'Dairy / Milk / Lactose', icon: '🥛' },
  { id: 'gluten', label: 'Gluten / Wheat / Maida', icon: '🌾' },
  { id: 'peanut', label: 'Peanuts / Groundnut', icon: '🥜' },
  { id: 'tree nuts', label: 'Tree Nuts (Almond, Cashew, Walnut)', icon: '🌰' },
  { id: 'soy', label: 'Soy / Soya / Soy Lecithin', icon: '🌱' },
  { id: 'egg', label: 'Egg & Egg Products', icon: '🥚' },
  { id: 'sesame', label: 'Sesame (Til)', icon: '🥯' },
  { id: 'mustard', label: 'Mustard (Sarson / Rai)', icon: '🌼' },
  { id: 'shellfish', label: 'Shellfish / Prawns / Crab', icon: '🦐' },
  { id: 'fish', label: 'Fish & Fish Oil', icon: '🐟' },
  { id: 'sulfites', label: 'Sulfites (INS 223 / Preservatives)', icon: '🧪' },
];

const BUILTIN_DISEASES = [
  {
    id: 'diabetic',
    name: 'Diabetic / Pre-Diabetic',
    category: 'Metabolic',
    tag: 'Sugar & Simple Carbs',
    desc: 'Flags sugar >15g/100g, maltodextrin & liquid glucose',
  },
  {
    id: 'hypertension',
    name: 'Hypertension (High BP)',
    category: 'Cardiovascular',
    tag: 'Sodium & Salt',
    desc: 'Flags sodium >400mg/100g and high-sodium preservatives',
  },
  {
    id: 'high_cholesterol',
    name: 'High Cholesterol / Heart',
    category: 'Cardiovascular',
    tag: 'Saturated & Trans Fats',
    desc: 'Flags palm oil, hydrogenated fats, saturated fat >5g',
  },
  {
    id: 'celiac',
    name: 'Celiac Disease',
    category: 'Digestive',
    tag: 'Gluten Free',
    desc: 'Strict zero-tolerance for wheat, barley, rye, malt',
  },
  {
    id: 'kidney_disease',
    name: 'Chronic Kidney Disease (CKD)',
    category: 'Renal',
    tag: 'Potassium & Phosphorus',
    desc: 'Flags potassium chloride (INS 508), phosphate additives & high sodium',
  },
  {
    id: 'lactose_intolerance',
    name: 'Lactose Intolerance',
    category: 'Digestive',
    tag: 'Dairy Solids',
    desc: 'Flags milk solids, whey powder, casein, lactose',
  },
  {
    id: 'gout',
    name: 'Gout & Hyperuricemia',
    category: 'Metabolic',
    tag: 'Purines & HFCS',
    desc: 'Flags yeast extract, high-fructose corn syrup, shellfish',
  },
  {
    id: 'ibs',
    name: 'IBS / High FODMAP',
    category: 'Digestive',
    tag: 'FODMAPs & Polyols',
    desc: 'Flags inulin, sorbitol, maltitol, onion/garlic powder',
  },
  {
    id: 'gerd',
    name: 'GERD / Acid Reflux',
    category: 'Digestive',
    tag: 'High Acid & Spices',
    desc: 'Flags high citric acid, vinegar, chili, caffeine',
  },
  {
    id: 'pku',
    name: 'Phenylketonuria (PKU)',
    category: 'Genetic',
    tag: 'Aspartame',
    desc: 'Strict contraindication for Aspartame (INS 951)',
  },
  {
    id: 'fatty_liver',
    name: 'Fatty Liver (NAFLD)',
    category: 'Hepatic',
    tag: 'Fructose & Trans Fats',
    desc: 'Flags liquid glucose, corn syrup solids, hydrogenated oils',
  },
];

export default function ProfileModal({ isOpen, onClose, userProfile, onSaveProfile }) {
  const [allergies, setAllergies] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [sugarThreshold, setSugarThreshold] = useState(15.0);
  const [sodiumThreshold, setSodiumThreshold] = useState(400.0);
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [customConditionInput, setCustomConditionInput] = useState('');
  const [allergySuggestions, setAllergySuggestions] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setAllergies(userProfile.allergies || []);
      setConditions(userProfile.conditions || []);
      setSugarThreshold(userProfile.sugar_threshold || 15.0);
      setSodiumThreshold(userProfile.sodium_threshold || 400.0);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const toggleAllergy = (allergenId) => {
    if (allergies.includes(allergenId)) {
      setAllergies(allergies.filter((a) => a !== allergenId));
    } else {
      setAllergies([...allergies, allergenId]);
    }
  };

  const toggleCondition = (conditionId) => {
    if (conditions.includes(conditionId)) {
      setConditions(conditions.filter((c) => c !== conditionId));
    } else {
      setConditions([...conditions, conditionId]);
    }
  };

  const handleCustomAllergyChange = (e) => {
    const val = e.target.value;
    setCustomAllergyInput(val);
    if (val.trim().length > 0) {
      const filtered = COMMON_ALLERGENS.filter(
        (ca) =>
          ca.label.toLowerCase().includes(val.toLowerCase()) ||
          ca.id.toLowerCase().includes(val.toLowerCase())
      ).map((ca) => ca.id);
      setAllergySuggestions(filtered.filter((item) => !allergies.includes(item)));
    } else {
      setAllergySuggestions([]);
    }
  };

  const addCustomAllergy = (val) => {
    const term = (val || customAllergyInput).trim().toLowerCase();
    if (term && !allergies.includes(term)) {
      setAllergies([...allergies, term]);
      setCustomAllergyInput('');
      setAllergySuggestions([]);
    }
  };

  const addCustomCondition = () => {
    const term = customConditionInput.trim().toLowerCase();
    if (term && !conditions.includes(term)) {
      setConditions([...conditions, term]);
      setCustomConditionInput('');
    }
  };

  const handleSave = () => {
    onSaveProfile({
      allergies,
      conditions,
      sugar_threshold: Number(sugarThreshold),
      sodium_threshold: Number(sodiumThreshold),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Personal Health, Disease & Allergy Profile</h2>
              <p className="text-xs text-slate-400">Stored locally on your device for instant safety alerts on scans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: Medical Conditions & Diseases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                  1. Medical Diseases & Conditions ({conditions.length} Selected)
                </h3>
              </div>
            </div>

            {/* Disease Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUILTIN_DISEASES.map((dis) => {
                const isSelected = conditions.includes(dis.id);
                return (
                  <div
                    key={dis.id}
                    onClick={() => toggleCondition(dis.id)}
                    className={`cursor-pointer p-3 rounded-xl border transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-100">{dis.name}</div>
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 border border-emerald-500/20 inline-block mt-0.5">
                          {dis.tag}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-tight">{dis.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Disease Input */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Add Custom Disease / Health Condition:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type condition (e.g. Migraine, Histamine Intolerance, Thyroid)..."
                  value={customConditionInput}
                  onChange={(e) => setCustomConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomCondition();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Custom Added Conditions Tags */}
              {conditions.filter((c) => !BUILTIN_DISEASES.some((bd) => bd.id === c)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {conditions
                    .filter((c) => !BUILTIN_DISEASES.some((bd) => bd.id === c))
                    .map((customC) => (
                      <span
                        key={customC}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                      >
                        <span className="capitalize">{customC}</span>
                        <button
                          type="button"
                          onClick={() => toggleCondition(customC)}
                          className="hover:text-white ml-1 text-emerald-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Configurable Threshold Sliders for Diabetic & Hypertension */}
            {conditions.includes('diabetic') && (
              <div className="mt-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Custom Sugar Flag Threshold:</label>
                  <p className="text-[11px] text-slate-500">Alert triggers if product sugar exceeds this value</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="5"
                    max="35"
                    step="1"
                    value={sugarThreshold}
                    onChange={(e) => setSugarThreshold(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-emerald-400 text-xs w-16 text-right">
                    {sugarThreshold} g/100g
                  </span>
                </div>
              </div>
            )}

            {conditions.includes('hypertension') && (
              <div className="mt-2 p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Custom Sodium Flag Threshold:</label>
                  <p className="text-[11px] text-slate-500">Alert triggers if sodium exceeds this value</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="150"
                    max="1000"
                    step="50"
                    value={sodiumThreshold}
                    onChange={(e) => setSodiumThreshold(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-emerald-400 text-xs w-20 text-right">
                    {sodiumThreshold} mg/100g
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Allergies Selection */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                  2. Select Allergies ({allergies.length} Active)
                </h3>
              </div>
            </div>

            {/* Quick Allergens Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_ALLERGENS.map((item) => {
                const isSelected = allergies.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAllergy(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-left border transition text-xs ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate flex-1">{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Freeform Autocomplete Tag Adder */}
            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Add Custom or Specific Allergen:
              </label>
              <div className="relative flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Type allergen (e.g. kaju, casein, strawberry)..."
                  value={customAllergyInput}
                  onChange={handleCustomAllergyChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomAllergy();
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => addCustomAllergy()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Suggestions */}
              {allergySuggestions.length > 0 && (
                <div className="mt-1 bg-slate-950 border border-slate-800 rounded-xl p-1.5 flex flex-wrap gap-1">
                  {allergySuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => addCustomAllergy(sug)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-[11px] transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              )}

              {/* Active Selected Tags */}
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                    >
                      <span className="capitalize">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className="hover:text-white ml-1 text-emerald-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              setAllergies([]);
              setConditions([]);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Clear All
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition"
            >
              Save Profile Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
