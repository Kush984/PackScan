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
    <div className="bg-white border border-[#e7e0d6] rounded-2xl overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-[#faf7f2] transition text-left cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <FileCode className="w-4 h-4 text-[#b8532f]" />
          <span className="font-bold text-xs text-[#2a2622] font-['Space_Grotesk']">
            Inspect Extracted Raw Label Text & Source Metadata
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#faf7f2] text-[#b8532f] border border-[#e7e0d6]">
            Source: {product?.source || 'OCR'}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#78716c]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#78716c]" />
        )}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#e7e0d6] bg-[#faf7f2] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#78716c] font-medium">
              Exact raw text processed by the compliance and allergen engines:
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-[#f7f4ee] border border-[#e7e0d6] text-[11px] text-[#2a2622] transition cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#c99a3e]" /> : <Copy className="w-3 h-3 text-[#78716c]" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <pre className="p-3 bg-white rounded-xl border border-[#e7e0d6] text-[11px] text-[#2a2622] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {rawText}
          </pre>

          {product && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
              <div className="p-2 bg-white rounded border border-[#e7e0d6]">
                <span className="text-[#78716c] block">Barcode:</span>
                <span className="text-[#2a2622]">{product.barcode || 'N/A'}</span>
              </div>
              <div className="p-2 bg-white rounded border border-[#e7e0d6]">
                <span className="text-[#78716c] block">Brand:</span>
                <span className="text-[#2a2622] truncate block">{product.brand || 'N/A'}</span>
              </div>
              <div className="p-2 bg-white rounded border border-[#e7e0d6]">
                <span className="text-[#78716c] block">Category:</span>
                <span className="text-[#2a2622] truncate block">{product.category || 'N/A'}</span>
              </div>
              <div className="p-2 bg-white rounded border border-[#e7e0d6]">
                <span className="text-[#78716c] block">Data Pipeline:</span>
                <span className="text-[#b8532f] font-semibold">{product.source || 'Local OCR'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
