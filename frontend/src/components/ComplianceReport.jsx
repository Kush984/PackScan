import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  ShieldAlert,
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
  const [animatedPercent, setAnimatedPercent] = useState(0);

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

  const detectedCount = fields.filter((f, idx) => localOverrides[idx] !== undefined || f.status === 'DETECTED').length;
  const unclearCount = fields.filter((f, idx) => localOverrides[idx] === undefined && f.status === 'UNCLEAR').length;
  const missingCount = fields.filter((f, idx) => localOverrides[idx] === undefined && f.status === 'MISSING').length;

  const displayScore = detectedCount;
  const displayPercentage = Math.round((displayScore / totalFields) * 100);
  const isFullyCompliant = displayScore === totalFields;

  // Animate score counter smoothly from 0 to displayPercentage
  useEffect(() => {
    let start = 0;
    const end = displayPercentage;
    const duration = 1000;
    const startTime = performance.now();

    const frame = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setAnimatedPercent(Math.round(eased * end));
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, [displayPercentage]);

  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'COMPLIANT':
        return {
          bg: 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]',
          title: 'FULLY COMPLIANT',
          subtitle: 'Legal Metrology (Packaged Commodities) Rules, 2011 Verified',
          icon: <ShieldCheck className="w-6 h-6 text-[#16a34a]" />,
        };
      case 'DIGITAL_RECORD_VERIFIED':
        return {
          bg: 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]',
          title: 'DIGITAL REGISTRY MATCHED (AWAITING PHYSICAL LABEL AUDIT)',
          subtitle: 'Brand & Nutrition Verified Online — Point Camera at Pack to Auto-Verify Printed MRP & Batch Date',
          icon: <AlertTriangle className="w-6 h-6 text-[#be123c]" />,
        };
      case 'PARTIALLY_COMPLIANT':
        return {
          bg: 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]',
          title: 'PARTIALLY COMPLIANT',
          subtitle: 'Some Mandatory Declarations Missing or Non-Standard',
          icon: <AlertTriangle className="w-6 h-6 text-[#be123c]" />,
        };
      case 'NON_COMPLIANT':
      default:
        return {
          bg: 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]',
          title: 'NON-COMPLIANT (VIOLATION DETECTED)',
          subtitle: 'Multiple Statutory Packaging Violations Identified on Physical Label',
          icon: <ShieldAlert className="w-6 h-6 text-[#be123c]" />,
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

  return (
    <div className="bg-white border border-[#e8e2d8] rounded-xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
      {/* Primary Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e2d8]">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-xl bg-[#fbf2ed] border border-[#ecc2b0] text-[#b8532f] shadow-xs">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#b8532f] font-['Space_Grotesk']">
                Core Compliance Engine (SIH26034)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2a2622] tracking-tight font-['Space_Grotesk']">
              Legal Metrology Compliance Report
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-sm text-[#5c554e]">
                Mandatory Rule 6 Statutory Declaration Verification
              </p>
              {dataSource && (
                <DataSourceBadge dataSource={dataSource} confidence={confidence} />
              )}
            </div>
          </div>
        </div>

        {/* Animated Score Meter & Scan Another Product */}
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {onNewScan && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onNewScan}
              className="px-4 py-2 bg-[#faf7f2] hover:bg-[#f4efe6] border border-[#e8e2d8] text-[#2a2622] font-['Space_Grotesk'] font-bold rounded-lg text-xs transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#b8532f]" />
              <span>Scan Another Product</span>
            </motion.button>
          )}

          <div className="flex items-center space-x-3.5 bg-[#faf7f2] px-4 py-2.5 rounded-xl border border-[#e8e2d8]">
            <div className="text-right">
              <div className="text-[11px] uppercase font-bold text-[#8c8278] font-['Space_Grotesk']">Compliance Score</div>
              <div className={`text-lg font-black font-['Space_Grotesk'] leading-none ${
                isFullyCompliant ? 'text-[#15803d]' : 'text-[#be123c]'
              }`}>
                {displayScore} / {totalFields} Fields
              </div>
              <div className="text-[11px] text-[#5c554e] mt-1 font-medium">
                <span className={`${isFullyCompliant ? 'text-[#15803d]' : 'text-[#be123c]'} font-bold`}>{detectedCount}</span> detected •{' '}
                <span className="text-[#926325] font-bold">{unclearCount}</span> unclear •{' '}
                <span className="text-[#be123c] font-bold">{missingCount}</span> missing
              </div>
            </div>

            {/* Animated Ring Arc */}
            <div className="w-14 h-14 flex items-center justify-center relative shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e8e2d8]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${displayPercentage}, 100` }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke={isFullyCompliant ? '#16a34a' : '#be123c'}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className={`absolute text-xs font-bold font-['Space_Grotesk'] ${
                isFullyCompliant ? 'text-[#15803d]' : 'text-[#be123c]'
              }`}>
                {animatedPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification for Field Edit */}
      {saveSuccessMsg && (
        <div className="mt-3 p-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[#15803d] text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
          <span>{saveSuccessMsg} (saved to local database)</span>
        </div>
      )}

      {/* Main Status Hero Banner */}
      <div
        className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isFullyCompliant ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]' : badge.bg
        }`}
      >
        <div className="flex items-center space-x-3">
          {isFullyCompliant ? <ShieldCheck className="w-6 h-6 text-[#16a34a]" /> : badge.icon}
          <div>
            <div className="text-base font-extrabold tracking-tight font-['Space_Grotesk']">
              {isFullyCompliant ? 'FULLY COMPLIANT (PHYSICAL DECLARATIONS VERIFIED)' : badge.title}
            </div>
            <div className="text-sm text-[#5c554e] mt-0.5 max-w-2xl leading-relaxed">
              {isFullyCompliant
                ? 'All 8 mandatory declarations under Legal Metrology Rules, 2011 verified & stored.'
                : summary}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsNoticeOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#faf7f2] border border-[#e8e2d8] text-[#2a2622] font-['Space_Grotesk'] font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-[#b8532f]" />
            <span>Official Notice (PDF)</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleExportAuditJson}
            title="Download JSON Audit Trail"
            className="px-3.5 py-2 bg-white hover:bg-[#faf7f2] border border-[#e8e2d8] text-[#5c554e] font-['Space_Grotesk'] font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-[#c99a3e]" />
            <span>Export JSON</span>
          </motion.button>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded border uppercase font-['Space_Grotesk'] ${
            isFullyCompliant ? 'bg-[#dcfce7] text-[#15803d] border-[#86efac]' : 'bg-[#fee2e2] text-[#be123c] border-[#fca5a5]'
          }`}>
            {isFullyCompliant ? 'COMPLIANT' : overallStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* 8 Mandatory Declarations Grid (Staggered Animation) */}
      <div className="mt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c8278] mb-3 flex items-center justify-between font-['Space_Grotesk']">
          <span>Mandatory 8-Field Statutory Audit Breakdown</span>
          <span className="text-[11px] text-[#b8532f] lowercase font-sans">Rule 6(1) to 6(11)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {fields.map((field, idx) => {
            const displayVal = localOverrides[idx] !== undefined ? localOverrides[idx] : (field.value || field.snippet);
            const isOverridden = localOverrides[idx] !== undefined;
            const isDetected = isOverridden || field.status === 'DETECTED';
            const isUnclear = !isOverridden && field.status === 'UNCLEAR';
            const isMissing = !isOverridden && field.status === 'MISSING';
            const isEditing = editingFieldIdx === idx;

            return (
              <motion.div
                key={field.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08, ease: 'easeOut' }}
                className={`p-4 rounded-xl border transition ${
                  isDetected
                    ? 'bg-white border-[#e8e2d8] hover:border-[#ded6c7]'
                    : isUnclear
                    ? 'bg-[#fdf5e6] border-[#eed69e]'
                    : 'bg-[#fff1f2] border-[#fecdd3]'
                }`}
              >
                {/* Field Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 ${
                        isDetected
                          ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          : isUnclear
                          ? 'bg-[#fef3c7] text-[#926325] border border-[#fde68a]'
                          : 'bg-[#fee2e2] text-[#be123c] border border-[#fca5a5]'
                      }`}
                    >
                      {isDetected ? '✓' : isUnclear ? '?' : '✗'}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-[#2a2622] block font-['Space_Grotesk']">
                        {field.name}
                      </span>
                      {field.sourcePhoto && isDetected && (
                        <span className="text-[11px] text-[#16a34a] font-medium">
                          Found in: {field.sourcePhoto}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, displayVal)}
                        title="Edit this field to correct OCR"
                        className="p-1.5 text-[#8c8278] hover:text-[#b8532f] hover:bg-[#faf7f2] rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase shrink-0 font-['Space_Grotesk'] ${
                        isDetected
                          ? 'bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]'
                          : isUnclear
                          ? 'bg-[#fdf5e6] text-[#926325] border border-[#eed69e]'
                          : 'bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]'
                      }`}
                    >
                      {isOverridden ? 'VERIFIED' : isDetected ? 'DETECTED' : isUnclear ? 'UNCLEAR' : 'NOT DETECTED'}
                    </span>
                  </div>
                </div>

                {/* Statutory Rule Citation */}
                <div className="text-[12px] text-[#8c8278] mt-1 font-medium">{field.legalRule}</div>

                {/* Inline Editing Form */}
                {isEditing ? (
                  <div className="mt-2.5 space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={2}
                      className="w-full bg-[#faf7f2] border border-[#b8532f] rounded-lg p-2.5 text-xs text-[#2a2622] focus:outline-none focus:ring-1 focus:ring-[#b8532f]"
                      placeholder={`Enter corrected ${field.name}...`}
                    />
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="px-3 py-1.5 rounded bg-[#faf7f2] hover:bg-[#f4efe6] text-[#5c554e] text-xs font-semibold flex items-center space-x-1 border border-[#e8e2d8] cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(field, idx)}
                        disabled={isSaving || !editValue.trim()}
                        className="px-3 py-1.5 rounded bg-[#b8532f] hover:bg-[#a34a2b] text-white text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
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
                      <div className="bg-[#faf7f2] rounded-lg p-2.5 border border-[#e8e2d8]">
                        <div className="text-[11px] text-[#8c8278] uppercase font-bold font-['Space_Grotesk']">
                          {isOverridden ? 'User-Corrected Value:' : 'Extracted Text Value:'}
                        </div>
                        <div className="text-[#2a2622] font-semibold text-xs break-words mt-0.5 leading-relaxed">
                          {displayVal}
                        </div>
                      </div>
                    )}

                    {isUnclear && (
                      <div className="bg-[#fdf5e6] rounded-lg p-2.5 border border-[#eed69e] text-[#926325]">
                        <div className="text-[11px] uppercase font-bold font-['Space_Grotesk']">Partial Match:</div>
                        <div className="text-xs mt-0.5">{displayVal}</div>
                        <div className="text-xs text-[#926325] mt-1">{field.violationMessage}</div>
                      </div>
                    )}

                    {isMissing && (
                      <div className="bg-[#fff1f2] rounded-lg p-2.5 border border-[#fecdd3] text-[#be123c]">
                        <div className="text-xs font-medium">
                          {field.violationMessage || 'Mandatory declaration not detected in any captured photos.'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Additional Angle Capture Prompt */}
        {fields.some((f, i) => localOverrides[i] === undefined && f.status === 'MISSING') && (
          <div className="mt-4 p-4 rounded-xl bg-[#fdf5e6] border border-[#eed69e] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-white border border-[#eed69e] text-[#c99a3e] shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-[#926325] font-['Space_Grotesk']">
                  Some mandatory declarations weren't found on the pack:
                </div>
                <div className="text-xs text-[#5c554e] mt-1">
                  Missing:{' '}
                  <span className="text-[#be123c] font-semibold">
                    {fields
                      .filter((f, i) => localOverrides[i] === undefined && f.status === 'MISSING')
                      .map((f) => f.name)
                      .join(', ')}
                  </span>
                </div>
                <p className="text-xs text-[#8c8278] mt-1">
                  Try photographing the side, fold, or bottom of the pack where batch numbers or manufacturer stamps might be printed.
                </p>
              </div>
            </div>

            {onAddAdditionalPhoto && (
              <div className="flex items-center gap-3 pt-2 border-t border-[#eed69e]">
                <label className="px-4 py-2 bg-[#c99a3e] hover:bg-[#b1812f] text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer">
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
                <span className="text-xs text-[#8c8278]">
                  Will re-run OCR on the new photo and merge newly detected fields into your checklist.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barcode Registry Information (Distinct from packet OCR) */}
      <div className="mt-5 p-4 rounded-xl bg-[#faf7f2] border border-[#e8e2d8] space-y-2">
        <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#b8532f]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#2a2622] font-['Space_Grotesk']">
              Product Registry Information (Barcode Lookup)
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#b8532f] bg-[#fbf2ed] px-2 py-0.5 rounded border border-[#ecc2b0]">
            Digital Registry
          </span>
        </div>
        <p className="text-xs text-[#5c554e]">
          Metadata retrieved from Open Food Facts &amp; Indian FMCG Registry database for this GTIN barcode:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-white p-2.5 rounded-lg border border-[#e8e2d8]">
            <span className="text-[11px] text-[#8c8278] uppercase block font-bold font-['Space_Grotesk']">Registered Product Name</span>
            <span className="text-[#2a2622] font-semibold">{productName || 'Packaged Commodity'}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-[#e8e2d8]">
            <span className="text-[11px] text-[#8c8278] uppercase block font-bold font-['Space_Grotesk']">Registered GTIN Barcode</span>
            <span className="text-[#2a2622] font-mono font-medium">{barcode || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Violations Box */}
      {violations && violations.length > 0 && overallStatus !== 'DIGITAL_RECORD_VERIFIED' && (
        <div className="mt-5 p-4 rounded-xl bg-[#fff1f2] border border-[#fecdd3]">
          <div className="flex items-center space-x-2 text-[#be123c] font-bold text-xs uppercase mb-2 font-['Space_Grotesk']">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Regulatory Violations on Label ({violations.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#be123c]">
            {violations.map((v, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="font-bold">•</span>
                <div>
                  <span className="font-semibold">{v.field}:</span> {v.message}
                  <span className="text-[11px] block text-[#9f1239]">{v.rule}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rule 9 Font Height & Readability Specifications (Streamlined) */}
      {fontCompliance && fontCompliance.rule && (
        <div className="mt-5 p-4 rounded-xl bg-[#faf7f2] border border-[#e8e2d8] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-[#b8532f]" />
              <span className="font-bold text-[#2a2622] uppercase tracking-wider font-['Space_Grotesk']">
                Rule 9 &amp; Table-I Font Height Audit
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fbf2ed] text-[#b8532f] border border-[#ecc2b0] uppercase font-['Space_Grotesk']">
              {fontCompliance.status || 'REVIEW_REQUIRED'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-[#e8e2d8]">
              <span className="text-[11px] text-[#8c8278] block uppercase font-bold font-['Space_Grotesk']">Weight Bracket</span>
              <strong className="text-[#2a2622]">{fontCompliance.packageWeightBracket || 'Standard'}</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-[#e8e2d8]">
              <span className="text-[11px] text-[#8c8278] block uppercase font-bold font-['Space_Grotesk']">Prescribed Min. Height</span>
              <strong className="text-[#b8532f]">{fontCompliance.prescribedMinHeightMm || '1.0 mm'} ({fontCompliance.prescribedMinHeightPt || '2.8 pt'})</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-[#e8e2d8]">
              <span className="text-[11px] text-[#8c8278] block uppercase font-bold font-['Space_Grotesk']">Readability Index</span>
              <strong className="text-[#2a2622]">{fontCompliance.readabilityIndex || 'Adequate'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Official Legal Metrology Notice Modal */}
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

