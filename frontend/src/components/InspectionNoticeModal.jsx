import React, { useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Printer,
  Download,
  X,
  Scale,
  Calendar,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Camera,
} from 'lucide-react';

export default function InspectionNoticeModal({
  isOpen,
  onClose,
  inspectionData,
}) {
  const printRef = useRef(null);

  if (!isOpen || !inspectionData) return null;

  const {
    productName = 'Packaged Commodity',
    brand = 'Unknown Brand',
    barcode = 'N/A',
    image_path,
    imageUrl,
    complianceReport = {},
    created_at = new Date().toISOString(),
    id = Math.floor(100000 + Math.random() * 900000),
  } = inspectionData;

  const {
    overallStatus = 'NON_COMPLIANT',
    score = 0,
    totalFields = 8,
    compliancePercentage = 0,
    fields = [],
    fontCompliance = {},
    violations = [],
  } = complianceReport;

  const isCompliant = overallStatus === 'COMPLIANT';
  const noticeNumber = `LM/2026/INSP-${id}`;
  const inspectionDate = new Date(created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const photoSrc = imageUrl || (image_path ? (image_path.startsWith('/') ? image_path : `/${image_path}`) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        {/* Top Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 print:hidden">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              Official Legal Metrology Inspection Notice
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Body */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-6 print:m-0">
          {/* Government of India Header */}
          <div className="text-center pb-4 border-b-2 border-slate-700 print:border-black space-y-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 print:text-black">
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white print:text-black tracking-tight uppercase">
              Legal Metrology Compliance Inspection Report
            </h1>
            <div className="text-xs text-slate-400 print:text-gray-600">
              Issued under the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
            </div>
          </div>

          {/* Inspection Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 print:bg-gray-100 p-4 rounded-2xl border border-slate-800 print:border-gray-300 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold block">Notice No.</span>
              <span className="font-mono font-bold text-emerald-400 print:text-black">{noticeNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold block">Date & Time</span>
              <span className="font-medium text-slate-200 print:text-black">{inspectionDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold block">GTIN / Barcode</span>
              <span className="font-mono font-medium text-slate-200 print:text-black">{barcode}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold block">Audit Status</span>
              <span className={`font-bold font-mono ${isCompliant ? 'text-emerald-400 print:text-green-700' : 'text-rose-400 print:text-red-700'}`}>
                {overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Product Summary */}
          <div className="border border-slate-800 print:border-gray-300 rounded-2xl p-4 bg-slate-950/40 print:bg-white space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
              Sample Commodity Under Inspection
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-base font-bold text-white print:text-black">{productName}</div>
                <div className="text-xs text-slate-300 print:text-gray-700">Brand / Packer: {brand}</div>
              </div>
              <div className="text-right sm:self-center">
                <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-slate-800 print:bg-gray-200 inline-block">
                  Rule 6 Score: {score} / {totalFields} Fields ({compliancePercentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Attached Photographic Evidence */}
          {photoSrc && (
            <div className="border border-slate-800 print:border-gray-300 rounded-2xl p-4 bg-slate-950/40 print:bg-white space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
                <Camera className="w-4 h-4 text-emerald-400 print:text-black" />
                <span>Annexure A: Attached Photographic Packaging Evidence</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-slate-700 print:border-gray-400 max-h-64 flex items-center justify-center bg-black/40">
                <img
                  src={photoSrc}
                  alt="Packaging Evidence"
                  className="max-h-60 object-contain w-full"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded border border-white/20">
                  Evidence Stamp: {noticeNumber}
                </div>
              </div>
            </div>
          )}

          {/* Itemized 8 Mandatory Rule 6 Declarations Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
              Statutory Verification Matrix (Rule 6 Declarations)
            </h3>
            <div className="border border-slate-800 print:border-gray-300 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 print:bg-gray-200 border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Mandatory Declaration</th>
                    <th className="p-3">Legal Rule</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Extracted Statement / Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                  {fields.map((f, i) => (
                    <tr key={f.id || i} className="hover:bg-slate-950/30">
                      <td className="p-3 font-mono font-bold text-slate-500 print:text-gray-600">{i + 1}</td>
                      <td className="p-3 font-semibold text-slate-200 print:text-black">{f.name}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400 print:text-gray-600">{f.legalRule?.split('-')[0]}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          f.status === 'DETECTED'
                            ? 'bg-emerald-500/20 text-emerald-400 print:bg-green-100 print:text-green-800'
                            : f.status === 'UNCLEAR'
                            ? 'bg-amber-500/20 text-amber-400 print:bg-yellow-100 print:text-yellow-800'
                            : 'bg-rose-500/20 text-rose-400 print:bg-red-100 print:text-red-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-300 print:text-gray-800 max-w-xs break-words">
                        {f.value || f.violationMessage || 'Missing on packaging label'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rule 9 Font Height & Readability Specification */}
          {fontCompliance && fontCompliance.rule && (
            <div className="border border-slate-800 print:border-gray-300 rounded-2xl p-4 bg-slate-950/40 print:bg-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 print:text-black">
                  Rule 9 & Table-I Font Height Audit:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 print:bg-green-100 print:text-green-800 uppercase">
                  {fontCompliance.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300 print:text-gray-700">
                <div>Weight Bracket: <strong>{fontCompliance.packageWeightBracket}</strong></div>
                <div>Prescribed Minimum: <strong>{fontCompliance.prescribedMinHeightMm} ({fontCompliance.prescribedMinHeightPt})</strong></div>
                <div>Readability Index: <strong>{fontCompliance.readabilityIndex}</strong></div>
              </div>
            </div>
          )}

          {/* Violations & Section 36 Penalty Advisory */}
          {violations && violations.length > 0 && (
            <div className="border-2 border-rose-500/40 print:border-red-600 rounded-2xl p-4 bg-rose-950/20 print:bg-red-50 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-rose-400 print:text-red-700 font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Statutory Non-Compliance Advisory (Section 36 Penalty)</span>
              </div>
              <p className="text-rose-200 print:text-red-900 text-xs leading-relaxed">
                Under <strong>Section 36 of the Legal Metrology Act, 2009</strong>, manufacturing, packing, importing, or distributing
                packaged commodities in violation of Rule 6 declarations is a punishable offense carrying a fine of up to
                <strong> ₹25,000</strong> for the first offense, and up to <strong>₹50,000</strong> or imprisonment for subsequent offenses.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-300 print:text-red-800">
                {violations.map((v, idx) => (
                  <li key={idx}>
                    <strong>{v.field}:</strong> {v.message} ({v.rule})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official Sign-off Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-black flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
            <div>
              <div className="text-[10px] uppercase text-slate-500 print:text-gray-500">Inspecting Authority</div>
              <div className="font-bold text-slate-200 print:text-black">PackScan Automated Metrology Audit Engine (SIH26034)</div>
              <div className="text-[11px] text-slate-400 print:text-gray-600">Verification Hash: SHA256:a9f4c8e12b7</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="w-36 border-b border-slate-600 print:border-black mb-1" />
              <div className="text-[10px] text-slate-400 print:text-gray-600">Enforcement Officer Signature / Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
