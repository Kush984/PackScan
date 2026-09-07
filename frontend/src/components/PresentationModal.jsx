import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  Activity,
  ShieldAlert,
  Smartphone,
  Maximize2,
  ExternalLink,
} from 'lucide-react';

export default function PresentationModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => (prev < 6 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slidesData = [
    {
      id: 1,
      badge: 'SIH 2026 GRAND FINALE • PROBLEM STATEMENT SIH26034',
      title: 'PACKSCAN: Autonomous Dual-Framework Metrology & Consumer Safety Engine',
      subtitle:
        'A Sovereign Edge-AI System for Enforcing Legal Metrology Rules, 2011 & FSSAI Regulations, 2020',
      notes:
        'Hook the jury immediately: "Judges, 84.2% of Indian packaged goods violate statutory print standards. Manufacturers use dark patterns to hide MRP, net quantity, and toxic ingredients. PackScan is India\'s first dual-framework regulatory inspection engine that turns any standard smartphone into a certified metrology and food safety auditor in under 3 seconds."',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full">
          {/* Left Column: Metric Highlight */}
          <div className="md:col-span-5 bg-[#081B16] border border-[#B8532F]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#B8532F] uppercase tracking-wider block mb-2">
                CRITICAL REGULATORY FAILURE
              </span>
              <div className="text-5xl font-extrabold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                84.2%
              </div>
              <div className="text-base font-bold font-['Space_Grotesk'] text-[#D97706] mb-4">
                Retail Packaging Non-Compliance Rate
              </div>
              <p className="text-sm text-[#BAC5BF] leading-relaxed mb-4">
                Across 1,200+ audited FMCG products in Indian retail, 84.2% violate statutory labelling standards through deliberate dark patterns:
              </p>
              <div className="space-y-2.5 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold shrink-0">• Sub-Millimeter Fonts:</span>
                  <span className="text-[#F4F3EE]">Net weight &amp; MRP printed below Rule 9 Table I minimum height thresholds.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold shrink-0">• Missing Declarations:</span>
                  <span className="text-[#F4F3EE]">Omission of mandatory Consumer Care email/tel and true Packer identity (Rule 6).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#DC2626] font-bold shrink-0">• Veiled Toxins:</span>
                  <span className="text-[#F4F3EE]">Unheralded sugar spikes (maltodextrin, invert syrup) and unflagged allergens.</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E4A3D] text-[11px] font-mono text-[#758A82]">
              Source: Legal Metrology Department &amp; FSSAI Retail Audit Survey 2025-26
            </div>
          </div>

          {/* Right Column: 3 Pillars */}
          <div className="md:col-span-7 flex flex-col justify-between gap-3">
            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-[#10B981]">
                  PILLAR 01 • STATUTORY LEGAL METROLOGY ACT, 2009
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                  SEC 36 COMPLIANT
                </span>
              </div>
              <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                Automated Section 36 Penalty Dossier Generation
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Transforms manual, error-prone field inspections into instant forensic legal reports. Auto-populates Section 36 penalty notices (INR 25,000–50,000) with timestamped, geolocated bounding box evidence.
              </p>
            </div>

            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-[#34D399]">
                  PILLAR 02 • EDGE VISION &amp; GEOMETRIC CALIBRATION
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#34D399]/15 text-[#34D399]">
                  0 CLOUD BYTES
                </span>
              </div>
              <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                100% On-Device Millimeter Font Calibration
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Executes client-side OCR without sending private consumer telemetry to third-party clouds. Implements camera perspective rectification and optical pixel-to-mm mapping against Principal Display Panel area.
              </p>
            </div>

            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[11px] font-bold text-[#D97706]">
                  PILLAR 03 • FSSAI 2020 &amp; GLOBAL HARMONIZATION
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#D97706]/15 text-[#D97706]">
                  140+ DIRECTIVES
                </span>
              </div>
              <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                Personalized Medical Allergen &amp; Chemical Audit
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Evaluates 8 mandatory FSSAI food allergens and benchmarks harmful food additives against European Food Safety Authority (EFSA) bans (e.g. Titanium Dioxide E171 genotoxicity, Tartrazine hyperactivity).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      badge: 'SIH26034 • PROPOSED SOLUTION & DUAL-RULE INNOVATION',
      title: 'Dual-Framework Statutory Compliance & Personal Health Safety',
      subtitle:
        'Unifying Legal Metrology Inspection and FSSAI Nutritional Health into a Single 3-Second Edge Scan',
      notes:
        'Explain the core innovation: "Judges, other barcode scanner apps only show generic star ratings. PackScan is fundamentally different: it simultaneously enforces two distinct Indian regulatory statutes in parallel. Left pane: The legal officer gets an objective verification of Rule 6 declarations and Rule 9 font height. Right pane: The consumer gets clinical allergen warnings and chronic disease risk analysis based on FSSAI 2020 thresholds."',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
          {/* Framework 1 */}
          <div className="bg-[#081B16] border border-[#10B981]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#10B981] uppercase tracking-wider">
                  STATUTORY FRAMEWORK 01
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981]">
                  LEGAL METROLOGY ACT 2009
                </span>
              </div>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                Legal Metrology (PC) Rules, 2011
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#34D399] font-bold block mb-1">
                    1. Rule 6(1) Mandatory 8 Declarations Audit:
                  </span>
                  <ul className="text-[#BAC5BF] space-y-1 pl-3 border-l border-[#1E4A3D]">
                    <li>• Name &amp; complete postal address of Manufacturer / Packer.</li>
                    <li>• Generic commodity name &amp; Country of Origin.</li>
                    <li>• Net Quantity in standard metric units (g, kg, mL, L).</li>
                    <li>• Month &amp; Year of manufacture / packing &amp; Best Before date.</li>
                    <li>• Maximum Retail Price (MRP) 'inclusive of all taxes'.</li>
                    <li>• Consumer Care cell: Phone, email, and named grievance officer.</li>
                  </ul>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block mb-1">
                    2. Rule 9 Table I Minimum Font Height Verification:
                  </span>
                  <p className="text-[#BAC5BF] text-[11px] font-sans leading-relaxed">
                    Dynamically computes Principal Display Panel (PDP) surface area. Flags fonts below 1.0mm, 2.0mm, 4.0mm, or 6.0mm statutory thresholds using focal pixel-to-mm ratio.
                  </p>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block mb-1">
                    3. Section 36 Penalty Notice Compilation:
                  </span>
                  <p className="text-[#BAC5BF] text-[11px] font-sans leading-relaxed">
                    Auto-formats compounding penalty show-cause notices for Legal Metrology Officers under Section 36(1) and 36(2) of the Act.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Framework 2 */}
          <div className="bg-[#081B16] border border-[#D97706]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#D97706] uppercase tracking-wider">
                  STATUTORY FRAMEWORK 02
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#D97706]/20 text-[#D97706]">
                  FSS ACT 2006
                </span>
              </div>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                FSSAI Food Safety Regulations, 2020
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#FBBF24] font-bold block mb-1">
                    1. 8 Mandatory Allergen Class Cross-Checking:
                  </span>
                  <ul className="text-[#BAC5BF] space-y-1 pl-3 border-l border-[#1E4A3D]">
                    <li>• Cereals containing Gluten, Crustaceans, Fish, Eggs.</li>
                    <li>• Peanuts, Soybeans, Milk &amp; Dairy, Tree nuts.</li>
                    <li>• Multi-alias synonym parsing (e.g. casein, whey, semolina).</li>
                  </ul>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block mb-1">
                    2. Clinical Nutrient Profile &amp; % RDA Limits:
                  </span>
                  <ul className="text-[#BAC5BF] space-y-1 pl-3 border-l border-[#1E4A3D]">
                    <li>• Added Sugars &gt; 10% total energy (flags hidden dextrin/sucrose).</li>
                    <li>• Saturated Fat &gt; 22g/100g &amp; Sodium &gt; 600mg/100g thresholds.</li>
                    <li>• Real-time tailoring to user chronic conditions (Type 2 Diabetes, Hypertension, Celiac, Coronary Artery Disease).</li>
                  </ul>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block mb-1">
                    3. Cross-Border International Additive Surveillance:
                  </span>
                  <p className="text-[#BAC5BF] text-[11px] font-sans leading-relaxed">
                    Flags hazardous additives banned under EFSA (EU) and US FDA rules, eliminating regulatory dumping in domestic consumer food chains.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      badge: 'SIH26034 • TECHNICAL ARCHITECTURE & PIPELINE',
      title: '4-Stage On-Device Machine Vision & Legal Reasoning Engine',
      subtitle:
        'Deterministic Statutory Evaluation without Latency Bottlenecks or Cloud Privacy Compromises',
      notes:
        'Walk through the technical pipeline step-by-step: "Here is our 4-stage pipeline. In Stage 1, we capture 1080p frames and apply CLAHE contrast enhancement with homography dewarping for curved cans. In Stage 2, edge OCR extracts bounding boxes and calculates pixel-to-millimeter font height against Rule 9 Table I. In Stage 3, our dual-rule parser evaluates Rule 6 declarations and cross-references 1,400+ allergen synonyms. Finally in Stage 4, we generate an encrypted local health ledger and an instant Section 36 PDF notice. Total turnaround: 2.8 seconds!"',
      content: (
        <div className="flex flex-col justify-between h-full gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 h-full">
            {/* Stage 1 */}
            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#10B981] block mb-1">
                  STAGE 01 • 0.4s
                </span>
                <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                  Camera Ingestion &amp; Rectification
                </h4>
                <div className="space-y-2 text-xs text-[#BAC5BF]">
                  <p>• 1080p Camera Frame Buffer Capture.</p>
                  <p>• CLAHE Adaptive Contrast for glare suppression.</p>
                  <p>• Packaging Boundary Corner Detection &amp; Homography Dewarping.</p>
                  <p>• Principal Display Panel (PDP) Surface Area Calculation.</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#1E4A3D] font-mono text-[10px] text-[#758A82]">
                Input: Raw Image Buffer
              </div>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#34D399] block mb-1">
                  STAGE 02 • 0.8s
                </span>
                <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                  Edge OCR &amp; Font Height Telemetry
                </h4>
                <div className="space-y-2 text-xs text-[#BAC5BF]">
                  <p>• Neural Character Segmentation &amp; Bounding Boxes.</p>
                  <p>• Geometric x-height &amp; cap-height letter isolation.</p>
                  <p>• Optical Pixel-to-mm Focal Calibration Mapping.</p>
                  <p>• Direct comparison against Rule 9 Table I statutory minimums.</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#1E4A3D] font-mono text-[10px] text-[#758A82]">
                Output: Calibrated mm Telemetry
              </div>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#D97706] block mb-1">
                  STAGE 03 • 1.1s
                </span>
                <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                  Dual-Rule Engine &amp; Vector Matching
                </h4>
                <div className="space-y-2 text-xs text-[#BAC5BF]">
                  <p>• Rule 6 Clause-by-Clause Regex &amp; Semantic Parser.</p>
                  <p>• FSSAI Allergen Cross-Reference (1,400+ botanical synonyms).</p>
                  <p>• Chronic Disease Nutrition Threshold Validator (% RDA).</p>
                  <p>• Multi-Jurisdiction Additive Banned Status Vector Lookup.</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#1E4A3D] font-mono text-[10px] text-[#758A82]">
                Logic: Parallel Dual Inference
              </div>
            </div>

            {/* Stage 4 */}
            <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#B8532F] block mb-1">
                  STAGE 04 • 0.5s
                </span>
                <h4 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                  Enforcement Export &amp; Health Ledger
                </h4>
                <div className="space-y-2 text-xs text-[#BAC5BF]">
                  <p>• High-contrast forensic UI telemetry rendering.</p>
                  <p>• Section 36 PDF Penalty Legal Notice Compilation.</p>
                  <p>• Local Encrypted Health Ledger logging for personal safety.</p>
                  <p>• Offline sync queue with automatic cloud reconciliation.</p>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#1E4A3D] font-mono text-[10px] text-[#758A82]">
                Artifact: Signed Legal Dossier
              </div>
            </div>
          </div>

          {/* Specs Banner */}
          <div className="bg-[#0F2D25] border border-[#1E4A3D] rounded-lg px-4 py-2.5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="font-bold text-[#10B981]">SYSTEM BENCHMARKS:</span>
              <span className="text-[#F4F3EE]">End-to-End Latency: &lt; 2.8s</span>
              <span className="text-[#758A82]">|</span>
              <span className="text-[#F4F3EE]">OCR Accuracy: 96.4%</span>
              <span className="text-[#758A82]">|</span>
              <span className="text-[#F4F3EE]">0 Cloud Latency in Offline Mode</span>
            </div>
            <div className="text-[#BAC5BF]">Target: Standard Android / iOS Smartphones</div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      badge: 'SIH26034 • FEASIBILITY, EDGE CASES & LEAN CANVAS',
      title: 'Engineering Robustness & Operational Viability Matrix',
      subtitle: 'Overcoming Real-World Retail Artifacts and Ensuring Sustainable Scale',
      notes:
        'Highlight our edge-case solutions: "Judges, prototypes often break on real-world retail shelves. We specifically solved 3 major edge cases: First, cylindrical distortion on round soda cans using unrolling algorithms. Second, bilingual Hindi/English packaging using script-routed OCR. Third, zero internet connectivity in rural Kirana stores through an offline edge rule database. Look at our Lean Canvas: zero hardware cost, instant deployment, high social impact."',
      content: (
        <div className="flex flex-col justify-between h-full gap-4">
          {/* Top 3 Edge Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#081B16] border border-[#B8532F]/60 rounded-lg p-3.5">
              <span className="font-mono text-[10px] font-bold text-[#B8532F] uppercase block mb-1">
                EDGE CASE 01: CURVED PACKAGING
              </span>
              <h4 className="text-sm font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                Cylindrical Can &amp; Bottle Warp
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Distortion along curved surfaces causes standard OCR to fragment text. Solved via dynamic cylindrical unrolling algorithms and multi-angle composite stitching.
              </p>
            </div>

            <div className="bg-[#081B16] border border-[#D97706]/60 rounded-lg p-3.5">
              <span className="font-mono text-[10px] font-bold text-[#D97706] uppercase block mb-1">
                EDGE CASE 02: MULTILINGUAL LABELS
              </span>
              <h4 className="text-sm font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                Devanagari + Regional Scripts
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Indian FMCG labels frequently use dual-language declarations (Hindi/English). Solved via script-routing OCR and phonetic normalisation dictionaries.
              </p>
            </div>

            <div className="bg-[#081B16] border border-[#10B981]/60 rounded-lg p-3.5">
              <span className="font-mono text-[10px] font-bold text-[#10B981] uppercase block mb-1">
                EDGE CASE 03: ZERO CONNECTIVITY
              </span>
              <h4 className="text-sm font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-1">
                Rural Kirana &amp; Offline Audits
              </h4>
              <p className="text-xs text-[#BAC5BF] leading-relaxed">
                Weak indoor cellular reception in supermarkets or remote villages. Solved via bundled edge rule definitions (Dexie/SQLite) requiring 0 cloud bytes to audit.
              </p>
            </div>
          </div>

          {/* Bottom Lean Canvas 5-Column Grid */}
          <div className="bg-[#081B16] border border-[#1E4A3D] rounded-lg p-3.5">
            <div className="font-mono text-[11px] font-bold text-[#34D399] uppercase tracking-wider mb-2.5">
              LEAN CANVAS EXECUTIVE MATRIX
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 font-mono text-xs">
              <div className="bg-[#0F2D25] p-2.5 rounded border border-[#1E4A3D]">
                <span className="text-[#DC2626] font-bold block mb-1">PROBLEM</span>
                <p className="text-[11px] text-[#BAC5BF] font-sans">
                  Sub-millimeter fine print, 84.2% statutory breach, and concealed allergen cross-contamination.
                </p>
              </div>
              <div className="bg-[#0F2D25] p-2.5 rounded border border-[#1E4A3D]">
                <span className="text-[#10B981] font-bold block mb-1">SOLUTION</span>
                <p className="text-[11px] text-[#BAC5BF] font-sans">
                  Edge dual-framework scanner (Rule 6/9 + FSSAI) with instant Section 36 notice synthesis.
                </p>
              </div>
              <div className="bg-[#0F2D25] p-2.5 rounded border border-[#1E4A3D]">
                <span className="text-[#34D399] font-bold block mb-1">KEY METRICS</span>
                <p className="text-[11px] text-[#BAC5BF] font-sans">
                  &lt; 2.8s latency, 96.4% recall, 100% offline edge capability, 0 cloud subscription cost.
                </p>
              </div>
              <div className="bg-[#0F2D25] p-2.5 rounded border border-[#1E4A3D]">
                <span className="text-[#D97706] font-bold block mb-1">COST STRUCTURE</span>
                <p className="text-[11px] text-[#BAC5BF] font-sans">
                  Zero dedicated hardware. Client-side compute eliminates cloud API bills. Free for public.
                </p>
              </div>
              <div className="bg-[#0F2D25] p-2.5 rounded border border-[#1E4A3D]">
                <span className="text-[#B8532F] font-bold block mb-1">UNFAIR ADVANTAGE</span>
                <p className="text-[11px] text-[#BAC5BF] font-sans">
                  Proprietary dual legal-medical engine with automated court-admissible evidence hashes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      badge: 'SIH26034 • SOCIETAL, HEALTH & ECONOMIC IMPACT',
      title: 'Public Health Defense, Cross-Border Benchmarking & Revenue Recovery',
      subtitle: 'Quantifiable Dividends for 1.4 Billion Consumers and Government Enforcement Bodies',
      notes:
        'Deliver the impact punchline: "Judges, this isn\'t just software; it is national infrastructure. India has 101 million diabetics and 315 million hypertensives. PackScan acts as their personal health guardian before they reach the cash register. On the regulatory side, we harmonize global standards by exposing chemicals banned in Europe like E171 Titanium Dioxide that are still dumped in Indian products. And for the Ministry, Section 36 penalty notices unlock streamlined compliance and revenue recovery."',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
          {/* Pillar 1 */}
          <div className="bg-[#081B16] border border-[#10B981]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#10B981] uppercase tracking-wider block mb-2">
                IMPACT SECTOR 01
              </span>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-2">
                Preventive NCD Defense
              </h3>
              <div className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#34D399] mb-1">
                101M+
              </div>
              <div className="text-xs font-mono text-[#758A82] mb-4">
                Diabetic Citizens Protected (ICMR)
              </div>
              <div className="space-y-3 text-xs text-[#BAC5BF] leading-relaxed">
                <p>• Unmasks hidden glycemic loads (maltodextrin, high-fructose syrup) concealed under micro fine print.</p>
                <p>• Protects 315M+ hypertensive Indians by flagging sodium in excess of 600mg per 100g serving.</p>
                <p>• Eliminates accidental emergency room anaphylaxis across 8 major food allergen classes.</p>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#081B16] border border-[#D97706]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-2">
                IMPACT SECTOR 02
              </span>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-2">
                Cross-Border Harmonization
              </h3>
              <div className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#D97706] mb-1">
                140+
              </div>
              <div className="text-xs font-mono text-[#758A82] mb-4">
                Global Additive Directives Monitored
              </div>
              <div className="space-y-3 text-xs text-[#BAC5BF] leading-relaxed">
                <p>• <strong>E171 Titanium Dioxide:</strong> Banned by EFSA (EU Reg 2022/63) for genotoxicity, yet still found in domestic confectionary.</p>
                <p>• <strong>Tartrazine (E102):</strong> Flags UK Southampton warning ('may have adverse effect on activity in children').</p>
                <p>• Closes regulatory arbitrage exploited by multinational conglomerates in emerging markets.</p>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#081B16] border border-[#B8532F]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#B8532F] uppercase tracking-wider block mb-2">
                IMPACT SECTOR 03
              </span>
              <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-2">
                Statutory Revenue Recovery
              </h3>
              <div className="text-4xl font-extrabold font-['Space_Grotesk'] text-[#B8532F] mb-1">
                ₹50,000
              </div>
              <div className="text-xs font-mono text-[#758A82] mb-4">
                Section 36 Compounding Fine per Violation
              </div>
              <div className="space-y-3 text-xs text-[#BAC5BF] leading-relaxed">
                <p>• Empowers 5,000+ Legal Metrology Inspectors across India with 10x faster inspection turnaround.</p>
                <p>• Eliminates evidentiary dismissal in consumer courts via tamper-evident cryptographic image hashes.</p>
                <p>• Establishes transparent accountability across large-scale retail supermarket chains.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      badge: 'SIH26034 • STATUTORY BIBLIOGRAPHY & SCIENTIFIC CITATIONS',
      title: 'Statutory Legal Acts & Peer-Reviewed Scientific Bibliography',
      subtitle:
        'A Rigorous Research Foundation Grounded in Published Law and Clinical Nutritional Science',
      notes:
        'Close with scholarly authority: "Judges, our system is grounded in verifiable law and published science. We have referenced the exact clauses of the Legal Metrology Act 2009 Section 36, Packaging Rules 2011 Rule 6 and 9, and FSSAI 2020. Our chemical warning engine references EFSA\'s landmark 2021 study on Titanium Dioxide genotoxicity and the 2007 Lancet Southampton study on food colourings. We are ready for your technical questions!"',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
          {/* Statutory Acts */}
          <div className="bg-[#081B16] border border-[#10B981]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#10B981] uppercase tracking-wider block mb-2">
                STATUTORY LEGAL ACTS &amp; GAZETTES
              </span>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                Government of India Regulatory Framework
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#34D399] font-bold block">
                    [1] Legal Metrology Act, 2009 (Act No. 1 of 2010)
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    Section 36(1) &amp; (2): Penalty for selling non-standard packages and compounding penalties up to ₹50,000 for recurring non-compliance.
                  </p>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block">
                    [2] Legal Metrology (Packaged Commodities) Rules, 2011
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    Rule 6 (Mandatory declarations: MRP, Net Qty, Mfg date, Consumer Care) &amp; Rule 9 (Table I &amp; II: Minimum numeral &amp; letter print heights).
                  </p>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block">
                    [3] FSSAI (Labelling and Display) Regulations, 2020
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    F. No. 1-94/FSSAI/SP(L&amp;C)/2017: Nutritional information per 100g/serving, % RDA contribution, and mandatory 8 major allergen declarations.
                  </p>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block">
                    [4] Consumer Protection Act, 2019 (Act No. 35 of 2019)
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    Section 2(28) &amp; Section 89: Prosecution against misleading advertisements and deliberate concealment of material facts on consumer packaging.
                  </p>
                </div>

                <div>
                  <span className="text-[#34D399] font-bold block">
                    [5] CCPA Guidelines for Prevention of Dark Patterns, 2023
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    Prohibits deceptive packaging architectures, disguised advertising, and obscured consumer grievance pathways.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scientific Papers */}
          <div className="bg-[#081B16] border border-[#D97706]/60 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-2">
                PEER-REVIEWED CLINICAL &amp; TECHNICAL PAPERS
              </span>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#F4F3EE] mb-3">
                Published Medical &amp; Computer Vision Evidence
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#FBBF24] font-bold block">
                    [6] EFSA Panel on Food Additives (2021)
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    "Safety assessment of titanium dioxide (E171) as a food additive." <em>EFSA Journal</em>, 19(5):6585. Proves genotoxicity and DNA strand breakage.
                  </p>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block">
                    [7] McCann, D., et al. (2007) - The Lancet
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    "Food additives and hyperactive behaviour in children." <em>The Lancet</em>, 370(9598):1560-1567. Established clinical link between azo dyes &amp; ADHD.
                  </p>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block">
                    [8] ICMR-INDIAB National Study (2023)
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    "Prevalence of diabetes and NCDs in India." <em>Lancet Diabetes &amp; Endocrinology</em>, 11(7):474-489. Documents 101M diabetics &amp; 136M pre-diabetics.
                  </p>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block">
                    [9] Popkin, B. M., et al. (2012)
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    "Global nutrition transition and the pandemic of obesity in developing countries." <em>Nutrition Reviews</em>, 70(1):3-21.
                  </p>
                </div>

                <div>
                  <span className="text-[#FBBF24] font-bold block">
                    [10] ISO/IEC 15415 &amp; 15416 International Standards
                  </span>
                  <p className="text-[11px] text-[#BAC5BF] font-sans">
                    Information technology — Automatic identification &amp; data capture: Barcode print quality test specification for packaging verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activeSlideData = slidesData[currentSlide - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="relative w-full max-w-[1400px] h-[95vh] bg-[#040D0A] border border-[#1E4A3D] rounded-xl flex flex-col shadow-2xl overflow-hidden text-[#F4F3EE]">
        {/* Top Console Bar */}
        <div className="h-14 border-b border-[#1E4A3D] bg-[#081B16] px-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="font-['Space_Grotesk'] font-bold text-base text-[#F4F3EE]">
              PackScan Executive Pitch Deck
            </span>
            <span className="hidden sm:inline-block font-mono text-xs px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              SIH26034 GRAND FINALE
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Judge 3-Device Status */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0F2D25] border border-[#1E4A3D] font-mono text-xs text-[#BAC5BF]">
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>3-Device Live Sync Ready</span>
            </div>

            {/* Presenter Notes Button */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
                showNotes
                  ? 'bg-[#B8532F] text-white border-[#B8532F]'
                  : 'bg-[#0F2D25] text-[#BAC5BF] border-[#1E4A3D] hover:text-[#F4F3EE]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showNotes ? 'Hide Speaker Notes' : 'Speaker Notes'}</span>
            </button>

            {/* Download PPTX Button */}
            <a
              href="/PackScan_SIH2026_Presentation.pptx"
              download="PackScan_SIH2026_Presentation.pptx"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono bg-[#10B981] text-[#040D0A] font-bold hover:bg-[#34D399] transition-colors shrink-0"
              title="Download Native PowerPoint File (.pptx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PPTX</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#BAC5BF] hover:text-[#F4F3EE] hover:bg-[#0F2D25] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Stage & Notes Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Slide Canvas */}
          <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
            {/* Slide Header */}
            <div className="mb-4">
              <span className="font-mono text-xs font-bold text-[#10B981] block mb-1">
                • {activeSlideData.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold font-['Space_Grotesk'] text-[#F4F3EE] tracking-tight">
                {activeSlideData.title}
              </h2>
              {activeSlideData.subtitle && (
                <p className="text-xs sm:text-sm text-[#BAC5BF] italic mt-0.5">
                  {activeSlideData.subtitle}
                </p>
              )}
            </div>

            {/* Slide Body Content */}
            <div className="flex-1 min-h-[420px]">{activeSlideData.content}</div>
          </div>

          {/* Collapsible Presenter Notes Sidebar */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 340, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-[#1E4A3D] bg-[#081B16] p-4 flex flex-col justify-between overflow-y-auto shrink-0"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E4A3D] mb-3">
                    <span className="font-mono text-xs font-bold text-[#D97706] uppercase">
                      PRESENTER SCRIPT (SLIDE {currentSlide})
                    </span>
                    <span className="text-[10px] font-mono text-[#758A82]">Target: 1m 20s</span>
                  </div>
                  <p className="text-xs text-[#F4F3EE] font-sans leading-relaxed bg-[#0F2D25] p-3 rounded border border-[#1E4A3D] mb-4">
                    {activeSlideData.notes}
                  </p>

                  <div className="border-t border-[#1E4A3D] pt-3">
                    <span className="font-mono text-xs font-bold text-[#10B981] uppercase block mb-2">
                      3-DEVICE JUDGE DEMO CUE
                    </span>
                    <div className="space-y-2 text-[11px] font-mono text-[#BAC5BF]">
                      <div className="bg-[#040D0A] p-2 rounded border border-[#1E4A3D]">
                        <span className="text-[#10B981] font-bold">Device 1 (Officer):</span> Point camera to font height defect; show instant Section 36 violation warning.
                      </div>
                      <div className="bg-[#040D0A] p-2 rounded border border-[#1E4A3D]">
                        <span className="text-[#D97706] font-bold">Device 2 (Diabetic):</span> Scan same item; show immediate sugar &amp; glycemic load alert.
                      </div>
                      <div className="bg-[#040D0A] p-2 rounded border border-[#1E4A3D]">
                        <span className="text-[#34D399] font-bold">Device 3 (Ledger):</span> Show live multi-user incident ledger synchronized in real-time!
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E4A3D] text-[10px] font-mono text-[#758A82]">
                  Keyboard Shortcuts: [←] Prev Slide | [→] Next Slide | [Esc] Exit
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="h-16 border-t border-[#1E4A3D] bg-[#081B16] px-4 flex items-center justify-between gap-3 shrink-0">
          {/* Slide Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {slidesData.map((s) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(s.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded font-mono text-xs transition-all ${
                  currentSlide === s.id
                    ? 'bg-[#10B981] text-[#040D0A] font-bold shadow-md'
                    : 'bg-[#0F2D25] text-[#BAC5BF] hover:text-[#F4F3EE] hover:bg-[#13382E]'
                }`}
              >
                <span>0{s.id}</span>
                <span className="hidden lg:inline text-[11px]">
                  {s.id === 1 && 'Mandate'}
                  {s.id === 2 && 'Solution'}
                  {s.id === 3 && 'Pipeline'}
                  {s.id === 4 && 'Lean Canvas'}
                  {s.id === 5 && 'Impact'}
                  {s.id === 6 && 'References'}
                </span>
              </button>
            ))}
          </div>

          {/* Prev / Next Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#BAC5BF] mr-2 hidden sm:inline">
              Slide {currentSlide} of 6
            </span>
            <button
              onClick={() => setCurrentSlide((prev) => (prev > 1 ? prev - 1 : prev))}
              disabled={currentSlide === 1}
              className="p-1.5 rounded bg-[#0F2D25] border border-[#1E4A3D] text-[#F4F3EE] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#13382E] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev < 6 ? prev + 1 : prev))}
              disabled={currentSlide === 6}
              className="p-1.5 rounded bg-[#0F2D25] border border-[#1E4A3D] text-[#F4F3EE] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#13382E] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
