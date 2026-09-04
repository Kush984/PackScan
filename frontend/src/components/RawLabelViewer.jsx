import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, FileCode, Tag } from 'lucide-react';

export default function RawLabelViewer({ rawText, product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!rawText) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/40 transition text-left"
      >
        <div className="flex items-center space-x-2.5">
          <FileCode className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-xs text-slate-300">
            Inspect Extracted Raw Label Text & Source Metadata
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
            Source: {product?.source || 'OCR'}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Exact raw text processed by the compliance and allergen engines:
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {rawText}
          </pre>

          {product && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 block">Barcode:</span>
                <span className="text-slate-200">{product.barcode || 'N/A'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 block">Brand:</span>
                <span className="text-slate-200 truncate block">{product.brand || 'N/A'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 block">Category:</span>
                <span className="text-slate-200 truncate block">{product.category || 'N/A'}</span>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-500 block">Data Pipeline:</span>
                <span className="text-emerald-400">{product.source || 'Local OCR'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
