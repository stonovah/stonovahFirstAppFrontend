// src/pages/admin/modals/RejectModal.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiLock, FiXCircle, FiTool } from 'react-icons/fi';
import { Modal, Btn, Pill, Img } from '../ui';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';

// order and values match the backend enum
const categories = [
  ['VENUE_PERMITTING', 'Incomplete or Unverified Venue Permitting', 'Council licenses, maximum capacity filings, or fire department clearances absent.'],
  ['FEE_MODEL_DISCREPANCY', 'Discrepancy in Ticket Pricing / Service Fee Configuration', 'Tier details do not add up, or the fee structure is inconsistent.'],
  ['RIGHTS_CLEARANCE', 'Missing Performer Rights / Music Licensing Clearances', 'Performance or licensing rights are unconfirmed.'],
  ['MISLEADING_CONTENT', 'Misleading Description or Inappropriate Promotional Artwork', 'Low-quality assets, deceptive billing, or content that breaks the platform rules.'],
  ['OTHER', 'Other Compliance Requirement', 'Anything else the organizer must fix before resubmitting.'],
];
const MAX = 1000;
const MIN = 10;

export default function RejectModal({ event, open, onClose, onDone }) {
  const [cat, setCat] = useState(null);
  const [text, setText] = useState('');
  const [resubmit, setResubmit] = useState(true);
  const [busy, setBusy] = useState(false);
  const valid = cat !== null && text.trim().length >= MIN;

  const confirm = async () => {
    setBusy(true);
    try {
      const updated = await adminApi.events.reject(event.id, { reasonCategory: categories[cat][0], feedback: text.trim(), allowResubmitWithoutKyc: resubmit });
      toast.success(`Sent back. ${event.organizer?.name} has been notified.`);
      onClose(); onDone?.(updated);
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} width="max-w-3xl">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-3 pr-10">
          <div className="w-10 h-10 rounded-lg bg-red-900 flex items-center justify-center shrink-0"><FiTool /></div>
          <div><span className="text-[10px] font-bold text-red-400 tracking-widest block">FORMAL ACTION REQUIRED</span>
            <h2 className="text-xl md:text-2xl font-black font-sans leading-tight">Reject Event Submission</h2></div>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">The event goes back to the organizer as a draft with your feedback. They see exactly what you write here and can edit and resubmit.</p>

        <div className="bg-neutral-800 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <div className="w-14 h-12 rounded overflow-hidden bg-neutral-900">{event.posterUrl && <Img src={event.posterUrl} className="w-full h-full object-cover" />}</div>
          <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><b className="text-sm font-sans">{event.title}</b><Pill>{String(event.id).slice(-8).toUpperCase()}</Pill></div>
            <span className="text-[11px] text-neutral-400">{event.organizer?.name} • {event.organizer?.email}</span></div>
        </div>

        <fieldset className="space-y-2"><legend className="text-[10px] font-bold text-red-300 tracking-wider mb-2">PRIMARY REASON *</legend>
          {categories.map(([, t, d], i) => (
            <label key={t} className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${cat === i ? 'bg-neutral-700' : 'bg-neutral-800 hover:bg-neutral-750'}`}>
              <input type="radio" name="cat" checked={cat === i} onChange={() => setCat(i)} className="mt-1 w-4 h-4 accent-red-600" />
              <span><b className="text-sm font-sans block">{t}</b><span className="text-[11px] text-neutral-400">{d}</span></span>
            </label>
          ))}
        </fieldset>

        <div>
          <div className="flex justify-between text-[10px] font-bold text-red-300 tracking-wider mb-1"><label htmlFor="fb">WHAT MUST CHANGE BEFORE RESUBMISSION *</label><span className="text-neutral-400">{text.length} / {MAX}</span></div>
          <textarea id="fb" rows={5} maxLength={MAX} value={text} onChange={(e) => setText(e.target.value)} placeholder="Explain exactly what the organizer needs to fix…"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm leading-relaxed focus:outline-none focus:border-red-600" />
          {text.length > 0 && text.trim().length < MIN && <p className="text-[10px] text-red-400">Please give at least {MIN} characters of feedback.</p>}
        </div>

        <label className="flex items-center gap-3 bg-neutral-800 rounded-lg p-3 text-sm cursor-pointer"><input type="checkbox" checked={resubmit} onChange={(e) => setResubmit(e.target.checked)} className="w-4 h-4 accent-red-600" />Record that this organizer may resubmit without repeating KYC</label>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-2"><FiLock /> Recorded under your admin account</span>
          <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel / Keep Under Review</Btn><Btn disabled={!valid || busy} onClick={confirm}><FiXCircle /> {busy ? 'Sending…' : 'Confirm Rejection & Notify'}</Btn></div>
        </div>
      </div>
    </Modal>
  );
}