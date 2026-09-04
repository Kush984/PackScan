import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProfileModal from './components/ProfileModal';
import FeedbackForumModal from './components/FeedbackForumModal';
import InspectionNoticeModal from './components/InspectionNoticeModal';
import Scanner from './components/Scanner';
import ComplianceReport from './components/ComplianceReport';
import HealthAlerts from './components/HealthAlerts';
import RegulatoryComparison from './components/RegulatoryComparison';
import AlternativeSuggestions from './components/AlternativeSuggestions';
import DemoPresetBar from './components/DemoPresetBar';
import RawLabelViewer from './components/RawLabelViewer';
import DataSourceBadge from './components/DataSourceBadge';
import EnforcementDashboard from './components/EnforcementDashboard';
import MedicalProfileView from './components/MedicalProfileView';
import AllergiesThresholdView from './components/AllergiesThresholdView';
import ProductForumLedgerView from './components/ProductForumLedgerView';
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Heart,
  Globe,
  FileSearch,
  CheckCircle2,
  ExternalLink,
  MessageSquarePlus,
  Camera,
  TrendingUp,
  Package,
  AlertTriangle,
  Zap,
  Cpu,
} from 'lucide-react';

const DEVICE_ID_KEY = 'packscan_device_id';
const PROFILE_STORAGE_KEY = 'packscan_user_profile';

const sampleInspectionData = {
  productName: 'Nestlé Maggi 2-Minute Masala',
  brand: 'Nestlé India Limited',
  barcode: '8901058852371',
  complianceReport: {
    overallStatus: 'COMPLIANT',
    score: 8,
    totalFields: 8,
    compliancePercentage: 100,
    summary: 'All 8 mandatory declarations under Legal Metrology Rules, 2011 verified.',
    fields: [
      { id: 'manufacturer', name: 'Manufacturer / Packer Name & Address', status: 'DETECTED', value: 'Nestlé India Limited, 100/101 World Trade Centre, Barakhamba Lane, New Delhi-110001', legalRule: 'Rule 6(1)(a)' },
      { id: 'generic_name', name: 'Common / Generic Product Name', status: 'DETECTED', value: 'Instant Noodles with Masala Tastemaker', legalRule: 'Rule 6(1)(b)' },
      { id: 'net_quantity', name: 'Net Quantity & Standard Weight', status: 'DETECTED', value: '70 g (Font: 2.8mm - Exceeds Min 2.0mm)', legalRule: 'Rule 6(1)(c)' },
      { id: 'mfg_date', name: 'Month and Year of Manufacture / Pack', status: 'DETECTED', value: '10/2024', legalRule: 'Rule 6(1)(d)' },
      { id: 'mrp', name: 'Price (MRP inclusive of all taxes)', status: 'DETECTED', value: '₹14.00 (Font: 3.2mm - Table-I Compliant)', legalRule: 'Rule 6(1)(e)' },
      { id: 'unit_sale_price', name: 'Package Dimensions & Unit Sale Price', status: 'DETECTED', value: '₹0.20 / g', legalRule: 'Rule 6(1)(f)' },
      { id: 'consumer_care', name: 'Consumer Helpline & Grievance Info', status: 'DETECTED', value: '1800-103-1947, wecare@in.nestle.com', legalRule: 'Rule 6(1)(g)' },
      { id: 'country_of_origin', name: 'Country of Origin (Imported units)', status: 'DETECTED', value: 'Made in India', legalRule: 'Rule 6(1)(h)' },
    ],
    fontCompliance: {
      rule: 'Rule 9 & Table-I',
      status: 'COMPLIANT',
      packageWeightBracket: '50g - 200g',
      prescribedMinHeightMm: '2.0 mm',
      prescribedMinHeightPt: '6 pt',
      readabilityIndex: '98% Pass',
    },
    violations: [],
  }
};

