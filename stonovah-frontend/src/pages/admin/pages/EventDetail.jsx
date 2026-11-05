// src/pages/admin/pages/EventDetail.jsx
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiEyeOff, FiEye, FiDownload, FiSearch } from 'react-icons/fi';
import { Card, Pill, Btn, Bar, CountUp } from '../ui';
import { Pagination, Select } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, ConfirmModal } from '../adminBits';
import { EVENT_STATUS, moneyK, fmtDate, priceRange, useDebounced } from '../adminLive';
import ApproveModal from './ApproveModal';

const reasons = ['POLICY_VIOLATION', 'VENUE_ISSUE', 'FRAUD_REPORT', 'ORGANIZER_REQUEST', 'OTHER'];
const label = (r) => r.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';
const PASS = { VALID: ['Not yet scanned', 'text-neutral-400'], USED: ['Checked in', 'text-emerald-400'], VOID: ['Cancelled', 'text-red-400'] };

export default function EventDetail() {
  const { id } = useParams();
  const ev = useLoad(() => adminApi.events.get(id), [id]);
  const st = useLoad(() => adminApi.events.stats(id), [id]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounced(q.trim());
  const att = useLoad(() => adminApi.events.attendees(id, { search, status, page, limit: 10 }), [id, search, status, page]);
  const [unpub, setUnpub] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [republish, setRepublish] = useState(false);

  const e = ev.data;
  if (!e) return ev.error ? <Card className="p-10 text-center">{ev.error} <Link to="/admin/events" className="text-[#FFBF00] underline">Back to all events</Link></Card> : <p className="font-mono text-xs font-bold">LOADING…</p>;

  const s = st.data;
  const t = e.tierSummary;
  const stat = EVENT_STATUS[e.status];
  const rows = att.data?.data || [];
  const meta = att.data?.meta || { total: 0, pages: 1 };
  const sold = s?.ticketsSold ?? 0;
  const paidOut = s ? s.advancePaid + s.settlementPaid : 0;
  const stats = s && [
    { k: 'TICKETS SOLD', v: <CountUp value={sold} />, sub: `of ${t.capacity.toLocaleString()} capacity`, bar: t.capacity ? (sold / t.capacity) * 100 : 0 },
    { k: 'CHECKED IN', v: <CountUp value={s.checkedInCount} />, sub: `of ${sold.toLocaleString()} tickets`, bar: sold ? (s.checkedInCount / sold) * 100 : 0 },
    { k: 'GROSS (FACE VALUE)', v: moneyK(s.grossRevenue), sub: 'Paid ticket sales' },
    { k: 'PLATFORM FEE', v: moneyK(s.feeDeducted), sub: e.feeHandling === 'ORGANIZER_ABSORBED' ? 'Deducted from the organizer' : 'Paid by buyers on top' },
    { k: 'OWED TO ORGANIZER', v: moneyK(s.netOwed), sub: 'After fees' },
    { k: 'PAID OUT', v: moneyK(paidOut), sub: `${moneyK(Math.max(0, s.remaining))} still to be paid` },
  ];

  const doUnpublish = async (memo) => {
    try { await adminApi.events.unpublish(id, { reasonCategory: reason, internalMemo: memo }); toast.success('Event unpublished'); setUnpub(false); ev.reload(); st.reload(); }
    catch (err) { toast.error(apiErrorMessage(err)); }
  };

  return (
    <>
      <div className="flex justify-between items-center text-[10px] font-mono font-bold"><Link to="/admin/events" className="inline-flex items-center gap-2 text-xs hover:underline"><FiArrowLeft /> Back to All Events</Link><span className="text-black/70">EVENT CONSOLE</span></div>

      <Card className="p-6 md:p-8 space-y-4 bg-gradient-to-br from-black via-black to-red-950/40">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold"><Pill>REF: {String(e.id).slice(-8).toUpperCase()}</Pill><Pill tone={e.status === 'PENDING' && e.isApproved ? 'amber' : stat.tone}>{e.status === 'PENDING' && e.isApproved ? 'Scheduled' : stat.label}</Pill>{e.hostedByStonovah && <Pill>Hosted by Stonovah</Pill>}</div>
        <span className="text-[10px] text-neutral-400 font-bold block">{(e.venue || 'No venue').toUpperCase()}{e.venueAddress ? ` • ${e.venueAddress.toUpperCase()}` : ''} • {fmtDate(e.startAt)}</span>
        <h1 className="text-3xl md:text-5xl font-black font-sans tracking-tight max-w-3xl">{e.title}</h1>
        {e.description && <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed whitespace-pre-line">{e.description}</p>}
        <div className="flex flex-wrap gap-2 pt-2">
          {e.status === 'LIVE' && <Btn variant="soft" onClick={() => setUnpub(true)}><FiEyeOff /> Unpublish Event</Btn>}
          {e.status === 'UNPUBLISHED' && <Btn variant="soft" onClick={() => setRepublish(true)}><FiEye /> Return to Sale</Btn>}
          <Btn onClick={() => adminApi.events.exportAttendees(id).catch((err) => toast.error(apiErrorMessage(err)))}><FiDownload /> Export Attendees (CSV)</Btn>
          {!e.hostedByStonovah && <Link to={`/admin/organizers/${e.organizer.id}`}><Btn variant="soft">Open Organizer</Btn></Link>}
        </div>
        {e.status === 'UNPUBLISHED' && e.unpublishReason && <p className="text-[11px] text-amber-300">Unpublished ({label(e.unpublishReason)}){e.unpublishMemo ? `: ${e.unpublishMemo}` : ''}</p>}
      </Card>

      <ErrorLine>{st.error}</ErrorLine>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {stats.map((x, i) => (
            <Card key={x.k} index={i} hover className="p-4 space-y-1.5"><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{x.k}</span><b className="text-xl font-black font-sans block break-all">{x.v}</b><span className="text-[10px] text-neutral-400 block">{x.sub}</span>{x.bar !== undefined && <Bar percent={x.bar} />}</Card>
          ))}
        </div>
      )}

      <Card index={1} className="p-5 space-y-4">
        <div><h2 className="text-xl font-black font-sans">Ticket Types</h2><p className="text-[11px] text-neutral-400">Inventory and sales per ticket type. Price range: {priceRange(t)}.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[560px]">
          <thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">TICKET TYPE</th><th>PRICE</th><th className="w-44">SOLD / QUANTITY</th><th className="text-right">SALES (FACE VALUE)</th></tr></thead>
          <tbody>{e.tiers.map((x) => { const pct = x.quantity ? Math.round((x.quantitySold / x.quantity) * 100) : 0; return (
            <tr key={x.id} className="border-t border-neutral-800"><td className="py-3 font-bold">{x.name}</td><td>{x.price ? moneyK(x.price) : 'Free'}</td><td className="pr-4"><span className="text-[10px]">{x.quantitySold.toLocaleString()} / {x.quantity.toLocaleString()} ({pct}%)</span><Bar percent={pct} /></td><td className="text-right">{moneyK(x.quantitySold * x.price)}</td></tr>); })}</tbody></table></div>
      </Card>

      <Card index={2} className="p-5 space-y-4">
        <div><h2 className="text-xl font-black font-sans">Attendees</h2><p className="text-[11px] text-neutral-400">Every ticket issued for this event.</p></div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(x) => { setQ(x.target.value); setPage(1); }} placeholder="Search by name, email, ticket code or order…" className={`${sel} w-full pl-9`} /></div>
          <Select
            className="w-48"
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: '', label: 'All tickets' },
              { value: 'VALID', label: 'Not yet scanned' },
              { value: 'USED', label: 'Checked in' },
              { value: 'VOID', label: 'Cancelled' },
            ]}
          />
        </div>
        <ErrorLine>{att.error}</ErrorLine>
        <div className="overflow-x-auto"><table className="w-full text-xs min-w-[760px]">
          <thead><tr className="text-[9px] text-neutral-500 text-left"><th className="py-2">TICKET CODE</th><th>ATTENDEE</th><th>EMAIL</th><th>TICKET TYPE</th><th>STATUS</th></tr></thead>
          <tbody>{rows.map((a) => { const [text, cls] = PASS[a.status] || PASS.VALID; return (
            <tr key={a.id} className="border-t border-neutral-800">
              <td className="py-3 font-mono text-[#FFBF00]">{a.ticketCode}</td><td className="font-bold">{a.order.buyerName}</td><td className="text-neutral-300">{a.order.buyerEmail}</td>
              <td><Pill>{a.tier.name}</Pill></td>
              <td className={cls}>{text}{a.status === 'USED' && a.checkedInAt ? ` • ${new Date(a.checkedInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</td>
            </tr>); })}</tbody></table>
          {att.loading && <p className="text-center text-sm text-neutral-400 py-10">Loading…</p>}
          {!att.loading && !rows.length && <p className="text-center text-sm text-neutral-400 py-10">{search || status ? 'No attendees match.' : 'No tickets have been issued yet.'}</p>}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <span>Showing <b>{meta.total ? (page - 1) * 10 + 1 : 0}–{Math.min(page * 10, meta.total)}</b> of <b>{meta.total}</b></span>
          <Pagination page={page} pages={meta.pages} onPage={setPage} />
        </div>
      </Card>

      {unpub && (
        <ConfirmModal open title="Unpublish this event?" confirmLabel="Unpublish" noteLabel="Internal memo (only admins see this)" noteMin={5} onClose={() => setUnpub(false)} onConfirm={doUnpublish}>
          <p>The event is taken off sale and the organizer is notified. Tickets already issued stay valid and no refunds are created.</p>
          <label className="block text-[10px] font-bold text-neutral-400 uppercase">Reason<select value={reason} onChange={(x) => setReason(x.target.value)} className={`${sel} w-full mt-1 normal-case`}>{reasons.map((r) => <option key={r} value={r}>{label(r)}</option>)}</select></label>
        </ConfirmModal>
      )}
      {republish && <ApproveModal event={e} open onClose={() => setRepublish(false)} onDone={() => { ev.reload(); st.reload(); }} />}
    </>
  );
}