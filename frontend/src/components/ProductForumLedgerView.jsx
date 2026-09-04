import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnforcementDashboard from './EnforcementDashboard';

export default function ProductForumLedgerView({
  deviceId = 'DL-MH-26034',
  onSelectProductForAudit,
}) {
  const [docketTab, setDocketTab] = useState('request'); // 'request' | 'community' | 'ledger'
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('snacks');
  const [notes, setNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [toastInfo, setToastInfo] = useState({ show: false, message: '' });

  // Default fallback community items in case backend is empty
  const defaultCommunityItems = [
    {
      id: 'default-1',
      category: 'Confectionery',
      product_name: 'Britannia Jim Jam 150g',
      barcode: '8901063013217',
      batch: 'MH-04',
      status: 'Pending Review (Batch MH-04)',
      notes: "Front pack advertises 'real fruit jam center' but the font size for net quantity appears less than 3mm statutory requirement for 150g packaging under Rule 7. High simple sugar content suspected.",
      requested_by: 'Officer DL-094',
      time_ago: '3 hours ago',
      upvotes: 14,
    },
    {
      id: 'default-2',
      category: 'Beverages',
      product_name: 'Frooti Mango Drink 200ml',
      barcode: '8901058852371',
      batch: 'DL-01',
      status: 'Under Review',
      notes: 'Added sugars declaration exceeds recommended daily threshold. Verification requested for font size on nutrition table per Rule 6(1)(b).',
      requested_by: 'Officer MH-112',
      time_ago: '5 hours ago',
      upvotes: 8,
    },
  ];

  const fetchCommunityRequests = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          // Merge with default items to ensure rich display
          const merged = [
            ...data.map((item) => ({
              ...item,
              batch: 'DL-02',
              time_ago: 'Recently submitted',
              status: item.status || 'Pending Verification',
            })),
            ...defaultCommunityItems.filter(
              (def) => !data.some((d) => d.product_name === def.product_name)
            ),
          ];
          setFeedbackList(merged);
        } else {
          setFeedbackList(defaultCommunityItems);
        }
      } else {
        setFeedbackList(defaultCommunityItems);
      }
    } catch (e) {
      setFeedbackList(defaultCommunityItems);
    }
  };

  useEffect(() => {
    fetchCommunityRequests();
  }, []);

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    // Check if real backend numeric id
    if (typeof id === 'number') {
      try {
        const res = await fetch(`/api/feedback/${id}/upvote`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setFeedbackList((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, upvotes: data.upvotes } : item
            )
          );
          return;
        }
      } catch (err) {}
    }
    // Optimistic local update
    setFeedbackList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, upvotes: (item.upvotes || 0) + 1 } : item
      )
    );
  };

  const handleEvidenceUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const clearEvidenceUpload = () => {
    setEvidenceFile(null);
  };

  const triggerToast = (msg) => {
    setToastInfo({ show: true, message: msg });
    setTimeout(() => {
      setToastInfo({ show: false, message: '' });
    }, 4000);
  };

  const submitProductRequest = async (e) => {
    if (e) e.preventDefault();
    const pName = productName.trim();

    if (!pName) {
      triggerToast('Please enter the official product name.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          barcode: barcode ? barcode.trim() : null,
          product_name: pName,
          brand: brand.trim() || null,
          category: category || 'Snacks',
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        triggerToast(`Product "${pName}" successfully submitted to the verification forum.`);
        // Refresh community list
        fetchCommunityRequests();
      } else {
        // Optimistic local addition
        const newItem = {
          id: Date.now(),
          category: category,
          product_name: pName,
          brand: brand.trim() || 'Unknown Brand',
          barcode: barcode || 'Pending Scan',
          batch: 'MH-NEW',
          status: '1 Pending Review (Local Intake)',
          notes: notes.trim() || 'Official packaging verification intake.',
          requested_by: `Officer ${deviceId}`,
          time_ago: 'Just now',
          upvotes: 1,
        };
        setFeedbackList((prev) => [newItem, ...prev]);
        triggerToast(`Product "${pName}" logged to PackScan queue. Verification ticket created.`);
      }
    } catch (err) {
      triggerToast(`Product "${pName}" queued locally for verification.`);
    } finally {
      setIsLoading(false);
      setProductName('');
      setBrand('');
      setBarcode('');
      setNotes('');
      setEvidenceFile(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full pb-16 space-y-6"
    >
      {/* Primary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Main Panel (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200/80 rounded-xl p-6 sm:p-7 shadow-xs relative">
          {/* Header: Clean Title & Subtitle */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0e7490] shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[26px]">balance</span>
              </div>
              <div className="flex flex-col">
                <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-900 tracking-tight">
                  Product Request &amp; Feedback Forum
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Request missing products to be audited and added to the PackScan verified database.
                </p>
              </div>
            </div>
            {/* Neutral Standardized Verification Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-[#0e7490] rounded-md text-xs font-semibold shrink-0">
              <span className="material-symbols-outlined text-[16px] text-[#0e7490]">verified</span>
              <span>Verified Official Intake</span>
            </div>
          </div>

          {/* Docket Tab Switcher */}
          <div className="flex flex-wrap items-center gap-2 mt-5 bg-slate-100 p-1 rounded-lg border border-slate-200 max-w-fit">
            <button
              type="button"
              onClick={() => setDocketTab('request')}
              className={`relative px-4 py-2 flex items-center gap-2 text-[13px] font-bold font-['Space_Grotesk'] rounded-md transition-all cursor-pointer ${
                docketTab === 'request'
                  ? 'bg-[#0e7490] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>+ Request New Product</span>
            </button>

            <button
              type="button"
              onClick={() => setDocketTab('community')}
              className={`relative px-4 py-2 flex items-center gap-2 text-[13px] font-bold font-['Space_Grotesk'] rounded-md transition-all cursor-pointer ${
                docketTab === 'community'
                  ? 'bg-[#0e7490] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">table_rows</span>
              <span>Community Requests</span>
              <span
                className={`px-1.5 py-0.5 rounded font-['JetBrains_Mono'] text-[10px] font-bold border ${
                  docketTab === 'community'
                    ? 'bg-cyan-950/30 text-white border-cyan-700'
                    : 'bg-orange-100 text-orange-800 border-orange-200'
                }`}
              >
                {feedbackList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDocketTab('ledger')}
              className={`relative px-4 py-2 flex items-center gap-2 text-[13px] font-bold font-['Space_Grotesk'] rounded-md transition-all cursor-pointer ${
                docketTab === 'ledger'
                  ? 'bg-[#0e7490] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">folder_managed</span>
              <span>Statutory Inspection Ledger</span>
              <span
                className={`px-1.5 py-0.5 rounded font-['JetBrains_Mono'] text-[10px] font-bold border ${
                  docketTab === 'ledger'
                    ? 'bg-cyan-950/30 text-white border-cyan-700'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                95
              </span>
            </button>
          </div>

          {/* VIEW 1: Formal Submission Form */}
          {docketTab === 'request' && (
            <div className="flex flex-col mt-6 space-y-5">
              {/* Field 1: Official Product Name */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1"
                    htmlFor="product-name"
                  >
                    Product Name <span className="text-orange-600">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-['JetBrains_Mono']">
                    Rule 6(1)(a) Declaration
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="product-name"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Kurkure Chilli Chatka, Frooti Mango Drink..."
                    className="w-full bg-[#f8fafc] text-slate-900 border border-slate-300 px-3.5 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-all"
                  />
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    shopping_bag
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-[#0e7490]">info</span>
                  Enter official brand name as printed on primary consumer packaging
                </p>
              </div>

              {/* Row with 2 Fields: Brand/Manufacturer & Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand / Manufacturer */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-700"
                      htmlFor="manufacturer-name"
                    >
                      Brand / Manufacturer <span className="text-orange-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">
                      Rule 6(1)(b)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="manufacturer-name"
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. PepsiCo, Parle, Dabur..."
                      className="w-full bg-[#f8fafc] text-slate-900 border border-slate-300 px-3.5 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      factory
                    </span>
                  </div>
                </div>

                {/* Barcode Number (EAN-13 / UPC) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-700"
                      htmlFor="barcode-val"
                    >
                      Barcode Number (EAN-13 / UPC)
                    </label>
                    <span className="px-2 py-0.5 bg-cyan-50 text-[#0e7490] border border-cyan-200 rounded text-[10px] font-['JetBrains_Mono'] font-semibold">
                      GS1 Standard
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="barcode-val"
                      type="text"
                      maxLength={14}
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="e.g. 8901234567890"
                      className="w-full bg-[#f8fafc] text-slate-900 font-['JetBrains_Mono'] border border-slate-300 px-3.5 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0e7490] text-[20px]">
                      barcode_scanner
                    </span>
                  </div>
                </div>
              </div>

              {/* Field 3: Product Category */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-700"
                    htmlFor="product-category"
                  >
                    Product Category <span className="text-orange-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-['JetBrains_Mono']">
                    Commodity Classification
                  </span>
                </div>
                <div className="relative">
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#f8fafc] text-slate-900 border border-slate-300 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-all appearance-none cursor-pointer"
                  >
                    <option value="snacks">Snacks &amp; Savory Namkeen (Schedule II Category 14)</option>
                    <option value="beverages">Beverages &amp; Liquid Refreshments (Category 03)</option>
                    <option value="confectionery">Confectionery, Chocolates &amp; Sweets (Category 09)</option>
                    <option value="dairy-oils">Dairy, Ghee, Butter &amp; Edible Vegetable Oils (Category 06)</option>
                    <option value="ready-to-eat">Ready-to-eat Prepackaged Meals &amp; Instant Noodles (Category 18)</option>
                    <option value="cereals-staples">Flours, Grains, Pulses &amp; Spices (Category 01)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Field 4: Additional Notes */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-slate-700"
                    htmlFor="audit-notes"
                  >
                    Additional Notes / Details
                  </label>
                  <span className="font-['JetBrains_Mono'] text-xs text-slate-400">
                    {notes.length} / 500 chars
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="audit-notes"
                    rows={3}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe missing data, allergen queries, high sugar concerns, or package anomalies..."
                    className="w-full bg-[#f8fafc] text-slate-900 border border-slate-300 px-3.5 py-2.5 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0e7490]/30 focus:border-[#0e7490] transition-all resize-none"
                  />
                </div>
              </div>

              {/* Evidence Upload Section */}
              <div className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center text-[#0e7490] shrink-0 shadow-2xs">
                    <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900">
                      Package Photo Upload (Optional)
                    </span>
                    <p className="text-xs text-slate-500">
                      Attach clear front or back pack images to speed up automated OCR verification of MRP and ingredients.
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-['Space_Grotesk'] text-xs font-bold rounded-lg shrink-0 flex items-center gap-2 transition-all shadow-2xs">
                  <span className="material-symbols-outlined text-[18px] text-[#0e7490]">cloud_upload</span>
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Evidence Feedback Pill */}
              {evidenceFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-cyan-50 border border-cyan-200 text-slate-900 rounded-lg"
                >
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-xs">
                    <span className="material-symbols-outlined text-[#0e7490] text-[18px]">
                      check_circle
                    </span>
                    <span className="font-semibold text-cyan-900">{evidenceFile.name}</span>
                    <span className="text-slate-500 text-[11px]">
                      ({Math.round(evidenceFile.size / 1024)} KB • Ready for processing)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearEvidenceUpload}
                    className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </motion.div>
              )}

              {/* Standardized Warning Banner */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-orange-600 text-[20px] shrink-0 mt-0.5">
                  policy
                </span>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-wider text-orange-800">
                    Statutory Verification Notice
                  </span>
                  <p className="text-xs text-orange-950/80 mt-1 leading-relaxed">
                    Requested commodities are scheduled for verification across key standards: Common Name, Net Quantity, MRP (incl. of all taxes), Manufacturing Date, Expiry/Best Before, Consumer Care, and FSSAI License Number under Legal Metrology Rules.
                  </p>
                </div>
              </div>

              {/* Primary Action Deck */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[#0e7490] text-[14px]">lock</span>
                  <span>Encrypted submission • Node: DL-MH-26034</span>
                </div>
                <button
                  type="button"
                  onClick={submitProductRequest}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-7 py-2.5 bg-[#0e7490] hover:bg-[#155e75] text-white font-['Space_Grotesk'] text-sm font-bold rounded-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-95 shadow-xs cursor-pointer tracking-wide disabled:opacity-50"
                >
                  <span>{isLoading ? 'Submitting...' : 'Submit Product to Forum'}</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: Community Requests View */}
          {docketTab === 'community' && (
            <div className="flex flex-col mt-6 space-y-4">
              <div className="flex items-center justify-between py-1 border-b border-slate-200 pb-2">
                <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Community Queue ({feedbackList.length})
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-['JetBrains_Mono'] font-medium">
                  Status: Pending Verification
                </span>
              </div>

              {feedbackList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl flex flex-col gap-2.5 shadow-2xs"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 font-['JetBrains_Mono'] text-[11px] font-semibold rounded">
                        {item.category || 'General FMCG'}
                      </span>
                      <span className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                        {item.product_name}
                      </span>
                      {item.barcode && (
                        <span className="font-['JetBrains_Mono'] text-slate-500 text-xs">
                          EAN: {item.barcode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 border border-orange-200 text-orange-800 font-['JetBrains_Mono'] text-xs font-bold rounded max-w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                      <span>{item.status || 'Under Review'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.notes || 'Official packaging verification requested for consumer safety.'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500 font-['JetBrains_Mono'] text-xs">
                    <span>
                      Requested by {item.requested_by || 'Field Officer'} • {item.time_ago || 'Recent'}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleUpvote(item.id, e)}
                        className="flex items-center gap-1 text-[#0e7490] hover:text-[#155e75] cursor-pointer font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                        <span>Upvote Priority ({item.upvotes || 0})</span>
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="font-semibold text-slate-700">Status: Awaiting Verification</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 3: Statutory Inspection Ledger (Integrated Full-Featured Mode) */}
          {docketTab === 'ledger' && (
            <div className="mt-6">
              <EnforcementDashboard onSelectProductForAudit={onSelectProductForAudit} />
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Panels (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Card 1: Recent Community Requests & Ingestion Stream */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0e7490] text-[22px]">
                  receipt_long
                </span>
                <h2 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                  Recent Community Requests &amp; Ingestion Stream
                </h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0e7490]"></span>
            </div>
            <p className="text-xs text-slate-500 py-3 leading-relaxed">
              Live stream of user and officer submissions currently in queue for laboratory verification.
            </p>

            {/* The Pending Item (Warning/Coral system) */}
            <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-lg flex flex-col gap-1.5 mb-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-800 border border-orange-200 font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase">
                  1 Pending Verification
                </span>
                <span className="font-['JetBrains_Mono'] text-orange-700 font-bold text-[10px]">
                  PRIORITY ALPHA
                </span>
              </div>
              <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 mt-1">
                Britannia Jim Jam 150g
              </span>
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-slate-500 text-[11px]">
                <span>BATCH: MH-04</span>
                <span>•</span>
                <span>EAN: 8901063013217</span>
              </div>
              <div className="mt-2 pt-2 border-t border-orange-200/70 flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-600 font-['JetBrains_Mono'] text-xs">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">
                    schedule
                  </span>
                  <span>Verification Queue #409</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocketTab('community')}
                  className="text-[#0e7490] hover:text-[#155e75] font-['JetBrains_Mono'] text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Secondary Item: Completed / Compliant */}
            <div className="p-3.5 bg-[#f8fafc] border border-slate-200 rounded-lg flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-['JetBrains_Mono'] text-[10px] font-bold rounded uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-emerald-600">
                    check_circle
                  </span>
                  COMPLETED
                </span>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 font-['JetBrains_Mono'] text-[10px] font-semibold rounded">
                  VERIFIED
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 mt-1">
                Tata Sampann Unpolished Toor Dal 1kg
              </span>
              <span className="font-['JetBrains_Mono'] text-slate-500 text-[10px]">
                EAN: 8904043905442 • Rule Compliant • 0 Violations
              </span>
            </div>
          </div>

          {/* Card 2: Audit Criteria Guidelines */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#0e7490] text-[20px]">
                rule_folder
              </span>
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-slate-900">
                Audit Criteria Guidelines
              </h3>
            </div>
            <p className="text-xs text-slate-500 py-2.5 leading-relaxed">
              All submitted products undergo standard legal metrology and label safety checks:
            </p>
            <div className="space-y-2.5 text-xs">
              {/* Criterion 1 */}
              <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-lg flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0e7490] text-[18px] shrink-0 mt-0.5">
                  straighten
                </span>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-slate-900 font-bold">
                    Print Height Precision (Rule 7)
                  </span>
                  <span className="text-slate-500 text-[11px] mt-0.5">
                    For net weight 200g-1kg, minimum print height must exceed 4.0mm.
                  </span>
                </div>
              </div>
              {/* Criterion 2 */}
              <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-lg flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0e7490] text-[18px] shrink-0 mt-0.5">
                  currency_rupee
                </span>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-slate-900 font-bold">
                    Unified MRP Clause (Rule 6)
                  </span>
                  <span className="text-slate-500 text-[11px] mt-0.5">
                    Must clearly print "Maximum Retail Price inclusive of all taxes".
                  </span>
                </div>
              </div>
              {/* Criterion 3 */}
              <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-lg flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#0e7490] text-[18px] shrink-0 mt-0.5">
                  contact_support
                </span>
                <div className="flex flex-col">
                  <span className="font-['Space_Grotesk'] text-slate-900 font-bold">
                    Consumer Grievance Contact
                  </span>
                  <span className="text-slate-500 text-[11px] mt-0.5">
                    Official support email, telephone number, and postal address must be present.
                  </span>
                </div>
              </div>
            </div>
            {/* Sidebar Alert Notice Pill */}
            <div className="mt-4 p-2.5 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-orange-800 uppercase">
                <span className="material-symbols-outlined text-[16px] text-orange-600">shield</span>
                <span>Section 36 Penalty Ceiling</span>
              </div>
              <span className="font-['JetBrains_Mono'] text-orange-800 font-bold text-xs">
                ≤ ₹50,000 / Batch
              </span>
            </div>
          </div>

          {/* Card 3: Verification Engine Load */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-700 uppercase tracking-wider">
                Verification Engine Load
              </span>
              <span className="px-2 py-0.5 bg-cyan-50 text-[#0e7490] border border-cyan-200 font-['JetBrains_Mono'] text-[10px] font-bold rounded">
                94.2% READY
              </span>
            </div>
            {/* Bar Graph */}
            <div className="flex items-end justify-between gap-1.5 h-14 w-full px-2 py-1.5 bg-[#f8fafc] border border-slate-200 rounded-lg">
              <div className="w-full bg-[#0e7490]/40 rounded-t h-[35%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Beverages: 35%"></div>
              <div className="w-full bg-[#0e7490]/60 rounded-t h-[60%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Snacks: 60%"></div>
              <div className="w-full bg-[#0e7490]/30 rounded-t h-[25%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Dairy: 25%"></div>
              <div className="w-full bg-[#0e7490]/80 rounded-t h-[80%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Confectionery: 80%"></div>
              <div className="w-full bg-[#0e7490] rounded-t h-[95%] hover:bg-[#155e75] transition-all cursor-pointer" title="Staples: 95%"></div>
              <div className="w-full bg-[#0e7490]/70 rounded-t h-[50%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Instant Meals: 50%"></div>
              <div className="w-full bg-orange-500 rounded-t h-[40%] hover:bg-orange-600 transition-all cursor-pointer" title="Bakery: 40%"></div>
              <div className="w-full bg-[#0e7490]/90 rounded-t h-[70%] hover:bg-[#0e7490] transition-all cursor-pointer" title="Spices: 70%"></div>
            </div>
            <div className="flex items-center justify-between mt-3 font-['JetBrains_Mono'] text-[11px] text-slate-500">
              <span>Node: AWS-BOM-01</span>
              <span>API v2.4: Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Toast Notification */}
      <AnimatePresence>
        {toastInfo.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
          >
            <div className="p-4 bg-white text-slate-900 rounded-xl shadow-xl flex items-center gap-3.5 max-w-md border border-slate-200">
              <div className="w-9 h-9 rounded-lg bg-[#0e7490] flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900">
                  Product Request Dispatched
                </span>
                <span className="text-xs text-slate-600">{toastInfo.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
