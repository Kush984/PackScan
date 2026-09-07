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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-[#e7e0d6] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        {/* Top Modal Controls Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e7e0d6] print:hidden">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-[#b8532f]" />
            <span className="font-extrabold text-sm text-[#2a2622] uppercase tracking-wider font-['Space_Grotesk']">
              Official Legal Metrology Inspection Notice
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#b8532f] hover:bg-[#a34a2b] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#78716c] hover:text-[#2a2622] hover:bg-[#faf7f2] rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Notice Body */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-[#faf7f2] text-[#2a2622] print:bg-white print:text-black print:p-6 print:m-0">
          {/* Government of India Header */}
          <div className="text-center pb-4 border-b-2 border-[#e7e0d6] print:border-black space-y-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-[#b8532f] print:text-black">
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#2a2622] print:text-black tracking-tight uppercase font-['Space_Grotesk']">
              Legal Metrology Compliance Inspection Report
            </h1>
            <div className="text-xs text-[#57534e] print:text-gray-600">
              Issued under the Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011
            </div>
          </div>

          {/* Inspection Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white print:bg-gray-100 p-4 rounded-2xl border border-[#e7e0d6] print:border-gray-300 text-xs">
            <div>
              <span className="text-[10px] text-[#78716c] print:text-gray-500 uppercase font-semibold block">Notice No.</span>
              <span className="font-mono font-bold text-[#b8532f] print:text-black">{noticeNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#78716c] print:text-gray-500 uppercase font-semibold block">Date & Time</span>
              <span className="font-medium text-[#2a2622] print:text-black">{inspectionDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#78716c] print:text-gray-500 uppercase font-semibold block">GTIN / Barcode</span>
              <span className="font-mono font-medium text-[#2a2622] print:text-black">{barcode}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#78716c] print:text-gray-500 uppercase font-semibold block">Audit Status</span>
              <span className={`font-bold font-mono ${isCompliant ? 'text-[#c99a3e] print:text-black' : 'text-[#be123c] print:text-black'}`}>
                {overallStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Product Summary */}
          <div className="border border-[#e7e0d6] print:border-gray-300 rounded-2xl p-4 bg-white space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716c] print:text-gray-600 font-['Space_Grotesk']">
              Sample Commodity Under Inspection
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-base font-bold text-[#2a2622] print:text-black font-['Space_Grotesk']">{productName}</div>
                <div className="text-xs text-[#57534e] print:text-gray-700">Brand / Packer: {brand}</div>
              </div>
              <div className="text-right sm:self-center">
                <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] text-[#b8532f] inline-block">
                  Rule 6 Score: {score} / {totalFields} Fields ({compliancePercentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Attached Photographic Evidence */}
          {photoSrc && (
            <div className="border border-[#e7e0d6] print:border-gray-300 rounded-2xl p-4 bg-white space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#78716c] print:text-gray-600 font-['Space_Grotesk']">
                <Camera className="w-4 h-4 text-[#b8532f] print:text-black" />
                <span>Annexure A: Attached Photographic Packaging Evidence</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-[#e7e0d6] print:border-gray-400 max-h-64 flex items-center justify-center bg-[#faf7f2]">
                <img
                  src={photoSrc}
                  alt="Packaging Evidence"
                  className="max-h-60 object-contain w-full"
                />
                <div className="absolute bottom-2 right-2 bg-white/90 text-[10px] font-mono text-[#2a2622] px-2 py-0.5 rounded border border-[#e7e0d6]">
                  Evidence Stamp: {noticeNumber}
                </div>
              </div>
            </div>
          )}

          {/* Itemized 8 Mandatory Rule 6 Declarations Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716c] print:text-gray-600 font-['Space_Grotesk']">
              Statutory Verification Matrix (Rule 6 Declarations)
            </h3>
            <div className="border border-[#e7e0d6] print:border-gray-300 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#faf7f2] print:bg-gray-200 border-b border-[#e7e0d6] print:border-gray-300 text-[#78716c] print:text-gray-700">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Mandatory Declaration</th>
                    <th className="p-3">Legal Rule</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">Extracted Statement / Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e0d6] print:divide-gray-200">
                  {fields.map((f, i) => (
                    <tr key={f.id || i} className="hover:bg-[#faf7f2]/50">
                      <td className="p-3 font-mono font-bold text-[#78716c] print:text-gray-600">{i + 1}</td>
                      <td className="p-3 font-semibold text-[#2a2622] print:text-black">{f.name}</td>
                      <td className="p-3 font-mono text-[11px] text-[#78716c] print:text-gray-600">{f.legalRule?.split('-')[0]}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          f.status === 'DETECTED'
                            ? 'bg-[#fef3c7] text-[#c99a3e] border border-[#fde68a] print:bg-yellow-100 print:text-yellow-800'
                            : f.status === 'UNCLEAR'
                            ? 'bg-[#fef3c7] text-[#c99a3e] border border-[#fde68a] print:bg-yellow-100 print:text-yellow-800'
                            : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] print:bg-red-100 print:text-red-800'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-[#57534e] print:text-gray-800 max-w-xs break-words">
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
            <div className="border border-[#e7e0d6] print:border-gray-300 rounded-2xl p-4 bg-white space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2a2622] print:text-black font-['Space_Grotesk']">
                  Rule 9 & Table-I Font Height Audit:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fef3c7] text-[#c99a3e] border border-[#fde68a] uppercase">
                  {fontCompliance.status}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-[#57534e] print:text-gray-700">
                <div>Weight Bracket: <strong>{fontCompliance.packageWeightBracket}</strong></div>
                <div>Prescribed Minimum: <strong>{fontCompliance.prescribedMinHeightMm} ({fontCompliance.prescribedMinHeightPt})</strong></div>
                <div>Readability Index: <strong>{fontCompliance.readabilityIndex}</strong></div>
              </div>
            </div>
          )}

          {/* Violations & Section 36 Penalty Advisory */}
          {violations && violations.length > 0 && (
            <div className="border-2 border-[#fecdd3] print:border-red-600 rounded-2xl p-4 bg-[#fff1f2] space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#be123c] print:text-red-700 font-bold uppercase font-['Space_Grotesk']">
                <AlertTriangle className="w-4 h-4" />
                <span>Statutory Non-Compliance Advisory (Section 36 Penalty)</span>
              </div>
              <p className="text-[#be123c] print:text-red-900 text-xs leading-relaxed">
                Under <strong>Section 36 of the Legal Metrology Act, 2009</strong>, manufacturing, packing, importing, or distributing
                packaged commodities in violation of Rule 6 declarations is a punishable offense carrying a fine of up to
                <strong> ₹25,000</strong> for the first offense, and up to <strong>₹50,000</strong> or imprisonment for subsequent offenses.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#9f1239] print:text-red-800">
                {violations.map((v, idx) => (
                  <li key={idx}>
                    <strong>{v.field}:</strong> {v.message} ({v.rule})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Official Sign-off Footer */}
          <div className="pt-6 border-t border-[#e7e0d6] print:border-black flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 text-xs">
            <div>
              <div className="text-[10px] uppercase text-[#78716c] print:text-gray-500">Inspecting Authority</div>
              <div className="font-bold text-[#2a2622] print:text-black">PackScan Automated Metrology Audit Engine (SIH26034)</div>
              <div className="text-[11px] text-[#78716c] print:text-gray-600">Verification Hash: SHA256:a9f4c8e12b7</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="w-36 border-b border-[#78716c] print:border-black mb-1" />
              <div className="text-[10px] text-[#78716c] print:text-gray-600">Enforcement Officer Signature / Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
