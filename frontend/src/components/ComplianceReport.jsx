import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  FileText,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Info,
  Edit2,
  Check,
  X,
  Loader2,
  Camera,
  Printer,
  Download,
} from 'lucide-react';
import DataSourceBadge from './DataSourceBadge';
import InspectionNoticeModal from './InspectionNoticeModal';

export default function ComplianceReport({
  report,
  productName,
  barcode,
  dataSource,
  confidence,
  imageUrl,
  product,
  onUpdateProductField,
  onAddAdditionalPhoto,
  onNewScan,
}) {
  const [editingFieldIdx, setEditingFieldIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [localOverrides, setLocalOverrides] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  if (!report) return null;

  const {
    overallStatus = 'NON_COMPLIANT',
    score = 0,
    totalFields = 8,
    compliancePercentage = 0,
    summary = '',
    fields = [],
    violations = [],
    fontCompliance = null,
  } = report || {};

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'COMPLIANT':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
          indicator: 'bg-emerald-500',
          title: 'FULLY COMPLIANT',
          subtitle: 'Legal Metrology (Packaged Commodities) Rules, 2011 Verified',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
      case 'DIGITAL_RECORD_VERIFIED':
        return {
          bg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
          indicator: 'bg-sky-500',
          title: 'DIGITAL REGISTRY MATCHED (AWAITING PHYSICAL LABEL AUDIT)',
          subtitle: 'Brand & Nutrition Verified Online — Point Camera at Pack to Auto-Verify Printed MRP & Batch Date',
          icon: <Info className="w-6 h-6 text-sky-400" />,
        };
      case 'PARTIALLY_COMPLIANT':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          indicator: 'bg-amber-500',
          title: 'PARTIALLY COMPLIANT',
          subtitle: 'Some Mandatory Declarations Missing or Non-Standard',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
        };
      case 'NON_COMPLIANT':
      default:
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          indicator: 'bg-rose-500',
          title: 'NON-COMPLIANT (VIOLATION DETECTED)',
          subtitle: 'Multiple Statutory Packaging Violations Identified on Physical Label',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400" />,
        };
    }
  };

  const badge = getStatusBadge();

  const handleStartEdit = (idx, currentVal) => {
    setEditingFieldIdx(idx);
    setEditValue(currentVal || '');
    setSaveSuccessMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingFieldIdx(null);
    setEditValue('');
  };

  const handleSaveEdit = async (field, idx) => {
    if (!editValue.trim()) return;
    setIsSaving(true);

    try {
      if (onUpdateProductField) {
        await onUpdateProductField(field.id || field.name, editValue.trim());
      } else if (barcode) {
        await fetch(`/api/products/${encodeURIComponent(barcode)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [field.id || 'ingredients']: editValue.trim(),
            confidence: 'high',
          }),
        });
      }

      setLocalOverrides((prev) => ({
        ...prev,
        [idx]: editValue.trim(),
      }));

      setSaveSuccessMsg(`Updated "${field.name}" in local database`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      setEditingFieldIdx(null);
    } catch (err) {
      console.error('Failed to save field correction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportAuditJson = useCallback(() => {
    const auditData = {
      timestamp: new Date().toISOString(),
      productName: productName || product?.name || 'Unknown Product',
      barcode: barcode || product?.barcode || 'N/A',
      overallStatus: isFullyCompliant ? 'COMPLIANT' : overallStatus,
      complianceScore: `${displayScore}/${totalFields}`,
      compliancePercentage: `${displayPercentage}%`,
      fieldAudit: fields.map((f, idx) => ({
        id: f.id,
        name: f.name,
        status: localOverrides[idx] !== undefined ? 'DETECTED' : f.status,
        value: localOverrides[idx] !== undefined ? localOverrides[idx] : (f.value || f.snippet || null),
        confidence: f.confidence || 'unknown',
        sourcePhoto: f.sourcePhoto || null,
        ruleRef: f.ruleRef || null,
      })),
      violations: violations || [],
      fontCompliance: fontCompliance || null,
      standards: 'Legal Metrology (Packaged Commodities) Rules, 2011 — Mandatory Rule 6',
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_${barcode || 'product'}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [productName, product, barcode, isFullyCompliant, overallStatus, displayScore, totalFields, displayPercentage, fields, localOverrides, violations, fontCompliance]);

  const detectedCount = fields.filter((f, idx) => localOverrides[idx] !== undefined || f.status === 'DETECTED').length;
  const unclearCount = fields.filter((f, idx) => localOverrides[idx] === undefined && f.status === 'UNCLEAR').length;
  const missingCount = fields.filter((f, idx) => localOverrides[idx] === undefined && f.status === 'MISSING').length;

  const displayScore = detectedCount;
  const displayPercentage = Math.round((displayScore / totalFields) * 100);
  const isFullyCompliant = displayScore === totalFields;

  return (
    <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Primary Section Header - SIH26034 Requirement */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Core Compliance Engine (SIH26034)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Legal Metrology Compliance Report
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-slate-400">
                India Legal Metrology (Packaged Commodities) Rules, 2011 — Mandatory Rule 6 Verification
              </p>
              {dataSource && (
                <DataSourceBadge dataSource={dataSource} confidence={confidence} />
              )}
            </div>
          </div>
        </div>

        {/* Score Meter & Scan Another Product Action */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {onNewScan && (
            <button
              type="button"
              onClick={onNewScan}
              className="px-3.5 py-2.5 bg-slate-950 hover:bg-emerald-600 border border-slate-800 hover:border-emerald-500 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Scan Another Product</span>
            </button>
          )}

          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Compliance Score</div>
              <div className="text-lg font-black text-emerald-400 font-mono leading-none">
                {displayScore} / {totalFields} Fields
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                <span className="text-emerald-400 font-bold">{detectedCount}</span> detected •{' '}
                <span className="text-amber-400 font-bold">{unclearCount}</span> unclear •{' '}
                <span className="text-rose-400 font-bold">{missingCount}</span> missing
              </div>
            </div>
            <div className="w-14 h-14 flex items-center justify-center relative shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`transition-all duration-700 ease-out ${
                    isFullyCompliant || overallStatus === 'COMPLIANT'
                      ? 'text-emerald-400'
                      : displayPercentage >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                  strokeDasharray={`${displayPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-black font-mono text-slate-100">{displayPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification for Field Edit */}
      {saveSuccessMsg && (
        <div className="mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg} (saved to local database)</span>
        </div>
      )}

      {/* Main Status Hero Banner */}
      <div
        className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isFullyCompliant ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : badge.bg
        }`}
      >
        <div className="flex items-center space-x-3">
          {isFullyCompliant ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : badge.icon}
          <div>
            <div className="text-base font-extrabold tracking-tight">
              {isFullyCompliant ? 'FULLY COMPLIANT (PHYSICAL DECLARATIONS VERIFIED)' : badge.title}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              {isFullyCompliant
                ? 'All 8 mandatory declarations under Legal Metrology Rules, 2011 verified & stored.'
                : summary}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
          <button
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-500 text-slate-200 hover:text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Notice (PDF)</span>
          </button>

          <button
            type="button"
            onClick={handleExportAuditJson}
            title="Download JSON Audit Trail"
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          {!isFullyCompliant && overallStatus === 'DIGITAL_RECORD_VERIFIED' && (
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                  const buttons = Array.from(document.querySelectorAll('button'));
                  const photoBtn = buttons.find((b) => b.textContent.includes('Label OCR Photo'));
                  if (photoBtn) photoBtn.click();
                }, 100);
              }}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photograph Packet Label</span>
            </button>
          )}
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-black/40 border border-white/10 uppercase">
            {isFullyCompliant ? 'COMPLIANT' : overallStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 8 Mandatory Declarations Grid */}
      <div className="mt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Mandatory 8-Field Statutory Audit Breakdown:</span>
          <span className="text-[11px] text-emerald-400 lowercase font-mono">Rule 6(1) to 6(11)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((field, idx) => {
            const displayVal = localOverrides[idx] !== undefined ? localOverrides[idx] : (field.value || field.snippet);
            const isOverridden = localOverrides[idx] !== undefined;
            const isDetected = isOverridden || field.status === 'DETECTED';
            const isUnclear = !isOverridden && field.status === 'UNCLEAR';
            const isMissing = !isOverridden && field.status === 'MISSING';
            const isEditing = editingFieldIdx === idx;

            return (
              <div
                key={field.id || idx}
                className={`p-3.5 rounded-xl border transition ${
                  isDetected
                    ? 'bg-slate-950/60 border-emerald-500/30 hover:border-emerald-500/50'
                    : isUnclear
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-rose-500/30'
                }`}
              >
                {/* Field Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-full font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                        isDetected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isUnclear
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {isDetected ? '✓' : isUnclear ? '?' : '✗'}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-200 block">{field.name}</span>
                      {field.sourcePhoto && isDetected && (
                        <span className="text-[10px] text-emerald-400/80 font-medium">
                          Found in: {field.sourcePhoto}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Inline Edit Button */}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, displayVal)}
                        title="Edit this field to correct OCR"
                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Status & Confidence Pills */}
                    <div className="flex items-center space-x-1 flex-wrap gap-y-1 justify-end">
                      {/* Confidence Tag */}
                      {field.confidence === 'high' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          High Confidence
                        </span>
                      )}
                      {field.confidence === 'low' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low Confidence
                        </span>
                      )}

                      {/* Status Pill */}
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase shrink-0 ${
                          isDetected
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isUnclear
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        <span>
                          {isOverridden ? 'VERIFIED' : isDetected ? 'DETECTED' : isUnclear ? 'UNCLEAR' : 'NOT DETECTED'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statutory Rule Citation */}
                <div className="text-[10px] font-mono text-slate-500 mt-1">{field.legalRule}</div>

                {/* Inline Editing Form */}
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg p-2 text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder={`Enter corrected ${field.name}...`}
                    />
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(field, idx)}
                        disabled={isSaving || !editValue.trim()}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-sm"
                      >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        <span>Save to DB</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Extracted Value or Failure Reason */
                  <div className="mt-2 text-xs">
                    {isDetected && (
                      <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {isOverridden ? 'User-Corrected Value:' : 'Extracted Text Value:'}
                        </div>
                        <div className="font-mono text-emerald-300 font-medium text-xs break-words mt-0.5">
                          {displayVal}
                        </div>
                      </div>
                    )}

                    {isUnclear && (
                      <div className="bg-amber-950/40 rounded-lg p-2 border border-amber-800/40 text-amber-300">
                        <div className="text-[10px] uppercase font-semibold">Partial Match:</div>
                        <div className="font-mono text-xs">{displayVal}</div>
                        <div className="text-[11px] text-amber-400/90 mt-1">{field.violationMessage}</div>
                      </div>
                    )}

                    {isMissing && (
                      <div className="bg-rose-950/30 rounded-lg p-2 border border-rose-800/30 text-rose-300">
                        <div className="text-[11px] font-medium">
                          {field.violationMessage || 'Mandatory declaration not detected in any captured photos.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* STAGE 4: Handling Fields Not Found (Additional Angle Capture) */}
        {fields.some((f, i) => localOverrides[i] === undefined && f.status === 'MISSING') && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-amber-300">
                  Some mandatory fields weren't found on the pack:
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Missing:{' '}
                  <span className="text-amber-200 font-semibold">
                    {fields
                      .filter((f, i) => localOverrides[i] === undefined && f.status === 'MISSING')
                      .map((f) => f.name)
                      .join(', ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Try photographing the side, fold, or bottom of the pack where batch numbers or manufacturer stamps might be printed.
                </p>
              </div>
            </div>

            {onAddAdditionalPhoto && (
              <div className="flex items-center gap-3 pt-1 border-t border-slate-800">
                <label className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>Photograph Additional Angle &amp; Merge</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onAddAdditionalPhoto(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <span className="text-[11px] text-slate-400">
                  Will re-run OCR on the new photo and merge newly detected fields into your checklist.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STAGE 3: Barcode-Sourced Registry Information Section (Distinct from packet OCR) */}
      <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product Registry Information (Barcode Lookup)
            </span>
          </div>
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            Source: Digital Registry
          </span>
        </div>
        <p className="text-xs text-slate-400">
          The following product metadata was retrieved from the Open Food Facts &amp; Indian FMCG Registry database based on the scanned GTIN barcode, rather than this specific pack's printed ink:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Registered Product Name</span>
            <span className="text-slate-100 font-medium">{productName || 'Packaged Commodity'}</span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Registered GTIN Barcode</span>
            <span className="text-slate-100 font-mono font-medium">{barcode || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Violations / Actionable Summary Box */}
      {violations && violations.length > 0 && overallStatus !== 'DIGITAL_RECORD_VERIFIED' && (
        <div className="mt-5 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Regulatory Violations on Label ({violations.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-200">
            {violations.map((v, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-rose-400 font-bold">•</span>
                <div>
                  <span className="font-semibold text-rose-300">{v.field}:</span> {v.message}
                  <span className="text-[10px] font-mono text-rose-400/80 block">{v.rule}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule 9 Font Height & Readability Specifications */}
      {fontCompliance && fontCompliance.rule && (
        <div className="mt-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-100 uppercase tracking-wider">
                Rule 9 &amp; Table-I Font Height &amp; Readability Audit
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              {fontCompliance.status || 'REVIEW_REQUIRED'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Weight Category</span>
              <strong className="text-slate-200">{fontCompliance.packageWeightBracket || 'Standard'}</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Prescribed Min. Height</span>
              <strong className="text-emerald-400">{fontCompliance.prescribedMinHeightMm || '1.0 mm'} ({fontCompliance.prescribedMinHeightPt || '2.8 pt'})</strong>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Readability Index</span>
              <strong className="text-slate-200">{fontCompliance.readabilityIndex || 'Adequate'}</strong>
            </div>
          </div>
          {fontCompliance.legalMandate && (
            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
              {fontCompliance.legalMandate}
            </p>
          )}
        </div>
      )}

      {/* Official Legal Metrology Notice & Printable PDF Modal */}
      <InspectionNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        inspectionData={{
          productName,
          brand: productName?.split(' ')[0] || 'Unknown Brand',
          barcode,
          imageUrl,
          complianceReport: report,
          created_at: report.analyzedAt || new Date().toISOString(),
        }}
      />
    </div>
  );
}
