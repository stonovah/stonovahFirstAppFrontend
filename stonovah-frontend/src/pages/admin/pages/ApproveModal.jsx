// src/pages/admin/modals/ApproveModal.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiShield, FiCreditCard, FiAlertTriangle } from 'react-icons/fi';
import { Modal, Btn, Pill, Img } from '../ui';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useAuth } from '../../../context/AuthContext';
import { useFeeRate } from '../../steps/helpers';
import { moneyK } from '../adminLive';

export default function ApproveModal({ event, open, onClose, onDone }) {
  const { user } = useAuth();
  const feeRate = useFeeRate();
  const pct = Number((feeRate * 100).toFixed(2));
  const [mode, setMode] = useState('immediate');
  const [publishAt, setPublishAt] = useState('');
  const [attest, setAttest] = useState(false);
  const [busy, setBusy] = useState(false);

  const t = event.tierSummary;
  const futureOk = mode === 'immediate' || (publishAt && new Date(publishAt) > new Date());
  const blocked = event.issues?.length > 0;
  const valid = attest && futureOk && !blocked;
  const maxFee = Math.round(t.projectedGross * feeRate);
  const republish = event.status === 'UNPUBLISHED';

  const effects = [
    ['The event appears in the public listing', republish ? 'It returns to sale immediately.' : mode === 'immediate' ? 'Buyers can see it as soon as you confirm.' : 'It is published automatically at the chosen time.'],
    ['Ticket checkout opens', `${t.count} ticket type${t.count === 1 ? '' : 's'}, ${t.capacity.toLocaleString()} tickets in total.`],
    ['The organizer is notified', `An in-app notification is sent to ${event.organizer?.email}.`],
    ['Tickets are issued with the selected template', event.ticketTemplate ? `Template: ${event.ticketTemplate.name}.` : 'No template is selected.'],
  ];

  const confirm = async () => {
    setBusy(true);
    try {
      const updated = await adminApi.events.approve(event.id, mode === 'immediate' ? { publishMode: 'immediate' } : { publishMode: 'scheduled', scheduledAt: new Date(publishAt).toISOString() });
      toast.success(mode === 'immediate' ? 'Event approved and published' : 'Event approved and scheduled');
      onClose(); onDone?.(updated);
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} width="max-w-4xl">
      <div className="p-6 md:p-8 space-y-6">
        <div className="pr-10 space-y-2">
          <span className="text-[10px] font-bold text-red-400 tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> FINAL APPROVAL</span>
          <h2 className="text-2xl md:text-4xl font-black font-sans leading-tight">{republish ? 'Return Event to Sale' : 'Authorize Event Publication & Ticket Sales'}</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">Approving publishes this event to the public listing and opens ticket checkout.</p>
        </div>

        <div className="bg-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:items-center">
          <div className="w-24 h-20 rounded overflow-hidden shrink-0 bg-neutral-900">{event.posterUrl && <Img src={event.posterUrl} className="w-full h-full object-cover" />}</div>
          <div className="flex-1 min-w-0">
            <b className="text-lg font-sans block">{event.title}</b>
            <span className="text-[11px] text-neutral-400 block">{event.organizer?.name} • {event.venue}{event.venueAddress ? `, ${event.venueAddress}` : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <Pill>{t.count} Tiers</Pill>
            <Pill tone="red">{event.feeHandling === 'ORGANIZER_ABSORBED' ? `${pct}% fee absorbed` : `${pct}% buyer fee`}</Pill>
            {event.organizer?.cacNumber && <Pill>CAC {event.organizer.cacNumber}</Pill>}
          </div>
        </div>

        {blocked && (
          <div className="bg-red-950/50 border border-red-900 rounded-xl p-4 flex gap-3 text-xs"><FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-red-200"><b className="block mb-1">This event cannot be approved yet</b>{event.issues.map((i) => <span key={i} className="block">• {i}</span>)}Reject it with feedback so the organizer can fix these.</span></div>
        )}

        {!republish && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-red-300 tracking-wider">1. WHEN SHOULD IT GO LIVE?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[['immediate', 'Publish immediately', 'The event goes on sale as soon as you confirm.'], ['scheduled', 'Schedule the release', 'It is published automatically at the time you choose.']].map(([k, title, d]) => (
                <button key={k} type="button" onClick={() => setMode(k)} className={`text-left rounded-xl p-4 border transition cursor-pointer ${mode === k ? 'bg-neutral-800 border-red-600' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-600'}`}>
                  <b className="font-sans flex items-center gap-2"><span className={`w-4 h-4 rounded-full border-2 ${mode === k ? 'bg-red-600 border-red-600' : 'border-neutral-500'}`} />{title}</b>
                  <p className="text-[11px] text-neutral-400 mt-2 leading-snug">{d}</p>
                </button>
              ))}
            </div>
            {mode === 'scheduled' && (
              <div><label htmlFor="pub" className="text-[10px] text-neutral-400 block mb-1">RELEASE TIME (YOUR LOCAL TIME)</label>
                <input id="pub" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                {publishAt && !futureOk && <p className="text-[10px] text-red-400 mt-1">Choose a time in the future.</p>}</div>
            )}
          </section>
        )}

        <section className="space-y-2">
          <h3 className="text-[11px] font-bold text-red-300 tracking-wider">2. WHAT HAPPENS WHEN YOU CONFIRM</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {effects.map(([title, d]) => (
              <div key={title} className="bg-neutral-800 rounded-lg p-3 flex gap-3"><FiCheckCircle className="text-red-500 mt-0.5 shrink-0 text-lg" /><span><b className="text-sm font-sans block">{title}</b><span className="text-[11px] text-neutral-400 leading-snug">{d}</span></span></div>
            ))}
          </div>
        </section>

        <div className="bg-neutral-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-3"><FiCreditCard className="text-red-400 mt-1 shrink-0" />
            <div><b className="text-[11px] text-red-300 tracking-wider block">FEE: {pct}% {event.feeHandling === 'ORGANIZER_ABSORBED' ? 'DEDUCTED FROM THE ORGANIZER' : 'ADDED TO BUYER CHECKOUT'}</b>
              <p className="text-xs text-neutral-300 leading-relaxed mt-1">Projected gross if every ticket sells: {moneyK(t.projectedGross)}. Free tickets carry no fee.</p></div></div>
          <div className="bg-neutral-900 rounded-lg px-5 py-3 text-center shrink-0"><span className="text-[9px] text-neutral-500 font-bold block">MAX PLATFORM FEE</span><b className="text-2xl font-sans">{moneyK(maxFee)}</b></div>
        </div>

        <label className="flex gap-3 bg-neutral-950 rounded-xl p-4 text-xs leading-relaxed cursor-pointer text-neutral-300">
          <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="mt-0.5 w-4 h-4 accent-red-600 shrink-0" />
          <span>I, <b className="text-white">{user?.email}</b>, have reviewed this event: the venue details, the ticket types and pricing, and the organizer’s KYC record. I authorize its publication.</span>
        </label>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-2"><FiShield /> This action is recorded under your admin account.</span>
          <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Keep Under Review</Btn><Btn disabled={!valid || busy} onClick={confirm}>{busy ? 'Working…' : `Confirm & ${republish ? 'Return to Sale' : mode === 'immediate' ? 'Publish' : 'Schedule'}`}</Btn></div>
        </div>
      </div>
    </Modal>
  );
}