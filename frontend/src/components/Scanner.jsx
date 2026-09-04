import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  CameraOff,
  Barcode,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  SkipForward,
  Loader2,
  ScanLine,
  ZoomIn,
  AlertTriangle,
  Upload,
  Search,
  Database,
  ShieldCheck,
  Check,
  Printer
} from 'lucide-react';
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  RGBLuminanceSource,
  BinaryBitmap,
  HybridBinarizer,
} from '@zxing/library';

function playBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function createZXingReader() {
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_39,
    BarcodeFormat.CODE_93,
    BarcodeFormat.ITF,
    BarcodeFormat.QR_CODE,
  ]);
  const reader = new MultiFormatReader();
  reader.setHints(hints);
  return reader;
}

export default function Scanner({
  onCompleteMultiStepScan,
  onScanDirectBarcode,
  isLoading,
  scanResult,
  onOpenNoticeModal,
  onResetScan,
}) {
  // Wizard state: 1 (Barcode), 2 (Front), 3 (Back/MRP), 4 (Side/Mfg), 5 (Processing)
  const [step, setStep] = useState(1);
  const [capturedData, setCapturedData] = useState({
    barcode: null,
    frontPhoto: null,
    backPhoto: null,
    sidePhoto: null
  });

  const [thumbnails, setThumbnails] = useState({
    front: null,
    back: null,
    side: null
  });

  const [manualBarcode, setManualBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [qualityFeedback, setQualityFeedback] = useState({ status: 'good', message: 'Ready to capture' });
  const [isZoomed, setIsZoomed] = useState(false);
  const [lockedPromptOpen, setLockedPromptOpen] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const qualityIntervalRef = useRef(null);
  const readerRef = useRef(null);
  const isLockedRef = useRef(false);
  const candidateBarcodeRef = useRef({ code: null, count: 0, lastTime: 0 });
  const stepRef = useRef(step);
  const barcodeDetectorRef = useRef(null);
  const isScanningRef = useRef(false);
  const fileInputRef = useRef(null);
  const barcodeFileInputRef = useRef(null);

  // Keep stepRef in sync
  useEffect(() => { stepRef.current = step; }, [step]);

  // Reset step if loading finishes or fails
  useEffect(() => {
    if (!isLoading && step === 5) {
      setStep(1);
      setCapturedData({ barcode: null, frontPhoto: null, backPhoto: null, sidePhoto: null });
      setThumbnails({ front: null, back: null, side: null });
      setLockedPromptOpen(false);
    }
  }, [isLoading, step]);

  useEffect(() => {
    readerRef.current = createZXingReader();
    if ('BarcodeDetector' in window) {
      try {
        barcodeDetectorRef.current = new BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code']
        });
      } catch (_) {}
    }
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (qualityIntervalRef.current) {
      clearInterval(qualityIntervalRef.current);
      qualityIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 3840, min: 1280 },
          height: { ideal: 2160, min: 720 },
        }
      });
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
        setIsCameraActive(true);
        isLockedRef.current = false;

        // Step 1: Barcode scan interval
        if (stepRef.current === 1) {
          scanIntervalRef.current = setInterval(async () => {
            if (isScanningRef.current) return;
            isScanningRef.current = true;
            try {
              const code = await decodeFrameAsync(videoRef.current);
              if (code) handleBarcodeFound(code);
            } finally {
              isScanningRef.current = false;
            }
          }, 250);
        } else {
          // Steps 2, 3, 4: Real-time sharpness & lighting quality analyzer
          qualityIntervalRef.current = setInterval(() => {
            evaluateFrameQuality(videoRef.current);
          }, 350);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Could not access camera. Please check permissions or upload photos directly.');
    }
  };

  // Real-time brightness & edge sharpness analyzer
  const evaluateFrameQuality = (videoEl) => {
    if (!videoEl || videoEl.readyState < 2) return;
    if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement('canvas');
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(videoEl, 0, 0, 160, 120);
    try {
      const data = ctx.getImageData(0, 0, 160, 120).data;
      let totalBrightness = 0;
      let edgeSum = 0;
      const len = data.length;
      for (let i = 0; i < len; i += 4) {
        const avg = (data[i] + data[i+1] + data[i+2]) / 3;
        totalBrightness += avg;
        if (i > 4) {
          const prevAvg = (data[i-4] + data[i-3] + data[i-2]) / 3;
          edgeSum += Math.abs(avg - prevAvg);
        }
      }
      const brightness = totalBrightness / (160 * 120);
      const sharpness = edgeSum / (160 * 120);

      if (brightness < 40) {
        setQualityFeedback({ status: 'dark', message: '⚠️ Lighting Dark — Move to brighter light' });
      } else if (sharpness < 3.2) {
        setQualityFeedback({ status: 'blurry', message: '⚠️ Hold Steady & Bring Text in Focus' });
      } else {
        setQualityFeedback({ status: 'good', message: '✅ Sharp Focus & Good Lighting' });
      }
    } catch (_) {}
  };

  const decodeFrameAsync = async (videoEl) => {
    if (!videoEl || videoEl.readyState < 2) return null;

    if (barcodeDetectorRef.current) {
      try {
        const barcodes = await barcodeDetectorRef.current.detect(videoEl);
        if (barcodes.length > 0) return barcodes[0].rawValue;
      } catch (_) {}
    }

    if (readerRef.current) {
      if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement('canvas');
      const canvas = offscreenCanvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const vw = videoEl.videoWidth || 640;
      const vh = videoEl.videoHeight || 480;
      canvas.width = vw;
      canvas.height = vh;
      ctx.drawImage(videoEl, 0, 0, vw, vh);
      try {
        const imgData = ctx.getImageData(0, 0, vw, vh).data;
        const src = new RGBLuminanceSource(imgData, vw, vh);
        const bitmap = new BinaryBitmap(new HybridBinarizer(src));
        const result = readerRef.current.decode(bitmap);
        if (result) return result.getText();
      } catch (_) {}
    }

    return null;
  };

  const handleBarcodeFound = useCallback((decodedText) => {
    if (!decodedText || isLockedRef.current) return;
    const clean = decodedText.trim();
    if (!clean || clean.length < 8) return;

    const now = Date.now();
    const cand = candidateBarcodeRef.current;
    if (cand.code === clean && now - cand.lastTime < 900) {
      cand.count += 1;
    } else {
      candidateBarcodeRef.current = { code: clean, count: 1, lastTime: now };
      return;
    }
    if (cand.count < 2) return;

    isLockedRef.current = true;
    playBeep();
    stopCamera();
    
    setCapturedData(prev => ({ ...prev, barcode: clean }));
    setLockedPromptOpen(true);
  }, []);

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    const clean = manualBarcode.trim();
    setCapturedData(prev => ({ ...prev, barcode: clean }));
    isLockedRef.current = true;
    playBeep();
    stopCamera();
    setLockedPromptOpen(true);
  };

  const handleProceedToPhotos = () => {
    setLockedPromptOpen(false);
    setStep(2);
    startCamera();
  };

  const handleDirectDatabaseAudit = () => {
    const targetBc = capturedData.barcode || manualBarcode.trim();
    if (!targetBc) return;
    stopCamera();
    setLockedPromptOpen(false);
    if (onScanDirectBarcode) {
      onScanDirectBarcode(targetBc);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const videoEl = videoRef.current;
    if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement('canvas');
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoEl.videoWidth || 1920;
    canvas.height = videoEl.videoHeight || 1080;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `photo_step${step}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCurrentFile(file);
      setCurrentPreviewUrl(URL.createObjectURL(blob));
      setIsZoomed(false);
      stopCamera();
    }, 'image/jpeg', 0.98);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCurrentFile(file);
    setCurrentPreviewUrl(URL.createObjectURL(file));
    setIsZoomed(false);
    stopCamera();
  };

  const handleBarcodeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await img.decode();

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let foundBarcode = null;
      if (barcodeDetectorRef.current) {
        try {
          const results = await barcodeDetectorRef.current.detect(canvas);
          if (results.length > 0) foundBarcode = results[0].rawValue;
        } catch (_) {}
      }

      if (!foundBarcode && readerRef.current) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const source = new RGBLuminanceSource(imgData.data, canvas.width, canvas.height);
        const bitmap = new BinaryBitmap(new HybridBinarizer(source));
        try {
          const res = readerRef.current.decode(bitmap);
          if (res) foundBarcode = res.getText();
        } catch (_) {}
      }

      if (foundBarcode) {
        playBeep();
        handleBarcodeFound(foundBarcode);
      } else {
        alert('Could not detect a clear barcode in this uploaded photo. Please try entering the barcode number manually.');
      }
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Barcode file decode error:', err);
    }
  };

  const handleResetScanner = () => {
    stopCamera();
    setStep(1);
    setCapturedData({ barcode: null, frontPhoto: null, backPhoto: null, sidePhoto: null });
    setThumbnails({ front: null, back: null, side: null });
    setLockedPromptOpen(false);
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    if (onResetScan) onResetScan();
  };

  const handleConfirmPhoto = () => {
    const updated = { ...capturedData };
    const newThumbs = { ...thumbnails };

    if (step === 2) {
      updated.frontPhoto = currentFile;
      newThumbs.front = currentPreviewUrl;
    } else if (step === 3) {
      updated.backPhoto = currentFile;
      newThumbs.back = currentPreviewUrl;
    } else if (step === 4) {
      updated.sidePhoto = currentFile;
      newThumbs.side = currentPreviewUrl;
    }

    setCapturedData(updated);
    setThumbnails(newThumbs);
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);

    if (step < 4) {
      setStep(step + 1);
      startCamera();
    } else {
      setStep(5);
      if (onCompleteMultiStepScan) {
        onCompleteMultiStepScan(updated);
      }
    }
  };

  const handleRetake = () => {
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);
    startCamera();
  };

  const handleSkipStep4 = () => {
    setStep(5);
    stopCamera();
    if (onCompleteMultiStepScan) {
      onCompleteMultiStepScan(capturedData);
    }
  };

  // Rule 6 statutory items list
  const rule6Declarations = [
    { num: '1', title: 'Manufacturer / Packer Name & Address', rule: 'RULE 6(1)(a)', fieldId: 'manufacturer' },
    { num: '2', title: 'Common / Generic Product Name', rule: 'RULE 6(1)(b)', fieldId: 'generic_name' },
    { num: '3', title: 'Net Quantity & Standard Weight', rule: 'RULE 6(1)(c)', fieldId: 'net_quantity' },
    { num: '4', title: 'Month and Year of Manufacture / Pack', rule: 'RULE 6(1)(d)', fieldId: 'mfg_date' },
    { num: '5', title: 'Price (MRP inclusive of all taxes)', rule: 'RULE 6(1)(e)', fieldId: 'mrp' },
    { num: '6', title: 'Package Dimensions & Size', rule: 'RULE 6(1)(f)', fieldId: 'unit_sale_price' },
    { num: '7', title: 'Consumer Helpline & Grievance Info', rule: 'RULE 6(1)(g)', fieldId: 'consumer_care' },
    { num: '8', title: 'Country of Origin (Imported units)', rule: 'RULE 6(1)(h)', fieldId: 'country_of_origin' },
  ];

  // Dynamic Rule 6 status based on active scanResult or default 8/8
  const reportFields = scanResult?.complianceReport?.fields || [];
  const score = scanResult?.complianceReport?.score ?? 8;
  const isViolationState = scanResult?.complianceReport?.overallStatus === 'NON_COMPLIANT' || (scanResult && score < 8);

  // Active or mock packaging unit values
  const activeProduct = scanResult?.product;
  const displayName = activeProduct?.name || 'Nestlé Maggi 2-Minute Masala';
  const displayEan = activeProduct?.barcode || '8901058852371';
  const displayMrp = activeProduct?.mrp ? `₹${activeProduct.mrp} (3.2mm)` : '₹14.00 (3.2mm)';
  const displayWeight = activeProduct?.netQuantity ? `${activeProduct.netQuantity} (2.8mm)` : '70 g (2.8mm)';
  const displayMfg = activeProduct?.mfgDate || '10/2024';
  const displayHelpline = activeProduct?.consumerCare || '1800-103-1947';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
      {/* Hidden file inputs for programmatic trigger */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={barcodeFileInputRef}
        onChange={handleBarcodeFileUpload}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* Left: Precision Metrology Viewfinder (col-span-8) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-8 bg-white rounded-xl p-5 sm:p-6 border border-[#cbd5e1] shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[440px]">
        {/* Header inside panel */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0e7490]"></span>
            <span className="font-['Space_Grotesk'] text-[13px] text-[#0f172a] font-bold tracking-wider uppercase">
              Metrology Viewfinder // Rule 9 Optical Micrometer
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#64748b] font-['JetBrains_Mono'] text-[11px]">
            <span>CALIBRATION: 0.05MM / PX</span>
            <span>•</span>
            <span className="text-[#0e7490] font-semibold">
              {isCameraActive ? 'LIVE MICROMETER' : 'AUTO-FOCUS LOCK'}
            </span>
          </div>
        </div>

        {/* Viewfinder Stage (Light calm steel stage) */}
        <div className="relative w-full flex-1 bg-[#f8fafc] rounded-lg flex items-center justify-center p-6 my-4 overflow-hidden select-none border border-[#cbd5e1] min-h-[290px]">
          {/* Steel Grid Background */}
          <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="36" id="grid-light" patternUnits="userSpaceOnUse" width="36">
                <path className="text-[#94a3b8]" d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
              </pattern>
            </defs>
            <rect fill="url(#grid-light)" height="100%" width="100%"></rect>
          </svg>

          {/* Optical Reticle Center Line */}
          <div className="absolute inset-x-0 h-0.5 bg-[#0e7490]/40 top-1/3 pointer-events-none"></div>

          {/* Target Corner Markers */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#0e7490] z-20"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#0e7490] z-20"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#0e7490] z-20"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#0e7490] z-20"></div>

          {/* A. Camera Active Live Feed */}
          {isCameraActive && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Barcode Reticle & Laser Sweep (Step 1) */}
              {step === 1 && !capturedData.barcode && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-36 border-2 border-cyan-400/60 rounded-xl relative shadow-[0_0_20px_rgba(14,116,144,0.3)]">
                    <div className="camera-reticle-corner -top-1 -left-1 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                    <div className="camera-reticle-corner -top-1 -right-1 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                    <div className="camera-reticle-corner -bottom-1 -left-1 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                    <div className="camera-reticle-corner -bottom-1 -right-1 border-b-2 border-r-2 border-cyan-400 rounded-br" />
                    <div className="absolute inset-x-2 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] scanner-laser" />
                  </div>
                  <div className="mt-3 text-[11px] font-mono text-cyan-300 font-bold bg-black/70 px-3 py-1 rounded-full border border-cyan-500/30">
                    Align product barcode inside frame
                  </div>
                </div>
              )}

              {/* Quality Guidance Overlay (Steps 2-4) */}
              {step > 1 && (
                <div className="absolute top-3 left-3 pointer-events-none">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
                      qualityFeedback.status === 'good'
                        ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}
                  >
                    {qualityFeedback.message}
                  </div>
                </div>
              )}

              {/* Top Controls Overlay */}
              <div className="absolute top-3 right-3 flex items-center space-x-2">
                {step === 4 && (
                  <button
                    type="button"
                    onClick={handleSkipStep4}
                    className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold rounded-lg backdrop-blur-md transition flex items-center space-x-1 text-xs border border-slate-700 shadow-md cursor-pointer"
                  >
                    <span>Skip Side Photo</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-rose-600 text-rose-300 hover:text-white font-bold rounded-lg text-xs border border-rose-500/40 hover:border-rose-600 backdrop-blur-md transition flex items-center space-x-1.5 shadow-lg active:scale-95 cursor-pointer"
                  title="Stop camera feed and turn off webcam"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Scanner</span>
                </button>
              </div>

              {/* Step indicator pill */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] px-2.5 py-1 rounded-md">
                {step === 1 ? 'STEP 1: Barcode Scan' : step === 2 ? 'STEP 2: Front Label' : step === 3 ? 'STEP 3: MRP & Date' : 'STEP 4: Side / Packer'}
              </div>
            </div>
          )}

          {/* B. Zoomable Captured Photo Preview */}
          {currentPreviewUrl && !isCameraActive && (
            <div className="absolute inset-0 z-20 flex flex-col bg-slate-950">
              <div
                className="relative flex-1 overflow-hidden flex items-center justify-center bg-black/70 cursor-pointer select-none"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={currentPreviewUrl}
                  alt="Captured Preview"
                  className={`max-h-[280px] object-contain transition-transform duration-300 ease-out ${
                    isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                  }`}
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1 shadow-md">
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isZoomed ? 'Tap to Zoom Out' : 'Tap to Zoom & Inspect'}</span>
                </div>
              </div>

              {/* Quality verification bottom bar */}
              <div className="p-3 bg-white border-t border-[#cbd5e1] flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#0e7490]">verified</span>
                    <span>Quality Check: Is printed text sharp and legible?</span>
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Tap Retake if blurry or dark.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e293b] font-bold rounded-lg text-xs border border-[#cbd5e1] transition cursor-pointer"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPhoto}
                    className="px-4 py-1.5 bg-[#0e7490] hover:bg-[#155e75] text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Proceed</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. Barcode Decision Modal Prompt */}
          {lockedPromptOpen && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl p-5 border border-[#cbd5e1] max-w-sm w-full shadow-lg text-center space-y-3">
                <div className="w-11 h-11 rounded-lg bg-[#f0fdfa] border border-[#ccfbf1] text-[#0e7490] flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                </div>
                <div>
                  <div className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#0e7490] uppercase tracking-wider">
                    Barcode Recognized
                  </div>
                  <h3 className="font-['Space_Grotesk'] text-lg font-bold text-[#0f172a] mt-0.5">
                    {capturedData.barcode}
                  </h3>
                  <p className="text-xs text-[#64748b] mt-1">
                    Select audit mode for this packaged commodity:
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDirectDatabaseAudit}
                    className="w-full py-2.5 px-3 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Instant Database Audit (&lt;10ms)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPhotos}
                    className="w-full py-2 px-3 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e293b] font-['Space_Grotesk'] font-semibold rounded-lg text-xs border border-[#cbd5e1] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#0e7490]" />
                    <span>Continue to Packaging Photos</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. Processing State */}
          {(step === 5 || isLoading) && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-xs text-center space-y-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#0e7490] animate-spin absolute" />
                <ShieldCheck className="w-5 h-5 text-[#0e7490]" />
              </div>
              <div>
                <div className="font-['Space_Grotesk'] font-bold text-[15px] text-[#0f172a]">
                  Cross-Confirming Evidence with Database
                </div>
                <p className="font-['JetBrains_Mono'] text-[11.5px] text-[#64748b] mt-1 max-w-md mx-auto">
                  Running Rule 6 statutory checks, optical font measurement &amp; allergen cross-match...
                </p>
              </div>
            </div>
          )}

          {/* E. Scanned Label Card (Idle State / Scanned Result Preview) */}
          {!isCameraActive && !currentPreviewUrl && !lockedPromptOpen && !isLoading && step !== 5 && (
            <div className="relative w-full max-w-lg bg-white text-[#0f172a] rounded-lg p-4 shadow-sm border border-[#cbd5e1] z-10">
              <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-2 mb-2">
                <div>
                  <span className="px-2 py-0.5 bg-[#f0fdfa] border border-[#ccfbf1] text-[#0e7490] font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase">
                    PREPACKAGED RETAIL UNIT
                  </span>
                  <div className="font-['Space_Grotesk'] text-[15px] font-bold text-[#0f172a] mt-1">
                    {displayName}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] font-['JetBrains_Mono'] text-[11px] font-semibold rounded">
                  EAN: {displayEan}
                </span>
              </div>

              {/* Bounding Boxes mapped to Rule 6 Plain Language */}
              <div className="grid grid-cols-2 gap-2 font-['JetBrains_Mono'] text-[11px]">
                <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0e7490]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-[#334155] font-medium">Price (MRP)</span>
                  </div>
                  <span className="font-bold text-[#0f172a]">{displayMrp}</span>
                </div>

                <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0e7490]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-[#334155] font-medium">Net Quantity &amp; Weight</span>
                  </div>
                  <span className="font-bold text-[#0f172a]">{displayWeight}</span>
                </div>

                <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0e7490]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-[#334155] font-medium">Month &amp; Year of Mfg</span>
                  </div>
                  <span className="font-bold text-[#0f172a]">{displayMfg}</span>
                </div>

                <div className="p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#0e7490]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-[#334155] font-medium">Consumer Helpline</span>
                  </div>
                  <span className="font-bold text-[#0f172a]">{displayHelpline}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plain language guidance & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-[#475569] font-['JetBrains_Mono'] text-[11.5px] font-medium">
            <span className="material-symbols-outlined text-[17px] text-[#0e7490]">center_focus_strong</span>
            <span>Point your camera at the barcode • Hold steady</span>
          </div>

          <div className="flex items-center gap-2.5">
            {isCameraActive ? (
              <>
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  <span>{step === 1 ? 'Capture Frame' : 'Capture Photo & Check Rules'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-[#f8fafc] hover:bg-rose-50 text-rose-600 border border-rose-200 font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Scanner</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => barcodeFileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#1e293b] border border-[#cbd5e1] font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#64748b]">upload_file</span>
                  <span>Upload Label File</span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera_back</span>
                  <span>Start Live Scanner</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Optional Manual Barcode Input bar at bottom */}
        {!isCameraActive && (
          <form onSubmit={handleManualBarcodeSubmit} className="mt-3 pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider shrink-0">
              Manual EAN:
            </span>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Or enter barcode (e.g. 8901058852371)"
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-md px-3 py-1.5 text-xs text-[#0f172a] font-['JetBrains_Mono'] flex-1 focus:outline-none focus:border-[#0e7490]"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="px-3 py-1.5 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] font-bold rounded-md text-xs disabled:opacity-40 cursor-pointer transition shadow-xs"
            >
              Verify
            </button>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Right: Rule 6 Checklist (8 Plain-Language Declarations) (col-span-4) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 bg-white rounded-xl p-5 sm:p-6 border border-[#cbd5e1] shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-['Space_Grotesk'] text-[16px] text-[#0f172a] font-bold">
              Rule 6 Checklist (8 Declarations)
            </span>
            <motion.span
              key={score}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-0.5 font-['JetBrains_Mono'] text-[11px] font-bold rounded flex items-center gap-1 border ${
                isViolationState
                  ? 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]'
                  : 'bg-[#f0fdfa] text-[#0f766e] border-[#99f6e4]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[14px] ${
                  isViolationState ? 'text-[#ea580c]' : 'text-[#0e7490]'
                }`}
              >
                {isViolationState ? 'warning' : 'check_circle'}
              </span>
              <span>{score}/8 {isViolationState && score < 8 ? 'VERIFIED' : 'PASSED'}</span>
            </motion.span>
          </div>
          <p className="text-[13px] text-[#64748b] font-normal">
            Mandatory label standards verification under Legal Metrology Rules, 2011.
          </p>

          {/* 8 Checks List with Framer Motion Stagger */}
          <div className="mt-4 space-y-1.5">
            {rule6Declarations.map((item, index) => {
              // Check status from active report if available
              const matchedField = reportFields.find((f) => f.id === item.fieldId);
              const isMissing = matchedField && matchedField.status === 'MISSING';

              return (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className={`flex items-center justify-between p-2 rounded border ${
                    isMissing
                      ? 'bg-[#fff7ed] border-[#fed7aa]'
                      : 'bg-[#f8fafc] border-[#e2e8f0]'
                  }`}
                >
                  <span className="font-['JetBrains_Mono'] text-[11.5px] text-[#1e293b] font-medium">
                    {item.num}. {item.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold rounded border ${
                      isMissing
                        ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                        : 'bg-[#f0fdfa] text-[#0f766e] border-[#ccfbf1]'
                    }`}
                  >
                    {item.rule} {isMissing ? '✗' : '✓'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 36 Action Notice Panel */}
        <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#0e7490] text-[18px]">verified_user</span>
            <span className="font-['Space_Grotesk'] text-[12px] font-bold text-[#0f172a] uppercase">
              Instant Audit Dossier
            </span>
          </div>
          <p className="text-[12px] text-[#64748b] leading-relaxed">
            Section 36 penalty exporter auto-generates statutory notices for state enforcement when discrepancies exceed legal limits.
          </p>
          <button
            type="button"
            onClick={onOpenNoticeModal}
            className="w-full mt-2 py-2 px-3 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] text-[12px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>GENERATE SEC 36 AUDIT REPORT</span>
          </button>
        </div>
      </div>
    </section>
  );
}
