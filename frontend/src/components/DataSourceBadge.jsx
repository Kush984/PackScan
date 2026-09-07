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
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf7f2] border border-[#e7e0d6] text-[#b8532f] font-mono ${className}`}>
        <CheckCircle2 className="w-3 h-3 text-[#b8532f]" />
        <span>Verified — Open Food Facts</span>
      </span>
    );
  }

  if (src === 'catalog') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#fef3c7] border border-[#fde68a] text-[#c99a3e] font-mono ${className}`}>
        <Database className="w-3 h-3 text-[#c99a3e]" />
        <span>Verified — PackScan Catalog</span>
      </span>
    );
  }

  if (src === 'ocr_cache' || (src === 'ocr' && confidence === 'high')) {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf7f2] border border-[#e7e0d6] text-[#57534e] font-mono ${className}`}>
        <Zap className="w-3 h-3 text-[#b8532f]" />
        <span>From Previous Scan</span>
      </span>
    );
  }

  if (src === 'ocr') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] font-mono ${className}`}>
        <AlertTriangle className="w-3 h-3 text-[#be123c]" />
        <span>Auto-extracted — please verify</span>
      </span>
    );
  }

  if (src === 'manual') {
    return (
      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf7f2] border border-[#e7e0d6] text-[#78716c] font-mono ${className}`}>
        <PenLine className="w-3 h-3 text-[#78716c]" />
        <span>Entered Manually</span>
      </span>
    );
  }

  // unknown / fallback
  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#faf7f2] border border-[#e7e0d6] text-[#78716c] font-mono ${className}`}>
      <Database className="w-3 h-3 text-[#78716c]" />
      <span>Database Source</span>
    </span>
  );
}
