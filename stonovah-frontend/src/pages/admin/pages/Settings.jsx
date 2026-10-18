// src/pages/admin/pages/Settings.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPercent, FiClock, FiShield, FiSave, FiRotateCcw, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader } from '../ui';
import { FormField, inputCls } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { ago } from '../adminLive';

const LABEL = {
  globalFeeRate: 'Platform fee rate',
  advancePercentage: 'Advance payout',
  approvalSlaHours: 'Review target',
  advanceCapacityPct: 'Advance: sales threshold',
  advanceDaysBefore: 'Advance: days before the event',
};
const isRate = (f) => f === 'globalFeeRate' || f === 'advancePercentage';
const show = (f, v) => (isRate(f) ? `${+(v * 100).toFixed(2)}%` : f === 'advanceCapacityPct' ? `${v}%` : f === 'approvalSlaHours' ? `${v} h` : `${v} days`);
const toDraft = (s) => ({
  fee: String(+(s.globalFeeRate * 100).toFixed(2)),
  adv: String(+(s.advancePercentage * 100).toFixed(2)),
  cap: String(s.advanceCapacityPct),
  days: String(s.advanceDaysBefore),
  sla: String(s.approvalSlaHours),
});
const CHECKS = [
  ['database', 'Database'],
  ['paystack', 'Paystack payments'],
  ['email', 'Email (Resend)'],
  ['storage', 'File storage (Cloudinary)'],
  ['imageGeneration', 'AI ticket artwork'],
];

