// src/components/tickets/TicketPicker.jsx
import React, { useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useFeeRate } from '../../pages/steps/helpers';
import { naira, remaining } from '../../pages/public/publicLive';
import { publicApi } from '../../api/public';
import { apiErrorMessage } from '../../api/apiClient';

export const MAX_PER_TYPE = 20; // the checkout API accepts at most 20 of one ticket type per order

const step = 'w-7 h-7 rounded bg-[#2A2A2A] text-white flex items-center justify-center hover:bg-[#E50914] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#2A2A2A]';
const field = 'w-full bg-[#1A1A1A] border border-neutral-700 text-white px-3 py-2 rounded-lg text-xs focus:border-[#FFBF00] focus:outline-none';

function Waitlist({ event, tier }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', email: '' });
  const [state, setState] = useState('idle'); // idle | busy | done
  const [err, setErr] = useState('');
  const valid = f.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim());

  const submit = async () => {
    setState('busy'); setErr('');
    try { await publicApi.joinWaitlist(event.id, tier.id, { name: f.name.trim(), email: f.email.trim() }); setState('done'); }
    catch (e) { setErr(apiErrorMessage(e, 'Could not join the waitlist.')); setState('idle'); }
  };

  if (state === 'done') return <p className="text-[10px] font-mono text-emerald-400">✓ You are on the waitlist for this ticket type.</p>;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="text-[10px] font-mono font-bold text-[#FFBF00] hover:text-white underline cursor-pointer">Join the waitlist</button>;
  return (
    <div className="space-y-2">
      <input aria-label="Your name" placeholder="Your name" maxLength={120} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={field} />
      <input aria-label="Your email" type="email" placeholder="Your email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className={field} />
      {err && <p className="text-[10px] text-red-400">{err}</p>}
      <button type="button" disabled={!valid || state === 'busy'} onClick={submit} className="w-full bg-[#2A2A2A] hover:bg-[#E50914] text-white text-[10px] font-mono font-bold uppercase py-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
        {state === 'busy' ? 'Joining…' : 'Join waitlist'}
      </button>
    </div>
  );
}

export default function TicketPicker({ event, ended = false, onContinue }) {
  const feeRate = useFeeRate();
  const [qty, setQty] = useState({});
  const tiers = [...(event.tiers || [])].sort((a, b) => a.price - b.price);
  const cap = (t) => Math.min(remaining(t), MAX_PER_TYPE);
  const set = (t, n) => setQty((q) => ({ ...q, [t.id]: Math.min(Math.max(0, Number.isFinite(n) ? n : 0), cap(t)) }));

  const picked = tiers.filter((t) => (qty[t.id] || 0) > 0);
  const count = picked.reduce((s, t) => s + qty[t.id], 0);
  const subtotal = picked.reduce((s, t) => s + t.price * qty[t.id], 0);
  const buyerPays = event.feeHandling === 'BUYER_ADDED';
  const fee = buyerPays ? Math.round(subtotal * feeRate) : 0;
  const total = subtotal + fee;

  return (
    <div className="space-y-4 text-white">
      {tiers.map((t) => {
        const left = remaining(t);
        const n = qty[t.id] || 0;
        return (
          <div key={t.id} className="border-b border-neutral-800 pb-4 space-y-2">
            <div className={`flex justify-between items-start gap-3 ${left === 0 ? 'opacity-60' : ''}`}>
              <div className="min-w-0">
                <span className="text-xs font-bold uppercase block">{t.name}</span>
                {t.description && <p className="text-[10px] text-neutral-400 mt-0.5">{t.description}</p>}
                {left > 0 && left <= 10 && <span className="text-[9px] font-mono text-[#FFBF00] font-bold">ONLY {left} LEFT</span>}
              </div>
              <span className="text-sm font-mono font-bold shrink-0">{t.price ? naira(t.price) : 'Free'}</span>
            </div>

            {left === 0 ? (
              <div className="space-y-2">
                <span className="text-[9px] font-mono text-[#E50914] font-bold uppercase block">// Sold out</span>
                {!ended && <Waitlist event={event} tier={t} />}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#1A1A1A] p-2 rounded-lg border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400">QUANTITY{n > 0 && n >= cap(t) ? ` (MAX ${cap(t)})` : ''}</span>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label={`Fewer ${t.name} tickets`} disabled={ended || n === 0} onClick={() => set(t, n - 1)} className={step}><FiMinus /></button>
                  <input aria-label={`${t.name} quantity`} inputMode="numeric" value={n} disabled={ended}
                    onChange={(e) => set(t, parseInt(e.target.value.replace(/\D/g, ''), 10) || 0)}
                    className="w-10 text-center bg-transparent text-sm font-mono font-bold focus:outline-none focus:text-[#FFBF00]" />
                  <button type="button" aria-label={`More ${t.name} tickets`} disabled={ended || n >= cap(t)} onClick={() => set(t, n + 1)} className={step}><FiPlus /></button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {!tiers.length && <p className="text-xs text-neutral-400">Tickets are not on sale yet.</p>}

      {count > 0 && (
        <div className="space-y-1.5 text-xs font-mono">
          {picked.map((t) => (
            <div key={t.id} className="flex justify-between text-neutral-300"><span>{qty[t.id]} × {t.name}</span><span>{t.price ? naira(t.price * qty[t.id]) : 'Free'}</span></div>
          ))}
          {buyerPays && subtotal > 0 && <div className="flex justify-between text-neutral-400"><span>Booking fee</span><span>{naira(fee)}</span></div>}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-neutral-800"><span>Total</span><span className="text-[#FFBF00]">{total ? naira(total) : 'Free'}</span></div>
        </div>
      )}

      <button
        type="button"
        disabled={ended || count === 0}
        onClick={() => onContinue(picked.map((t) => ({ tierId: t.id, quantity: qty[t.id] })))}
        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-wider transition ${ended || count === 0 ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-[#E50914] hover:bg-red-700 text-white shadow-xl shadow-red-950/50 cursor-pointer'}`}
      >
        {ended ? 'This event has ended' : count === 0 ? 'Select tickets to continue' : `Continue • ${count} ticket${count === 1 ? '' : 's'}${total ? ` • ${naira(total)}` : ''}`}
      </button>
    </div>
  );
}