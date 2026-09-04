import React from 'react';
import { Globe, AlertCircle, BookOpen, ShieldCheck, Check, Ban } from 'lucide-react';

export default function RegulatoryComparison({ additives = [] }) {
  if (!additives || additives.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">
              Feature 4 • Global Standards
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Multi-Country Regulatory Additives Comparison
          </h3>
          <p className="text-xs text-slate-400">
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
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
            >
              {/* Additive Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-sky-300 font-mono">
                    {item.additive}
                  </span>
                  {item.matchedKeyword && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Matched: "{item.matchedKeyword}"
                    </span>
                  )}
                </div>

                {isEuBanned && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase font-mono self-start sm:self-auto">
                    <Ban className="w-3 h-3" />
                    <span>Banned in EU</span>
                  </span>
                )}
                {isEuWarning && !isEuBanned && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase font-mono self-start sm:self-auto">
                    <AlertCircle className="w-3 h-3" />
                    <span>EU Warning Mandate</span>
                  </span>
                )}
              </div>

              {/* 3-Column Jurisdiction Grid */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                {/* India FSSAI */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-300 text-[11px] mb-1">
                    <span>🇮🇳</span>
                    <span>India (FSSAI)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.india_status}</p>
                </div>

                {/* European Union EFSA */}
                <div
                  className={`p-3 rounded-lg border ${
                    isEuBanned
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : isEuWarning
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold text-slate-300 text-[11px] mb-1">
                    <span>🇪🇺</span>
                    <span>European Union (EFSA)</span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${
                      isEuBanned ? 'text-rose-300 font-medium' : isEuWarning ? 'text-amber-300 font-medium' : 'text-slate-300'
                    }`}
                  >
                    {item.eu_status}
                  </p>
                </div>

                {/* Australia FSANZ */}
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-300 text-[11px] mb-1">
                    <span>🇦🇺</span>
                    <span>Australia (FSANZ)</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.au_status}</p>
                </div>
              </div>

              {/* Plain Language Note */}
              <div className="mt-2.5 p-2.5 bg-slate-900/50 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 flex items-start space-x-2">
                <span className="text-sky-400 font-bold shrink-0">Key Insight:</span>
                <span>{item.note}</span>
              </div>

              {/* Sourced Citation */}
              <div className="mt-1.5 text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                <BookOpen className="w-3 h-3 text-slate-500" />
                <span className="truncate">Source: {item.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
