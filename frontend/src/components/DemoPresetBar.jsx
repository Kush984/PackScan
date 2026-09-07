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
        return { meta: 'Net Wt: 70g • Font: 2.8mm', alert: 'ZERO ALLERGEN THREAT', alertColor: 'text-[#c99a3e]' };
      case 'coca-cola-original':
        return { meta: 'Vol: 750ml • Font: 4.0mm', alert: 'SUGAR > 10g WATCH', alertColor: 'text-[#be123c]' };
      case 'coca-cola-zero':
        return { meta: 'Vol: 300ml • Cal: 0.9kcal', alert: 'NON-CALORIC SWEETENER', alertColor: 'text-[#be123c]' };
      case 'thums-up-charged':
        return { meta: 'Vol: 250ml • Caffeinated', alert: 'STATUTORY AUDIT: CLEAN', alertColor: 'text-[#78716c]' };
      case 'lays-magic-masala':
        return { meta: 'Net Wt: 50g • Font: 2.5mm', alert: 'SODIUM WITHIN CAP', alertColor: 'text-[#78716c]' };
      case 'kurkure-masala-munch':
        return { meta: 'Net Wt: 85g • Font: 3.0mm', alert: 'FSSAI / METROLOGY OK', alertColor: 'text-[#78716c]' };
      case 'cadbury-dairy-milk':
        return { meta: 'Net Wt: 52g • Milk Solids', alert: 'ALLERGEN: MILK', alertColor: 'text-[#be123c]' };
      case 'britannia-good-day':
        return { meta: 'Net Wt: 120g • Font: 3.2mm', alert: 'ALLERGEN: TREE NUTS', alertColor: 'text-[#be123c]' };
      case 'haldirams-aloo-bhujia':
        return { meta: 'Net Wt: 200g • Font: 3.0mm', alert: 'ALLERGEN: PEANUT TRACES', alertColor: 'text-[#be123c]' };
      case 'amul-butter':
        return { meta: 'Net Wt: 100g • Dairy Grade A', alert: 'HYPERTENSION SODIUM WATCH', alertColor: 'text-[#be123c]' };
      case 'parle-g-biscuits':
        return { meta: 'Net Wt: 130g • Font: 2.8mm', alert: 'WHEAT GLUTEN IDENTIFIED', alertColor: 'text-[#78716c]' };
      case 'defective-local-snack':
        return { meta: 'SEC 36 PENALTY: ₹25,000 FINE', alert: 'EXPORT NOTICE', alertColor: 'text-[#be123c]' };
      case 'protein-bar-substitute':
        return { meta: 'Net Wt: 45g • Polyols Checked', alert: 'HEALTH GUARDIAN: 100% SAFE', alertColor: 'text-[#c99a3e]' };
      default:
        return { meta: 'Standard FMCG SKU', alert: 'METROLOGY VERIFIED', alertColor: 'text-[#c99a3e]' };
    }
  };

  return (
    <section className="w-full space-y-4">
      {/* Catalog Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-[#e7e0d6] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#faf7f2] text-[#b8532f] border border-[#e7e0d6] font-mono text-[10px] font-bold rounded uppercase">
              PRE-INDEXED CACHE
            </span>
            <span className="font-mono text-[11px] text-[#78716c]">
              ● REAL-TIME AUDIT ACCELERATOR
            </span>
          </div>
          <h2 className="font-['Space_Grotesk'] text-[20px] font-bold text-[#2a2622] tracking-tight">
            Quick 1-Click FMCG Demo Catalog (Instant &lt;10ms Speed Mode)
          </h2>
        </div>

        {/* Quick filters with Standard 3-Tier Badges */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold text-[#78716c] uppercase mr-1">
            FILTER:
          </span>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold rounded-lg cursor-pointer transition ${
              filter === 'ALL'
                ? 'bg-[#b8532f] text-white border border-[#a34a2b] shadow-xs'
                : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#f7f4ee] border border-[#e7e0d6]'
            }`}
          >
            ALL ({presets.length})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setFilter('COMPLIANT')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold rounded-lg cursor-pointer transition ${
              filter === 'COMPLIANT'
                ? 'bg-[#b8532f] text-white border border-[#a34a2b] shadow-xs'
                : 'bg-[#faf7f2] text-[#57534e] hover:bg-[#f7f4ee] border border-[#e7e0d6]'
            }`}
          >
            COMPLIANT ({compliantCount})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setFilter('VIOLATIONS')}
            className={`px-3 py-1.5 font-['Space_Grotesk'] text-[12px] font-bold rounded-lg border cursor-pointer transition ${
              filter === 'VIOLATIONS'
                ? 'bg-[#be123c] text-white border-[#9f1239] shadow-xs'
                : 'bg-[#fff1f2] text-[#be123c] hover:bg-[#ffe4e6] border border-[#fecdd3]'
            }`}
          >
            VIOLATIONS ({violationCount})
          </motion.button>
        </div>
      </div>

      {/* Catalog Grid */}
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
                  ? 'bg-[#fff1f2] border-2 border-[#be123c] shadow-[0_0_15px_rgba(190,18,60,0.12)]'
                  : 'bg-white border-[#e7e0d6] hover:border-[#b8532f] hover:bg-[#faf7f2]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 font-mono text-[10.5px] font-semibold rounded uppercase ${
                      isDefective
                        ? 'bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3] font-bold'
                        : 'bg-[#faf7f2] text-[#57534e] border border-[#e7e0d6]'
                    }`}
                  >
                    {preset.category?.split('&')[0]?.trim() || 'FMCG Retail'}
                  </span>

                  {isDefective ? (
                    <span className="px-2.5 py-0.5 bg-[#be123c] text-white font-['Space_Grotesk'] text-[11px] font-extrabold rounded flex items-center gap-1 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5" /> VIOLATION DETECTED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-[#c99a3e] font-['Space_Grotesk'] text-[11px] font-bold rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c99a3e]" />{' '}
                      {preset.id === 'maggi-2min-classic' ? 'RULE 6 VERIFIED' : 'COMPLIANT'}
                    </span>
                  )}
                </div>

                <h3
                  className={`font-['Space_Grotesk'] text-[16px] font-bold mt-2.5 transition-colors ${
                    isDefective ? 'text-[#9f1239] font-extrabold' : 'text-[#2a2622] hover:text-[#b8532f]'
                  }`}
                >
                  {preset.name}
                </h3>

                <div className={`font-mono text-[12px] mt-1 ${isDefective ? 'text-[#be123c]' : 'text-[#78716c]'}`}>
                  EAN: {preset.barcode}
                </div>

                {isDefective && (
                  <div className="mt-2.5 p-2.5 bg-white border border-[#fecdd3] rounded font-mono text-[11px] text-[#9f1239] font-medium shadow-xs">
                    Missing Rule 6(1)(e) Net Quantity & Font &lt; 2.0mm. Penalty Sec 36 applicable.
                  </div>
                )}
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between font-mono text-[11px] ${
                  isDefective ? 'border-[#fecdd3]' : 'border-[#e7e0d6]'
                }`}
              >
                <span className={isDefective ? 'text-[#be123c] font-bold' : 'text-[#78716c]'}>
                  {details.meta}
                </span>
                <span className={`font-bold flex items-center gap-1 ${details.alertColor}`}>
                  {isDefective ? (
                    <span className="underline uppercase tracking-wide">EXPORT NOTICE</span>
                  ) : details.alertColor.includes('be123c') ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-[#be123c]" />
                      <span>{details.alert}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c99a3e]"></span>
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
