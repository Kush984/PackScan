import React from 'react';
import { CheckCircle2, Zap, AlertTriangle, PenLine, Database } from 'lucide-react';

/**
 * Small unobtrusive chip showing where product data came from.
 * dataSource: 'openfoodfacts' | 'catalog' | 'ocr' | 'manual' | 'ocr_cache' | unknown
 * confidence: 'high' | 'needs_verification'
 */
export default function DataSourceBadge({ dataSource, confidence, className = '' }) {
  const src = (dataSource || '').toLowerCase();

  if (src === 'openfoodfacts') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 ${className}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>Verified — Open Food Facts</span>
      </span>
    );
  }

  if (src === 'catalog') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-500/10 border border-sky-500/25 text-sky-300 ${className}`}>
        <Database className="w-3 h-3 text-sky-400" />
        <span>Verified — PackScan Catalog</span>
      </span>
    );
  }

  if (src === 'ocr_cache' || (src === 'ocr' && confidence === 'high')) {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-500/10 border border-violet-500/25 text-violet-300 ${className}`}>
        <Zap className="w-3 h-3 text-violet-400" />
        <span>From Previous Scan</span>
      </span>
    );
  }

  if (src === 'ocr') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-300 ${className}`}>
        <AlertTriangle className="w-3 h-3 text-amber-400" />
        <span>Auto-extracted — please verify</span>
      </span>
    );
  }

  if (src === 'manual') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-700/60 border border-slate-600 text-slate-300 ${className}`}>
        <PenLine className="w-3 h-3 text-slate-400" />
        <span>Entered Manually</span>
      </span>
    );
  }

  // unknown / fallback
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-400 ${className}`}>
      <Database className="w-3 h-3" />
      <span>Packaged Commodity</span>
    </span>
  );
}
