import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle, Leaf, BookOpen } from 'lucide-react';

export default function AlternativeSuggestions({ alternatives = [] }) {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              Feature 3 & 5 • Healthier Alternatives & Nuance Warnings
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">Safer Product Alternatives</h3>
          <p className="text-xs text-slate-400">
            Nutritionally superior alternatives tailored to your health profile with ingredient transparency
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/30 transition flex flex-col justify-between"
          >
            <div>
              {/* Product Title & Brand */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{alt.name}</h4>
                  <p className="text-xs text-slate-400">{alt.brand}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase shrink-0">
                  Alternative #{idx + 1}
                </span>
              </div>

              {/* Recommendation Reason */}
              <div className="mt-2.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{alt.reason}</span>
              </div>

              {/* Nutrition Snapshot */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Sugars:</div>
                  <div className="font-mono font-bold text-emerald-400 text-xs">{alt.sugars_100g}g / 100g</div>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Sodium:</div>
                  <div className="font-mono font-bold text-emerald-400 text-xs">{alt.sodium_100g}mg / 100g</div>
                </div>
              </div>

              {/* Ingredients snippet */}
              {alt.ingredients_text && (
                <div className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                  <span className="text-slate-500">Key Ingredients: </span>
                  {alt.ingredients_text}
                </div>
              )}
            </div>

            {/* Feature 5: "Safer Substitute" Nuance Caveat Warnings */}
            {alt.hasCaveats && alt.substituteCaveats && alt.substituteCaveats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Substitute Nuance Caveat (Feature 5)</span>
                </div>
                {alt.substituteCaveats.map((cav, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1"
                  >
                    <div className="font-semibold text-amber-300">
                      Replaced <span className="underline">{cav.original_ingredient}</span> with{' '}
                      <span className="underline">{cav.common_substitute}</span>:
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-relaxed">{cav.caveat}</p>
                    <div className="text-[9px] font-mono text-amber-400/70">Source: {cav.source}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