export default function Settings() {
  const s = useLoad(() => adminApi.settings.get());
  const h = useLoad(() => adminApi.settings.history());
  const hc = useLoad(() => adminApi.settings.health());
  const ad = useLoad(() => adminApi.settings.admins());
  const [d, setD] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { if (s.data) setD(toDraft(s.data)); }, [s.data]);

  if (!s.data || !d) {
    return s.error ? <ErrorLine>{s.error}</ErrorLine> : <p className="font-mono text-xs font-bold">LOADING SETTINGS…</p>;
  }

  const cur = s.data;
  const n = (k) => Number(d[k]);
  const whole = (k) => Number.isInteger(n(k));
  const err = {
    fee: !(d.fee !== '' && n('fee') >= 0 && n('fee') <= 20) && 'Enter 0 to 20',
    adv: !(d.adv !== '' && n('adv') >= 0 && n('adv') <= 80) && 'Enter 0 to 80',
    cap: !(d.cap !== '' && whole('cap') && n('cap') >= 0 && n('cap') <= 100) && 'Whole number, 0 to 100',
    days: !(d.days !== '' && whole('days') && n('days') >= 0 && n('days') <= 120) && 'Whole days, 0 to 120',
    sla: !(d.sla !== '' && whole('sla') && n('sla') >= 1 && n('sla') <= 72) && 'Whole hours, 1 to 72',
  };
  const valid = !Object.values(err).some(Boolean);
  const body = {
    globalFeeRate: +(n('fee') / 100).toFixed(4),
    advancePercentage: +(n('adv') / 100).toFixed(4),
    advanceCapacityPct: n('cap'),
    advanceDaysBefore: n('days'),
    approvalSlaHours: n('sla'),
  };
  const changed = valid ? Object.keys(body).filter((k) => Math.abs(body[k] - cur[k]) > 1e-9) : [];
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(cur));
  const advPct = Math.min(Math.max(n('adv') || 0, 0), 100);

  const save = async () => {
    try {
      await adminApi.settings.update(Object.fromEntries(changed.map((k) => [k, body[k]])));
      toast.success('Settings saved');
      setConfirm(false);
      s.reload();
      h.reload();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const num = (k, props = {}) => (
    <input type="number" step="any" value={d[k]} onChange={set(k)} className={`${inputCls} text-lg font-black`} {...props} />
  );

  const cards = [
    ['PLATFORM FEE', show('globalFeeRate', cur.globalFeeRate), 'Charged on every paid ticket', FiPercent],
    ['ADVANCE PAYOUT', show('advancePercentage', cur.advancePercentage), 'Share of sales paid early', FiShield],
    ['ADVANCE TRIGGER', `${cur.advanceCapacityPct}% or ${cur.advanceDaysBefore}d`, 'Sold, or days before the event', FiCheckCircle],
    ['REVIEW TARGET', `${cur.approvalSlaHours} hours`, 'Time to review a submitted event', FiClock],
  ];

  return (
    <>
      <PageHeader
        eyebrow="ROOT SETTINGS & AUDIT"
        title="Settings & Audit"
        desc="The fee and advance rules that apply across the platform, a record of every change, and a check that the services Stonovah depends on are configured."
      >
        <Card className="px-4 py-3 text-[11px]">
          <span className="font-bold block">LAST CHANGED</span>
          <span className="text-neutral-400">{h.data?.[0] ? `${ago(h.data[0].createdAt)} by ${h.data[0].adminEmail}` : 'No changes recorded yet'}</span>
        </Card>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(([k, v, sub, Icon], i) => (
          <Card key={k} index={i} hover className="p-5 space-y-2 relative">
            <span className="absolute bottom-0 left-0 w-14 h-0.5 bg-red-600" />
            <div className="flex justify-between"><span className="text-[9px] font-bold text-neutral-400 tracking-wider">{k}</span><Icon className="text-red-400" /></div>
            <b className="text-3xl font-black font-sans block break-words">{v}</b>
            <span className="text-[10px] text-neutral-400">{sub}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <Card index={1} className="p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-red-400">MODULE 01 • FEES</span>
              <h2 className="text-2xl font-black font-sans">Platform Service Fee</h2>
              <p className="text-[11px] text-neutral-400">Charged on the face value of paid tickets. Free tickets carry no fee.</p>
            </div>
            <FormField label="Service fee rate (%)" error={err.fee} hint="Applied to ticket face value on each paid order">
              {num('fee', { min: 0, max: 20 })}
            </FormField>
            <div className="bg-red-950/40 border border-red-950 rounded-xl p-4 flex gap-3 text-xs leading-relaxed">
              <FiInfo className="text-red-400 mt-0.5 shrink-0 text-lg" />
              <span>
                <b>Who pays the fee</b> is chosen per event by each organizer: they absorb it, or buyers pay it at checkout. This setting only changes the rate.<br />
                <b>Each order keeps the rate it was created with.</b> Changing the rate affects new orders only. Figures for past orders do not change.
              </span>
            </div>
          </Card>

          <Card index={2} className="p-6 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-red-400">MODULE 02 • ADVANCES</span>
              <h2 className="text-2xl font-black font-sans">Advance Payout Rules</h2>
              <p className="text-[11px] text-neutral-400">An organizer may request an advance on a live event once it qualifies. An admin reviews and approves each request.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Advance amount (% of sales)" error={err.adv}>{num('adv', { min: 0, max: 80 })}</FormField>
              <FormField label="Qualifies at sales (% of capacity)" error={err.cap}>{num('cap', { min: 0, max: 100 })}</FormField>
              <FormField label="Or within (days of the event)" error={err.days}>{num('days', { min: 0, max: 120 })}</FormField>
            </div>
            <div className="bg-neutral-950 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-neutral-400">HOW THE MONEY IS SPLIT</span>
              <div className="flex h-8 rounded-lg overflow-hidden text-[10px] font-bold">
                <motion.div animate={{ width: `${advPct}%` }} className="bg-red-600 flex items-center justify-center overflow-hidden whitespace-nowrap px-1">{advPct}% ADVANCE</motion.div>
                <motion.div animate={{ width: `${100 - advPct}%` }} className="bg-neutral-700 flex items-center justify-center overflow-hidden whitespace-nowrap px-1">{100 - advPct}% AFTER THE EVENT</motion.div>
              </div>
              <p className="text-[10px] text-neutral-400">
                An event qualifies when it has sold {d.cap || 0}% of its tickets, or starts within {d.days || 0} days. The advance is calculated on sales at the time of approval and never exceeds what is still owed. There is one advance per event. The rest is paid in a final settlement after the event ends.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 tracking-wider">ALWAYS ENFORCED BY THE SYSTEM</span>
              {[
                'The organizer’s KYC is verified and the account is active.',
                'The settlement account has been verified by Stonovah.',
                'The event is live. Settlements are only created after it has ended.',
                'No payout is created while refund requests for the event are waiting.',
              ].map((t) => (
                <div key={t} className="bg-neutral-900 rounded-lg px-3 py-2.5 flex items-center gap-3 text-xs"><FiCheckCircle className="text-emerald-400 shrink-0" />{t}</div>
              ))}
            </div>
          </Card>

          <Card index={3} className="p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold text-red-400">MODULE 03 • REVIEW</span>
              <h2 className="text-2xl font-black font-sans">Event Review Target</h2>
              <p className="text-[11px] text-neutral-400">Used by the pending queue to show how long each submitted event has been waiting.</p>
            </div>
            <div className="max-w-xs"><FormField label="Review target (hours)" error={err.sla}>{num('sla', { min: 1, max: 72 })}</FormField></div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card index={2} className="p-5 space-y-3">
            <div className="flex justify-between items-start">
              <div><span className="text-[10px] font-bold text-red-400">SYSTEM CHECK</span><h2 className="text-xl font-black font-sans">Configuration</h2></div>
              <button type="button" onClick={hc.reload} className="text-[10px] font-bold text-[#FFBF00] hover:text-white cursor-pointer">Re-check</button>
            </div>
            <ErrorLine>{hc.error}</ErrorLine>
            {hc.data && CHECKS.map(([k, label]) => (
              <div key={k} className="bg-neutral-900 rounded-lg px-3 py-2.5 flex justify-between items-center gap-2 text-xs">
                <span className="font-bold">{label}</span>
                <Pill tone={hc.data[k] ? 'green' : 'red'}>{hc.data[k] ? 'Configured' : 'Not configured'}</Pill>
              </div>
            ))}
            {hc.data && CHECKS.some(([k]) => !hc.data[k]) && (
              <p className="text-[11px] text-amber-300 flex gap-2"><FiAlertTriangle className="mt-0.5 shrink-0" /> Something is missing. Set the matching variable in the backend environment and restart the server.</p>
            )}
            <p className="text-[10px] text-neutral-500">This only checks that each setting is present. It does not call the services, so it cannot tell you a key is wrong or that a service is down.</p>
          </Card>

          <Card index={3} className="p-5 space-y-3">
            <div><span className="text-[10px] font-bold text-red-400">ACCESS</span><h2 className="text-xl font-black font-sans">Admin Accounts</h2></div>
            <ErrorLine>{ad.error}</ErrorLine>
            {(ad.data || []).map((a) => (
              <div key={a.id} className="bg-neutral-900 rounded-lg px-3 py-2.5 flex justify-between items-center gap-2 text-xs">
                <span className="min-w-0"><b className="block truncate">{a.email}</b><span className="text-[10px] text-neutral-500">Added {ago(a.createdAt)}</span></span>
                <Pill tone={a.isActive ? 'green' : 'grey'}>{a.isActive ? 'Active' : 'Disabled'}</Pill>
              </div>
            ))}
            <p className="text-[10px] text-neutral-500">Admin accounts are created directly in the database for now. There is no invite flow yet.</p>
          </Card>
        </div>
      </div>

      <Card index={4} className="p-6 space-y-4">
        <div><span className="text-[10px] font-bold text-red-400">AUDIT TRAIL</span><h2 className="text-2xl font-black font-sans">Change History</h2><p className="text-[11px] text-neutral-400">Every change to these rules, with who made it and what it changed from and to.</p></div>
        <ErrorLine>{h.error}</ErrorLine>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {(h.data || []).map((c) => (
            <div key={c.id} className="border-l-2 border-red-600 bg-neutral-900 rounded-r-lg px-3 py-2.5">
              <div className="flex justify-between gap-2 text-[10px]"><b className="break-all">{c.adminEmail}</b><span className="text-neutral-500 shrink-0">{ago(c.createdAt)}</span></div>
              <div className="mt-1 space-y-0.5">
                {Object.entries(c.changes).map(([f, [from, to]]) => (
                  <p key={f} className="text-xs text-neutral-300"><span className="text-neutral-400">{LABEL[f] || f}:</span> {show(f, from)} → <b>{show(f, to)}</b></p>
                ))}
              </div>
            </div>
          ))}
          {h.data && !h.data.length && <p className="text-xs text-neutral-500">No changes have been made yet. The platform is running on its default rules.</p>}
          {h.loading && !h.data && <p className="text-xs text-neutral-500">Loading…</p>}
        </div>
      </Card>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="sticky bottom-4 z-30 bg-black text-white rounded-2xl shadow-2xl border border-neutral-800 p-4 font-mono flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <span className="text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2 animate-pulse" />
              <b>You have unsaved changes</b>
              <span className="text-neutral-400"> • new orders and new advance decisions will use these rules</span>
              {!valid && <span className="text-red-400 block mt-1">Fix the highlighted fields to save.</span>}
            </span>
            <div className="flex gap-2">
              <Btn variant="soft" onClick={() => setD(toDraft(cur))}><FiRotateCcw /> Discard</Btn>
              <Btn disabled={!valid || !changed.length} onClick={() => setConfirm(true)}><FiSave /> Review & Save</Btn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {confirm && (
        <ConfirmModal
          open
          title="Save these changes?"
          confirmLabel="Save settings"
          checkLabel="I understand these rules apply from now on and are recorded under my account."
          onClose={() => setConfirm(false)}
          onConfirm={save}
        >
          <div className="space-y-1.5">
            {changed.map((f) => (
              <div key={f} className="bg-neutral-800 rounded-lg px-3 py-2 flex justify-between gap-3">
                <span className="text-neutral-400">{LABEL[f]}</span>
                <span>{show(f, cur[f])} → <b className="text-white">{show(f, body[f])}</b></span>
              </div>
            ))}
          </div>
          {changed.includes('globalFeeRate') && <p className="text-[11px] text-amber-300">The new fee rate applies to new orders only. Existing orders keep the rate they were created with.</p>}
          {changed.includes('advancePercentage') && <p className="text-[11px] text-amber-300">Advances that were already created keep their amount.</p>}
        </ConfirmModal>
      )}
    </>
  );
}