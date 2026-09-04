import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function DemoPresetBar({ presets = [], onSelectPreset, isLoading }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'COMPLIANT' | 'VIOLATIONS'

  if (!presets || presets.length === 0) return null;

  const filteredPresets = presets.filter((p) => {
    const isViolation = p.id === 'defective-local-snack';
    if (filter === 'COMPLIANT') return !isViolation;
    if (filter === 'VIOLATIONS') return isViolation;
    return true;
  });

  const compliantCount = presets.filter((p) => p.id !== 'defective-local-snack').length;
  const violationCount = presets.filter((p) => p.id === 'defective-local-snack').length;

  const getCardDetails = (preset) => {
    switch (preset.id) {
      case 'maggi-2min-classic':
        return { meta: 'Net Wt: 70g • Font: 2.8mm', alert: 'ZERO ALLERGEN THREAT', alertColor: 'text-cyan-400' };
      case 'coca-cola-original':
        return { meta: 'Vol: 750ml • Font: 4.0mm', alert: 'SUGAR > 10g WATCH', alertColor: 'text-amber-400' };
      case 'coca-cola-zero':
        return { meta: 'Vol: 300ml • Cal: 0.9kcal', alert: 'NON-CALORIC SWEETENER', alertColor: 'text-orange-400' };
      case 'thums-up-charged':
        return { meta: 'Vol: 250ml • Caffeinated', alert: 'STATUTORY AUDIT: CLEAN', alertColor: 'text-slate-400' };
      case 'lays-magic-masala':
        return { meta: 'Net Wt: 50g • Font: 2.5mm', alert: 'SODIUM WITHIN CAP', alertColor: 'text-slate-400' };
      case 'kurkure-masala-munch':
        return { meta: 'Net Wt: 85g • Font: 3.0mm', alert: 'FSSAI / METROLOGY OK', alertColor: 'text-slate-400' };
      case 'cadbury-dairy-milk':
        return { meta: 'Net Wt: 52g • Milk Solids', alert: 'ALLERGEN: MILK', alertColor: 'text-amber-400' };
      case 'britannia-good-day':
        return { meta: 'Net Wt: 120g • Font: 3.2mm', alert: 'ALLERGEN: TREE NUTS', alertColor: 'text-amber-400' };
      case 'haldirams-aloo-bhujia':
        return { meta: 'Net Wt: 200g • Font: 3.0mm', alert: 'ALLERGEN: PEANUT TRACES', alertColor: 'text-amber-400' };
      case 'amul-butter':
        return { meta: 'Net Wt: 100g • Dairy Grade A', alert: 'HYPERTENSION SODIUM WATCH', alertColor: 'text-amber-400' };
      case 'parle-g-biscuits':
        return { meta: 'Net Wt: 130g • Font: 2.8mm', alert: 'WHEAT GLUTEN IDENTIFIED', alertColor: 'text-slate-400' };
      case 'defective-local-snack':
        return { meta: 'SEC 36 PENALTY: ₹25,000 FINE', alert: 'EXPORT NOTICE', alertColor: 'text-orange-400' };
      case 'protein-bar-substitute':
        return { meta: 'Net Wt: 45g • Polyols Checked', alert: 'HEALTH GUARDIAN: 100% SAFE', alertColor: 'text-cyan-400' };
      default:
        return { meta: 'Standard FMCG SKU', alert: 'METROLOGY VERIFIED', alertColor: 'text-cyan-400' };
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Catalog Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111c33] p-4 sm:p-5 rounded-xl border border-[#1e2f52] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase">
              PRE-INDEXED CACHE
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-slate-400">
              ● REAL-TIME AUDIT ACCELERATOR
            </span>
          </div>
          <h2 className="font-['Space_Grotesk'] text-[20px] font-bold text-slate-100 tracking-tight">
            Quick 1-Click FMCG Demo Catalog (Instant &lt;10ms Speed Mode)
          </h2>
        </div>

        {/* Quick filters with Standard 3-Tier Badges */}
        <div className="flex items-center gap-1.5">
          <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-slate-400 uppercase mr-1">
            FILTER:
          </span>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-[12px] font-bold rounded cursor-pointer transition ${
              filter === 'ALL'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-[#0e172a] text-slate-300 hover:bg-[#1a2744] border border-[#1e2f52]'
            }`}
          >
            ALL ({presets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLIANT')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-[12px] font-semibold rounded cursor-pointer transition ${
              filter === 'COMPLIANT'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-[#0e172a] text-slate-300 hover:bg-[#1a2744] border border-[#1e2f52]'
            }`}
          >
            COMPLIANT ({compliantCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('VIOLATIONS')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-[12px] font-bold rounded border cursor-pointer transition ${
              filter === 'VIOLATIONS'
                ? 'bg-[#ea580c] text-white border-[#ea580c] shadow-xs'
                : 'bg-[#2a1215] text-amber-300 hover:bg-[#3b181c] border border-amber-900/50'
            }`}
          >
            VIOLATIONS ({violationCount})
          </button>
        </div>
      </div>

      {/* Catalog Grid: Midnight Slate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => {
          const isDefective = preset.id === 'defective-local-snack';
          const details = getCardDetails(preset);

          return (
            <motion.div
              key={preset.id}
              whileHover={{ y: -2, scale: 1.008 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              onClick={() => !isLoading && onSelectPreset(preset)}
              className={`rounded-xl p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isDefective
                  ? 'bg-[#1a0f14] border-2 border-orange-500/80 shadow-[0_0_15px_rgba(234,88,12,0.15)]'
                  : 'bg-[#111c33] border-[#1e2f52] hover:border-cyan-500/60 hover:bg-[#152340]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[10.5px] font-semibold rounded uppercase ${
                      isDefective
                        ? 'bg-orange-950/60 text-orange-300 border border-orange-800/40 font-bold'
                        : 'bg-[#0e172a] text-slate-300 border border-[#1e2f52]'
                    }`}
                  >
                    {preset.category?.split('&')[0]?.trim() || 'FMCG Retail'}
                  </span>

                  {isDefective ? (
                    <span className="px-2.5 py-0.5 bg-orange-600 text-white font-['Space_Grotesk'] text-[11px] font-extrabold rounded flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> VIOLATION DETECTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-['Space_Grotesk'] text-[11px] font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />{' '}
                      {preset.id === 'maggi-2min-classic' ? 'RULE 6 VERIFIED' : 'COMPLIANT'}
                    </span>
                  )}
                </div>

                <h3
                  className={`font-['Space_Grotesk'] text-[16px] font-bold mt-2.5 transition-colors ${
                    isDefective ? 'text-orange-300 font-extrabold' : 'text-slate-100 hover:text-cyan-400'
                  }`}
                >
                  {preset.name}
                </h3>

                <div className={`font-['JetBrains_Mono'] text-[12px] mt-1 ${isDefective ? 'text-orange-400/90' : 'text-slate-400'}`}>
                  EAN: {preset.barcode}
                </div>

                {isDefective && (
                  <div className="mt-2.5 p-2.5 bg-[#0e172a] border border-orange-900/50 rounded font-['JetBrains_Mono'] text-[11px] text-orange-300 font-medium shadow-xs">
                    Missing Rule 6(1)(e) Net Quantity &amp; Font &lt; 2.0mm. Penalty Sec 36 applicable.
                  </div>
                )}
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between font-['JetBrains_Mono'] text-[11px] ${
                  isDefective ? 'border-orange-900/40' : 'border-[#1e2f52]'
                }`}
              >
                <span className={isDefective ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                  {details.meta}
                </span>
                <span className={`font-bold flex items-center gap-1 ${details.alertColor}`}>
                  {isDefective ? (
                    <span className="underline uppercase tracking-wide">EXPORT NOTICE</span>
                  ) : details.alertColor.includes('amber') || details.alertColor.includes('orange') ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{details.alert}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{details.alert}</span>
                    </>
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
