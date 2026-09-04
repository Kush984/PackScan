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
  Printer,
  QrCode,
  Focus,
  Zap,
  Plus,
  Sparkles,
  Layers,
  HelpCircle,
  X
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
  onScanImage,
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
  const [isExtractingBarcode, setIsExtractingBarcode] = useState(false);

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

  // Ensure video element receives stream and plays when camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch((e) => console.warn('Video play caught in effect:', e));
    }
  }, [isCameraActive]);

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
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      let stream = null;
      // Resilient camera request: attempt high-res environment mode first, then fall back to standard video
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920, min: 640 },
            height: { ideal: 1080, min: 480 },
          },
        });
      } catch (firstErr) {
        console.warn('High-res camera constraints unsupported, falling back to basic video:', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      isLockedRef.current = false;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Direct play error (will retry via effect):', playErr);
        }
      }

      // Step 1: Barcode scan interval
      if (stepRef.current === 1) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = setInterval(async () => {
          if (isScanningRef.current || !videoRef.current) return;
          isScanningRef.current = true;
          try {
            const code = await decodeFrameAsync(videoRef.current);
            if (code) handleBarcodeFound(code);
          } catch (e) {
            console.warn('Frame scan error:', e);
          } finally {
            isScanningRef.current = false;
          }
        }, 250);
      } else {
        // Steps 2, 3, 4: Real-time sharpness & lighting quality analyzer
        if (qualityIntervalRef.current) clearInterval(qualityIntervalRef.current);
        qualityIntervalRef.current = setInterval(() => {
          if (videoRef.current) evaluateFrameQuality(videoRef.current);
        }, 350);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please click the camera icon in your browser address bar to allow access, or upload packaging photos directly.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on your device. You can test live scanning using "Upload Label File" or select a product from the demo catalog below.');
      } else {
        setCameraError(`Camera error (${err.message || err.name}). Please check permissions or upload photos directly.`);
      }
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

      // PASS 1: Center Reticle Crop (Focuses on the exact bounding box where user holds packet)
      try {
        const cropW = Math.round(vw * 0.6);
        const cropH = Math.round(vh * 0.45);
        const cropX = Math.round((vw - cropW) / 2);
        const cropY = Math.round((vh - cropH) / 2);

        canvas.width = cropW;
        canvas.height = cropH;
        ctx.drawImage(videoEl, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        const imgData = ctx.getImageData(0, 0, cropW, cropH).data;
        const src = new RGBLuminanceSource(imgData, cropW, cropH);
        const bitmap = new BinaryBitmap(new HybridBinarizer(src));
        const res = readerRef.current.decode(bitmap);
        if (res) return res.getText();
      } catch (_) {}

      // PASS 2: Full-frame fallback
      try {
        canvas.width = vw;
        canvas.height = vh;
        ctx.drawImage(videoEl, 0, 0, vw, vh);
        const imgData = ctx.getImageData(0, 0, vw, vh).data;
        const src = new RGBLuminanceSource(imgData, vw, vh);
        const bitmap = new BinaryBitmap(new HybridBinarizer(src));
        const res = readerRef.current.decode(bitmap);
        if (res) return res.getText();
      } catch (_) {}
    }

    return null;
  };

  const handleBarcodeFound = useCallback((decodedText) => {
    if (!decodedText || isLockedRef.current) return;
    const clean = decodedText.trim();
    if (!clean || clean.length < 8) return;

    // Instant lock-in for recognized barcode format
    isLockedRef.current = true;
    playBeep();
    stopCamera();
    
    setCapturedData((prev) => ({ ...prev, barcode: clean }));
    setLockedPromptOpen(true);
  }, []);

  const handleManualBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    const clean = manualBarcode.trim();
    setCapturedData((prev) => ({ ...prev, barcode: clean }));
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

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const videoEl = videoRef.current;
    if (!offscreenCanvasRef.current) offscreenCanvasRef.current = document.createElement('canvas');
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoEl.videoWidth || 1920;
    canvas.height = videoEl.videoHeight || 1080;
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    // STEP 1: Barcode Capture Mode (Client decode + AI fallback)
    if (step === 1) {
      setIsExtractingBarcode(true);
      setCameraError(null);

      // 1. Try immediate client-side decode on the high-res canvas
      try {
        const localCode = await decodeFrameAsync(videoEl);
        if (localCode) {
          setIsExtractingBarcode(false);
          handleBarcodeFound(localCode);
          return;
        }
      } catch (_) {}

      // 2. Invoke AI Barcode Extractor for curved/blurry/colored barcodes
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsExtractingBarcode(false);
          return;
        }
        try {
          const formData = new FormData();
          formData.append('frame', blob, 'frame.jpg');
          const res = await fetch('/api/scan/extract-barcode', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.success && data.barcode) {
            handleBarcodeFound(data.barcode);
          } else {
            setCameraError(
              'Could not auto-read barcode from this angle. Tip: Type "8901393019469" in the Manual EAN box below, or click "Skip to 2-Shot Photos".'
            );
          }
        } catch (err) {
          console.warn('AI Barcode extraction error:', err);
          setCameraError('Barcode recognition timeout. Please enter digits manually below or skip to 2-shot photos.');
        } finally {
          setIsExtractingBarcode(false);
        }
      }, 'image/jpeg', 0.85);
      return;
    }

    // STEPS 2-4: Standard Packaging Angle Photo Capture
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
    setIsExtractingBarcode(true);
    setCameraError(null);

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

      URL.revokeObjectURL(url);

      if (foundBarcode) {
        setIsExtractingBarcode(false);
        playBeep();
        handleBarcodeFound(foundBarcode);
        return;
      }

      // If client-side ZXing failed, send to AI barcode extractor
      const formData = new FormData();
      formData.append('frame', file);
      const res = await fetch('/api/scan/extract-barcode', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.barcode) {
        playBeep();
        handleBarcodeFound(data.barcode);
      } else if (onScanImage) {
        onScanImage(file);
      } else {
        setCameraError('Could not detect barcode from this photo. You can type the numbers manually or click "Skip to 2-Shot Photos".');
      }
    } catch (err) {
      console.error('Barcode file decode error:', err);
      if (onScanImage) {
        onScanImage(file);
      }
    } finally {
      setIsExtractingBarcode(false);
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

  const submitMultiStepScan = (dataToSubmit) => {
    setStep(5);
    stopCamera();
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);
    if (onCompleteMultiStepScan) {
      onCompleteMultiStepScan(dataToSubmit);
    }
  };

  // Step 2 (Front): Confirm & Proceed to Shot 2 (Back)
  const handleConfirmFront = () => {
    const updated = { ...capturedData, frontPhoto: currentFile };
    const newThumbs = { ...thumbnails, front: currentPreviewUrl };
    setCapturedData(updated);
    setThumbnails(newThumbs);
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);
    setStep(3);
    startCamera();
  };

  // Step 2 Optional: Quick single-shot analyze
  const handleFinishSingleShot = () => {
    const updated = { ...capturedData, frontPhoto: currentFile };
    const newThumbs = { ...thumbnails, front: currentPreviewUrl };
    setCapturedData(updated);
    setThumbnails(newThumbs);
    submitMultiStepScan(updated);
  };

  // Step 3 (Back): Immediate 2-Shot completion (~3.5s)
  const handleFinishTwoShot = () => {
    const updated = { ...capturedData, backPhoto: currentFile };
    const newThumbs = { ...thumbnails, back: currentPreviewUrl };
    setCapturedData(updated);
    setThumbnails(newThumbs);
    submitMultiStepScan(updated);
  };

  // Step 3 (Back): Proceed to optional side / flap photo (Shot 3)
  const handleProceedToSidePhoto = () => {
    const updated = { ...capturedData, backPhoto: currentFile };
    const newThumbs = { ...thumbnails, back: currentPreviewUrl };
    setCapturedData(updated);
    setThumbnails(newThumbs);
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);
    setStep(4);
    startCamera();
  };

  // Step 4 (Side): Confirm & Complete Full 3-Shot Audit
  const handleConfirmSide = () => {
    const updated = { ...capturedData, sidePhoto: currentFile };
    const newThumbs = { ...thumbnails, side: currentPreviewUrl };
    setCapturedData(updated);
    setThumbnails(newThumbs);
    submitMultiStepScan(updated);
  };

  const handleRetake = () => {
    setCurrentFile(null);
    setCurrentPreviewUrl(null);
    setIsZoomed(false);
    startCamera();
  };

  const handleSkipStep4 = () => {
    submitMultiStepScan(capturedData);
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

  // Active product and field details directly derived from scanResult
  const activeProduct = scanResult?.product;
  const mrpField = reportFields.find((f) => f.id === 'mrp');
  const weightField = reportFields.find((f) => f.id === 'net_quantity');
  const mfgField = reportFields.find((f) => f.id === 'mfg_date');
  const helplineField = reportFields.find((f) => f.id === 'consumer_care');

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
      <div className="lg:col-span-8 bg-white rounded-xl p-5 sm:p-6 border border-[#ccfbf1] shadow-xs flex flex-col justify-between relative overflow-hidden min-h-[440px]">
        {/* Header inside panel */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ccfbf1]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#47d1cc]"></span>
            <span className="font-['Space_Grotesk'] text-[13px] text-[#0f172a] font-bold tracking-wider uppercase">
              Metrology Viewfinder // Rule 9 Optical Micrometer
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#64748b] font-['JetBrains_Mono'] text-[11px]">
            <span>CALIBRATION: 0.05MM / PX</span>
            <span>•</span>
            <span className="text-[#0d9488] font-bold">
              {isCameraActive ? 'LIVE MICROMETER' : 'AUTO-FOCUS LOCK'}
            </span>
          </div>
        </div>

        {/* Streamlined Stepper Progress Bar (Smart 2-Shot Architecture) */}
        <div className="grid grid-cols-3 gap-2 pt-3 pb-1">
          {/* Step 1 Pill */}
          <div
            onClick={() => {
              if (step > 1 && !isLoading) {
                stopCamera();
                setStep(1);
              }
            }}
            className={`p-2 rounded-lg border text-center transition-all ${
              step > 1 && !isLoading ? 'cursor-pointer hover:border-[#47d1cc]' : ''
            } ${
              step === 1
                ? 'bg-[#e0fbf9] border-[#47d1cc] text-[#042f2e] ring-1 ring-[#47d1cc]'
                : capturedData.barcode
                ? 'bg-[#f0fdfc] border-[#99f6e4] text-[#0f766e]'
                : 'bg-[#f8fefe] border-[#e2e8f0] text-[#64748b]'
            }`}
          >
            <div className="flex items-center justify-center gap-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider">
              {capturedData.barcode ? <Check className="w-3 h-3 text-[#0d9488]" /> : null}
              <span>{capturedData.barcode ? 'Barcode Set' : '1. Barcode'}</span>
            </div>
            <div className="font-['Space_Grotesk'] text-[11px] font-semibold truncate mt-0.5">
              {capturedData.barcode ? capturedData.barcode : 'Scan / Lookup'}
            </div>
          </div>

          {/* Shot 1 Pill (Front) */}
          <div
            onClick={() => {
              if (!isLoading) {
                stopCamera();
                setStep(2);
                startCamera();
              }
            }}
            className={`p-2 rounded-lg border text-center transition-all cursor-pointer hover:border-[#47d1cc] ${
              step === 2
                ? 'bg-[#e0fbf9] border-[#47d1cc] text-[#042f2e] ring-1 ring-[#47d1cc]'
                : thumbnails.front
                ? 'bg-[#f0fdfc] border-[#99f6e4] text-[#0f766e]'
                : 'bg-[#f8fefe] border-[#e2e8f0] text-[#64748b]'
            }`}
          >
            <div className="flex items-center justify-center gap-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider">
              {thumbnails.front ? <Check className="w-3 h-3 text-[#0d9488]" /> : null}
              <span>{thumbnails.front ? 'Shot 1 Done' : '2. Front'}</span>
            </div>
            <div className="font-['Space_Grotesk'] text-[11px] font-semibold truncate mt-0.5 flex items-center justify-center gap-1">
              {thumbnails.front && (
                <img src={thumbnails.front} alt="Front" className="w-3.5 h-3.5 rounded object-cover" />
              )}
              <span>Brand &amp; Weight</span>
            </div>
          </div>

          {/* Shot 2 Pill (Back + Optional Side) */}
          <div
            onClick={() => {
              if (thumbnails.front && !isLoading) {
                stopCamera();
                setStep(3);
                startCamera();
              }
            }}
            className={`p-2 rounded-lg border text-center transition-all ${
              thumbnails.front && !isLoading ? 'cursor-pointer hover:border-[#47d1cc]' : ''
            } ${
              step === 3 || step === 4
                ? 'bg-[#e0fbf9] border-[#47d1cc] text-[#042f2e] ring-1 ring-[#47d1cc]'
                : thumbnails.back
                ? 'bg-[#f0fdfc] border-[#99f6e4] text-[#0f766e]'
                : 'bg-[#f8fefe] border-[#e2e8f0] text-[#64748b]'
            }`}
          >
            <div className="flex items-center justify-center gap-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase tracking-wider">
              {thumbnails.back ? <Check className="w-3 h-3 text-[#0d9488]" /> : null}
              <span>{thumbnails.back ? (step === 4 ? 'Shot 3 (Flap)' : 'Shot 2 Done') : '3. Back / Rules'}</span>
            </div>
            <div className="font-['Space_Grotesk'] text-[11px] font-semibold truncate mt-0.5 flex items-center justify-center gap-1">
              {thumbnails.back && (
                <img src={thumbnails.back} alt="Back" className="w-3.5 h-3.5 rounded object-cover" />
              )}
              <span>{step === 4 ? 'Side / Flap (Opt)' : 'MRP &amp; Nutrition'}</span>
            </div>
          </div>
        </div>

        {/* Viewfinder Stage (Soft Turquoise Tinted Stage) */}
        <div className="relative w-full flex-1 bg-[#f4fcfb] rounded-lg flex items-center justify-center p-6 my-4 overflow-hidden select-none border border-[#ccfbf1] min-h-[290px]">
          {/* Subtle Grid Background */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="36" id="grid-light" patternUnits="userSpaceOnUse" width="36">
                <path className="text-[#ccfbf1]" d="M 36 0 L 0 0 0 36" fill="none" stroke="currentColor" strokeWidth="0.75"></path>
              </pattern>
            </defs>
            <rect fill="url(#grid-light)" height="100%" width="100%"></rect>
          </svg>

          {/* Optical Reticle Center Line */}
          <div className="absolute inset-x-0 h-0.5 bg-[#47d1cc]/40 top-1/3 pointer-events-none"></div>

          {/* Target Corner Markers */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#47d1cc] z-20"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#47d1cc] z-20"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#47d1cc] z-20"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#47d1cc] z-20"></div>

          {/* Camera Error Alert Banner */}
          {cameraError && !isCameraActive && (
            <div className="absolute inset-x-4 top-4 z-30 p-3.5 bg-[#fff7ed] border border-[#fed7aa] rounded-xl flex items-start gap-3 text-left shadow-lg animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#9a3412] uppercase tracking-wide">
                  Camera Access Alert
                </div>
                <p className="text-xs text-[#c2410c] mt-0.5 leading-relaxed">
                  {cameraError}
                </p>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3 py-1 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-md transition shadow-xs cursor-pointer"
                  >
                    Retry Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => barcodeFileInputRef.current?.click()}
                    className="px-3 py-1 bg-white hover:bg-[#ffedd5] border border-[#fed7aa] text-[#c2410c] text-xs font-semibold rounded-md transition cursor-pointer"
                  >
                    Upload Label Image
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCameraError(null)}
                className="text-[#ea580c] hover:text-[#9a3412] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* A. Camera Live Feed (Always mounted so videoRef.current is never null) */}
          <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black ${isCameraActive ? 'block' : 'hidden'}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Barcode Reticle & Laser Sweep (Step 1) */}
            {step === 1 && !capturedData.barcode && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-64 h-36 border-2 border-[#47d1cc]/70 rounded-xl relative shadow-[0_0_20px_rgba(71,209,204,0.3)]">
                  <div className="camera-reticle-corner -top-1 -left-1 border-t-2 border-l-2 border-[#47d1cc] rounded-tl" />
                  <div className="camera-reticle-corner -top-1 -right-1 border-t-2 border-r-2 border-[#47d1cc] rounded-tr" />
                  <div className="camera-reticle-corner -bottom-1 -left-1 border-b-2 border-l-2 border-[#47d1cc] rounded-bl" />
                  <div className="camera-reticle-corner -bottom-1 -right-1 border-b-2 border-r-2 border-[#47d1cc] rounded-br" />
                  <div className="absolute inset-x-2 h-0.5 bg-[#47d1cc] shadow-[0_0_12px_#47d1cc] scanner-laser" />
                </div>
                <div className="mt-3 text-[11px] font-mono text-[#47d1cc] font-bold bg-black/70 px-3 py-1 rounded-full border border-[#47d1cc]/40">
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
                      ? 'bg-[#042f2e]/80 text-[#e0fbf9] border-[#47d1cc]/40'
                      : 'bg-[#431407]/80 text-[#fdba74] border-[#ea580c]/40 animate-pulse'
                  }`}
                >
                  {qualityFeedback.message}
                </div>
              </div>
            )}

            {/* Top Controls Overlay */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                  }}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-[#47d1cc] font-bold rounded-lg backdrop-blur-md transition flex items-center space-x-1 text-xs border border-slate-700 shadow-md cursor-pointer"
                >
                  <span>Skip Barcode → Photos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {step === 3 && thumbnails.front && (
                <button
                  type="button"
                  onClick={() => submitMultiStepScan(capturedData)}
                  className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-[#47d1cc] font-bold rounded-lg backdrop-blur-md transition flex items-center space-x-1 text-xs border border-slate-700 shadow-md cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>Analyze Front Only</span>
                </button>
              )}
              {step === 4 && (
                <button
                  type="button"
                  onClick={handleSkipStep4}
                  className="px-3 py-1.5 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-bold rounded-lg backdrop-blur-md transition flex items-center space-x-1 text-xs border border-[#2bc4be] shadow-md cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Analyze 2 Photos Now</span>
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
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md border border-white/20 text-white font-mono text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5">
              {step === 1 && (
                <>
                  <Barcode className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>STEP 1: Barcode Scan</span>
                </>
              )}
              {step === 2 && (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>SHOT 1 OF 2: Front Panel (Brand &amp; Net Wt)</span>
                </>
              )}
              {step === 3 && (
                <>
                  <Layers className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>SHOT 2 OF 2: Back Panel (MRP, Date, Ingredients)</span>
                </>
              )}
              {step === 4 && (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>OPTIONAL SHOT 3: Side Panel / Flap</span>
                </>
              )}
            </div>
          </div>

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
                  <ZoomIn className="w-3.5 h-3.5 text-[#47d1cc]" />
                  <span>{isZoomed ? 'Tap to Zoom Out' : 'Tap to Zoom & Inspect'}</span>
                </div>
              </div>

              {/* Quality verification bottom bar */}
              <div className="p-3 bg-white border-t border-[#ccfbf1] flex flex-wrap items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
                    <span>
                      {step === 2
                        ? 'Front Panel: Brand, Name & Net Quantity clear?'
                        : step === 3
                        ? 'Back Panel: MRP, Date & Ingredients legible?'
                        : 'Side / Flap: Batch info & Manufacturer address sharp?'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Tap Retake if glare or motion blur obscures text.
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-3 py-1.5 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#334155] font-semibold rounded-lg text-xs border border-[#ccfbf1] transition cursor-pointer"
                  >
                    Retake
                  </button>

                  {/* Step 2 Actions */}
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={handleConfirmFront}
                      className="px-4 py-1.5 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#2bc4be]"
                    >
                      <span>Confirm &amp; Next: Back Panel (Shot 2)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Step 3 Actions: 2-Shot Finish OR Add Side */}
                  {step === 3 && (
                    <>
                      <button
                        type="button"
                        onClick={handleProceedToSidePhoto}
                        className="px-3 py-1.5 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#0f766e] font-semibold rounded-lg text-xs border border-[#99f6e4] transition flex items-center gap-1 cursor-pointer"
                        title="Add side or flap photo for packages with side printing"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Side / Flap</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFinishTwoShot}
                        className="px-4 py-1.5 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#2bc4be]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-[#042f2e]" />
                        <span>Analyze Now (Fast 2-Shot)</span>
                      </button>
                    </>
                  )}

                  {/* Step 4 Actions */}
                  {step === 4 && (
                    <button
                      type="button"
                      onClick={handleConfirmSide}
                      className="px-4 py-1.5 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs cursor-pointer border border-[#2bc4be]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Analyze Full Package</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* C. Barcode Decision Modal Prompt */}
          {lockedPromptOpen && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl p-5 border border-[#ccfbf1] max-w-sm w-full shadow-2xl text-center space-y-3">
                <div className="w-11 h-11 rounded-lg bg-[#e0fbf9] border border-[#99f6e4] text-[#0d9488] flex items-center justify-center mx-auto">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#0d9488] uppercase tracking-wider">
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
                    className="w-full py-2.5 px-3 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#2bc4be]"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Instant Database Audit (&lt;10ms)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToPhotos}
                    className="w-full py-2 px-3 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#334155] font-['Space_Grotesk'] font-semibold rounded-lg text-xs border border-[#ccfbf1] transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Start Fast 2-Shot Packaging Audit</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D. Processing State */}
          {(step === 5 || isLoading) && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-white/95 backdrop-blur-xs text-center space-y-3">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#47d1cc] animate-spin absolute" />
                <ShieldCheck className="w-5 h-5 text-[#0d9488]" />
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

          {/* E. Scanned Label Card (Active Scanned Result Preview or Standby Prompt) */}
          {!isCameraActive && !currentPreviewUrl && !lockedPromptOpen && !isLoading && step !== 5 && (
            scanResult ? (
              <div className="relative w-full max-w-lg bg-white text-[#0f172a] rounded-lg p-4 shadow-xs border border-[#ccfbf1] z-10">
                <div className="flex items-start justify-between border-b border-[#ccfbf1] pb-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 bg-[#e6fbf9] border border-[#99f6e4] text-[#0f766e] font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase">
                      PREPACKAGED RETAIL UNIT
                    </span>
                    <div className="font-['Space_Grotesk'] text-[15px] font-bold text-[#0f172a] mt-1">
                      {activeProduct?.name || 'Scanned Packaged Commodity'}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 font-['JetBrains_Mono'] text-[11px] font-semibold rounded border ${
                    activeProduct?.barcode 
                      ? 'bg-[#f0fdfc] text-[#334155] border-[#ccfbf1]' 
                      : 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]'
                  }`}>
                    {activeProduct?.barcode ? `EAN: ${activeProduct.barcode}` : 'NO BARCODE (VISUAL AUDIT)'}
                  </span>
                </div>

                {/* Bounding Boxes mapped to Rule 6 Plain Language */}
                <div className="grid grid-cols-2 gap-2 font-['JetBrains_Mono'] text-[11px]">
                  {/* MRP */}
                  <div className={`p-2 border rounded flex items-center justify-between ${
                    mrpField?.status === 'DETECTED'
                      ? 'bg-[#f0fdfc] border-[#ccfbf1]'
                      : 'bg-[#fff7ed] border-[#fed7aa]'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {mrpField?.status === 'DETECTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      )}
                      <span className="text-[#475569] font-medium">Price (MRP)</span>
                    </div>
                    <span className={`font-bold ${
                      mrpField?.status === 'DETECTED' ? 'text-[#0f172a]' : 'text-[#c2410c] text-[10px]'
                    }`}>
                      {mrpField?.status === 'DETECTED'
                        ? (mrpField.value?.startsWith('₹') ? mrpField.value : `₹${mrpField.value}`)
                        : 'NOT DETECTED'}
                    </span>
                  </div>

                  {/* Net Quantity & Weight */}
                  <div className={`p-2 border rounded flex items-center justify-between ${
                    weightField?.status === 'DETECTED'
                      ? 'bg-[#f0fdfc] border-[#ccfbf1]'
                      : 'bg-[#fff7ed] border-[#fed7aa]'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {weightField?.status === 'DETECTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      )}
                      <span className="text-[#475569] font-medium">Net Quantity</span>
                    </div>
                    <span className={`font-bold ${
                      weightField?.status === 'DETECTED' ? 'text-[#0f172a]' : 'text-[#c2410c] text-[10px]'
                    }`}>
                      {weightField?.status === 'DETECTED'
                        ? (weightField.value?.replace(/^NET\s*(?:WEIGHT|QTY|QUANTITY)?\s*:\s*/i, '') || 'Detected')
                        : 'NOT DETECTED'}
                    </span>
                  </div>

                  {/* Month & Year of Mfg */}
                  <div className={`p-2 border rounded flex items-center justify-between ${
                    mfgField?.status === 'DETECTED'
                      ? 'bg-[#f0fdfc] border-[#ccfbf1]'
                      : mfgField?.status === 'UNCLEAR'
                      ? 'bg-[#fffbeb] border-[#fde68a]'
                      : 'bg-[#fff7ed] border-[#fed7aa]'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {mfgField?.status === 'DETECTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      ) : mfgField?.status === 'UNCLEAR' ? (
                        <HelpCircle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      )}
                      <span className="text-[#475569] font-medium">Mfg Date</span>
                    </div>
                    <span className={`font-bold ${
                      mfgField?.status === 'DETECTED' 
                        ? 'text-[#0f172a]' 
                        : mfgField?.status === 'UNCLEAR'
                        ? 'text-[#b45309] text-[10px]'
                        : 'text-[#c2410c] text-[10px]'
                    }`}>
                      {mfgField?.status === 'DETECTED'
                        ? mfgField.value
                        : mfgField?.status === 'UNCLEAR'
                        ? 'UNCLEAR'
                        : 'NOT DETECTED'}
                    </span>
                  </div>

                  {/* Consumer Helpline */}
                  <div className={`p-2 border rounded flex items-center justify-between ${
                    helplineField?.status === 'DETECTED'
                      ? 'bg-[#f0fdfc] border-[#ccfbf1]'
                      : 'bg-[#fff7ed] border-[#fed7aa]'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {helplineField?.status === 'DETECTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488] shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      )}
                      <span className="text-[#475569] font-medium">Helpline</span>
                    </div>
                    <span className={`font-bold ${
                      helplineField?.status === 'DETECTED' ? 'text-[#0f172a]' : 'text-[#c2410c] text-[10px]'
                    }`}>
                      {helplineField?.status === 'DETECTED'
                        ? helplineField.value
                        : 'NOT DETECTED'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xs text-[#0f172a] rounded-xl p-5 shadow-xs border border-[#ccfbf1] text-center z-10 space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-[#e0fbf9] border border-[#99f6e4] text-[#0d9488] flex items-center justify-center mx-auto shadow-xs">
                  <Focus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-['Space_Grotesk'] text-sm font-bold text-[#0f172a]">
                    Packaging Viewfinder Ready
                  </div>
                  <p className="text-xs text-[#64748b] mt-1 max-w-xs mx-auto">
                    Point camera at retail commodity or use <strong>Direct 2-Shot Audit</strong> to inspect MRP, Net Quantity &amp; Legal Metrology declarations.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-[#f0fdfc] border border-[#ccfbf1] text-[#0f766e] font-['JetBrains_Mono'] text-[10px] font-semibold rounded">
                    Rule 6 Audit Active
                  </span>
                  <span className="px-2 py-0.5 bg-[#f0fdfc] border border-[#ccfbf1] text-[#0f766e] font-['JetBrains_Mono'] text-[10px] font-semibold rounded">
                    Gemini Multimodal AI
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Plain language guidance & Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-[#64748b] font-['JetBrains_Mono'] text-[11.5px] font-medium">
            <Focus className="w-4 h-4 text-[#0d9488]" />
            <span>
              {step === 1
                ? 'Align barcode in frame or click "Direct 2-Shot Audit"'
                : step === 2
                ? 'Shot 1 of 2: Point camera at front panel (Brand, Net Wt)'
                : step === 3
                ? 'Shot 2 of 2: Point camera at back panel (MRP, Date, Ingredients)'
                : 'Optional Shot 3: Side panel or seal flap (Packer, USP)'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCameraActive ? (
              <>
                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                    }}
                    className="px-3 py-2 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#0f766e] border border-[#ccfbf1] font-['Space_Grotesk'] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Skip to 2-Shot Photos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {step === 3 && thumbnails.front && (
                  <button
                    type="button"
                    onClick={() => submitMultiStepScan(capturedData)}
                    className="px-3 py-2 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#0f766e] border border-[#ccfbf1] font-['Space_Grotesk'] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Analyze directly with front photo"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Analyze Front Only</span>
                  </button>
                )}
                {step === 4 && (
                  <button
                    type="button"
                    onClick={handleSkipStep4}
                    className="px-3 py-2 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#0f766e] border border-[#ccfbf1] font-['Space_Grotesk'] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#0d9488]" />
                    <span>Analyze 2 Photos Now</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-4 py-2 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#2bc4be]"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {step === 1
                      ? 'Capture Barcode Frame'
                      : step === 2
                      ? 'Capture Front Photo (1/2)'
                      : step === 3
                      ? 'Capture Back Photo (2/2)'
                      : 'Capture Side Photo (3/3)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3] font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Scanner</span>
                </button>
              </>
            ) : (
              <>
                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(2);
                      startCamera();
                    }}
                    className="px-3.5 py-2 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#0f766e] border border-[#ccfbf1] font-['Space_Grotesk'] text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Layers className="w-4 h-4 text-[#0d9488]" />
                    <span>Direct 2-Shot Audit</span>
                  </button>
                )}
                {thumbnails.front && (
                  <button
                    type="button"
                    onClick={() => submitMultiStepScan(capturedData)}
                    className="px-3.5 py-2 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#2bc4be]"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      Analyze Captured ({[thumbnails.front, thumbnails.back, thumbnails.side].filter(Boolean).length} Photos)
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      barcodeFileInputRef.current?.click();
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="px-4 py-2 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#334155] border border-[#ccfbf1] font-['Space_Grotesk'] text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-4 h-4 text-[#64748b]" />
                  <span>
                    {step === 1
                      ? 'Upload Label File'
                      : `Upload Shot ${step === 2 ? '1 (Front)' : step === 3 ? '2 (Back)' : '3 (Side)'} Photo`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] text-[13px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#2bc4be]"
                >
                  <Camera className="w-4 h-4" />
                  <span>{thumbnails.front ? 'Resume Camera' : 'Start Live Scanner'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Optional Manual Barcode Input bar at bottom */}
        {!isCameraActive && (
          <form onSubmit={handleManualBarcodeSubmit} className="mt-3 pt-3 border-t border-[#ccfbf1] flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[10.5px] font-bold text-[#64748b] uppercase tracking-wider shrink-0">
              Manual EAN:
            </span>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Or enter barcode (e.g. 8901058852371)"
              className="bg-[#f0fdfc] border border-[#ccfbf1] rounded-md px-3 py-1.5 text-xs text-[#0f172a] placeholder-[#94a3b8] font-['JetBrains_Mono'] flex-1 focus:outline-none focus:border-[#47d1cc]"
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="px-3.5 py-1.5 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] font-bold rounded-md text-xs disabled:opacity-40 cursor-pointer transition shadow-xs border border-[#2bc4be]"
            >
              Verify
            </button>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Right: Rule 6 Checklist (8 Plain-Language Declarations) (col-span-4) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 bg-white rounded-xl p-5 sm:p-6 border border-[#ccfbf1] shadow-xs flex flex-col justify-between space-y-4">
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
                  : 'bg-[#e6fbf9] text-[#0f766e] border-[#99f6e4]'
              }`}
            >
              {isViolationState ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#ea580c]" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0d9488]" />
              )}
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
                      : 'bg-[#f8fefe] border-[#e2e8f0]'
                  }`}
                >
                  <span className={`font-['JetBrains_Mono'] text-[11.5px] font-medium ${isMissing ? 'text-[#9a3412]' : 'text-[#334155]'}`}>
                    {item.num}. {item.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold rounded border ${
                      isMissing
                        ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]'
                        : 'bg-[#e6fbf9] text-[#0f766e] border-[#99f6e4]'
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
        <div className="p-3.5 bg-[#f0fdfc] border border-[#ccfbf1] rounded-lg space-y-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0d9488]" />
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
            className="w-full mt-2 py-2 px-3 bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] font-['Space_Grotesk'] text-[12px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer border border-[#2bc4be]"
          >
            <Printer className="w-4 h-4" />
            <span>GENERATE SEC 36 AUDIT REPORT</span>
          </button>
        </div>
      </div>
    </section>
  );
}
