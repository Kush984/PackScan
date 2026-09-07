import React from 'react';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle, Leaf, BookOpen } from 'lucide-react';

export default function AlternativeSuggestions({ alternatives = [] }) {
  if (!alternatives || alternatives.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#e7e0d6] rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Section Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-[#e7e0d6]">
        <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] text-[#b8532f]">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8532f]">
              Healthier Substitutions & Nuance Warnings
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#2a2622] font-['Space_Grotesk']">
            Safer Product Alternatives
          </h3>
          <p className="text-xs text-[#57534e]">
            Nutritionally superior alternatives tailored to your health profile with ingredient transparency
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {alternatives.map((alt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] hover:border-[#b8532f] transition flex flex-col justify-between"
          >
            <div>
              {/* Product Title & Brand */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#2a2622] font-['Space_Grotesk']">{alt.name}</h4>
                  <p className="text-xs text-[#78716c]">{alt.brand}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white border border-[#e7e0d6] text-[#b8532f] text-[10px] font-bold uppercase shrink-0 font-mono">
                  Alternative #{idx + 1}
                </span>
              </div>

              {/* Recommendation Reason */}
              <div className="mt-2.5 p-2 rounded-lg bg-white border border-[#e7e0d6] text-[#2a2622] text-xs font-medium flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#c99a3e] shrink-0" />
                <span>{alt.reason}</span>
              </div>

              {/* Nutrition Snapshot */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-[#e7e0d6]">
                  <div className="text-[10px] text-[#78716c] uppercase font-mono">Sugars:</div>
                  <div className="font-mono font-bold text-[#b8532f] text-xs">{alt.sugars_100g}g / 100g</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#e7e0d6]">
                  <div className="text-[10px] text-[#78716c] uppercase font-mono">Sodium:</div>
                  <div className="font-mono font-bold text-[#b8532f] text-xs">{alt.sodium_100g}mg / 100g</div>
                </div>
              </div>

              {/* Ingredients snippet */}
              {alt.ingredients_text && (
                <div className="mt-2 text-[11px] text-[#57534e] line-clamp-2">
                  <span className="text-[#78716c]">Key Ingredients: </span>
                  {alt.ingredients_text}
                </div>
              )}
            </div>

            {/* Feature 5: "Safer Substitute" Nuance Caveat Warnings */}
            {alt.hasCaveats && alt.substituteCaveats && alt.substituteCaveats.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#e7e0d6]">
                <div className="text-[11px] font-bold text-[#c99a3e] uppercase tracking-wider flex items-center space-x-1 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#c99a3e]" />
                  <span>Substitute Nuance Caveat</span>
                </div>
                {alt.substituteCaveats.map((cav, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-2.5 rounded-lg bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-xs space-y-1"
                  >
                    <div className="font-semibold text-[#92400e]">
                      Replaced <span className="underline">{cav.original_ingredient}</span> with{' '}
                      <span className="underline">{cav.common_substitute}</span>:
                    </div>
                    <p className="text-[11px] text-[#92400e]/90 leading-relaxed">{cav.caveat}</p>
                    <div className="text-[9px] font-mono text-[#b45309]">Source: {cav.source}</div>
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
