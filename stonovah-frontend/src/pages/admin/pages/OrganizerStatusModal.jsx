// src/pages/admin/modals/OrganizerStatusModal.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiShield, FiLock, FiAlertTriangle } from 'react-icons/fi';
import { Modal, Btn, Pill } from '../ui';
import { FormField, inputCls } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';

// What each status really does in the system
const options = [
  { id: 'ACTIVE', label: 'Active', tag: 'STANDARD', d: 'Full access: they can sign in, create and submit events, and request advances.' },
  { id: 'PROBATIONARY', label: 'Probationary', tag: 'LIMITED', d: 'They can sign in and run existing events, but cannot submit new events or request advances.' },
  { id: 'SUSPENDED', label: 'Suspended', tag: 'LOCKED OUT', d: 'They are signed out everywhere and cannot sign in. Their team members lose access too.' },
];
const reasons = ['Manual Administrative Discretion', 'Chargeback Threshold Breach', 'KYC Re-verification Required', 'Sanctions / AML Flag', 'Fraud Investigation', 'Venue or Permit Non-Compliance'];
const MAX = 1000;

export default function OrganizerStatusModal({ org, open, onClose, onDone }) {
  const current = org.organizerProfile?.status || 'ACTIVE';
  const [target, setTarget] = useState('SUSPENDED');
  const [reason, setReason] = useState(reasons[0]);
  const [memo, setMemo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTarget(current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    setReason(reasons[0]); setMemo('');
  }, [open, current]);

  const live = (org.events || []).filter((e) => e.status === 'LIVE').length;
  const valid = target !== current && memo.trim().length >= 10;
  const label = target === 'ACTIVE' ? 'Confirm Reactivation' : target === 'SUSPENDED' ? 'Confirm Suspension' : 'Confirm Probation';

  const confirm = async () => {
    setBusy(true);
    try {
      const updated = await adminApi.organizers.setStatus(org.id, { status: target, reason: target === 'ACTIVE' ? 'Reinstated by Stonovah' : reason, internalMemo: memo.trim() });
      toast.success(`${org.name} is now ${target.toLowerCase()}`);
      onClose(); onDone?.(updated);
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={() => !busy && onClose()} width="max-w-3xl">
      <div className="p-6 md:p-8 space-y-5">
        <div className="flex gap-3 pr-10"><div className="w-11 h-11 rounded-lg bg-neutral-800 text-red-400 flex items-center justify-center shrink-0"><FiShield className="text-xl" /></div>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl md:text-2xl font-black font-sans">Change Organizer Account Status</h2><Pill tone="solid">Enforcement</Pill></div>
            <span className="text-[10px] font-bold text-red-300 block mt-1 break-all">{org.name} • {org.email}</span></div></div>

        <fieldset className="space-y-2"><legend className="text-[10px] font-bold text-red-300 tracking-wider mb-2">NEW STATUS</legend>
          {options.map((o) => (
            <label key={o.id} className={`flex gap-3 p-3 rounded-lg transition ${current === o.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${target === o.id ? 'bg-neutral-700' : 'bg-neutral-800 hover:bg-neutral-750'}`}>
              <input type="radio" name="target" disabled={current === o.id} checked={target === o.id} onChange={() => setTarget(o.id)} className="mt-1 accent-red-600" />
              <span><b className={`text-sm font-sans ${target === o.id && o.id !== 'ACTIVE' ? 'text-red-300' : ''}`}>{o.label}</b> <Pill tone={o.id === 'SUSPENDED' ? 'solid' : 'grey'}>{o.tag}</Pill>{current === o.id && <Pill tone="green" className="ml-1">Current</Pill>}<span className="text-[11px] text-neutral-400 block">{o.d}</span></span>
            </label>
          ))}
        </fieldset>

        {target !== 'ACTIVE' && <FormField label="Reason (shown to the organizer)"><select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>{reasons.map((r) => <option key={r}>{r}</option>)}</select></FormField>}

        <FormField label="Internal justification (mandatory)" required right={<span className="text-neutral-500 normal-case">{memo.length} / {MAX}</span>} error={memo.length > 0 && memo.trim().length < 10 ? 'Enter at least 10 characters' : ''}>
          <textarea rows={4} maxLength={MAX} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Record why this change is being made. Only admins see this." className={inputCls} />
        </FormField>

        <div className="bg-neutral-950 rounded-xl p-4 space-y-2 text-xs leading-relaxed text-neutral-200">
          <b className="flex items-center gap-2 text-red-300"><FiAlertTriangle /> WHAT THIS DOES</b>
          <p>• The organizer is notified{target === 'SUSPENDED' ? ' (they will see it the next time they can sign in)' : ''} and the change is written to the audit log under your account.</p>
          {target === 'SUSPENDED' && <p>• {live > 0 ? `${live} of their events are live and stay on sale until you unpublish them from the event page.` : 'They have no live events.'} Payouts are not created automatically; do not create payouts for a suspended organizer.</p>}
          {target === 'PROBATIONARY' && <p>• Existing live events keep selling. New event submissions and advance requests are blocked.</p>}
          {target === 'ACTIVE' && <p>• Their access and sign-in are restored. Events that were unpublished earlier are not republished automatically.</p>}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <span className="text-[10px] text-neutral-400 font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Recorded in the audit log</span>
          <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn disabled={!valid || busy} onClick={confirm}><FiLock /> {busy ? 'Working…' : label}</Btn></div>
        </div>
      </div>
    </Modal>
  );
}