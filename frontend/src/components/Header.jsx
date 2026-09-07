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
  const activeConditionsCount = userProfile?.conditions?.length || 0;
  const activeAllergiesCount = userProfile?.allergies?.length || 0;
  const totalFlagsCount = activeConditionsCount + activeAllergiesCount;

  const navItems = [
    { id: 'scan', label: 'Scan & Verify' },
    { id: 'medical', label: 'Medical & Chronic Profile' },
    { id: 'allergies', label: 'Allergies & Custom Thresholds' },
    { id: 'forum', label: 'Product Forum & Ledger' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e2d8] shadow-xs">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Upper Status Bar */}
        <div className="h-14 border-b border-[#f4efe6] flex items-center justify-between py-2 relative">
          {/* Left Brand Area */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab && onSelectTab('scan')}
          >
            {/* Ambient Logo Glow */}
            <div className="relative">
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
              <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-[#b8532f] text-white shadow-xs">
                <Scan className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-extrabold text-[19px] leading-tight text-[#2a2622] tracking-tight group-hover:text-[#b8532f] transition-colors">
                PackScan
              </span>
              <span className="font-['Space_Grotesk'] text-[10px] font-bold text-[#b8532f] uppercase tracking-wider leading-none mt-0.5">
                Legal Metrology &amp; Health Guardian
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Officer Jurisdiction Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#faf7f2] border border-[#e8e2d8] rounded-md text-[13px] font-medium text-[#5c554e]">
              <span className="w-2 h-2 rounded-full bg-[#b8532f]"></span>
              <span>Jurisdiction:</span>
              <span className="font-semibold text-[#2a2622]">DL/MH Central</span>
            </div>

            {/* Health Guardian Alert Badge */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onSelectTab && onSelectTab('medical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold border transition-all cursor-pointer ${
                totalFlagsCount > 0
                  ? 'bg-[#fdf5e6] border-[#eed69e] text-[#926325] hover:bg-[#fbf0d6]'
                  : 'bg-[#faf7f2] border-[#e8e2d8] text-[#5c554e] hover:bg-[#f4efe6]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-[#c99a3e] shrink-0" />
              <span>
                Health Guardian:{' '}
                <strong className={totalFlagsCount > 0 ? 'text-[#926325] font-bold' : 'text-[#2a2622] font-semibold'}>
                  {totalFlagsCount > 0 ? `${totalFlagsCount} Flags Active` : '0 Flags'}
                </strong>
              </span>
            </motion.button>

            {/* Officer Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-[#fbf2ed] border border-[#ecc2b0] flex items-center justify-center text-[#b8532f] text-[13px] font-['Space_Grotesk'] font-bold cursor-pointer shadow-xs hover:border-[#b8532f] transition-colors"
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
                  className={`h-11 flex items-center px-3.5 text-sm transition-all cursor-pointer ${
                    isActive
                      ? "border-b-2 border-[#b8532f] text-[#b8532f] font-['Space_Grotesk'] font-bold bg-[#fdf6f2]"
                      : 'text-[#5c554e] hover:text-[#2a2622] font-medium border-b-2 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Subheader status text */}
          <div className="hidden lg:flex items-center gap-2 text-[12px] text-[#8c8278]">
            <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#b8532f]"></span>
          </div>
        </div>
      </div>

      {/* Secondary Mobile Subheader Strip */}
      <div className="lg:hidden bg-[#f4efe6] border-t border-[#e8e2d8] px-4 py-1.5 flex items-center justify-between text-[12px] text-[#5c554e]">
        <span>Legal Metrology Rules, 2011</span>
        <span className="flex items-center gap-1.5 font-semibold text-[#b8532f]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8532f]"></span> Enforcement Active
        </span>
      </div>
    </header>
  );
}

