import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiCalendar, FiPlusSquare, FiShield, FiUsers,
  FiDollarSign, FiCreditCard, FiSettings, FiSearch, FiBell,
  FiLogOut, FiCheck, FiLock, FiArrowLeft, FiSave,
  FiArrowRight, FiInfo, FiLayers, FiRefreshCw, FiDatabase
} from 'react-icons/fi';
import Navbar from '../components/Navbar/Navbar';

export default function ServiceFeeConfiguration() {
  // Navigation & Step States
  const [activeTab, setActiveTab] = useState('Create Event');
  const [currentStep, setCurrentStep] = useState(3);
  
  // Selected Fee Handling Option: 'organizer' | 'buyer'
  const [feeOption, setFeeOption] = useState('organizer');

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', icon: FiGrid },
    { name: 'My Events', icon: FiCalendar },
    { name: 'Create Event', icon: FiPlusSquare, activeBadge: true },
    { name: 'Gate Check-In & Scanner', icon: FiShield },
    { name: 'Attendees & Orders', icon: FiUsers },
    { name: 'Payouts & Revenue', icon: FiDollarSign },
    { name: 'Ticket Templates', icon: FiCreditCard },
    { name: 'Settings', icon: FiSettings },
  ];

  // Wizard Steps
  const wizardSteps = [
    { id: 1, title: 'Basic Details', subtitle: 'ACTIVE STAGE' },
    { id: 2, title: 'Ticket Types', subtitle: 'INVENTORY' },
    { id: 3, title: 'Service Fee Configuration', subtitle: 'FEES & TAXES' },
    { id: 4, title: 'Ticket Template', subtitle: 'AESTHETIC' },
    { id: 5, title: 'Review & Publish', subtitle: 'LAUNCH' },
  ];

  // Animation Variants
  const containerAnimation = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen bg-[#FFBF00] text-black font-sans selection:bg-black selection:text-[#FFBF00]">
      
      <Navbar/>

      {/* DASHBOARD BODY */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-64 bg-[#FFBF00] border-r-2 border-black/20 p-4 space-y-6 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <span className="text-[9px] font-mono font-bold uppercase text-black/60 tracking-widest block px-2">
              PORTAL CORE
            </span>

            <nav className="space-y-1 font-mono text-xs font-bold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'text-black hover:bg-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="text-sm shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.activeBadge && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-black text-white p-4 rounded-xl border border-black space-y-2 font-mono">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-400 flex items-center gap-1">
                <FiDatabase className="text-[10px]" /> VAULT STORAGE
              </span>
              <span className="text-[#FFBF00] font-bold">78%</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full w-[78%]" />
            </div>
            <span className="text-[9px] text-neutral-400 block">3.9 TB of 5.0 TB</span>
          </div>
        </aside>

        {/* MAIN WORKSPACE AREA */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden space-y-6">
          
          {/* STEPPER HEADER */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs">
            {wizardSteps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-black text-white border-black shadow-lg ring-2 ring-red-600'
                      : isCompleted
                      ? 'bg-black/90 text-neutral-300 border-black/40'
                      : 'bg-black/80 text-neutral-400 border-black/20 hover:bg-black'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-red-600 text-white' : isCompleted ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {isCompleted ? <FiCheck /> : step.id}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 block truncate">
                      {step.subtitle}
                    </span>
                  </div>
                  <span className="font-bold block truncate text-xs">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* PAGE TITLE & SUBTITLE */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-black/70 uppercase tracking-widest">
              <span>MONETIZATION ARCHITECTURE</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-black">
                <FiLock className="text-xs" /> ZERO FRICTION ESCROW
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-black font-sans leading-none">
                  How should the 2% service <br className="hidden md:inline" />
                  fee be handled?
                </h1>
                <p className="text-xs font-mono text-black/80 max-w-2xl mt-2 leading-relaxed">
                  Stonovah charges a nominal 2.0% platform & cryptographic turnstile service fee on paid admissions. Choose how this fee is absorbed across your active ticket inventory.
                </p>
              </div>

              {/* EXEMPTION RULE BOX */}
              <div className="bg-black/90 border border-black/40 p-3 rounded-xl font-mono text-xs text-white max-w-xs shrink-0">
                <span className="text-[9px] font-bold text-[#FFBF00] uppercase block tracking-wider mb-0.5">
                  EXEMPTION RULE
                </span>
                <span className="text-[11px] text-neutral-300 block leading-tight">
                  Free and RSVP guest tiers remain 100% complimentary ($0 / N0)
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CONFIGURATION GRID */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerAnimation}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* LEFT COLUMN: OPTIONS SELECTION */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* OPTION 1: ORGANIZER COVERS */}
                <motion.div
                  onClick={() => setFeeOption('organizer')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
                    feeOption === 'organizer'
                      ? 'bg-black text-white border-black shadow-2xl ring-2 ring-red-600'
                      : 'bg-black/80 text-neutral-300 border-black/30 hover:bg-black/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        feeOption === 'organizer' ? 'border-red-500 bg-red-500' : 'border-neutral-500'
                      }`}>
                        {feeOption === 'organizer' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase tracking-tight text-white font-sans">
                          I'll cover it — deducted from my sales
                        </h3>
                        <span className="text-[9px] font-mono bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-0.5">
                          RECOMMENDED FOR HIGHEST CONVERSION
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-neutral-400 leading-relaxed pl-7">
                    Absorb the 2% fee from gross payouts. Ticket buyers pay the clean round face value displayed on the public event page. Increases conversion by eliminating checkout fee friction.
                  </p>

                  {/* COMPUTATION PREVIEW BOX */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs pl-7">
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">
                      LIVE TRANSACTION VERIFICATION:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-neutral-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Regular Standing (₦10,000)
                        </div>
                        <span className="text-[10px] text-neutral-400 block">Buyer pays: ₦10,000 • 2% Fee: -₦200</span>
                        <span className="text-xs font-bold text-[#FFBF00] block">You get: ₦9,800</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          VIP Royal Circle (£45.00)
                        </div>
                        <span className="text-[10px] text-neutral-400 block">Buyer pays: £45.00 • 2% Fee: -£0.90</span>
                        <span className="text-xs font-bold text-[#FFBF00] block">You get: £44.10</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-neutral-400">
                        Estimated 1,000 Tier 1 sales: Net payout <strong className="text-white">₦9,800,000</strong>
                      </span>
                      <span className="text-emerald-400 font-bold uppercase">
                        0 CART ABANDONMENT PENALTY
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* OPTION 2: BUYER PAYS */}
                <motion.div
                  onClick={() => setFeeOption('buyer')}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
                    feeOption === 'buyer'
                      ? 'bg-black text-white border-black shadow-2xl ring-2 ring-red-600'
                      : 'bg-black/80 text-neutral-300 border-black/30 hover:bg-black/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        feeOption === 'buyer' ? 'border-red-500 bg-red-500' : 'border-neutral-500'
                      }`}>
                        {feeOption === 'buyer' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <h3 className="text-base font-black uppercase tracking-tight text-white font-sans">
                          Add it to the ticket price — the buyer pays it
                        </h3>
                        <span className="text-[9px] font-mono text-neutral-400 block font-bold uppercase tracking-wider mt-0.5">
                          100% FACE VALUE PAYOUT
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-neutral-400 leading-relaxed pl-7">
                    Pass the 2% service fee to the ticket purchaser at checkout as a transparent line-item booking fee. You retain 100% of your listed ticket face value upon settlement.
                  </p>

                  {/* CHECKOUT TOTAL CALCULATION */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs pl-7">
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">
                      CHECKOUT TOTAL CALCULATION:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-neutral-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          Regular Standing (₦10,000)
                        </div>
                        <span className="text-[10px] text-neutral-400 block">Base: ₦10,000 + 2% Booking Fee (+₦200)</span>
                        <span className="text-xs font-bold text-[#FFBF00] block">Buyer pays: ₦10,200</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          VIP Royal Circle (£45.00)
                        </div>
                        <span className="text-[10px] text-neutral-400 block">Base: £45.00 + 2% Booking Fee (+£0.90)</span>
                        <span className="text-xs font-bold text-[#FFBF00] block">Buyer pays: £45.90</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="text-neutral-400">
                        Estimated 1,000 Tier 1 sales: Net payout <strong className="text-white">₦10,000,000</strong>
                      </span>
                      <span className="text-neutral-400 font-bold uppercase">
                        SHOWN CLEARLY AT PAYMENT GATEWAY
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* SETTLEMENT ARCHITECTURE BLUEPRINT */}
                <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                      <FiLayers className="text-red-500" /> Settlement Architecture Blueprint
                    </h3>
                    <span className="text-[9px] text-[#FFBF00] font-bold uppercase tracking-wider">
                      AUTOMATED SPLIT ENGINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-[9px] text-neutral-500 block font-bold uppercase">1. CHECKOUT FLOW</span>
                      <h4 className="font-bold text-white block">Clean Face Value</h4>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        Attendee is billed the advertised ticket price with zero surprise add-ons.
                      </p>
                    </div>

                    <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-[9px] text-neutral-500 block font-bold uppercase">2. VAULT ESCROW</span>
                      <h4 className="font-bold text-white block">Instant Split</h4>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        98.0% routed to organizer custody ledger; 2.0% goes to network turnstile verification.
                      </p>
                    </div>

                    <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                      <span className="text-[9px] text-neutral-500 block font-bold uppercase">3. DISBURSEMENT</span>
                      <h4 className="font-bold text-white block">T+2 Rolling</h4>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        Bank settlement triggered immediately post-event or per scheduled milestone tranches.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: PRICING AUDIT & GATEWAY SPECS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ACTIVE TIER PRICING AUDIT */}
                <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block font-bold">
                        STEP 02 DETECTED TIERS
                      </span>
                      <h3 className="text-sm font-bold uppercase text-white">Active Tier Pricing Audit</h3>
                    </div>
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      3 Tiers Configured
                    </span>
                  </div>

                  {/* Tier items */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="font-bold text-white block">Regular Standing</span>
                        <span className="text-[10px] text-neutral-400 block">Capacity: 1,500 units</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#FFBF00] block">₦10,000</span>
                        <span className="text-[9px] text-neutral-400 block font-bold">Paid Tier</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="font-bold text-white block">VIP Royal Circle</span>
                        <span className="text-[10px] text-neutral-400 block">Capacity: 250 units</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#FFBF00] block">£45.00</span>
                        <span className="text-[9px] text-neutral-400 block font-bold">Paid Tier</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="font-bold text-white block">Community Student RSVP</span>
                        <span className="text-[10px] text-emerald-400 block">Fee Exempt (100% Free)</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-400 block">FREE</span>
                        <span className="text-[9px] text-neutral-400 block font-bold">0% Charge</span>
                      </div>
                    </div>
                  </div>

                  {/* SETTLEMENT CYCLE METRICS */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800 text-[10px]">
                    <div>
                      <span className="text-neutral-500 block uppercase font-bold">SETTLEMENT CYCLE</span>
                      <span className="text-white font-bold block">Bi-Weekly or Post-Event</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block uppercase font-bold">PRIMARY CURRENCY</span>
                      <span className="text-white font-bold block">NGN (₦) / GBP (£)</span>
                    </div>
                    <div className="col-span-2 pt-1">
                      <span className="text-neutral-500 block uppercase font-bold">CRYPTOGRAPHIC AUDIT</span>
                      <span className="text-[#FFBF00] font-bold block">Automated Ledger</span>
                    </div>
                  </div>
                </div>

                {/* SOVEREIGN GATE HARDWARE CARD */}
                <div className="bg-black text-white rounded-2xl border border-black shadow-2xl overflow-hidden font-mono">
                  <div className="h-40 relative">
                    <img
                      src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
                      alt="Sovereign Gate"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <span className="absolute top-3 left-3 bg-black/80 text-[#FFBF00] text-[9px] font-bold px-2 py-0.5 rounded border border-[#FFBF00]/30 uppercase tracking-widest">
                      STONOVAH SOVEREIGN GATE
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white block">
                        Hardware Turnstile Sync Ready
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                        The 2% service charge covers continuous real-time verification against fraudulent duplicate passes, offline local sync, and handheld scanner leases.
                      </p>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
                      <FiShield className="text-red-500 text-xl shrink-0" />
                      <div className="text-[10px]">
                        <span className="text-white font-bold block uppercase">NDPR & SEC Compliant Escrow</span>
                        <span className="text-neutral-400 block">
                          All ticket funds are segregated in licensed custodial accounts until settlement release triggers.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>

          {/* FOOTER ACTIONS BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-black/20 font-mono text-xs">
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-black/10 hover:bg-black/20 text-black font-bold px-5 py-2.5 rounded-xl border border-black/20 flex items-center gap-2 transition"
            >
              <FiArrowLeft /> Back to Ticket Types & Tiers
            </button>

            <div className="flex items-center gap-3">
              <button className="bg-black/10 hover:bg-black/20 text-black font-bold px-4 py-2.5 rounded-xl border border-black/20 flex items-center gap-2 transition">
                <FiSave /> Save as Draft
              </button>

              <div className="text-right hidden md:block">
                <span className="text-[9px] text-black/60 uppercase font-bold block">SELECTED SETTLEMENT</span>
                <span className="text-xs text-black font-black uppercase block">
                  {feeOption === 'organizer' ? 'Organizer Absorbed (2.0%)' : 'Buyer Passed (2.0%)'}
                </span>
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl uppercase tracking-wider shadow-xl flex items-center gap-2 transition"
              >
                Continue to Ticket Template <FiArrowRight />
              </button>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}