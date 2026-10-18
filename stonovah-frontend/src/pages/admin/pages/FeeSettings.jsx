import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPercent, FiLock, FiClock, FiShield, FiInfo, FiSave, FiRotateCcw, FiCheckCircle, FiArrowLeft, FiServer } from 'react-icons/fi';
import { useAdmin } from '../AdminProvider';
import { Card, Pill, Btn, PageHeader, CountUp } from '../ui';
import { Toggle, FormField, inputCls } from '../ui2';
import { ago } from '../adminData';

const toDraft = (s) => ({ feeRate: String(s.feeRate), feeFloorGbp: String(s.feeFloorGbp), feeFloorNgn: String(s.feeFloorNgn), allowFeeChoice: s.allowFeeChoice, advancePct: String(s.advancePct), advanceCapacityPct: String(s.advanceCapacityPct), advanceDaysBefore: String(s.advanceDaysBefore), clearingTime: s.clearingTime, custodian: s.custodian });
const invariants = ['Organizer must possess Tier-1 KYC verification (CAC / NIN approved).', 'Zero active chargeback disputes on account across all multi-currency ledgers.', 'Venue contract and municipal assembly permits verified.'];

export default function FeeSettings() {
  const { settings, saveSettings, notify } = useAdmin();
  const [d, setD] = useState(toDraft(settings));
  useEffect(() => setD(toDraft(settings)), [settings]);
  const set = (k) => (e) => setD((x) => ({ ...x, [k]: e.target.value }));
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(settings));

  const n = (k) => Number(d[k]);
  const err = {
    feeRate: !(n('feeRate') >= 0 && n('feeRate') <= 20) && 'Enter 0 to 20',
    feeFloorGbp: !(n('feeFloorGbp') >= 0) && 'Must be 0 or more',
    feeFloorNgn: !(n('feeFloorNgn') >= 0) && 'Must be 0 or more',
    advancePct: !(n('advancePct') >= 0 && n('advancePct') <= 80) && 'Enter 0 to 80',
    advanceCapacityPct: !(n('advanceCapacityPct') >= 0 && n('advanceCapacityPct') <= 100) && 'Enter 0 to 100',
    advanceDaysBefore: !(Number.isInteger(n('advanceDaysBefore')) && n('advanceDaysBefore') >= 0) && 'Whole days only',
    clearingTime: !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.clearingTime) && 'Use HH:MM',
    custodian: !d.custodian.trim() && 'Required',
  };
  const valid = !Object.values(err).some(Boolean);
  const adv = Math.min(Math.max(n('advancePct') || 0, 0), 100);

  const save = () => {
    saveSettings({ feeRate: n('feeRate'), feeFloorGbp: n('feeFloorGbp'), feeFloorNgn: n('feeFloorNgn'), allowFeeChoice: d.allowFeeChoice, advancePct: n('advancePct'), advanceCapacityPct: n('advanceCapacityPct'), advanceDaysBefore: n('advanceDaysBefore'), clearingTime: d.clearingTime, custodian: d.custodian.trim() });
    notify('Settlement settings saved. Applies to all future sales');
  };

  const num = (k, extra = {}) => <input type="number" step="any" value={d[k]} onChange={set(k)} className={`${inputCls} text-lg font-black`} {...extra} />;

  return (
    <>
      <Link to="/admin/payouts" className="inline-flex items-center gap-2 text-xs font-mono font-bold hover:underline"><FiArrowLeft /> Back to Payouts</Link>
      <PageHeader eyebrow="ENTERPRISE CONSOLE / EVENTS & TICKETING / GLOBAL FEE & SETTLEMENT SETTINGS" title="Payout & Service Fee Global Settings"
        desc="Configure platform commission formulas, escrow advance thresholds, payout clearing schedules, and statutory fee allocations across all operating jurisdictions.">
        <Card className="px-4 py-3 text-[11px]"><span className="flex items-center gap-2 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400" /> ALL SYSTEMS OPERATIONAL</span><span className="text-neutral-400">Last modified by {settings.modifiedBy} ({ago(settings.modifiedAt)})</span></Card>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          ['ACTIVE RATE BASE', <><CountUp value={settings.feeRate} decimals={2} />%</>, 'Global platform baseline', FiPercent],
          ['ESCROW ADVANCE CAP', <><CountUp value={settings.advancePct} decimals={2} />%</>, 'T+1 residual release', FiLock],
          ['CLEARING PIPELINE', <>{settings.clearingTime}</>, `UTC daily • ${settings.rails.length} rails configured`, FiClock],
          ['ESCROW PROTOCOL', <span className="text-2xl">{settings.custodian}</span>, 'Tier-1 segregated escrow', FiShield],
        ].map(([k, v, s, Icon], i) => (
          <Card key={k} index={i} hover className="p-5 space-y-2 relative"><span className="absolute bottom-0 left-0 w-14 h-0.5 bg-red-600" />
            <div className="flex justify-between"><span className="text-[9px] font-bold text-neutral-400 tracking-wider">{k}</span><Icon className="text-red-400" /></div>
            <b className="text-4xl font-black font-sans block">{v}</b><span className="text-[10px] text-neutral-400">{s}</span></Card>))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <Card index={1} className="p-6 space-y-5">
            <div><span className="text-[10px] font-bold text-red-400">MODULE 01 • FISCAL ARCHITECTURE</span><h2 className="text-2xl font-black font-sans">Global Platform Service Fee Rate</h2><p className="text-[11px] text-neutral-400">Defines baseline enterprise platform margin across primary ticket issuances.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Default platform service fee rate (%)" error={err.feeRate} hint="Applied to total gross face value per transaction">{num('feeRate', { min: 0, max: 20 })}</FormField>
              <div className="grid grid-cols-2 gap-2"><FormField label="Fee floor (£)" error={err.feeFloorGbp} hint="Per ticket">{num('feeFloorGbp', { min: 0 })}</FormField><FormField label="Fee floor (₦)" error={err.feeFloorNgn}>{num('feeFloorNgn', { min: 0 })}</FormField></div>
            </div>
            <div className="bg-red-950/40 border border-red-950 rounded-xl p-4 flex gap-3 text-xs leading-relaxed"><FiInfo className="text-red-400 mt-0.5 shrink-0 text-lg" /><span><b>Fee Model Allocation Specification</b><br />The global rate set here ({settings.feeRate}%) determines the platform commission rate. <b>Who pays this fee</b> (organizer absorbs it, or buyers pay it at checkout) is <b>not configured globally</b>. It is chosen per event by each organizer during event creation.</span></div>
            <div className="bg-neutral-900 rounded-xl p-4 flex items-center justify-between gap-4"><div><b className="font-sans text-sm">Allow organizers to choose fee handling model</b> <Pill tone="grey">{d.allowFeeChoice ? 'Enforced' : 'Disabled'}</Pill><p className="text-[11px] text-neutral-400 mt-1">Preserves event producer autonomy to elect between absorbed commissions or client-side surcharge pass-through.</p></div><Toggle on={d.allowFeeChoice} onChange={(v) => setD((x) => ({ ...x, allowFeeChoice: v }))} label="Allow organizers to choose fee model" /></div>
          </Card>

          <Card index={2} className="p-6 space-y-5">
            <div><span className="text-[10px] font-bold text-red-400">MODULE 02 • RISK & LIQUIDITY DISBURSEMENT</span><h2 className="text-2xl font-black font-sans">Escrow Advance Payout Architecture</h2><p className="text-[11px] text-neutral-400">Automated liquidity distribution governing capital advancement prior to turnstile ingress.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Standard advance payout (%)" error={err.advancePct}>{num('advancePct', { min: 0, max: 80 })}</FormField>
              <FormField label="Trigger: sales capacity (%)" error={err.advanceCapacityPct}>{num('advanceCapacityPct', { min: 0, max: 100 })}</FormField>
              <FormField label="Or days before ingress" error={err.advanceDaysBefore}>{num('advanceDaysBefore', { min: 0 })}</FormField>
            </div>
            <div className="bg-neutral-950 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-neutral-400"><span>STAGED LIQUIDITY DISTRIBUTION TIMELINE</span><span className="text-white">T+1 SETTLEMENT GUARANTEE</span></div>
              <div className="flex h-8 rounded-lg overflow-hidden text-[10px] font-bold">
                <motion.div animate={{ width: `${adv}%` }} className="bg-red-600 flex items-center justify-center overflow-hidden whitespace-nowrap px-1">{adv}% ADVANCE</motion.div>
                <motion.div animate={{ width: `${100 - adv}%` }} className="bg-neutral-700 flex items-center justify-center overflow-hidden whitespace-nowrap px-1">{100 - adv}% ESCROW VAULT</motion.div></div>
              <div className="grid grid-cols-2 gap-3 text-[10px] text-neutral-400"><span>● Released {d.advanceDaysBefore} days prior to ingress (capacity ≥ {d.advanceCapacityPct}%)</span><span>● Remaining released T+1 business days after gate reconciliation</span></div>
            </div>
            <div className="space-y-2"><span className="text-[10px] font-bold text-neutral-400 tracking-wider">MANDATORY PRE-REQUISITE INVARIANTS</span>
              {invariants.map((t) => <div key={t} className="bg-neutral-900 rounded-lg px-3 py-2.5 flex items-center gap-3 text-xs"><FiCheckCircle className="text-emerald-400 shrink-0" />{t}<Pill tone="grey" className="ml-auto">Enforced</Pill></div>)}</div>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card index={2} className="p-5 space-y-4">
            <div><span className="text-[10px] font-bold text-red-400">MODULE 03 • CLEARING RAILS</span><h2 className="text-2xl font-black font-sans">Settlement Banking Rails</h2><p className="text-[11px] text-neutral-400">Multi-currency payment pipelines, clearing custodians and payout schedule.</p></div>
            <div className="bg-neutral-900 rounded-xl p-4 space-y-3"><span className="text-[9px] font-bold text-neutral-500">AUTOMATED PAYOUT SCHEDULE</span>
              <b className="font-sans flex items-center gap-2"><FiClock className="text-red-400" /> Daily Settlement Batch at {d.clearingTime} UTC</b>
              <FormField label="Clearing time (UTC)" error={err.clearingTime}><input type="time" value={d.clearingTime} onChange={set('clearingTime')} className={inputCls} /></FormField>
              <FormField label="Escrow custody partner" error={err.custodian}><input value={d.custodian} onChange={set('custodian')} className={inputCls} /></FormField></div>
            <span className="text-[9px] font-bold text-neutral-500 block">CONNECTED INFRASTRUCTURE NODES</span>
            {settings.integrations.map((r) => <div key={r.name} className="bg-neutral-900 rounded-xl p-3 flex justify-between gap-2"><span className="flex gap-2"><FiServer className="text-red-400 mt-0.5" /><span><b className="text-sm font-sans block">{r.name}</b><span className="text-[10px] text-neutral-400">{r.ccy}</span></span></span><Pill tone={r.status === 'configured' ? 'green' : 'grey'}>{r.status}</Pill></div>)}
            <p className="text-[9px] text-neutral-600">Integration status is a placeholder. Drive it from backend health checks.</p>
          </Card>
          <Card index={3} className="p-5 space-y-2">
            <span className="text-[9px] font-bold text-neutral-500">PROTOCOL AUDIT TRAIL</span>
            {[['Settings changes', 'Logged to audit ledger'], ['Fee model choice', d.allowFeeChoice ? 'Organizer-selectable' : 'Disabled'], ['Daily clearing', `${d.clearingTime} UTC`]].map(([k, v]) => <div key={k} className="flex justify-between text-xs bg-neutral-900 rounded-lg px-3 py-2"><span className="text-neutral-400">{k}</span><b>{v}</b></div>)}
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="sticky bottom-4 z-30 bg-black text-white rounded-2xl shadow-2xl border border-neutral-800 p-4 font-mono flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-xs"><span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-2 animate-pulse" /><b>You have unsaved changes</b> <span className="text-neutral-400">• Modifications affect all future global ticket sales</span>{!valid && <span className="text-red-400 block mt-1">Fix the highlighted fields to save.</span>}</span>
            <div className="flex gap-2"><Btn variant="soft" onClick={() => setD(toDraft(settings))}><FiRotateCcw /> Discard Changes</Btn><Btn disabled={!valid} onClick={save}><FiSave /> Save Settlement Settings</Btn></div>
          </motion.div>)}
      </AnimatePresence>
    </>
  );
}