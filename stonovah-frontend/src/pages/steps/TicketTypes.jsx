// src/pages/steps/TicketTypes.jsx — tiers are now editable and saved through the API
import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { containerAnimation, staggerChildren, formatNaira, newKey, tierError, tierColor, isFreeTier } from './helpers';

const inputCls = 'w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#FFBF00]';
const num = (v) => (v === '' ? '' : Number(v));

export default function TicketTypes({ form, update }) {
  const { tiers } = form;
  const hasFree = tiers.some(isFreeTier);

  const setTier = (key, patch) => update('tiers', tiers.map((t) => (t.key === key ? { ...t, ...patch } : t)));

  const addTier = (free = false) =>
    update('tiers', [
      ...tiers,
      { key: newKey(), id: null, name: free ? 'Free RSVP' : `Ticket Tier ${tiers.length + 1}`, price: free ? 0 : 5000, total: free ? 200 : 100, sold: 0, free },
    ]);

  // Turning the toggle off removes unsold free tiers (they are deleted on the server when you continue)
  const toggleRsvp = () => (hasFree ? update('tiers', tiers.filter((t) => !isFreeTier(t) || t.sold > 0)) : addTier(true));

  const removeTier = (t) => update('tiers', tiers.filter((x) => x.key !== t.key));

  const maxSeats = tiers.reduce((sum, t) => sum + (Number(t.total) || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* TIER BUILDER */}
      <div className="lg:col-span-7">
        <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-5 font-mono">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-xs" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Step 2: Multi-Tier Builder</h2>
            </div>
            <span className="text-[10px] text-neutral-400 font-bold">{tiers.length} Tier{tiers.length !== 1 && 's'}</span>
          </div>

          {/* Free RSVP toggle */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Free RSVP Protocol</span>
              <span className="text-[10px] text-neutral-400 block">Adds a zero-cost registration tier (price 0)</span>
            </div>
            <button type="button" onClick={toggleRsvp} className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${hasFree ? 'bg-red-600' : 'bg-neutral-800'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hasFree ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {tiers.length === 0 && (
            <p className="text-[11px] text-neutral-400 bg-neutral-950 border border-dashed border-neutral-800 rounded-xl p-4">
              No ticket types yet. Add your first one below.
            </p>
          )}

          <motion.div variants={staggerChildren} className="space-y-3">
            {tiers.map((tier, i) => {
              const error = tierError(tier);
              const soldOut = tier.total > 0 && tier.sold >= Number(tier.total);
              const percent = Number(tier.total) ? Math.round((tier.sold / Number(tier.total)) * 100) : 0;
              return (
                <motion.div key={tier.key} variants={containerAnimation} className={`bg-neutral-950 border rounded-xl p-4 space-y-3 ${error ? 'border-red-600/60' : 'border-neutral-800'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-[9px] font-bold uppercase">
                      <span className={`w-2 h-2 rounded-sm ${tierColor(i)}`} />
                      <span className={`px-1.5 py-0.5 rounded ${soldOut ? 'bg-neutral-800 text-neutral-400' : isFreeTier(tier) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-300'}`}>
                        {soldOut ? 'SOLD OUT' : isFreeTier(tier) ? 'FREE' : 'PAID'}
                      </span>
                      {!tier.id && <span className="text-neutral-500">UNSAVED</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTier(tier)}
                      disabled={tier.sold > 0}
                      title={tier.sold > 0 ? 'Tiers with sales cannot be removed' : 'Remove tier'}
                      className="text-neutral-500 hover:text-red-500 cursor-pointer p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                    <div className="sm:col-span-3">
                      <label className="text-[9px] text-neutral-500 block mb-1 uppercase">Name</label>
                      <input className={inputCls} value={tier.name} maxLength={80} onChange={(e) => setTier(tier.key, { name: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[9px] text-neutral-500 block mb-1 uppercase">Price (₦, 0 = free)</label>
                      <input className={inputCls} type="number" min="0" value={tier.price} onChange={(e) => setTier(tier.key, { price: num(e.target.value) })} />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="text-[9px] text-neutral-500 block mb-1 uppercase">Qty</label>
                      <input className={inputCls} type="number" min="1" value={tier.total} onChange={(e) => setTier(tier.key, { total: num(e.target.value) })} />
                    </div>
                  </div>

                  {error && <p className="text-[10px] text-red-400">{error}</p>}

                  {tier.sold > 0 && (
                    <>
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full ${tierColor(i)}`} style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] text-neutral-400 block"><strong className="text-white">{tier.sold}</strong> sold ({percent}%)</span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          <button type="button" onClick={() => addTier(false)} className="w-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer">
            <FiPlus /> Add Another Ticket Tier
          </button>
        </div>
      </div>

      {/* INVENTORY BREAKDOWN */}
      <div className="lg:col-span-5">
        <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">INVENTORY BREAKDOWN</span>
            <span className="text-xs text-[#FFBF00] font-bold">{maxSeats.toLocaleString()} Total Tickets</span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-neutral-300 block text-center">{form.venueName || 'Venue not set'}</span>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden flex">
              {tiers.map((t, i) => (
                <div key={t.key} className={`${tierColor(i)} h-full`} style={{ width: `${maxSeats ? ((Number(t.total) || 0) / maxSeats) * 100 : 0}%` }} title={t.name} />
              ))}
            </div>
            <div className="space-y-1.5 text-[10px]">
              {tiers.map((t, i) => (
                <div key={t.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-neutral-300 truncate"><span className={`w-2 h-2 ${tierColor(i)} rounded-xs shrink-0`} /> {t.name || 'Untitled'}</span>
                  <span className="text-neutral-400 shrink-0">{isFreeTier(t) ? 'FREE' : formatNaira(t.price)} × {Number(t.total) || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}