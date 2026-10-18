// src/pages/admin/pages/Payouts.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSliders, FiDownload, FiSearch, FiLock, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../ui';
import { Pagination, FormField, inputCls } from '../ui2';
import { downloadCsv } from '../adminData';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { koboToNaira } from '../../steps/helpers';
import { useLoad, ErrorLine, ConfirmModal, KV } from '../adminBits';
import { PAYOUT_STATUS, moneyK, fmtDate, ago, shortId, useDebounced } from '../adminLive';

const TYPE = { ADVANCE: 'Advance', SETTLEMENT: 'Final settlement' };
const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';
const PAGE = 10;

function MarkPaidModal({ payout, onClose, onDone }) {
  const d = useLoad(() => adminApi.payouts.get(payout.id), [payout.id]);
  const [ref, setRef] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const b = d.data?.beneficiary;
  const f = d.data?.financials;
  const valid = ref.trim().length >= 6 && ok && b?.verified;

  const submit = async () => {
    setBusy(true);
    try { await adminApi.payouts.markPaid(payout.id, ref.trim()); toast.success('Payout recorded as paid'); onDone(); }
    catch (e) { toast.error(apiErrorMessage(e)); setBusy(false); }
  };

  return (
    <Modal open onClose={() => !busy && onClose()} width="max-w-xl">
      <div className="p-6 space-y-4">
        <div className="pr-10"><span className="text-[10px] font-bold text-red-400 tracking-widest block">RECORD A BANK TRANSFER</span><h2 className="text-2xl font-black font-sans">Mark Payout as Paid</h2></div>
        <p className="text-xs text-neutral-300 leading-relaxed">Stonovah does not move money from this screen. Make the transfer in your bank first, then record its reference here. The organizer is notified.</p>
        <ErrorLine>{d.error}</ErrorLine>
        {d.loading && !d.data && <p className="text-xs text-neutral-400">Loading…</p>}
        {d.data && (
          <>
            <div className="bg-neutral-800 rounded-xl p-4 space-y-1">
              <span className="text-[9px] text-neutral-400 font-bold">AMOUNT TO TRANSFER</span><b className="text-3xl font-black font-sans block text-red-300">{moneyK(payout.amount)}</b>
              <span className="text-[11px] text-neutral-400">{TYPE[payout.type]} • {d.data.event.title}</span>
            </div>
            {b ? (
              <div className="space-y-1.5"><span className="text-[10px] font-bold text-red-300 tracking-wider">SEND TO</span>
                <KV k="BANK" v={b.bankName} /><KV k="ACCOUNT NAME" v={b.accountName} /><KV k="ACCOUNT NUMBER" v={b.accountNumber} mono />
                {!b.verified && <p className="text-[11px] text-red-300 flex gap-2"><FiAlertTriangle className="mt-0.5 shrink-0" /> This account has not been verified. Verify it on the organizer’s page first.</p>}</div>
            ) : <p className="text-[11px] text-red-300 flex gap-2"><FiAlertTriangle className="mt-0.5 shrink-0" /> The organizer has no settlement account.</p>}
            {f && <div className="text-[11px] text-neutral-400 bg-neutral-900 rounded-lg p-3">Owed in total {moneyK(f.netOwed)} • already paid {moneyK(f.advancePaid + f.settlementPaid)} • still to be paid {moneyK(Math.max(0, f.remaining))} (including this payout’s waiting amount).</div>}
          </>
        )}
        <FormField label="Bank transfer reference" required error={ref && ref.trim().length < 6 ? 'At least 6 characters' : ''} hint="Copy it from your bank’s receipt. Each reference can only be used once.">
          <input value={ref} onChange={(e) => setRef(e.target.value.toUpperCase())} className={`${inputCls} font-mono`} />
        </FormField>
        <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 accent-red-600" />I have made this transfer from the bank.</label>
        <div className="flex gap-2"><Btn variant="soft" disabled={busy} onClick={onClose}>Cancel</Btn><Btn className="flex-1" disabled={!valid || busy} onClick={submit}><FiLock /> {busy ? 'Saving…' : 'Record Payout as Paid'}</Btn></div>
      </div>
    </Modal>
  );
}

