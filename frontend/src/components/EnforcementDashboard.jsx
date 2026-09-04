import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  FileText,
  AlertTriangle,
  Scale,
  RefreshCw,
  Eye,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
  Download,
} from 'lucide-react';
import InspectionNoticeModal from './InspectionNoticeModal';

export default function EnforcementDashboard({ onSelectProductForAudit }) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/enforcement/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to load enforcement analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleViewNotice = (inspection) => {
    setSelectedInspection({
      id: inspection.id,
      productName: inspection.product_name,
      barcode: inspection.barcode || 'N/A',
      image_path: inspection.image_path,
      complianceReport: inspection.compliance_report,
      created_at: inspection.created_at,
      brand: inspection.product_name?.split(' ')[0] || 'Unknown Brand',
    });
    setIsNoticeOpen(true);
  };

  const filteredInspections = (analytics?.recentInspections || []).filter((item) => {
    const matchesSearch =
      (item.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.barcode || '').includes(searchQuery);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'COMPLIANT' && item.compliance_status === 'COMPLIANT') ||
      (statusFilter === 'NON_COMPLIANT' && (item.compliance_status === 'NON_COMPLIANT' || item.compliance_status === 'PARTIALLY_COMPLIANT'));
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-3.5 z-10">
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Department of Consumer Affairs (DoCA)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                SIH26034 Enforcement Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Evaluation &amp; Test Sample Dataset
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Legal Metrology Officer Enforcement Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit logs from test evaluations &amp; scanned commodities. Demonstrates statutory violation tracking and Section 36 notice workflows.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-slate-700 shrink-0 self-start sm:self-auto z-10 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Audited (Sample)</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {analytics?.totalInspections || 0}
          </div>
          <div className="text-[11px] text-slate-400">Test Scans &amp; Evaluations Logged</div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Compliant (8/8)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {analytics?.compliantCount || 0}
          </div>
          <div className="text-[11px] text-emerald-300/80">
            {analytics?.totalInspections ? Math.round(((analytics.compliantCount) / analytics.totalInspections) * 100) : 0}% Pass Rate
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Violations Found</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {(analytics?.nonCompliantCount || 0) + (analytics?.partialCount || 0)}
          </div>
          <div className="text-[11px] text-rose-300/80">
            {analytics?.violationRate || 0}% Non-Compliance Rate
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Offending Brands</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {analytics?.topOffendingBrands?.length || 0}
          </div>
          <div className="text-[11px] text-amber-300/80">Brands Tracked with Gaps</div>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Rule Violations Heatmap + Brand Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rule-by-Rule Violation Frequency Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                Statutory Non-Compliance Distribution by Legal Rule
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Rule 6 & Rule 9 Standards</span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics?.ruleCounts &&
              Object.entries(analytics.ruleCounts).map(([ruleName, count], idx) => {
                const maxCount = Math.max(...Object.values(analytics.ruleCounts), 1);
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-300 truncate max-w-sm">{ruleName}</span>
                      <span className="font-mono font-bold text-slate-200">{count} violations</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          count > 3
                            ? 'bg-rose-500'
                            : count > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${Math.max(percent, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top Repeat Offender Brands */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">
              Repeat Offender Tracker
            </h3>
          </div>

          {analytics?.topOffendingBrands && analytics.topOffendingBrands.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topOffendingBrands.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-bold text-xs text-slate-200 truncate">{b.brand}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    {b.violations} violation{b.violations > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No brand packaging violations logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Live Inspection Archive & Repository */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-slate-100 tracking-tight">
                Inspection Repository &amp; Case Log
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Sample Dataset
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Searchable archive of evaluation audits and scanned packaging commodities with attached evidence.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search product or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant (8/8)</option>
              <option value="NON_COMPLIANT">Violations / Non-Compliant</option>
            </select>
          </div>
        </div>

        {/* Table of Scans */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Notice / ID</th>
                <th className="p-3.5">Product &amp; Brand</th>
                <th className="p-3.5">GTIN / Barcode</th>
                <th className="p-3.5">Compliance Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Official Notice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInspections.length > 0 ? (
                filteredInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      #{item.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-200 truncate max-w-xs">{item.product_name}</div>
                      <div className="text-[10px] text-slate-400">Source: {item.data_source || 'Camera OCR'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {item.barcode || 'Direct Image'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-200">
                      {item.compliance_score || 0} / 8 Fields
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                          item.compliance_status === 'COMPLIANT'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.compliance_status === 'PARTIALLY_COMPLIANT' || item.compliance_status === 'DIGITAL_RECORD_VERIFIED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.compliance_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleViewNotice(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-semibold transition inline-flex items-center space-x-1.5 border border-slate-700 hover:border-emerald-500 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Notice (PDF)</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 text-xs">
                    No inspection records matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Notice Modal */}
      {selectedInspection && (
        <InspectionNoticeModal
          isOpen={isNoticeOpen}
          onClose={() => setIsNoticeOpen(false)}
          inspectionData={selectedInspection}
        />
      )}
    </div>
  );
}
