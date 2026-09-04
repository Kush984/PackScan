import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
        return { meta: 'Net Wt: 70g • Font: 2.8mm', alert: 'ZERO ALLERGEN THREAT', alertColor: 'text-[#0e7490]' };
      case 'coca-cola-original':
        return { meta: 'Vol: 750ml • Font: 4.0mm', alert: 'SUGAR > 10g WATCH', alertColor: 'text-[#ea580c]' };
      case 'coca-cola-zero':
        return { meta: 'Vol: 300ml • Cal: 0.9kcal', alert: 'NON-CALORIC SWEETENER', alertColor: 'text-[#c2410c]' };
      case 'thums-up-charged':
        return { meta: 'Vol: 250ml • Caffeinated', alert: 'STATUTORY AUDIT: CLEAN', alertColor: 'text-[#334155]' };
      case 'lays-magic-masala':
        return { meta: 'Net Wt: 50g • Font: 2.5mm', alert: 'SODIUM WITHIN CAP', alertColor: 'text-[#334155]' };
      case 'kurkure-masala-munch':
        return { meta: 'Net Wt: 85g • Font: 3.0mm', alert: 'FSSAI / METROLOGY OK', alertColor: 'text-[#334155]' };
      case 'cadbury-dairy-milk':
        return { meta: 'Net Wt: 52g • Milk Solids', alert: 'ALLERGEN: MILK', alertColor: 'text-[#ea580c]' };
      case 'britannia-good-day':
        return { meta: 'Net Wt: 120g • Font: 3.2mm', alert: 'ALLERGEN: TREE NUTS', alertColor: 'text-[#ea580c]' };
      case 'haldirams-aloo-bhujia':
        return { meta: 'Net Wt: 200g • Font: 3.0mm', alert: 'ALLERGEN: PEANUT TRACES', alertColor: 'text-[#ea580c]' };
      case 'amul-butter':
        return { meta: 'Net Wt: 100g • Dairy Grade A', alert: 'HYPERTENSION SODIUM WATCH', alertColor: 'text-[#ea580c]' };
      case 'parle-g-biscuits':
        return { meta: 'Net Wt: 130g • Font: 2.8mm', alert: 'WHEAT GLUTEN IDENTIFIED', alertColor: 'text-[#334155]' };
      case 'defective-local-snack':
        return { meta: 'SEC 36 PENALTY: ₹25,000 FINE', alert: 'EXPORT NOTICE', alertColor: 'text-[#ea580c]' };
      case 'protein-bar-substitute':
        return { meta: 'Net Wt: 45g • Polyols Checked', alert: 'HEALTH GUARDIAN: 100% SAFE', alertColor: 'text-[#0e7490]' };
      default:
        return { meta: 'Standard FMCG SKU', alert: 'METROLOGY VERIFIED', alertColor: 'text-[#0e7490]' };
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Catalog Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-[#cbd5e1] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#f0fdfa] text-[#0e7490] border border-[#ccfbf1] font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase">
              PRE-INDEXED CACHE
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">
              ● REAL-TIME AUDIT ACCELERATOR
            </span>
          </div>
          <h2 className="font-['Space_Grotesk'] text-[20px] font-bold text-[#0f172a] tracking-tight">
            Quick 1-Click FMCG Demo Catalog (Instant &lt;10ms Speed Mode)
          </h2>
        </div>

        {/* Quick filters with Standard 3-Tier Badges */}
        <div className="flex items-center gap-1.5">
          <span className="font-['JetBrains_Mono'] text-[11px] font-bold text-[#64748b] uppercase mr-1">
            FILTER:
          </span>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-[12px] font-bold rounded cursor-pointer transition ${
              filter === 'ALL'
                ? 'bg-[#0e7490] text-white shadow-xs'
                : 'bg-[#f8fafc] text-[#334155] hover:bg-[#f1f5f9] border border-[#cbd5e1]'
            }`}
          >
            ALL ({presets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('COMPLIANT')}
            className={`px-3 py-1 font-['Space_Grotesk'] text-[12px] font-semibold rounded cursor-pointer transition ${
              filter === 'COMPLIANT'
                ? 'bg-[#0e7490] text-white shadow-xs'
                : 'bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1]'
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
                : 'bg-[#fff7ed] text-[#c2410c] hover:bg-[#ffedd5] border-[#fed7aa]'
            }`}
          >
            VIOLATIONS ({violationCount})
          </button>
        </div>
      </div>

      {/* Catalog Grid: Light Cards with Refined Hairline Borders */}
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
              className={`rounded-xl p-5 border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                isDefective
                  ? 'bg-[#fff7ed] border-2 border-[#ea580c]'
                  : 'bg-white border-[#cbd5e1] hover:border-[#0e7490]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[10.5px] font-semibold rounded uppercase ${
                      isDefective
                        ? 'bg-[#ffedd5] text-[#9a3412] font-bold'
                        : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]'
                    }`}
                  >
                    {preset.category?.split('&')[0]?.trim() || 'FMCG Retail'}
                  </span>

                  {isDefective ? (
                    <span className="px-2.5 py-0.5 bg-[#ea580c] text-white font-['Space_Grotesk'] text-[11px] font-extrabold rounded flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">warning</span> VIOLATION DETECTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#f0fdfa] border border-[#99f6e4] text-[#0f766e] font-['Space_Grotesk'] text-[11px] font-bold rounded flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[13px] text-[#0e7490]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>{' '}
                      {preset.id === 'maggi-2min-classic' ? 'RULE 6 VERIFIED' : 'COMPLIANT'}
                    </span>
                  )}
                </div>

                <h3
                  className={`font-['Space_Grotesk'] text-[16px] font-bold mt-2.5 transition-colors ${
                    isDefective ? 'text-[#9a3412] font-extrabold' : 'text-[#0f172a] hover:text-[#0e7490]'
                  }`}
                >
                  {preset.name}
                </h3>

                <div className={`font-['JetBrains_Mono'] text-[12px] mt-1 ${isDefective ? 'text-[#c2410c]' : 'text-[#64748b]'}`}>
                  EAN: {preset.barcode}
                </div>

                {isDefective && (
                  <div className="mt-2.5 p-2.5 bg-white border border-[#fed7aa] rounded font-['JetBrains_Mono'] text-[11px] text-[#9a3412] font-medium shadow-xs">
                    Missing Rule 6(1)(e) Net Quantity &amp; Font &lt; 2.0mm. Penalty Sec 36 applicable.
                  </div>
                )}
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between font-['JetBrains_Mono'] text-[11px] ${
                  isDefective ? 'border-[#fed7aa]' : 'border-[#e2e8f0]'
                }`}
              >
                <span className={isDefective ? 'text-[#c2410c] font-bold' : 'text-[#64748b]'}>
                  {details.meta}
                </span>
                <span className={`font-bold flex items-center gap-1 ${details.alertColor}`}>
                  {isDefective ? (
                    <span className="underline uppercase tracking-wide">EXPORT NOTICE</span>
                  ) : details.alertColor === 'text-[#ea580c]' ? (
                    <>
                      <span className="material-symbols-outlined text-[13px]">warning</span>
                      <span>{details.alert}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0e7490]"></span>
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
