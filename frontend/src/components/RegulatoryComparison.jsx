import React from 'react';
import { Globe, AlertCircle, BookOpen, ShieldCheck, Check, Ban } from 'lucide-react';

export default function RegulatoryComparison({ additives = [] }) {
  if (!additives || additives.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#e7e0d6] rounded-2xl p-4 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-[#e7e0d6]">
        <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] text-[#b8532f]">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8532f]">
              Global Standards Benchmarking
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#2a2622] font-['Space_Grotesk']">
            Multi-Country Regulatory Additives Comparison
          </h3>
          <p className="text-xs text-[#57534e]">
            Cross-referenced with India (FSSAI), European Union (EFSA), and Australia (FSANZ)
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {additives.map((item, idx) => {
          const isEuBanned = item.eu_status?.toLowerCase().includes('banned');
          const isEuWarning = item.eu_status?.toLowerCase().includes('warning');

          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] hover:border-[#b8532f] transition"
            >
              {/* Additive Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-[#b8532f] font-mono">
                    {item.additive}
                  </span>
                  {item.matchedKeyword && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#78716c] border border-[#e7e0d6]">
                      Matched: "{item.matchedKeyword}"
                    </span>
                  )}
                </div>

                {isEuBanned && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] text-[10px] font-bold uppercase font-mono self-start sm:self-auto">
                    <Ban className="w-3 h-3" />
                    <span>Banned in EU</span>
                  </span>
                )}
                {isEuWarning && !isEuBanned && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#c99a3e] text-[10px] font-bold uppercase font-mono self-start sm:self-auto">
                    <AlertCircle className="w-3 h-3" />
                    <span>EU Warning Mandate</span>
                  </span>
                )}
              </div>

              {/* 3-Column Jurisdiction Grid */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {/* India FSSAI */}
                <div className="p-3 bg-white rounded-lg border border-[#e7e0d6]">
                  <div className="flex items-center space-x-1.5 font-bold text-[#2a2622] text-[11px] mb-1 font-['Space_Grotesk']">
                    <span>🇮🇳</span>
                    <span>India (FSSAI)</span>
                  </div>
                  <p className="text-[#57534e] text-[11px] leading-relaxed">{item.india_status}</p>
                </div>

                {/* European Union EFSA */}
                <div
                  className={`p-3 rounded-lg border ${
                    isEuBanned
                      ? 'bg-[#fff1f2] border-[#fecdd3]'
                      : isEuWarning
                      ? 'bg-[#fef3c7] border-[#fde68a]'
                      : 'bg-white border-[#e7e0d6]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-[#2a2622] text-[11px] mb-1 font-['Space_Grotesk']">
                    <span>🇪🇺</span>
                    <span>European Union (EFSA)</span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isEuBanned ? 'text-[#be123c] font-medium' : isEuWarning ? 'text-[#92400e] font-medium' : 'text-[#57534e]'
                    }`}
                  >
                    {item.eu_status}
                  </p>
                </div>

                {/* Australia FSANZ */}
                <div className="p-3 bg-white rounded-lg border border-[#e7e0d6]">
                  <div className="flex items-center space-x-1.5 font-bold text-[#2a2622] text-[11px] mb-1 font-['Space_Grotesk']">
                    <span>🇦🇺</span>
                    <span>Australia (FSANZ)</span>
                  </div>
                  <p className="text-[#57534e] text-[11px] leading-relaxed">{item.au_status}</p>
                </div>
              </div>

              {/* Plain Language Note */}
              <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-[#e7e0d6] text-[11px] text-[#2a2622] flex items-start space-x-2">
                <span className="text-[#b8532f] font-bold shrink-0">Key Insight:</span>
                <span className="text-[#57534e]">{item.note}</span>
              </div>

              {/* Sourced Citation */}
              <div className="mt-1.5 text-[10px] font-mono text-[#78716c] flex items-center space-x-1">
                <BookOpen className="w-3 h-3 text-[#78716c]" />
                <span className="truncate">Source: {item.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
