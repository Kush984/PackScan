import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from './utils/api';
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
  UserCheck,
  Sliders,
} from 'lucide-react';

const DEVICE_ID_KEY = 'packscan_device_id';
const PROFILE_STORAGE_KEY = 'packscan_user_profile';

const safeStorage = {
  getItem: (key) => {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch (_) {
      return null;
    }
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (_) {}
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (_) {}
  }
};

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
    allergies: [],
    conditions: [],
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
    return safeStorage.getItem('packscan_theme') || 'midnight';
  });

  useEffect(() => {
    if (theme === 'steel-ice') {
      document.body.classList.add('theme-steel-ice');
      document.body.classList.remove('theme-midnight');
    } else {
      document.body.classList.remove('theme-steel-ice');
      document.body.classList.add('theme-midnight');
    }
    safeStorage.setItem('packscan_theme', theme);
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
    let id = safeStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      safeStorage.setItem(DEVICE_ID_KEY, id);
    }
    setDeviceId(id);

    const savedLocal = safeStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedLocal) {
      try {
        const parsed = JSON.parse(savedLocal);
        const isLegacy3Flags =
          parsed &&
          Array.isArray(parsed.allergies) &&
          parsed.allergies.includes('dairy') &&
          parsed.allergies.includes('peanut') &&
          Array.isArray(parsed.conditions) &&
          parsed.conditions.includes('diabetic') &&
          parsed.allergies.length === 2 &&
          parsed.conditions.length === 1;

        if (isLegacy3Flags) {
          safeStorage.removeItem(PROFILE_STORAGE_KEY);
          setUserProfile({
            allergies: [],
            conditions: [],
            sugar_threshold: 15.0,
            sodium_threshold: 400.0,
          });
        } else if (parsed) {
          setUserProfile(parsed);
        }
      } catch (e) {}
    }

    // Also sync saved profile from backend if available for this device
    apiFetch(`/api/profile/${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          const isLegacy3Flags =
            Array.isArray(data.allergies) &&
            data.allergies.includes('dairy') &&
            data.allergies.includes('peanut') &&
            Array.isArray(data.conditions) &&
            data.conditions.includes('diabetic') &&
            data.allergies.length === 2 &&
            data.conditions.length === 1;

          if (!isLegacy3Flags && (data.allergies?.length > 0 || data.conditions?.length > 0)) {
            setUserProfile((prev) => ({
              ...prev,
              allergies: data.allergies || prev.allergies,
              conditions: data.conditions || prev.conditions,
              sugar_threshold: data.sugar_threshold !== undefined ? data.sugar_threshold : prev.sugar_threshold,
              sodium_threshold: data.sodium_threshold !== undefined ? data.sodium_threshold : prev.sodium_threshold,
            }));
          }
        }
      })
      .catch((err) => console.warn('Could not sync remote profile:', err.message));

    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await apiFetch('/api/presets');
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
    safeStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));

    try {
      await apiFetch('/api/profile', {
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

    // Refresh active product health evaluation with the new profile (preserving packaging compliance report!)
    if (scanResult?.product) {
      try {
        const res = await apiFetch('/api/scan/re-evaluate-health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: newProfile,
            product: scanResult.product,
            rawExtractedText: scanResult.rawExtractedText,
          }),
        });
        if (res.ok) {
          const updatedHealth = await res.json();
          setScanResult((prev) => (prev ? {
            ...prev,
            healthEvaluation: updatedHealth.healthEvaluation,
            alternatives: updatedHealth.alternatives,
          } : prev));
        }
      } catch (err) {
        console.warn('Health re-evaluation error:', err.message);
      }
    }
  };

  // 1. Scan Barcode API
  const handleScanBarcode = async (barcode, profileOverride = null) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundInfo(null);

    try {
      const res = await apiFetch('/api/scan/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barcode,
          userProfile: profileOverride || userProfile,
          deviceId,
        }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        throw new Error(`Server connection issue (${res.status}: ${res.statusText || 'Unexpected response'})`);
      }

      if (res.status === 404 || data.status === 'NOT_FOUND') {
        setNotFoundInfo({
          barcode: data.barcode || barcode,
          message: data.message || `Barcode "${barcode}" is not available in our database.`,
        });
        setScanResult(null);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || `Product lookup failed (Status: ${res.status})`);
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

  // 2. Multi-angle photo capture scan handler
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

      const response = await apiFetch('/api/scan/multi-evidence', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (_) {
        throw new Error(`Scan processing failed (${response.status}: ${response.statusText || 'Invalid response from server'})`);
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || `Scan processing failed (Status: ${response.status})`);
      }

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

      const res = await apiFetch('/api/scan/multi-evidence', {
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
      console.warn('Failed to add additional photo:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Single Label / OCR Scan API
  const handleScanImage = async (imageFile, barcode = null) => {
    setIsLoading(true);
    setErrorMessage(null);
    setNotFoundInfo(null);

    try {
      const formData = new FormData();
      formData.append('labelImage', imageFile);
      if (barcode) formData.append('barcode', barcode);
      if (userProfile) formData.append('userProfile', JSON.stringify(userProfile));
      formData.append('deviceId', deviceId);

      const res = await apiFetch('/api/scan/image', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_) {
        throw new Error(`Image processing failed (${res.status}: ${res.statusText || 'Invalid response from server'})`);
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || `Image OCR processing failed (Status: ${res.status})`);
      }

      setScanResult(data);
      scrollToResult();
    } catch (err) {
      console.error('Image scan error:', err);
      setErrorMessage(err.message || 'Image OCR processing failed');
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
      const res = await apiFetch(`/api/products/${encodeURIComponent(barcode)}`, {
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
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2a2622] font-['Inter'] antialiased flex flex-col selection:bg-[#f6dfd5] selection:text-[#6f331f]">
      {/* TOP APP NAVIGATION (UNIFIED GLOBAL HEADER) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        userProfile={userProfile}
        onResetScan={handleNewScan}
        hasActiveResult={Boolean(scanResult || notFoundInfo)}
      />

      {/* MAIN WRAPPER WITH TAB CROSSFADE TRANSITION */}
      <main className="w-full max-w-[1280px] mx-auto px-3 sm:px-6 flex-1 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'medical' ? (
            <motion.div
              key="medical"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <MedicalProfileView
                userProfile={userProfile}
                onSaveProfile={handleSaveProfile}
                onNavigateTab={handleSelectTab}
              />
            </motion.div>
          ) : activeTab === 'allergies' ? (
            <motion.div
              key="allergies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <AllergiesThresholdView
                userProfile={userProfile}
                onSaveProfile={handleSaveProfile}
                onNavigateTab={handleSelectTab}
              />
            </motion.div>
          ) : activeTab === 'forum' ? (
            <motion.div
              key="forum"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <ProductForumLedgerView
                deviceId={deviceId}
                onSelectProductForAudit={(p) => {
                  handleSelectTab('scan');
                  if (p?.barcode) handleScanBarcode(p.barcode);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col w-full pb-16 space-y-6"
            >
              {/* SECTION 1: Compliance Banner (Refined White Card on Warm Stone) */}
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full bg-white rounded-xl p-4 sm:p-7 border border-[#e8e2d8] shadow-xs relative overflow-hidden"
              >
                {/* Subtle Ambient Warm Glow */}
                <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#b8532f]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
                  <div className="max-w-3xl space-y-2.5 sm:space-y-3">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#fbf2ed] text-[#b8532f] border border-[#ecc2b0] font-['Space_Grotesk'] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded">
                        LEGAL METROLOGY ACT, 2011
                      </span>
                      <span className="text-[#ded6c7] font-sans">|</span>
                      <span className="font-['Space_Grotesk'] text-[11px] sm:text-[12px] font-semibold text-[#8c8278]">
                        DIRECTIVE 2024/LM-8B
                      </span>
                    </div>
                    <h1 className="font-['Space_Grotesk'] text-[21px] sm:text-[30px] leading-tight text-[#2a2622] font-extrabold tracking-tight">
                      Legal Metrology Compliance &amp; Health Guardian
                    </h1>
                    <p className="text-[13px] sm:text-[15px] leading-relaxed text-[#5c554e] max-w-2xl font-normal">
                      Instant automated statutory audit for mandatory declarations under Rule 6 &amp; 9, coupled with personalized allergen and additive checking.
                    </p>

                    {/* 3-Tier Badges Standardized */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#fbf2ed] border border-[#ecc2b0] text-[#b8532f] rounded-md font-['Space_Grotesk'] text-[11.5px] sm:text-[13px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#b8532f] shrink-0" />
                        <span>Rule 6 &amp; 9 Mandatory Verification</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#fdf5e6] border border-[#eed69e] text-[#926325] rounded-md font-['Space_Grotesk'] text-[11.5px] sm:text-[13px] font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#c99a3e] shrink-0" />
                        <span>Allergen &amp; Additive Guard</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#faf7f2] border border-[#e8e2d8] text-[#5c554e] rounded-md font-['Space_Grotesk'] text-[11.5px] sm:text-[13px] font-semibold">
                        <Scale className="w-3.5 h-3.5 text-[#8c8278] shrink-0" />
                        <span>Section 36 Notice Exporter</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Readouts */}
                  <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3 w-full lg:w-72 shrink-0">
                    <div className="bg-[#faf7f2] border border-[#e8e2d8] p-2.5 sm:p-3.5 rounded-lg flex items-center justify-between shadow-2xs">
                      <div className="min-w-0 w-full">
                        <div className="text-[9.5px] sm:text-[11px] font-bold text-[#8c8278] uppercase tracking-wider font-['Space_Grotesk'] truncate">
                          Total Audited
                        </div>
                        <div className="font-['Space_Grotesk'] text-[19px] sm:text-[28px] font-extrabold text-[#2a2622] leading-tight mt-0.5 sm:mt-1">
                          1,248
                        </div>
                        <div className="text-[10px] sm:text-[12px] font-semibold text-[#b8532f] mt-0.5 sm:mt-1.5 flex items-center gap-1 truncate">
                          <TrendingUp className="w-3 h-3 text-[#b8532f] shrink-0" />
                          <span className="truncate">Batch Q4</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex w-10 h-10 rounded-lg bg-[#fbf2ed] border border-[#ecc2b0] items-center justify-center text-[#b8532f] shrink-0 ml-2">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#faf7f2] border border-[#e8e2d8] p-2.5 sm:p-3.5 rounded-lg flex items-center justify-between shadow-2xs">
                      <div className="min-w-0 w-full">
                        <div className="text-[9.5px] sm:text-[11px] font-bold text-[#8c8278] uppercase tracking-wider font-['Space_Grotesk'] truncate">
                          Non-Compliance
                        </div>
                        <div className="font-['Space_Grotesk'] text-[19px] sm:text-[28px] font-extrabold text-[#be123c] leading-tight mt-0.5 sm:mt-1">
                          8.4%
                        </div>
                        <div className="text-[10px] sm:text-[12px] font-semibold text-[#be123c] mt-0.5 sm:mt-1.5 truncate">
                          105 Violations
                        </div>
                      </div>
                      <div className="hidden sm:flex w-10 h-10 rounded-lg bg-[#fff1f2] border border-[#fecdd3] items-center justify-center text-[#be123c] shrink-0 ml-2">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="bg-[#faf7f2] border border-[#e8e2d8] p-2.5 sm:p-3.5 rounded-lg flex items-center justify-between shadow-2xs">
                      <div className="min-w-0 w-full">
                        <div className="text-[9.5px] sm:text-[11px] font-bold text-[#8c8278] uppercase tracking-wider font-['Space_Grotesk'] truncate">
                          Avg Latency
                        </div>
                        <div className="font-['Space_Grotesk'] text-[19px] sm:text-[28px] font-extrabold text-[#2a2622] leading-tight mt-0.5 sm:mt-1">
                          &lt;12ms
                        </div>
                        <div className="text-[10px] sm:text-[12px] font-semibold text-[#5c554e] mt-0.5 sm:mt-1.5 truncate">
                          Hardware OCR
                        </div>
                      </div>
                      <div className="hidden sm:flex w-10 h-10 rounded-lg bg-[#fdf5e6] border border-[#eed69e] items-center justify-center text-[#926325] shrink-0 ml-2">
                        <Zap className="w-5 h-5 text-[#c99a3e]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* SECTION 2: Precision Viewfinder Workspace & Plain Language Rule 6 Checklist */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08, ease: 'easeOut' }}
                className="space-y-3"
              >
                {/* Live Presenter Health Profile Switcher */}
                <div className="bg-white border border-[#e8e2d8] rounded-xl p-3 sm:p-3.5 shadow-xs">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                    {/* Active Profile Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#faf7f2] border border-[#e8e2d8] flex items-center justify-center text-[#b8532f] shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-['Space_Grotesk'] text-[11px] sm:text-xs font-bold text-[#2a2622] uppercase tracking-wider">
                            Health Profile:
                          </span>
                          <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            userProfile?.allergies?.includes('gluten')
                              ? 'bg-[#fff1f2] border-[#fecdd3] text-[#be123c]'
                              : userProfile?.conditions?.includes('diabetic')
                              ? 'bg-[#fdf2ec] border-[#f5d5c6] text-[#b8532f]'
                              : (userProfile?.allergies?.length > 0 || userProfile?.conditions?.length > 0)
                              ? 'bg-[#fdf9ee] border-[#f2e5be] text-[#8a651e]'
                              : 'bg-[#faf7f2] border-[#e8e2d8] text-[#78716c]'
                          }`}>
                            {userProfile?.allergies?.includes('gluten')
                              ? '🌾 Profile 1: Gluten Allergy (Maggi Demo)'
                              : userProfile?.conditions?.includes('diabetic')
                              ? '🩸 Profile 2: Diabetic Profile (Coke Demo)'
                              : (userProfile?.allergies?.length > 0 || userProfile?.conditions?.length > 0)
                              ? `${userProfile.allergies.length} Allergies, ${userProfile.conditions.length} Conditions`
                              : 'Standard / 0 Flags (Clean Slate)'}
                          </span>
                        </div>
                        <p className="text-[10.5px] sm:text-[11px] text-[#78716c] truncate mt-0.5">
                          {userProfile?.allergies?.includes('gluten')
                            ? 'Flags wheat flour, maida, and wheat gluten in Maggi on scan.'
                            : userProfile?.conditions?.includes('diabetic')
                            ? 'Flags high liquid sugar and glycemic load in Coca-Cola on scan.'
                            : (userProfile?.allergies?.length > 0 || userProfile?.conditions?.length > 0)
                            ? 'Custom allergen and condition thresholds active.'
                            : 'No flags preselected. Tap a preset below for presentation, or customize.'}
                        </p>
                      </div>
                    </div>

                    {/* Preset Buttons */}
                    <div className="grid grid-cols-2 sm:flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveProfile({ allergies: [], conditions: [], sugar_threshold: 15.0, sodium_threshold: 400.0 })}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer text-center truncate ${
                          userProfile?.allergies?.length === 0 && userProfile?.conditions?.length === 0
                            ? 'bg-[#2a2622] border-[#2a2622] text-white shadow-2xs'
                            : 'bg-[#faf7f2] hover:bg-[#f4efe6] border-[#e8e2d8] text-[#5c554e]'
                        }`}
                      >
                        0 Flags (Clean)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveProfile({ allergies: ['gluten'], conditions: [], sugar_threshold: 15.0, sodium_threshold: 400.0 })}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
                          userProfile?.allergies?.includes('gluten') && userProfile?.conditions?.length === 0
                            ? 'bg-[#be123c] border-[#be123c] text-white shadow-2xs'
                            : 'bg-white hover:bg-[#fff1f2] border-[#e8e2d8] text-[#be123c]'
                        }`}
                        title="Profile for Presenter 1 (Maggi with Gluten Allergy)"
                      >
                        <span>🌾</span>
                        <span className="truncate">Gluten (Maggi)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveProfile({ allergies: [], conditions: ['diabetic'], sugar_threshold: 15.0, sodium_threshold: 400.0 })}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 truncate ${
                          userProfile?.conditions?.includes('diabetic') && userProfile?.allergies?.length === 0
                            ? 'bg-[#b8532f] border-[#b8532f] text-white shadow-2xs'
                            : 'bg-white hover:bg-[#fdf2ec] border-[#e8e2d8] text-[#b8532f]'
                        }`}
                        title="Profile for Presenter 2 (Coca-Cola with Diabetic Condition)"
                      >
                        <span>🩸</span>
                        <span className="truncate">Diabetic (Coke)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsProfileOpen(true)}
                        className="px-2.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold bg-[#faf7f2] hover:bg-[#f4efe6] border border-[#e8e2d8] text-[#2a2622] transition-all cursor-pointer flex items-center justify-center gap-1 truncate"
                      >
                        <Sliders className="w-3 h-3 text-[#78716c] shrink-0" />
                        <span>Customize...</span>
                      </button>
                    </div>
                  </div>
                </div>
                <Scanner
                  onCompleteMultiStepScan={handleMultiStepScan}
                  onScanDirectBarcode={handleScanBarcode}
                  onScanImage={handleScanImage}
                  isLoading={isLoading}
                  scanResult={scanResult}
                  onOpenNoticeModal={() => setIsNoticeModalOpen(true)}
                  onResetScan={handleNewScan}
                />
              </motion.div>

              {/* SECTION 3: QUICK 1-CLICK FMCG DEMO CATALOG */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.14, ease: 'easeOut' }}
              >
                <DemoPresetBar
                  presets={presets}
                  onSelectPreset={handleSelectPreset}
                  isLoading={isLoading}
                />
              </motion.div>

              {/* SECTION 4: Execution Pipeline Tracker */}
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
                className="w-full bg-white rounded-xl p-4 sm:p-5 border border-[#e8e2d8] shadow-xs"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[#5c554e] text-[13px]">
                    <Cpu className="w-4 h-4 text-[#b8532f] shrink-0" />
                    <span className="uppercase tracking-wider font-bold text-[#2a2622] font-['Space_Grotesk']">
                      Statutory Execution Pipeline
                    </span>
                  </div>

                  {/* Steps Pipeline with Terracotta / Stone Theme */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto text-[13px]">
                    <div className="flex items-center gap-2 bg-[#faf7f2] border border-[#e8e2d8] px-3 py-1.5 rounded-md">
                      <span className="w-5 h-5 rounded-full bg-[#e8e2d8] text-[#5c554e] flex items-center justify-center font-bold text-[11px]">
                        01
                      </span>
                      <span className="text-[#5c554e] font-medium">Label Ingestion</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#faf7f2] border border-[#e8e2d8] px-3 py-1.5 rounded-md">
                      <span className="w-5 h-5 rounded-full bg-[#e8e2d8] text-[#5c554e] flex items-center justify-center font-bold text-[11px]">
                        02
                      </span>
                      <span className="text-[#5c554e] font-medium">OCR Extraction</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#faf7f2] border border-[#e8e2d8] px-3 py-1.5 rounded-md">
                      <span className="w-5 h-5 rounded-full bg-[#e8e2d8] text-[#5c554e] flex items-center justify-center font-bold text-[11px]">
                        03
                      </span>
                      <span className="text-[#5c554e] font-medium">Rule 9 Optical</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#fbf2ed] border border-[#ecc2b0] text-[#b8532f] px-3 py-1.5 rounded-md shadow-xs">
                      <span className="w-5 h-5 rounded-full bg-[#b8532f] text-white flex items-center justify-center font-bold text-[11px]">
                        04
                      </span>
                      <span className="font-bold">Health Match</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#8c8278] text-[12px] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#b8532f] animate-pulse"></span>
                    <span>LATENCY: 8.2MS READY</span>
                  </div>
                </div>
              </motion.section>

              {/* Product Not Found in Database Banner */}
              {notFoundInfo && (
                <div className="p-6 bg-white border-2 border-[#be123c] rounded-xl shadow-xs space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-lg bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] shrink-0">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-[#2a2622]">Product Not Available in Database</h3>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]">
                          #{notFoundInfo.barcode}
                        </span>
                      </div>
                      <p className="text-sm text-[#5c554e] mt-1 leading-relaxed max-w-2xl">
                        This product barcode is not currently registered in OpenFoodFacts or our local Indian FMCG registry.
                        You can request our team to audit and add it in the Community Feedback Forum, or take a photo of the label for instant OCR analysis!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#fecdd3]">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={() => openFeedbackWithBarcode(notFoundInfo.barcode)}
                      className="px-4 py-2 bg-[#b8532f] hover:bg-[#a34a2b] text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                      <span>Request in Community Forum</span>
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setNotFoundInfo(null)}
                      className="px-4 py-2 bg-[#faf7f2] hover:bg-[#f4efe6] text-[#5c554e] font-semibold rounded-lg text-xs border border-[#e8e2d8] transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Global Error Banner */}
              {errorMessage && (
                <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] rounded-xl flex items-start space-x-3 text-[#be123c] text-xs shadow-xs">
                  <AlertCircle className="w-5 h-5 text-[#be123c] shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-[#be123c] hover:text-[#9f1239] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 5: DETAILED AUDIT REPORT (Rendered when product is scanned/selected) */}
              {/* ========================================================================= */}
              {scanResult && (
                <div id="results-anchor" className="space-y-6 pt-4">
                  {/* Target Product Banner */}
                  <div className="p-5 rounded-xl bg-white border border-[#e8e2d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="text-[11px] uppercase text-[#b8532f] font-bold tracking-wider font-['Space_Grotesk']">
                        AUDITED COMMODITY DOSSIER
                      </div>
                      <h3 className="text-xl font-['Space_Grotesk'] font-extrabold text-[#2a2622] mt-0.5">
                        {scanResult.product?.name}
                      </h3>
                      <div className="text-[13px] text-[#5c554e] mt-1">
                        Brand: <span className="text-[#2a2622] font-semibold">{scanResult.product?.brand}</span> • Category:{' '}
                        <span className="text-[#2a2622] font-semibold">{scanResult.product?.category}</span>
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
                        <div className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#faf7f2] border border-[#e8e2d8] text-[#2a2622] font-semibold">
                          Barcode: {scanResult.product.barcode}
                        </div>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={handleNewScan}
                        className="px-4 py-2 bg-[#b8532f] hover:bg-[#a34a2b] text-white font-['Space_Grotesk'] font-bold rounded-lg text-xs border border-[#a34a2b] transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        title="Reset and scan another product"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Scan Another Product</span>
                      </motion.button>
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER (UNIFIED GLOBAL FOOTER) */}
      <footer className="w-full bg-[#f4efe6] border-t border-[#e8e2d8] py-4 mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#5c554e]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#2a2622]">PackScan Node ID: 26034-IN</span>
            <span>•</span>
            <span>Legal Metrology (Packaged Commodities) Rules, 2011 Enforcement Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#b8532f] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b8532f] animate-pulse"></span>
              <span>Systems Operational</span>
            </span>
            <span className="text-[#ded6c7]">|</span>
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
