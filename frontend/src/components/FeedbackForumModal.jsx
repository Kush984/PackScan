import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquarePlus,
  ThumbsUp,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Package,
  AlertCircle,
  Send,
} from 'lucide-react';

export default function FeedbackForumModal({
  isOpen,
  onClose,
  initialBarcode = '',
  deviceId = 'guest_device',
}) {
  const [activeTab, setActiveTab] = useState('request'); // 'request' | 'community'
  const [feedbackList, setFeedbackList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form fields
  const [barcode, setBarcode] = useState(initialBarcode);
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Snacks & Packaged Food');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialBarcode) {
      setBarcode(initialBarcode);
      setActiveTab('request');
    }
  }, [initialBarcode, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchFeedbackList();
    }
  }, [isOpen]);

  const fetchFeedbackList = async () => {
    try {
      const res = await fetch('/api/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch (err) {
      console.warn('Failed to load feedback list:', err);
    }
  };

  const handleUpvote = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/feedback/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFeedbackList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, upvotes: data.upvotes } : item))
        );
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          barcode: barcode ? barcode.trim() : null,
          product_name: productName.trim(),
          brand: brand.trim() || null,
          category: category || 'General Packaged Food',
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setProductName('');
        setBrand('');
        setNotes('');
        fetchFeedbackList();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveTab('community');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit product request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredCommunityList = feedbackList.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.barcode && item.barcode.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Product Request & Feedback Forum</h2>
              <p className="text-xs text-slate-400">Request missing commodities to be audited and added to PackScan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'request'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request New Product</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'community'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Community Requests ({feedbackList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-300">
          {/* Tab 1: Request Product Form */}
          {activeTab === 'request' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4 max-w-lg mx-auto">
              {initialBarcode && (
                <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-start space-x-2.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unregistered Barcode Detected:</span>
                    <span className="font-mono block text-white mt-0.5">#{initialBarcode}</span>
                    <p className="text-[11px] text-amber-400/80 mt-1">
                      Fill in the product name below and submit it. Our compliance team will audit the label declarations.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Product Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kurkure Chilli Chatka, Frooti Mango Drink..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. PepsiCo, Parle, Dabur..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Barcode Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 8901234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                >
                  <option value="Snacks & Savory Namkeen">Snacks & Savory Namkeen</option>
                  <option value="Biscuits & Bakery">Biscuits & Bakery</option>
                  <option value="Instant Noodles & Pasta">Instant Noodles & Pasta</option>
                  <option value="Carbonated Beverages & Juices">Carbonated Beverages & Juices</option>
                  <option value="Chocolates & Confectionery">Chocolates & Confectionery</option>
                  <option value="Dairy & Milk Products">Dairy & Milk Products</option>
                  <option value="Sauces, Dips & Condiments">Sauces, Dips & Condiments</option>
                  <option value="Breakfast Cereals & Oats">Breakfast Cereals & Oats</option>
                  <option value="Health & Nutrition Bars">Health & Nutrition Bars</option>
                  <option value="Other Packaged Goods">Other Packaged Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Additional Notes / Why Should We Add It?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Popular regional biscuit brand with high sugar, or newly launched flavor in India..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {submitSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Request submitted successfully! Added to community review queue.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !productName.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Request...' : 'Submit Product to Forum'}</span>
              </button>
            </form>
          )}

          {/* Tab 2: Community Forum List */}
          {activeTab === 'community' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search community product requests by name, brand or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCommunityList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-slate-600" />
                    <p>No product requests found matching your query.</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Be the first to request this product!
                    </button>
                  </div>
                ) : (
                  filteredCommunityList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs truncate">{item.product_name}</span>
                          {item.brand && (
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {item.brand}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                          {item.barcode && <span className="font-mono text-slate-300">#{item.barcode}</span>}
                          <span>•</span>
                          <span>{item.category || 'Food'}</span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-xs">"{item.notes}"</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Upvote button & status */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={(e) => handleUpvote(item.id, e)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 border border-slate-700 text-slate-200 hover:text-amber-300 font-bold transition text-xs"
                          title="Upvote to prioritize addition"
                        >
                          <ThumbsUp className="w-3 h-3 text-amber-400" />
                          <span>{item.upvotes || 1}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
