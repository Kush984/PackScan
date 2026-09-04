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
    <header className="fixed top-0 w-full z-50 bg-[#0e1628]/95 backdrop-blur-md border-b border-[#1e2f52] shadow-sm">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Upper Status Bar */}
        <div className="h-14 border-b border-[#1a2744] flex items-center justify-between py-2">
          {/* Left Brand Area */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab && onSelectTab('scan')}
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/50 border border-cyan-800 text-cyan-400 shadow-xs">
              <Scan className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-extrabold text-[18px] leading-tight text-slate-100 tracking-tight group-hover:text-cyan-400 transition-colors">
                PackScan
              </span>
              <span className="font-['JetBrains_Mono'] text-[9.5px] font-bold text-cyan-500 uppercase tracking-widest leading-none mt-0.5">
                LEGAL METROLOGY &amp; HEALTH SCANNER
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Theme Switcher Toggle (Bluish Slate / Soft Blue) */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title="Toggle Theme"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131d33] hover:bg-[#182642] border border-[#1e2f52] rounded-md text-[11.5px] font-['JetBrains_Mono'] font-medium text-cyan-300 transition-colors cursor-pointer"
              >
                {theme === 'midnight' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Bluish Slate</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Soft Blue</span>
                  </>
                )}
              </button>
            )}

            {/* Officer Jurisdiction Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#131d33] border border-[#1e2f52] rounded-md text-[12px] font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]"></span>
              <span>Jurisdiction:</span>
              <span className="font-['JetBrains_Mono'] font-bold text-slate-100">DL/MH Central</span>
            </div>

            {/* Health Guardian Alert Badge */}
            <button
              type="button"
              onClick={() => onSelectTab && onSelectTab('medical')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-950/30 border border-orange-800/80 text-orange-300 rounded-md text-[12px] font-semibold hover:bg-orange-950/50 transition cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
              <span>
                Health Guardian:{' '}
                <strong className="font-['JetBrains_Mono'] font-bold text-orange-200">
                  {totalFlagsCount > 0 ? `${totalFlagsCount} Conditions Flagged` : '0 Profile Flags'}
                </strong>
              </span>
            </button>

            {/* Consistent Officer Avatar with DL */}
            <div
              className="w-8 h-8 rounded-full bg-[#152340] border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-[12px] font-['Space_Grotesk'] font-bold cursor-pointer shadow-xs"
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
                      ? "border-b-2 border-cyan-400 text-cyan-300 font-['Space_Grotesk'] font-bold bg-cyan-950/30"
                      : 'text-slate-400 hover:text-slate-200 font-medium border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Subheader status text inside bar */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-['JetBrains_Mono'] text-[11px] text-slate-500">
              Government of India Legal Metrology (Packaged Commodities) Rules, 2011
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          </div>
        </div>
      </div>

      {/* Secondary Thin Subheader Strip (Mobile) */}
      <div className="lg:hidden bg-[#0a0f1d] border-t border-[#1a2744] px-4 py-1.5 flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-slate-400">
        <span>Govt of India LM Rules, 2011</span>
        <span className="flex items-center gap-1 font-semibold text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Active
        </span>
      </div>
    </header>
  );
}
