import React from 'react';
import { Scan, AlertTriangle, Moon, Sun, ShieldCheck } from 'lucide-react';

export default function Header({
  activeTab = 'scan',
  onSelectTab,
  userProfile,
  onResetScan,
  hasActiveResult,
  theme = 'midnight',
  onToggleTheme,
}) {
  const activeConditionsCount = userProfile?.conditions?.length || 0;
  const activeAllergiesCount = userProfile?.allergies?.length || 0;
  const totalFlagsCount = activeConditionsCount + activeAllergiesCount;

  const navItems = [
    { id: 'scan', label: 'Scan & Verify', path: 'audit-console' },
    { id: 'medical', label: 'Medical & Chronic Profile', path: 'medical-profile' },
    { id: 'allergies', label: 'Allergies & Custom Thresholds', path: 'allergen-matrix' },
    { id: 'forum', label: 'Product Forum & Ledger', path: 'metrology-ledger' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#ccfbf1] shadow-xs">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Upper Status Bar */}
        <div className="h-14 border-b border-[#e6fbf9] flex items-center justify-between py-2">
          {/* Left Brand Area */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab && onSelectTab('scan')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e0fbf9] border border-[#99f6e4] text-[#0d9488] shadow-xs">
              <Scan className="w-5 h-5 text-[#0d9488]" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-extrabold text-[18px] leading-tight text-[#0f172a] tracking-tight group-hover:text-[#0d9488] transition-colors">
                PackScan
              </span>
              <span className="font-['JetBrains_Mono'] text-[9.5px] font-bold text-[#0d9488] uppercase tracking-widest leading-none mt-0.5">
                LEGAL METROLOGY &amp; HEALTH SCANNER
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Officer Jurisdiction Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f0fdfc] border border-[#ccfbf1] rounded-md text-[12px] font-medium text-[#334155]">
              <span className="w-2 h-2 rounded-full bg-[#47d1cc] shadow-[0_0_6px_rgba(71,209,204,0.6)]"></span>
              <span>Jurisdiction:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-[#0f172a]">DL/MH Central</span>
            </div>

            {/* Health Guardian Alert Badge */}
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('medical')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fff7ed] border border-[#fed7aa] text-[#c2410c] rounded-md text-[12px] font-semibold hover:bg-[#ffedd5] transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-[#ea580c] shrink-0" />
              <span>
                Health Guardian:{' '}
                <strong className="font-['JetBrains_Mono'] font-bold text-[#9a3412]">
                  {totalFlagsCount > 0 ? `${totalFlagsCount} Conditions Flagged` : '0 Profile Flags'}
                </strong>
              </span>
            </button>

            {/* Consistent Officer Avatar with DL */}
            <div
              className="w-8 h-8 rounded-full bg-[#e0fbf9] border border-[#47d1cc] flex items-center justify-center text-[#0f766e] text-[12px] font-['Space_Grotesk'] font-bold cursor-pointer shadow-xs"
              title="Officer ID: DL/2026-IN"
            >
              DL
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="h-11 flex items-center justify-between">
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-11 flex items-center px-3.5 text-[13px] transition-all cursor-pointer ${
                    isActive
                      ? "border-b-2 border-[#47d1cc] text-[#0f766e] font-['Space_Grotesk'] font-bold bg-[#47d1cc]/15"
                      : 'text-[#475569] hover:text-[#0f172a] font-medium border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Subheader status text inside bar */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#64748b]">
              Government of India Legal Metrology (Packaged Commodities) Rules, 2011
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#47d1cc]"></span>
          </div>
        </div>
      </div>

      {/* Secondary Thin Subheader Strip (Mobile) */}
      <div className="lg:hidden bg-[#e8faf8] border-t border-[#ccfbf1] px-4 py-1.5 flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-[#475569]">
        <span>Govt of India LM Rules, 2011</span>
        <span className="flex items-center gap-1 font-semibold text-[#0f766e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#47d1cc]"></span> Active
        </span>
      </div>
    </header>
  );
}
