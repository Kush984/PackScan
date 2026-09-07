import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#e7e0d6] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7e0d6] bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#e7e0d6] text-[#b8532f]">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2a2622] font-['Space_Grotesk']">Product Request & Feedback Forum</h2>
              <p className="text-xs text-[#57534e]">Request missing commodities to be audited and added to PackScan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#78716c] hover:text-[#2a2622] hover:bg-[#faf7f2] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-[#e7e0d6] bg-[#faf7f2]">
          <button
            onClick={() => setActiveTab('request')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer font-['Space_Grotesk'] ${
              activeTab === 'request'
                ? 'border-[#b8532f] text-[#b8532f]'
                : 'border-transparent text-[#78716c] hover:text-[#2a2622]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request New Product</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center space-x-2 py-2.5 px-4 text-xs font-bold border-b-2 transition cursor-pointer font-['Space_Grotesk'] ${
              activeTab === 'community'
                ? 'border-[#b8532f] text-[#b8532f]'
                : 'border-transparent text-[#78716c] hover:text-[#2a2622]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Community Requests ({feedbackList.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-[#2a2622] bg-[#faf7f2]">
          {/* Tab 1: Request Product Form */}
          {activeTab === 'request' && (
            <form onSubmit={handleSubmitRequest} className="space-y-4 max-w-lg mx-auto">
              {initialBarcode && (
                <div className="p-3 bg-[#fff1f2] border border-[#fecdd3] rounded-xl flex items-start space-x-2.5 text-[#be123c]">
                  <AlertCircle className="w-4 h-4 text-[#be123c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Unregistered Barcode Detected:</span>
                    <span className="font-mono block text-[#2a2622] mt-0.5">#{initialBarcode}</span>
                    <p className="text-[11px] text-[#be123c] mt-1">
                      Fill in the product name below and submit it. Our compliance team will audit the label declarations.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#2a2622] font-semibold mb-1">
                  Product Name <span className="text-[#be123c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kurkure Chilli Chatka, Frooti Mango Drink..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-white border border-[#e7e0d6] rounded-xl px-3.5 py-2.5 text-xs text-[#2a2622] placeholder-[#a8a29e] focus:outline-none focus:border-[#b8532f] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2a2622] font-semibold mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. PepsiCo, Parle, Dabur..."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white border border-[#e7e0d6] rounded-xl px-3.5 py-2.5 text-xs text-[#2a2622] placeholder-[#a8a29e] focus:outline-none focus:border-[#b8532f] transition"
                  />
                </div>

                <div>
                  <label className="block text-[#2a2622] font-semibold mb-1">Barcode Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 8901234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-white border border-[#e7e0d6] rounded-xl px-3.5 py-2.5 text-xs text-[#2a2622] placeholder-[#a8a29e] focus:outline-none focus:border-[#b8532f] transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2a2622] font-semibold mb-1">Product Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#e7e0d6] rounded-xl px-3.5 py-2.5 text-xs text-[#2a2622] focus:outline-none focus:border-[#b8532f] transition"
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
                <label className="block text-[#2a2622] font-semibold mb-1">
                  Additional Notes / Why Should We Add It?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Popular regional biscuit brand with high sugar, or newly launched flavor in India..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-[#e7e0d6] rounded-xl p-3 text-xs text-[#2a2622] placeholder-[#a8a29e] focus:outline-none focus:border-[#b8532f] transition"
                />
              </div>

              {submitSuccess && (
                <div className="p-3 bg-[#fef3c7] border border-[#fde68a] rounded-xl flex items-center space-x-2 text-[#92400e]">
                  <CheckCircle2 className="w-4 h-4 text-[#c99a3e] shrink-0" />
                  <span>Request submitted successfully! Added to community review queue.</span>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSubmitting || !productName.trim()}
                className="w-full py-3 bg-[#b8532f] hover:bg-[#a34a2b] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer font-['Space_Grotesk']"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Request...' : 'Submit Product to Forum'}</span>
              </motion.button>
            </form>
          )}

          {/* Tab 2: Community Forum List */}
          {activeTab === 'community' && (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#78716c] absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search community product requests by name, brand or barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e7e0d6] rounded-xl pl-9 pr-4 py-2 text-xs text-[#2a2622] placeholder-[#a8a29e] focus:outline-none focus:border-[#b8532f] transition"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredCommunityList.length === 0 ? (
                  <div className="p-8 text-center text-[#78716c] space-y-2">
                    <Package className="w-8 h-8 mx-auto text-[#a8a29e]" />
                    <p>No product requests found matching your query.</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="text-[#b8532f] hover:underline font-semibold cursor-pointer"
                    >
                      Be the first to request this product!
                    </button>
                  </div>
                ) : (
                  filteredCommunityList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white border border-[#e7e0d6] rounded-xl flex items-center justify-between gap-3 hover:border-[#b8532f] transition"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#2a2622] text-xs truncate font-['Space_Grotesk']">{item.product_name}</span>
                          {item.brand && (
                            <span className="text-[10px] text-[#78716c] px-1.5 py-0.5 rounded bg-[#faf7f2] border border-[#e7e0d6]">
                              {item.brand}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-[#78716c]">
                          {item.barcode && <span className="font-mono text-[#2a2622]">#{item.barcode}</span>}
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
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => handleUpvote(item.id, e)}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#faf7f2] hover:bg-[#f7f4ee] border border-[#e7e0d6] text-[#b8532f] font-bold transition text-xs cursor-pointer"
                          title="Upvote to prioritize addition"
                        >
                          <ThumbsUp className="w-3 h-3 text-[#b8532f]" />
                          <span>{item.upvotes || 1}</span>
                        </motion.button>
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
