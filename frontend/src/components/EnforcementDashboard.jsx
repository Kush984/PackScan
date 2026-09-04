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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#ccfbf1] rounded-2xl shadow-xs relative overflow-hidden">
        <div className="flex items-center space-x-3.5 z-10">
          <div className="p-3 rounded-xl bg-[#e0fbf9] border border-[#99f6e4] text-[#0d9488]">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#0d9488]">
                Department of Consumer Affairs (DoCA)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f0fdfc] text-[#334155] border border-[#ccfbf1]">
                SIH26034 Enforcement Portal
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                Evaluation &amp; Test Sample Dataset
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight mt-0.5 font-['Space_Grotesk']">
              Legal Metrology Officer Enforcement Dashboard
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Audit logs from test evaluations &amp; scanned commodities. Demonstrates statutory violation tracking and Section 36 notice workflows.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="px-4 py-2.5 bg-[#f0fdfc] hover:bg-[#e0fbf9] text-[#334155] rounded-xl text-xs font-bold transition flex items-center space-x-2 border border-[#ccfbf1] shrink-0 self-start sm:self-auto z-10 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0d9488]' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-[#ccfbf1] rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#64748b]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Audited</span>
            <FileText className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0f172a] font-['Space_Grotesk']">
            {analytics?.totalInspections || 0}
          </div>
          <div className="text-[11px] text-[#64748b]">Test Scans &amp; Evaluations Logged</div>
        </div>

        <div className="p-5 bg-white border border-[#ccfbf1] rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#0f766e]">
            <span className="text-xs font-bold uppercase tracking-wider">Compliant (8/8)</span>
            <CheckCircle2 className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div className="text-2xl font-extrabold text-[#0d9488] font-['Space_Grotesk']">
            {analytics?.compliantCount || 0}
          </div>
          <div className="text-[11px] text-[#0f766e]">
            {analytics?.totalInspections ? Math.round(((analytics.compliantCount) / analytics.totalInspections) * 100) : 0}% Pass Rate
          </div>
        </div>

        <div className="p-5 bg-white border border-[#ccfbf1] rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#ea580c]">
            <span className="text-xs font-bold uppercase tracking-wider">Violations Found</span>
            <ShieldAlert className="w-4 h-4 text-[#ea580c]" />
          </div>
          <div className="text-2xl font-extrabold text-[#ea580c] font-['Space_Grotesk']">
            {(analytics?.nonCompliantCount || 0) + (analytics?.partialCount || 0)}
          </div>
          <div className="text-[11px] text-[#c2410c]">
            {analytics?.violationRate || 0}% Non-Compliance Rate
          </div>
        </div>

        <div className="p-5 bg-white border border-[#ccfbf1] rounded-xl space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-[#ea580c]">
            <span className="text-xs font-bold uppercase tracking-wider">Offending Brands</span>
            <TrendingUp className="w-4 h-4 text-[#ea580c]" />
          </div>
          <div className="text-2xl font-extrabold text-[#ea580c] font-['Space_Grotesk']">
            {analytics?.topOffendingBrands?.length || 0}
          </div>
          <div className="text-[11px] text-[#c2410c]">Brands Tracked with Gaps</div>
        </div>
      </div>

      {/* Analytics Breakdown Grid: Rule Violations Heatmap + Brand Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rule-by-Rule Violation Frequency Chart */}
        <div className="lg:col-span-2 p-6 bg-white border border-[#ccfbf1] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ccfbf1] pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#0d9488]" />
              <h3 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider font-['Space_Grotesk']">
                Statutory Non-Compliance Distribution by Legal Rule
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#64748b]">Rule 6 &amp; Rule 9 Standards</span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics?.ruleCounts &&
              Object.entries(analytics.ruleCounts).map(([ruleName, count], idx) => {
                const maxCount = Math.max(...Object.values(analytics.ruleCounts), 1);
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#334155] truncate max-w-sm">{ruleName}</span>
                      <span className="font-mono font-bold text-[#0f172a]">{count} violations</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#f0fdfc] overflow-hidden border border-[#ccfbf1]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          count > 3
                            ? 'bg-[#ea580c]'
                            : count > 0
                            ? 'bg-amber-500'
                            : 'bg-[#47d1cc]'
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
        <div className="p-6 bg-white border border-[#ccfbf1] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#ccfbf1] pb-3">
            <Building2 className="w-5 h-5 text-[#ea580c]" />
            <h3 className="font-bold text-sm text-[#0f172a] uppercase tracking-wider font-['Space_Grotesk']">
              Repeat Offender Tracker
            </h3>
          </div>

          {analytics?.topOffendingBrands && analytics.topOffendingBrands.length > 0 ? (
            <div className="space-y-2.5">
              {analytics.topOffendingBrands.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f0fdfc] border border-[#ccfbf1] hover:border-[#47d1cc] transition"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-[#e6fbf9] text-[#0f766e] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 border border-[#99f6e4]">
                      {i + 1}
                    </span>
                    <span className="font-bold text-xs text-[#0f172a] truncate">{b.brand}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] shrink-0">
                    {b.violations} violation{b.violations > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#64748b]">
              No brand packaging violations logged yet.
            </div>
          )}
        </div>
      </div>

      {/* Live Inspection Archive & Repository */}
      <div className="p-6 bg-white border border-[#ccfbf1] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ccfbf1] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-[#0f172a] tracking-tight font-['Space_Grotesk']">
                Inspection Repository &amp; Case Log
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
                Sample Dataset
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Searchable archive of evaluation audits and scanned packaging commodities with attached evidence.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search product or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#f0fdfc] border border-[#ccfbf1] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#47d1cc]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#f0fdfc] border border-[#ccfbf1] rounded-lg px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#47d1cc]"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant (8/8)</option>
              <option value="NON_COMPLIANT">Violations / Non-Compliant</option>
            </select>
          </div>
        </div>

        {/* Table of Scans */}
        <div className="overflow-x-auto rounded-xl border border-[#ccfbf1]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0fdfc] text-[#64748b] font-semibold border-b border-[#ccfbf1]">
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
            <tbody className="divide-y divide-[#ccfbf1]">
              {filteredInspections.length > 0 ? (
                filteredInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fefe] transition">
                    <td className="p-3.5 font-mono font-bold text-[#0d9488]">
                      #{item.id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-[#0f172a] truncate max-w-xs">{item.product_name}</div>
                      <div className="text-[10px] text-[#64748b]">Source: {item.data_source || 'Camera OCR'}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[#334155]">
                      {item.barcode || 'Direct Image'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-[#0f172a]">
                      {item.compliance_score || 0} / 8 Fields
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase ${
                          item.compliance_status === 'COMPLIANT'
                            ? 'bg-[#e6fbf9] text-[#0f766e] border border-[#99f6e4]'
                            : item.compliance_status === 'PARTIALLY_COMPLIANT' || item.compliance_status === 'DIGITAL_RECORD_VERIFIED'
                            ? 'bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]'
                            : 'bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]'
                        }`}
                      >
                        {item.compliance_status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#64748b] text-[11px]">
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
                        className="px-3 py-1.5 rounded-lg bg-[#47d1cc] hover:bg-[#38c2bd] text-[#042f2e] text-xs font-bold transition inline-flex items-center space-x-1.5 border border-[#2bc4be] shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Notice (PDF)</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#64748b] text-xs">
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