export default function App() {
  const [deviceId, setDeviceId] = useState('');
  const [userProfile, setUserProfile] = useState({
    allergies: ['dairy', 'peanut'],
    conditions: ['diabetic'],
    sugar_threshold: 15.0,
    sodium_threshold: 400.0,
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['scan', 'medical', 'allergies', 'forum'].includes(hash)) return hash;
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (['scan', 'medical', 'allergies', 'forum'].includes(tab)) return tab;
    }
    return 'scan';
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('packscan_theme') || 'midnight';
    }
    return 'midnight';
  });

  useEffect(() => {
    if (theme === 'steel-ice') {
      document.body.classList.add('theme-steel-ice');
      document.body.classList.remove('theme-midnight');
    } else {
      document.body.classList.remove('theme-steel-ice');
      document.body.classList.add('theme-midnight');
    }
    localStorage.setItem('packscan_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'midnight' ? 'steel-ice' : 'midnight'));
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['scan', 'medical', 'allergies', 'forum'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [unlistedBarcode, setUnlistedBarcode] = useState('');
  const [presets, setPresets] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFoundInfo, setNotFoundInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Initialize device ID & load profile from localStorage and API
  useEffect(() => {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    setDeviceId(id);

    const savedLocal = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedLocal) {
      try {
        setUserProfile(JSON.parse(savedLocal));
      } catch (e) {}
    }

    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
      }
    } catch (err) {
      console.warn('Failed to load presets:', err.message);
    }
  };

  const handleSaveProfile = async (newProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          ...newProfile,
        }),
      });
    } catch (err) {
      console.warn('Profile sync failed, cached locally:', err.message);
    }

    // Refresh active product analysis with the new profile if scan result exists
    if (scanResult?.product?.barcode) {
      handleScanBarcode(scanResult.product.barcode, newProfile);
    }
  };

  // 1. Scan Barcode API
  const handleScanBarcode = async (barcode, profileOverride = null) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundInfo(null);

    try {
      const res = await fetch('/api/scan/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          userProfile: profileOverride || userProfile,
          deviceId,
        }),
      });

      const data = await res.json();
      if (res.status === 404 || data.status === 'NOT_FOUND') {
        setNotFoundInfo({
          barcode: data.barcode || barcode,
          message: data.message || `Barcode "${barcode}" is not available in our database.`,
        });
        setScanResult(null);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to lookup product');
      }

      setScanResult(data);
      scrollToResult();
    } catch (err) {
      console.error('Barcode scan error:', err);
      setErrorMessage(err.message || 'Product lookup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Multi-Evidence Scan API (Guided Flow)
  const handleMultiStepScan = async (capturedData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundInfo(null);

    try {
      const formData = new FormData();
      if (capturedData.barcode) {
        formData.append('barcode', capturedData.barcode);
      }
      if (capturedData.frontPhoto) {
        formData.append('frontPhoto', capturedData.frontPhoto);
      }
      if (capturedData.backPhoto) {
        formData.append('backPhoto', capturedData.backPhoto);
      }
      if (capturedData.sidePhoto) {
        formData.append('sidePhoto', capturedData.sidePhoto);
      }
      if (userProfile) {
        formData.append('userProfile', JSON.stringify(userProfile));
      }
      formData.append('deviceId', deviceId);

      const response = await fetch('/api/scan/multi-evidence', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || `Scan processing failed (Status: ${response.status})`);
      }

      const result = await response.json();
      setScanResult(result);
      scrollToResult();
    } catch (err) {
      console.error('[Multi-step scan error]:', err);
      setErrorMessage(err.message || 'Multi-angle scan failed to process');
    } finally {
      setIsLoading(false);
    }
  };

  // Add extra angle photo and merge results
  const handleAddAdditionalPhoto = async (additionalFile) => {
    if (!scanResult) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('additionalPhoto', additionalFile);
      if (scanResult?.product?.barcode) {
        formData.append('barcode', scanResult.product.barcode);
      }
      formData.append('userProfile', JSON.stringify(userProfile || {}));

      const res = await fetch('/api/scan/multi-evidence', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setScanResult((prev) => {
          if (!prev) return updated;
          const mergedFields = prev.complianceReport.fields.map((oldField) => {
            if (oldField.status === 'DETECTED') return oldField;
            const newMatch = updated.complianceReport.fields.find((f) => f.id === oldField.id);
            return newMatch && newMatch.status === 'DETECTED' ? newMatch : oldField;
          });
          const detectedCount = mergedFields.filter((f) => f.status === 'DETECTED').length;
          return {
            ...updated,
            complianceReport: {
              ...updated.complianceReport,
              fields: mergedFields,
              score: detectedCount,
              compliancePercentage: Math.round((detectedCount / 8) * 100),
              overallStatus:
                detectedCount === 8
                  ? 'COMPLIANT'
                  : detectedCount >= 5
                  ? 'PARTIALLY_COMPLIANT'
                  : 'NON_COMPLIANT',
            },
          };
        });
      }
    } catch (err) {
      console.error('Additional photo merge error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset) => {
    handleScanBarcode(preset.barcode);
  };

  const openFeedbackWithBarcode = (bc) => {
    setUnlistedBarcode(bc);
    setIsFeedbackOpen(true);
  };

  const handleUpdateProductField = async (fieldName, fieldValue) => {
    if (!scanResult?.product?.barcode) return;
    const barcode = scanResult.product.barcode;
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(barcode)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [fieldName]: fieldValue,
          confidence: 'high',
        }),
      });
      if (res.ok) {
        setScanResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            product: {
              ...prev.product,
              confidence: 'high',
              dataSource: prev.product.dataSource === 'ocr' ? 'ocr_cache' : prev.product.dataSource,
            },
          };
        });
      }
    } catch (e) {
      console.error('Failed to update product field:', e);
    }
  };

  const scrollToResult = () => {
    setTimeout(() => {
      const el = document.getElementById('results-anchor');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setNotFoundInfo(null);
    setErrorMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.location.hash = tabId;
    }
    if (tabId === 'allergies') {
      setIsProfileOpen(true);
    } else if (tabId === 'forum') {
      setIsFeedbackOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-[#cbd5e1] font-['Inter'] antialiased flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* TOP APP NAVIGATION (UNIFIED GLOBAL HEADER) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userProfile={userProfile}
        onResetScan={handleNewScan}
        hasActiveResult={Boolean(scanResult || notFoundInfo)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* MAIN WRAPPER */}
      <main className="w-full pt-32 max-w-[1280px] mx-auto px-4 sm:px-6 flex-1">
        {activeTab === 'medical' ? (
          <MedicalProfileView
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onNavigateTab={handleSelectTab}
          />
        ) : activeTab === 'allergies' ? (
          <AllergiesThresholdView
            userProfile={userProfile}
            onSaveProfile={handleSaveProfile}
            onNavigateTab={handleSelectTab}
          />
        ) : activeTab === 'forum' ? (
          <ProductForumLedgerView
            deviceId={deviceId}
            onSelectProductForAudit={(p) => {
              handleSelectTab('scan');
              if (p?.barcode) handleScanBarcode(p.barcode);
            }}
          />
        ) : (
          <div className="flex flex-col w-full pb-16 space-y-6">

          {/* SECTION 1: Compliance Banner (Refined Bluish Slate Card) */}
          <section className="w-full bg-[#111c33] rounded-xl p-6 sm:p-7 border border-[#1e2f52] shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/80 font-['JetBrains_Mono'] text-[10.5px] font-bold uppercase tracking-wider rounded">
                    LEGAL METROLOGY ACT, 2011
                  </span>
                  <span className="text-[#1e2f52] font-mono">|</span>
                  <span className="font-['JetBrains_Mono'] text-[11.5px] font-semibold text-slate-400">
                    DIRECTIVE 2024/LM-8B
                  </span>
                </div>
                <h1 className="font-['Space_Grotesk'] text-[26px] sm:text-[30px] leading-tight text-slate-100 font-extrabold tracking-tight">
                  Legal Metrology Compliance &amp; Health Guardian
                </h1>
                <p className="text-[14px] leading-relaxed text-slate-300 max-w-2xl font-normal">
                  Instant automated audit for mandatory declarations under Rule 6 &amp; 9, coupled with personalized allergen and additive checking.
                </p>

                {/* 3-Tier Badges Standardized */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 border border-cyan-800/80 text-cyan-300 rounded-md font-['Space_Grotesk'] text-[12px] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Rule 6 &amp; 9 Mandatory Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-950/40 border border-orange-800/80 text-orange-300 rounded-md font-['Space_Grotesk'] text-[12px] font-semibold">
                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Allergen &amp; Additive Guard</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0e172a] border border-[#1e2f52] text-slate-300 rounded-md font-['Space_Grotesk'] text-[12px] font-semibold">
                    <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Section 36 Notice Exporter</span>
                  </div>
                </div>
              </div>

              {/* Telemetry Readouts */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 w-full lg:w-72 shrink-0">
                <div className="bg-[#0e172a] border border-[#1e2f52] p-3.5 rounded-lg flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-['JetBrains_Mono'] text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Audited
                    </div>
                    <div className="font-['Space_Grotesk'] text-[28px] font-extrabold text-slate-100 leading-none mt-1">
                      1,248
                    </div>
                    <div className="font-['JetBrains_Mono'] text-[11px] font-semibold text-cyan-400 mt-1.5 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Batch Q4 Complete</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <Package className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>

                <div className="bg-[#0e172a] border border-[#1e2f52] p-3.5 rounded-lg flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-['JetBrains_Mono'] text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Non-Compliance Ratio
                    </div>
                    <div className="font-['Space_Grotesk'] text-[28px] font-extrabold text-orange-400 leading-none mt-1">
                      8.4%
                    </div>
                    <div className="font-['JetBrains_Mono'] text-[11px] font-semibold text-orange-400 mt-1.5">
                      105 Violations Logged
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-950/60 border border-orange-800/80 flex items-center justify-center text-orange-400">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                </div>

                <div className="bg-[#0e172a] border border-[#1e2f52] p-3.5 rounded-lg flex items-center justify-between shadow-xs">
                  <div>
                    <div className="font-['JetBrains_Mono'] text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Avg Latency
                    </div>
                    <div className="font-['Space_Grotesk'] text-[28px] font-extrabold text-slate-100 leading-none mt-1">
                      &lt;12ms
                    </div>
                    <div className="font-['JetBrains_Mono'] text-[11px] font-semibold text-slate-400 mt-1.5">
                      Hardware OCR Engine
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: Precision Viewfinder Workspace & Plain Language Rule 6 Checklist */}
          <Scanner
            onCompleteMultiStepScan={handleMultiStepScan}
            onScanDirectBarcode={handleScanBarcode}
            isLoading={isLoading}
            scanResult={scanResult}
            onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
            onResetScan={handleNewScan}
          />

          {/* SECTION 3: QUICK 1-CLICK FMCG DEMO CATALOG */}
          <DemoPresetBar
            presets={presets}
            onSelectPreset={handleSelectPreset}
            isLoading={isLoading}
          />

          {/* SECTION 4: Execution Pipeline Tracker */}
          <section className="w-full bg-[#111c33] rounded-xl p-4 sm:p-5 border border-[#1e2f52] shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-400 font-['JetBrains_Mono'] text-[12px]">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="uppercase tracking-wider font-bold text-slate-200">
                  Statutory Execution Pipeline
                </span>
              </div>

              {/* Steps Pipeline with Bluish theme */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto font-['JetBrains_Mono'] text-[12px]">
                <div className="flex items-center gap-2 bg-[#0e172a] border border-[#1e2f52] px-3 py-1.5 rounded-md">
                  <span className="w-5 h-5 rounded-full bg-[#1e2f52] text-slate-300 flex items-center justify-center font-bold text-[11px]">
                    01
                  </span>
                  <span className="text-slate-300 font-medium">Label Ingestion</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0e172a] border border-[#1e2f52] px-3 py-1.5 rounded-md">
                  <span className="w-5 h-5 rounded-full bg-[#1e2f52] text-slate-300 flex items-center justify-center font-bold text-[11px]">
                    02
                  </span>
                  <span className="text-slate-300 font-medium">OCR Extraction</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0e172a] border border-[#1e2f52] px-3 py-1.5 rounded-md">
                  <span className="w-5 h-5 rounded-full bg-[#1e2f52] text-slate-300 flex items-center justify-center font-bold text-[11px]">
                    03
                  </span>
                  <span className="text-slate-300 font-medium">Rule 9 Optical</span>
                </div>
                <div className="flex items-center gap-2 bg-cyan-900/50 border border-cyan-700/80 text-cyan-200 px-3 py-1.5 rounded-md shadow-xs">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center font-bold text-[11px]">
                    04
                  </span>
                  <span className="font-bold">Health Match</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-['JetBrains_Mono'] text-[11.5px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>LATENCY: 8.2MS READY</span>
              </div>
            </div>
          </section>

          {/* Product Not Found in Database Banner */}
          {notFoundInfo && (
            <div className="p-6 bg-[#111c33] border border-orange-500/80 rounded-xl shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-lg bg-orange-950/60 border border-orange-800/80 text-orange-400 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-100">Product Not Available in Database</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0e172a] text-orange-400 border border-orange-800/60">
                      #{notFoundInfo.barcode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    This product barcode is not currently registered in OpenFoodFacts or our local Indian FMCG registry.
                    You can request our team to audit and add it in the Community Feedback Forum, or take a photo of the label for instant OCR analysis!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#1e2f52]">
                <button
                  type="button"
                  onClick={() => openFeedbackWithBarcode(notFoundInfo.barcode)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Request in Community Forum</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotFoundInfo(null)}
                  className="px-4 py-2 bg-[#0e172a] hover:bg-[#182642] text-slate-300 font-semibold rounded-lg text-xs border border-[#1e2f52] transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-orange-950/50 border border-orange-800/80 rounded-xl flex items-start space-x-3 text-orange-300 text-xs animate-fadeIn shadow-xs">
              <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-orange-400 hover:text-orange-200 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: DETAILED AUDIT REPORT (Rendered when product is scanned/selected) */}
          {/* ========================================================================= */}
          {scanResult && (
            <div id="results-anchor" className="space-y-6 pt-4 animate-fadeIn">
              {/* Target Product Banner */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#111c33] border border-[#1e2f52] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <div className="text-[10px] font-['JetBrains_Mono'] uppercase text-cyan-400 font-bold tracking-wider">
                    AUDITED COMMODITY DOSSIER
                  </div>
                  <h3 className="text-xl font-['Space_Grotesk'] font-extrabold text-slate-100 mt-0.5">
                    {scanResult.product?.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 font-['JetBrains_Mono']">
                    Brand: <span className="text-slate-200 font-semibold">{scanResult.product?.brand}</span> • Category:{' '}
                    <span className="text-slate-200 font-semibold">{scanResult.product?.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  {scanResult.product?.dataSource && (
                    <DataSourceBadge
                      dataSource={scanResult.product.dataSource}
                      confidence={scanResult.product.confidence}
                    />
                  )}
                  {scanResult.product?.barcode && (
                    <div className="font-['JetBrains_Mono'] text-xs px-3 py-1.5 rounded-lg bg-[#0e172a] border border-[#1e2f52] text-slate-300 font-semibold">
                      Barcode: {scanResult.product.barcode}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleNewScan}
                    className="px-3.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 font-['Space_Grotesk'] font-bold rounded-lg text-xs border border-cyan-800 transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                    title="Reset and scan another product"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Scan Another Product</span>
                  </button>
                </div>
              </div>

              {/* 1. Legal Metrology Compliance Report */}
              <ComplianceReport
                report={scanResult.complianceReport}
                productName={scanResult.product?.name}
                barcode={scanResult.product?.barcode}
                dataSource={scanResult.product?.dataSource}
                confidence={scanResult.product?.confidence}
                imageUrl={scanResult.product?.imageUrl}
                product={scanResult.product}
                onUpdateProductField={handleUpdateProductField}
                onAddAdditionalPhoto={handleAddAdditionalPhoto}
                onNewScan={handleNewScan}
              />

              {/* 2. Personalized Health & Allergy Alerts */}
              <HealthAlerts
                healthEvaluation={scanResult.healthEvaluation}
                userProfile={userProfile}
                onOpenProfile={() => setIsProfileOpen(true)}
              />

              {/* 3. Multi-Country Regulatory Additives Comparison */}
              <RegulatoryComparison additives={scanResult.regulatoryAdditives} />

              {/* 4. Alternative Product Suggestions */}
              <AlternativeSuggestions alternatives={scanResult.alternatives} />

              {/* 5. Raw Extracted Text & Metadata Inspection Drawer */}
              <RawLabelViewer
                rawText={scanResult.rawExtractedText}
                product={scanResult.product}
              />
            </div>
          )}
        </div>
        )}
      </main>

      {/* FOOTER (UNIFIED GLOBAL FOOTER) */}
      <footer className="w-full bg-[#0e1628] border-t border-[#1e2f52] py-4 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 font-['JetBrains_Mono'] text-[11.5px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">PackScan Node ID: 26034-IN</span>
            <span>•</span>
            <span>Legal Metrology (Packaged Commodities) Rules, 2011 Enforcement Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Systems Operational</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>FSSAI Lab Matrix v2.4</span>
          </div>
        </div>
      </footer>

      {/* Section 36 Inspection Notice Modal */}
      <InspectionNoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        inspectionData={scanResult || sampleInspectionData}
      />

      {/* Profile Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Product Request & Feedback Forum Modal */}
      <FeedbackForumModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialBarcode={unlistedBarcode}
        deviceId={deviceId}
      />
    </div>
  );
}
