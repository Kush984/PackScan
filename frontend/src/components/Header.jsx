import React from 'react';
import { motion } from 'framer-motion';
import { Scan, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Header({
  activeTab = 'scan',
  onSelectTab,
  userProfile,
  onResetScan,
  hasActiveResult,
}) {


  const navItems = [
    { id: 'scan', label: 'Scan & Verify', mobileLabel: 'Scan & Audit' },
    { id: 'medical', label: 'Medical & Chronic Profile', mobileLabel: 'Medical Profile' },
    { id: 'allergies', label: 'Allergies & Custom Thresholds', mobileLabel: 'Allergies & Limits' },
    { id: 'forum', label: 'Product Forum & Ledger', mobileLabel: 'Forum & Ledger' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e2d8] shadow-xs">
      <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-6">
        {/* Upper Status Bar */}
        <div className="h-14 border-b border-[#f4efe6] flex items-center justify-between gap-2 py-2">
          {/* Left Brand Area */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
            onClick={() => onSelectTab && onSelectTab('scan')}
          >
            {/* Ambient Logo Glow */}
            <div className="relative shrink-0">
              <motion.div
                className="absolute inset-0 rounded-lg bg-[#b8532f] filter blur-md"
                animate={{
                  opacity: [0.15, 0.35, 0.15],
                  scale: [0.95, 1.1, 0.95],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#b8532f] text-white shadow-xs">
                <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-['Space_Grotesk'] font-extrabold text-[17px] sm:text-[19px] leading-tight text-[#2a2622] tracking-tight group-hover:text-[#b8532f] transition-colors truncate">
                PackScan
              </span>
              <span className="font-['Space_Grotesk'] text-[9px] sm:text-[10px] font-bold text-[#b8532f] uppercase tracking-wider leading-none mt-0.5 truncate">
                Legal Metrology &amp; Health
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Officer Jurisdiction Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#faf7f2] border border-[#e8e2d8] rounded-md text-[13px] font-medium text-[#5c554e]">
              <span className="w-2 h-2 rounded-full bg-[#b8532f]"></span>
              <span>Jurisdiction:</span>
              <span className="font-semibold text-[#2a2622]">DL/MH Central</span>
            </div>


            {/* Officer Avatar */}
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#fbf2ed] border border-[#ecc2b0] flex items-center justify-center text-[#b8532f] text-xs sm:text-[13px] font-['Space_Grotesk'] font-bold cursor-pointer shadow-xs hover:border-[#b8532f] transition-colors shrink-0"
              title="Officer ID: DL/2026-IN"
            >
              DL
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div className="h-11 flex items-center justify-between overflow-hidden">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap w-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab && onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`h-11 flex items-center px-3 sm:px-3.5 text-xs sm:text-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? "border-b-2 border-[#b8532f] text-[#b8532f] font-['Space_Grotesk'] font-bold bg-[#fdf6f2]"
                      : 'text-[#5c554e] hover:text-[#2a2622] font-medium border-b-2 border-transparent hover:bg-[#faf7f2]'
                  }`}
                >
                  <span className="sm:hidden">{item.mobileLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Secondary Subheader status text */}
          <div className="hidden lg:flex items-center gap-2 text-[12px] text-[#8c8278] shrink-0 pl-4">
            <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b8532f]"></span>
          </div>
        </div>
      </div>

      {/* Secondary Mobile Subheader Strip */}
      <div className="lg:hidden bg-[#f4efe6] border-t border-[#e8e2d8] px-3 sm:px-4 py-1.5 flex items-center justify-between text-[11px] sm:text-[12px] text-[#5c554e]">
        <span>Legal Metrology Rules, 2011</span>
        <span className="flex items-center gap-1 font-semibold text-[#b8532f]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8532f]"></span> Enforcement Active
        </span>
      </div>
    </header>
  );
}

