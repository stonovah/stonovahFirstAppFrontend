import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiShield, FiLayers } from 'react-icons/fi';
import { formatNaira } from './helpers';

export default function ServiceFee({ form, update, ctx }) {
  const FEE_RATE = ctx.feeRate;                              // fraction from the platform setting
  const pct = Number((FEE_RATE * 100).toFixed(2));
  const feeOption = form.feeOption;
  // tiers may hold strings while typing, so normalise numbers once here
  const tiers = form.tiers.map((t) => ({ ...t, price: Number(t.price) || 0, total: Number(t.total) || 0 }));
  const paidTiers = tiers.filter((t) => t.price > 0);
  const freeTiers = tiers.filter((t) => t.price === 0);
  const previewTiers = paidTiers.slice(0, 2);
  const sample = previewTiers[0];
  const SAMPLE_SALES = 1000;

  const cardClass = (active) =>
    `p-6 rounded-2xl border transition-all cursor-pointer space-y-4 relative ${
      active
        ? 'bg-black text-white border-black shadow-2xl ring-2 ring-red-600'
        : 'bg-black/80 text-neutral-300 border-black/30 hover:bg-black/90'
    }`;

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
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
              How should the {pct}% service <br className="hidden md:inline" />
              fee be handled?
            </h1>
            <p className="text-xs font-mono text-black/80 max-w-2xl mt-2 leading-relaxed">
              Stonovah charges a nominal {pct}% platform & cryptographic turnstile service fee on paid
              admissions. Choose how this fee is absorbed across your active ticket inventory.
            </p>
          </div>

          <div className="bg-black/90 border border-black/40 p-3 rounded-xl font-mono text-xs text-white max-w-xs shrink-0">
            <span className="text-[9px] font-bold text-[#FFBF00] uppercase block tracking-wider mb-0.5">
              EXEMPTION RULE
            </span>
            <span className="text-[11px] text-neutral-300 block leading-tight">
              Free and RSVP guest tiers remain 100% complimentary
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: OPTIONS */}
        <div className="lg:col-span-7 space-y-6">
          {/* OPTION 1: ORGANIZER COVERS */}
          <motion.div
            onClick={() => update('feeOption', 'organizer')}
            className={cardClass(feeOption === 'organizer')}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  feeOption === 'organizer' ? 'border-red-500 bg-red-500' : 'border-neutral-500'
                }`}
              >
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

            <p className="text-xs font-mono text-neutral-400 leading-relaxed pl-7">
              Absorb the {pct}% fee from gross payouts. Ticket buyers pay the clean round face value
              displayed on the public event page. Increases conversion by eliminating checkout fee friction.
            </p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">
                LIVE TRANSACTION VERIFICATION:
              </span>

              {previewTiers.length === 0 ? (
                <p className="text-[10px] text-neutral-400">
                  No paid tiers yet. Add one in Step 2 to see the breakdown.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-neutral-800 pb-3">
                  {previewTiers.map((t) => {
                    const fee = t.price * FEE_RATE;
                    return (
                      <div key={t.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {t.name} ({formatNaira(t.price)})
                        </div>
                        <span className="text-[10px] text-neutral-400 block">
                          Buyer pays: {formatNaira(t.price)} • {pct}% Fee: -{formatNaira(fee)}
                        </span>
                        <span className="text-xs font-bold text-[#FFBF00] block">
                          You get: {formatNaira(t.price - fee)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {sample && (
                <div className="flex justify-between items-center text-[10px] pt-1 gap-2">
                  <span className="text-neutral-400">
                    Estimated {SAMPLE_SALES.toLocaleString()} {sample.name} sales: Net payout{' '}
                    <strong className="text-white">
                      {formatNaira(sample.price * SAMPLE_SALES * (1 - FEE_RATE))}
                    </strong>
                  </span>
                  <span className="text-emerald-400 font-bold uppercase shrink-0">
                    0 CART ABANDONMENT PENALTY
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* OPTION 2: BUYER PAYS */}
          <motion.div
            onClick={() => update('feeOption', 'buyer')}
            className={cardClass(feeOption === 'buyer')}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  feeOption === 'buyer' ? 'border-red-500 bg-red-500' : 'border-neutral-500'
                }`}
              >
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

            <p className="text-xs font-mono text-neutral-400 leading-relaxed pl-7">
              Pass the {pct}% service fee to the ticket purchaser at checkout as a transparent line-item
              booking fee. You retain 100% of your listed ticket face value upon settlement.
            </p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <span className="text-[9px] text-neutral-500 uppercase tracking-widest block font-bold">
                CHECKOUT TOTAL CALCULATION:
              </span>

              {previewTiers.length === 0 ? (
                <p className="text-[10px] text-neutral-400">
                  No paid tiers yet. Add one in Step 2 to see the breakdown.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-neutral-800 pb-3">
                  {previewTiers.map((t) => {
                    const fee = t.price * FEE_RATE;
                    return (
                      <div key={t.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          {t.name} ({formatNaira(t.price)})
                        </div>
                        <span className="text-[10px] text-neutral-400 block">
                          Base: {formatNaira(t.price)} + {pct}% Booking Fee (+{formatNaira(fee)})
                        </span>
                        <span className="text-xs font-bold text-[#FFBF00] block">
                          Buyer pays: {formatNaira(t.price + fee)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {sample && (
                <div className="flex justify-between items-center text-[10px] pt-1 gap-2">
                  <span className="text-neutral-400">
                    Estimated {SAMPLE_SALES.toLocaleString()} {sample.name} sales: Net payout{' '}
                    <strong className="text-white">
                      {formatNaira(sample.price * SAMPLE_SALES)}
                    </strong>
                  </span>
                  <span className="text-neutral-400 font-bold uppercase shrink-0">
                    SHOWN CLEARLY AT PAYMENT GATEWAY
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* SETTLEMENT BLUEPRINT */}
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
                <h4 className="font-bold text-white block">
                  {feeOption === 'organizer' ? 'Clean Face Value' : 'Face Value + Booking Fee'}
                </h4>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {feeOption === 'organizer'
                    ? 'Attendee is billed the advertised ticket price with zero surprise add-ons.'
                    : `Attendee sees the ${pct}% booking fee as a clear line item at payment.`}
                </p>
              </div>

              <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
                <span className="text-[9px] text-neutral-500 block font-bold uppercase">2. VAULT ESCROW</span>
                <h4 className="font-bold text-white block">Instant Split</h4>
                <p className="text-[10px] text-neutral-400 leading-tight">
                  {feeOption === 'organizer'
                    ? `${(100 - pct).toFixed(1)}% routed to organizer custody ledger; ${pct.toFixed(1)}% goes to network turnstile verification.`
                    : '100% of face value routed to organizer; the booking fee goes to network turnstile verification.'}
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

        {/* RIGHT: PRICING AUDIT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block font-bold">
                  STEP 02 DETECTED TIERS
                </span>
                <h3 className="text-sm font-bold uppercase text-white">Active Tier Pricing Audit</h3>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {tiers.length} Tier{tiers.length !== 1 && 's'} Configured
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {paidTiers.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800"
                >
                  <div>
                    <span className="font-bold text-white block">{t.name}</span>
                    <span className="text-[10px] text-neutral-400 block">
                      Capacity: {t.total.toLocaleString()} units
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-[#FFBF00] block">
                      {formatNaira(t.price)}
                    </span>
                    <span className="text-[9px] text-neutral-400 block font-bold">Paid Tier</span>
                  </div>
                </div>
              ))}

              {freeTiers.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center bg-neutral-900 p-3 rounded-xl border border-neutral-800"
                >
                  <div>
                    <span className="font-bold text-white block">{t.name}</span>
                    <span className="text-[10px] text-emerald-400 block">Fee Exempt (100% Free)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-400 block">FREE</span>
                    <span className="text-[9px] text-neutral-400 block font-bold">0% Charge</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-800 text-[10px]">
              <div>
                <span className="text-neutral-500 block uppercase font-bold">SETTLEMENT CYCLE</span>
                <span className="text-white font-bold block">Bi-Weekly or Post-Event</span>
              </div>
              <div>
                <span className="text-neutral-500 block uppercase font-bold">PRIMARY CURRENCY</span>
                <span className="text-white font-bold block">NGN (₦)</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-neutral-500 block uppercase font-bold">CRYPTOGRAPHIC AUDIT</span>
                <span className="text-[#FFBF00] font-bold block">Automated Ledger</span>
              </div>
            </div>
          </div>

          {/* HARDWARE CARD */}
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
                <h4 className="text-sm font-bold uppercase text-white block">Hardware Turnstile Sync Ready</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                  The {pct}% service charge covers continuous real-time verification against fraudulent
                  duplicate passes, offline local sync, and handheld scanner leases.
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
      </div>
    </div>
  );
}