import React, { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiLock, FiKey, FiClock } from 'react-icons/fi';
import { Modal, Btn, Pill } from '../ui';
import { DropZone, FormField, inputCls } from '../ui2';
import { useAdmin } from '../AdminProvider';
import { settle } from '../adminExtra';
import { money } from '../adminData';

const rails = [
  { id: 'wire', label: 'Direct Tier-1 Custody Wire', tag: 'INSTANT CLEAR', tone: 'solid' },
  { id: 'paystack', label: 'Paystack Split Payment API Clearing', d: 'Automated webhook distribution to sub-account ledger', tag: 'API AUTOMATED', tone: 'grey' },
  { id: 'manual', label: 'Manual Bank Wire Transfer', d: 'Offline treasury dispatch (requires advice slip upload)', tag: 'UPLOAD REQUIRED', tone: 'grey' },
];
const attest = [
  'Verified turnstile gate closure and attendee manifest ingress for this production.',
  'Confirmed zero unresolved chargeback disputes or pending refund claims with merchant acquirers.',
  'Authorize irreversible wire instruction from the Stonovah escrow ledger to the beneficiary account.',
];
const REF_RE = /^TXN-[A-Z0-9-]{8,48}$/;

export default function DisburseModal({ payout: p, open, onClose }) {
  const { organizers, settings, disburse, notify } = useAdmin();
  const org = organizers.find((o) => o.id === p.orgId);
  const x = settle(p, settings);
  const now = useMemo(() => new Date(), [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const [rail, setRail] = useState('wire');
  const [ref, setRef] = useState('');
  const [slip, setSlip] = useState([]);
  const [checks, setChecks] = useState([false, false, false]);

  useEffect(() => {
    if (!open) return;
    setRail('wire'); setSlip([]); setChecks([false, false, false]);
    setRef(`TXN-BNK-${new Date().getFullYear()}-${p.id.replace('PAY-', '')}-${(org?.name || 'ORG').split(' ')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')}`);
  }, [open, p.id, org?.name]);

  const refOk = REF_RE.test(ref);
  const valid = refOk && checks.every(Boolean) && (rail !== 'manual' || slip.length > 0) && !!org?.bank?.match && org?.status === 'active';
  const railLabel = rails.find((r) => r.id === rail).label;
  const utc = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })} • ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`;

  const confirm = () => {
    disburse(p.id, { rail: railLabel, ref, at: Date.now(), slip: slip[0]?.name });
    notify(`${money(p.currency, x.final, true)} recorded as paid to ${org.name}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width="max-w-2xl">
      <div className="p-6 md:p-8 space-y-5">
        <div className="pr-10"><span className="text-[10px] font-bold text-red-400 tracking-widest flex items-center gap-2">ESCROW RELEASE GATEWAY <span className="w-2 h-2 rounded-full bg-red-500" /></span><h2 className="text-2xl font-black font-sans">Disburse Payout & Mark as Paid</h2></div>
        <div className="bg-neutral-800 rounded-lg px-4 py-3 text-xs">Disbursing to <b>{org?.name}</b> for {p.eventTitle}</div>

        <div className="bg-neutral-800 rounded-xl p-5 space-y-2 text-sm">
          <div className="flex justify-between"><span>Gross Ticket Revenue</span><code>{money(p.currency, p.gross, true)}</code></div>
          {p.feeModel === 'organizer'
            ? <div className="flex justify-between"><span>Less {settings.feeRate}% Stonovah Service Fee</span><code className="text-red-300">-{money(p.currency, x.fee, true)}</code></div>
            : <div className="flex justify-between"><span>{settings.feeRate}% Service Fee (paid by buyers)</span><code className="text-neutral-400">Not deducted</code></div>}
          <div className="flex justify-between"><span>Less {settings.advancePct}% Advance Disbursed <Pill>REF #ADV-{p.id.slice(-4)}</Pill></span><code className="text-red-300">-{money(p.currency, x.advance, true)}</code></div>
          <div className="flex justify-between items-end pt-3 border-t border-neutral-700"><span><b className="text-xs">NET DISBURSAL AMOUNT</b><span className="text-[10px] text-neutral-400 block">Irreversible ledger wire</span></span><b className="text-3xl font-black font-sans text-red-300">{money(p.currency, x.final, true)}</b></div>
        </div>

        <fieldset className="space-y-2"><legend className="text-[10px] font-bold text-red-300 tracking-wider mb-2">1. SETTLEMENT METHOD / RAIL</legend>
          {rails.map((r) => (
            <label key={r.id} className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${rail === r.id ? 'bg-neutral-700' : 'bg-neutral-800 hover:bg-neutral-750'}`}>
              <input type="radio" name="rail" checked={rail === r.id} onChange={() => setRail(r.id)} className="mt-1 accent-red-600" />
              <span className="flex-1"><b className="text-sm font-sans">{r.label}</b><span className="text-[11px] text-neutral-400 block">{r.id === 'wire' ? `${settings.custodian} • Escrow acct ending in ${org?.bank?.last4}` : r.d}</span></span><Pill tone={r.tone}>{r.tag}</Pill>
            </label>))}
        </fieldset>
        {rail === 'manual' && <DropZone files={slip} onFiles={setSlip} accept=".pdf,.png,.jpg,.jpeg" maxMB={10} title="Upload bank advice slip" hint="PDF, PNG or JPG up to 10MB" />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="2. Payment reference" right={<span className={refOk ? 'text-emerald-400' : 'text-red-400'}>{refOk ? '✓ VALID BANK REF' : 'INVALID FORMAT'}</span>} hint="Format: TXN- followed by letters, digits or dashes">
            <div className="relative"><FiKey className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={`${inputCls} font-mono pr-9`} /></div></FormField>
          <FormField label="3. Clearing timestamp (UTC)"><div className={`${inputCls} flex items-center justify-between`}>{utc}<FiClock className="text-neutral-500" /></div></FormField>
        </div>

        <div className="bg-neutral-800 rounded-xl p-4 space-y-3"><span className="text-[10px] font-bold text-red-300 tracking-wider">4. CURATOR VERIFICATION & ATTESTATION</span>
          {attest.map((t, i) => (<label key={t} className="flex gap-3 text-xs leading-relaxed cursor-pointer"><input type="checkbox" checked={checks[i]} onChange={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))} className="mt-0.5 w-4 h-4 accent-red-600 shrink-0" />{t}</label>))}</div>

        {!org?.bank?.match && <p className="text-xs text-red-300">Beneficiary account name does not match. Resolve before disbursing.</p>}
        {org?.status !== 'active' && <p className="text-xs text-red-300">Organizer is {org?.status}. Reactivate before disbursing.</p>}

        <div className="flex gap-2"><Btn variant="soft" onClick={onClose}>Cancel / Hold Disbursal</Btn><Btn className="flex-1" disabled={!valid} onClick={confirm}><FiLock /> Authorize & Send Payout ({money(p.currency, x.final, true)})</Btn></div>
        <p className="text-[10px] text-neutral-500 flex items-center gap-2"><FiCheck /> Recorded to the audit ledger. Moving real funds must be executed by your server with signed requests.</p>
      </div>
    </Modal>
  );
}