export default function Payouts() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounced(q.trim());
  const list = useLoad(() => adminApi.payouts.list({ search, status, type, page, limit: PAGE }), [search, status, type, page]);
  const payable = useLoad(() => adminApi.payouts.payable());
  const reqs = useLoad(() => adminApi.payouts.advanceRequests({ status: 'PENDING', limit: 50 }));
  const [paying, setPaying] = useState(null);
  const [dlg, setDlg] = useState(null);

  const reloadAll = () => { list.reload(); payable.reload(); reqs.reload(); };
  const close = () => setDlg(null);
  const run = (fn, msg) => async (n) => { try { await fn(n); toast.success(msg); close(); reloadAll(); } catch (e) { toast.error(apiErrorMessage(e)); } };

  const rows = list.data?.data || [];
  const meta = list.data?.meta || { total: 0, pages: 1 };
  const counts = list.data?.counts || {};
  const totals = list.data?.totals || { pending: 0, paid: 0 };
  const requests = reqs.data?.data || [];
  const ready = payable.data || [];

  const d = dlg && ({
    approveReq: { title: 'Approve this advance request?', label: 'Approve & create advance', note: 'Note to the organizer (optional)', min: 0, body: <>An advance of <b>{moneyK(dlg.r.suggestedNow)}</b> for “{dlg.r.event.title}” will be created and wait for your bank transfer. It is calculated from sales as they stand now.</>, fn: (n) => adminApi.payouts.approveAdvance(dlg.r.id, n || undefined), msg: 'Advance approved' },
    rejectReq: { title: 'Decline this advance request?', label: 'Decline', note: 'Reason (shown to the organizer)', min: 5, body: <>“{dlg.r.event.title}” — {dlg.r.organizer.name}.</>, fn: (n) => adminApi.payouts.rejectAdvance(dlg.r.id, n), msg: 'Request declined' },
    advance: { title: 'Create an advance?', label: 'Create advance', body: <>An advance of <b>{moneyK(dlg.r.suggestedAdvance)}</b> for “{dlg.r.title}” will be created. Pay it from your bank, then record the reference.</>, fn: () => adminApi.payouts.createAdvance(dlg.r.eventId), msg: 'Advance created' },
    settle: { title: 'Create the final settlement?', label: 'Create settlement', body: <>A settlement of <b>{moneyK(dlg.r.settlementAmount)}</b> for “{dlg.r.title}” will be created. This is everything still owed after fees and earlier payments.</>, fn: () => adminApi.payouts.createSettlement(dlg.r.eventId), msg: 'Settlement created' },
    cancel: { title: 'Cancel this payout?', label: 'Cancel payout', note: 'Reason', min: 5, body: <>{TYPE[dlg.r.type]} of {moneyK(dlg.r.amount)} for “{dlg.r.event.title}” will be cancelled and the money counts as owed again.</>, fn: (n) => adminApi.payouts.cancel(dlg.r.id, n), msg: 'Payout cancelled' },
  }[dlg.type]);

  const stats = [
    { l: 'WAITING TO BE PAID', v: moneyK(totals.pending), s: `${counts.PENDING || 0} payout(s)`, hot: true },
    { l: 'PAID OUT TO ORGANIZERS', v: moneyK(totals.paid), s: `${counts.PAID || 0} payout(s)` },
    { l: 'ADVANCE REQUESTS', v: <CountUp value={requests.length} />, s: 'Waiting for a decision' },
    { l: 'READY TO CREATE', v: <CountUp value={ready.filter((r) => r.suggestedAdvance > 0 || r.settlementAmount > 0).length} />, s: 'Events with money owed' },
  ];

  return (
    <>
      <PageHeader eyebrow="FINANCIAL LEDGER" title="Payouts & Revenue Settlements" desc="Approve advances, create settlements, and record each bank transfer you make to organizers.">
        <Link to="/admin/settings"><Btn variant="dark"><FiSliders /> Fee & Payout Rules</Btn></Link>
        <Btn onClick={() => downloadCsv('payouts-page.csv', [['Payout', 'Organizer', 'Event', 'Type', 'Amount (NGN)', 'Status', 'Bank reference', 'Paid at'], ...rows.map((p) => [p.id, p.organizer.name, p.event.title, p.type, koboToNaira(p.amount), p.status, p.paymentReference, p.paidAt])])}><FiDownload /> Export this page</Btn>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((x, i) => (
          <Card key={x.l} index={i} hover className={`p-5 space-y-2 ${x.hot ? 'ring-2 ring-red-600' : ''}`}><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{x.l}</span><b className="text-2xl md:text-3xl font-black font-sans block break-words">{x.v}</b><span className="text-[10px] text-neutral-400">{x.s}</span></Card>
        ))}
      </div>

      <ErrorLine>{list.error || payable.error || reqs.error}</ErrorLine>

      {requests.length > 0 && (
        <Card index={1} className="p-5 space-y-3">
          <h2 className="text-xl font-black font-sans">Advance Requests ({requests.length})</h2>
          {requests.map((r) => (
            <div key={r.id} className="bg-neutral-900 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <span><b className="font-sans text-sm block">{r.event.title}</b><span className="text-neutral-400">{r.organizer.name} • requested {ago(r.createdAt)} • estimated {moneyK(r.estimate)}</span>
                {r.blockers.length > 0 && <span className="block text-red-300 mt-1">Cannot approve: {r.blockers.join('; ')}.</span>}</span>
              <span className="flex items-center gap-3 shrink-0"><span className="text-right"><span className="text-[9px] text-neutral-500 font-bold block">ADVANCE TODAY</span><b className="text-lg font-sans">{moneyK(r.suggestedNow)}</b></span>
                <Btn disabled={r.blockers.length > 0 || r.suggestedNow <= 0} onClick={() => setDlg({ type: 'approveReq', r })}>Approve</Btn><Btn variant="soft" onClick={() => setDlg({ type: 'rejectReq', r })}>Decline…</Btn></span>
            </div>
          ))}
        </Card>
      )}

      <Card index={2} className="overflow-hidden">
        <div className="p-4"><h2 className="text-xl font-black font-sans">Ready to Create</h2><p className="text-[11px] text-neutral-400">Events where money is owed to the organizer and nothing is waiting yet. Advances are for live events; settlements for events that have ended.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[900px]">
          <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">EVENT</th><th>ORGANIZER</th><th>OWED</th><th>ALREADY PAID</th><th>STILL TO PAY</th><th className="pr-4 text-right">ACTION</th></tr></thead>
          <tbody>{ready.map((r) => (
            <tr key={r.eventId} className="border-t border-neutral-800 align-top">
              <td className="p-4"><Link to={`/admin/events/${r.eventId}`} className="font-bold font-sans hover:text-[#FFBF00] block max-w-[240px]">{r.title}</Link><Pill tone={r.status === 'LIVE' ? 'green' : 'grey'}>{r.status}</Pill></td>
              <td><Link to={`/admin/organizers/${r.organizer.id}`} className="hover:text-[#FFBF00]">{r.organizer.name}</Link>{r.blockers.length > 0 && <span className="block text-[10px] text-red-300 max-w-[220px] mt-1">Blocked: {r.blockers.join('; ')}</span>}</td>
              <td>{moneyK(r.financials.netOwed)}</td><td>{moneyK(r.financials.advancePaid + r.financials.settlementPaid)}{r.pendingCount > 0 && <span className="block text-[10px] text-amber-300">{r.pendingCount} waiting</span>}</td>
              <td className="font-bold">{moneyK(Math.max(0, r.financials.remaining))}</td>
              <td className="pr-4 text-right space-x-2 whitespace-nowrap">
                {r.suggestedAdvance > 0 && <Btn className="py-1.5" disabled={r.blockers.length > 0} onClick={() => setDlg({ type: 'advance', r })}>Advance {moneyK(r.suggestedAdvance)}</Btn>}
                {r.settlementAmount > 0 && <Btn className="py-1.5" disabled={r.blockers.length > 0} onClick={() => setDlg({ type: 'settle', r })}>Settle {moneyK(r.settlementAmount)}</Btn>}
              </td>
            </tr>))}</tbody></table>
          {payable.loading && !payable.data && <p className="text-center text-sm text-neutral-400 py-8">Loading…</p>}
          {payable.data && !ready.length && <p className="text-center text-sm text-neutral-400 py-8"><FiCheckCircle className="inline mr-1 text-emerald-400" /> Nothing to create right now.</p>}
        </div>
      </Card>

      <Card index={3} className="overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <h2 className="text-xl font-black font-sans">Payout Ledger</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search organizer, event or reference…" className={`${sel} pl-9 w-64`} /></div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={sel}><option value="">Status: All</option>{Object.entries(PAYOUT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label} ({counts[k] || 0})</option>)}</select>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={sel}><option value="">Type: All</option><option value="ADVANCE">Advance</option><option value="SETTLEMENT">Final settlement</option></select>
          </div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[1000px]">
          <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">PAYOUT</th><th>ORGANIZER</th><th>EVENT</th><th>TYPE</th><th>AMOUNT</th><th>STATUS</th><th className="pr-4 text-right">ACTION</th></tr></thead>
          <tbody>{rows.map((p, i) => { const st = PAYOUT_STATUS[p.status]; return (
            <motion.tr key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-neutral-800 hover:bg-neutral-900 transition">
              <td className="p-4"><b className="font-sans text-sm block">#{shortId(p.id)}</b><span className="text-[10px] text-neutral-400">{fmtDate(p.createdAt)}</span></td>
              <td><Link to={`/admin/organizers/${p.organizer.id}`} className="font-bold hover:text-[#FFBF00]">{p.organizer.name}</Link></td>
              <td className="max-w-[220px]"><Link to={`/admin/events/${p.event.id}`} className="hover:text-[#FFBF00]">{p.event.title}</Link></td>
              <td>{TYPE[p.type]}</td><td className="font-bold">{moneyK(p.amount)}</td>
              <td><Pill tone={st.tone}>{st.label}</Pill>{p.status === 'PAID' && <span className="block text-[9px] text-neutral-500 mt-1 break-all max-w-[160px]">{p.paymentReference} • {fmtDate(p.paidAt, false)}</span>}{p.status === 'CANCELLED' && p.cancelNote && <span className="block text-[9px] text-neutral-500 mt-1 max-w-[160px]">{p.cancelNote}</span>}</td>
              <td className="pr-4 text-right whitespace-nowrap">{p.status === 'PENDING' && <><Btn className="py-1.5" onClick={() => setPaying(p)}>Mark as Paid</Btn> <Btn variant="soft" className="py-1.5" onClick={() => setDlg({ type: 'cancel', r: p })}>Cancel</Btn></>}</td>
            </motion.tr>); })}</tbody></table>
          {list.loading && !list.data && <p className="text-center text-sm text-neutral-400 py-10">Loading…</p>}
          {list.data && !rows.length && <p className="text-center text-sm text-neutral-400 py-10">No payouts match these filters.</p>}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t border-neutral-800 text-xs">
          <span>Showing <b>{meta.total ? (page - 1) * PAGE + 1 : 0}–{Math.min(page * PAGE, meta.total)}</b> of <b>{meta.total}</b></span>
          <Pagination page={page} pages={meta.pages} onPage={setPage} />
        </div>
      </Card>

      {d && <ConfirmModal open title={d.title} confirmLabel={d.label} noteLabel={d.note} noteMin={d.min} onClose={close} onConfirm={run(d.fn, d.msg)}><p>{d.body}</p></ConfirmModal>}
      {paying && <MarkPaidModal payout={paying} onClose={() => setPaying(null)} onDone={() => { setPaying(null); reloadAll(); }} />}
    </>
  );
}