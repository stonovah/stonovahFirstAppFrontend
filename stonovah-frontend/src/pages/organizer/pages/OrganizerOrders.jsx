// src/pages/organizer/pages/OrganizerOrders.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDownload, FiSearch, FiMail, FiRotateCcw, FiCopy } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../../admin/ui';
import { FormField, inputCls, Pagination } from '../../admin/ui2';
import { BarChart } from '../orgUi';
import { eventsApi } from '../../../api/events';
import { salesApi } from '../../../api/sales';
import { apiErrorMessage } from '../../../api/apiClient';
import { formatNaira, koboToNaira } from '../../steps/helpers';
import { useCan } from '../../../context/AuthContext';

const PAGE = 10;
const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';

const money = (kobo) => formatNaira(koboToNaira(kobo));
const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const ago = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return fmtDateTime(iso);
};

const ORDER_STATUS = {
  PENDING: { label: 'Awaiting payment', tone: 'amber' },
  PAID: { label: 'Paid', tone: 'green' },
  FAILED: { label: 'Failed', tone: undefined },
  REFUNDED: { label: 'Refunded', tone: 'grey' },
};
const stateOf = (o) => (o.refund?.status === 'PENDING' ? { label: 'Refund requested', tone: 'amber' } : ORDER_STATUS[o.status] || { label: o.status });

const TICKET_STATE = {
  VALID: { label: 'Not yet scanned', cls: 'text-neutral-500' },
  USED: { label: '● Checked in', cls: 'text-emerald-400 font-bold' },
  VOID: { label: 'Cancelled', cls: 'text-red-400' },
};

export default function OrganizerOrders() {
  const [tab, setTab] = useState('orders');
  const [events, setEvents] = useState([]);
  const [ev, setEv] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [attStatus, setAttStatus] = useState('');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState(''); // debounced q
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState(null);
  const [result, setResult] = useState({ data: [], meta: { total: 0, pages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null); // order id shown in the modal

  useEffect(() => {
    eventsApi.list().then((l) => setEvents(l.filter((e) => e.status !== 'DRAFT'))).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => { setPage(1); }, [tab, ev, orderStatus, attStatus, search]);

  const filters = useMemo(
    () => ({ eventId: ev, search, status: tab === 'orders' ? orderStatus : attStatus }),
    [ev, search, tab, orderStatus, attStatus]
  );

  const loadSummary = useCallback(() => {
    salesApi.summary({ eventId: ev }).then(setSummary).catch(() => {});
  }, [ev]);
  useEffect(() => { setSummary(null); loadSummary(); }, [loadSummary]);

  const loadList = useCallback(() => {
    let live = true;
    setLoading(true); setError('');
    (tab === 'orders' ? salesApi.orders : salesApi.attendees)({ ...filters, page, limit: PAGE })
      .then((r) => live && setResult(r))
      .catch((e) => live && setError(apiErrorMessage(e, 'Could not load this list.')))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [tab, filters, page]);
  useEffect(() => loadList(), [loadList]);

  const exportCsv = async () => {
    try { await (tab === 'orders' ? salesApi.exportOrders(filters) : salesApi.exportAttendees(filters)); }
    catch (e) { toast.error(apiErrorMessage(e, 'Could not export.')); }
  };

  const rows = result.data;
  const { total, pages } = result.meta;
  const chart = (summary?.daily || []).map((d) => ({
    label: new Date(`${d.date}T12:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
    value: d.tickets,
  }));
  const inRate = summary?.ticketsIssued ? (summary.checkedIn / summary.ticketsIssued) * 100 : 0;

  const stats = [
    ['PAID ORDERS', <CountUp key="a" value={summary?.paidOrders ?? 0} />, `${summary?.totalOrders ?? 0} total orders`],
    ['TICKETS SOLD', <CountUp key="b" value={summary?.ticketsSold ?? 0} />, 'Across paid orders'],
    ['GROSS SALES', <CountUp key="c" value={Math.round(koboToNaira(summary?.gross ?? 0))} prefix="₦" />, 'Ticket face value, before platform fees'],
    ['CHECK-IN RATE', <CountUp key="d" value={inRate} suffix="%" decimals={1} />, `${summary?.checkedIn ?? 0} of ${summary?.ticketsIssued ?? 0} scanned`],
    ['NEEDS ATTENTION', <CountUp key="e" value={summary?.needsAttention ?? 0} />, 'Refund requests and failed orders'],
  ];

  return (
    <>
      <PageHeader eyebrow="ORGANIZER PORTAL / SALES LEDGER" title="Attendees & Orders" desc="Every order and attendee across your productions. Resend tickets, review payments and request refunds.">
        <select value={ev} onChange={(e) => setEv(e.target.value)} className="bg-black text-white border border-black rounded-xl px-3 py-2.5 text-xs font-mono">
          <option value="">All events</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <Btn variant="dark" onClick={exportCsv}><FiDownload /> Export CSV</Btn>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map(([k, v, s], i) => (
          <Card key={k} index={i} hover className="p-4 space-y-1 relative overflow-hidden">
            <span className="absolute top-0 left-4 w-10 h-0.5 bg-red-600" />
            <span className="text-[9px] font-bold text-neutral-400 tracking-wider">{k}</span>
            <b className="text-3xl font-black font-sans block break-all">{v}</b>
            <span className="text-[10px] text-neutral-400">{s}</span>
          </Card>
        ))}
      </div>

      <Card index={1} className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black font-sans">Tickets sold, last 14 days</h3>
          <Pill>{chart.reduce((s, d) => s + d.value, 0)} tickets</Pill>
        </div>
        <BarChart data={chart} format={(v) => `${v} tickets`} />
      </Card>

      <Card className="p-3 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="flex gap-2">
          {[['orders', 'Orders'], ['attendees', 'Attendees']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>
              {l} ({k === 'orders' ? summary?.totalOrders ?? '…' : summary?.ticketsIssued ?? '…'})
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === 'orders' ? 'Search order ID, buyer or email…' : 'Search attendee, email, ticket code or order…'} className={`${sel} w-full pl-9`} />
        </div>
        {tab === 'orders' ? (
          <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className={sel}>
            <option value="">Status: All</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Awaiting payment</option>
            <option value="REFUND_REQUESTED">Refund requested</option>
            <option value="REFUNDED">Refunded</option>
            <option value="FAILED">Failed</option>
          </select>
        ) : (
          <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className={sel}>
            <option value="">Check-in: All</option>
            <option value="VALID">Not yet scanned</option>
            <option value="USED">Checked in</option>
            <option value="VOID">Cancelled</option>
          </select>
        )}
      </Card>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      <Card index={2} className="overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'orders' ? (
            <table className="w-full text-xs min-w-[860px]">
              <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">ORDER & DATE</th><th>BUYER</th><th>EVENT & TICKETS</th><th>QTY</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
              <tbody>
                {rows.map((o, i) => {
                  const st = stateOf(o);
                  return (
                    <motion.tr key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setOpen(o.id)} className="border-t border-neutral-800 hover:bg-neutral-900 transition cursor-pointer">
                      <td className="p-4"><b className="font-sans text-sm block">{String(o.id).slice(-8).toUpperCase()}</b><span className="text-[10px] text-neutral-400">{ago(o.createdAt)}</span></td>
                      <td><b className="block">{o.buyerName}</b><span className="text-[10px] text-neutral-400">{o.buyerEmail}</span></td>
                      <td className="max-w-[260px]"><b className="block truncate">{o.event.title}</b><span className="text-[10px] text-neutral-400 truncate block">{o.items.map((i) => i.tierName).join(', ')}</span></td>
                      <td>{o.quantity}</td>
                      <td className="font-bold">{o.totalAmount ? money(o.totalAmount) : 'Free'}</td>
                      <td><Pill tone={st.tone}>{st.label}</Pill></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs min-w-[860px]">
              <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">ATTENDEE</th><th>EMAIL</th><th>TIER</th><th>TICKET CODE</th><th>ORDER</th><th>CHECK-IN</th></tr></thead>
              <tbody>
                {rows.map((a, i) => {
                  const st = TICKET_STATE[a.status] || TICKET_STATE.VALID;
                  return (
                    <motion.tr key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t border-neutral-800 hover:bg-neutral-900 transition">
                      <td className="p-4"><b className="font-sans text-sm block">{a.order.buyerName}</b><span className="text-[10px] text-neutral-400 truncate block max-w-[220px]">{a.event.title}</span></td>
                      <td className="text-neutral-300">{a.order.buyerEmail}</td>
                      <td><Pill>{a.tier.name}</Pill></td>
                      <td className="font-mono text-[#FFBF00]">{a.ticketCode}</td>
                      <td className="text-neutral-400 font-mono">{String(a.orderId).slice(-8).toUpperCase()}</td>
                      <td className={st.cls}>{st.label}{a.status === 'USED' && a.checkedInAt ? ` • ${new Date(a.checkedInAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {loading && <p className="text-center text-sm text-neutral-400 py-12">Loading…</p>}
          {!loading && !rows.length && <p className="text-center text-sm text-neutral-400 py-12">Nothing matches these filters.</p>}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t border-neutral-800 text-xs">
          <span>Showing <b>{total ? (page - 1) * PAGE + 1 : 0}–{Math.min(page * PAGE, total)}</b> of <b>{total}</b></span>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </div>
      </Card>

      <OrderModal orderId={open} onClose={() => setOpen(null)} onChanged={() => { loadList(); loadSummary(); }} />
    </>
  );
}

// ---------- order detail ----------
function OrderModal({ orderId, onClose, onChanged }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [refund, setRefund] = useState(false);
  const [reason, setReason] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState('');
  const canAct = useCan()('sales.write');

  useEffect(() => {
    setOrder(null); setError(''); setRefund(false); setReason(''); setOk(false);
    if (!orderId) return undefined;
    let live = true;
    salesApi.order(orderId).then((o) => live && setOrder(o)).catch((e) => live && setError(apiErrorMessage(e, 'Could not load this order.')));
    return () => { live = false; };
  }, [orderId]);

  const resend = async () => {
    setBusy('resend');
    try { await salesApi.resend(order.id); toast.success(`Tickets sent to ${order.buyerEmail}`); }
    catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  const sendRefund = async () => {
    setBusy('refund');
    try {
      await salesApi.refund(order.id, reason.trim());
      toast.success('Refund request sent to Stonovah for review');
      onChanged(); onClose();
    } catch (e) { toast.error(apiErrorMessage(e)); }
    finally { setBusy(''); }
  };

  const pendingRefund = order?.refund?.status === 'PENDING';
  const canRefund = order && order.status === 'PAID' && order.totalAmount > 0 && !pendingRefund;
  const st = order ? stateOf(order) : null;

  return (
    <Modal open={!!orderId} onClose={onClose} width="max-w-xl">
      <div className="p-6 space-y-4">
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!order && !error && <p className="text-xs text-neutral-400 py-8 text-center">Loading order…</p>}

        {order && (
          <>
            <div className="pr-10">
              <h2 className="text-2xl font-black font-sans">{String(order.id).slice(-8).toUpperCase()}</h2>
              <div className="flex gap-2 mt-1 items-center"><Pill tone={st.tone}>{st.label}</Pill><span className="text-[11px] text-neutral-400">{fmtDateTime(order.createdAt)}</span></div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 space-y-1 text-xs">
              <b className="text-sm font-sans block">{order.buyerName}</b>
              <span className="text-neutral-400 block">{order.buyerEmail}</span>
              <span className="text-neutral-400 block">{order.buyerPhone}</span>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-neutral-400">Event</span><b className="text-right">{order.event.title}</b></div>
              {order.items.map((i) => (
                <div key={i.tierId} className="flex justify-between"><span className="text-neutral-400">{i.tierName}</span><b>{i.quantity} × {i.unitPrice ? money(i.unitPrice) : 'Free'}</b></div>
              ))}
              <div className="flex justify-between border-t border-neutral-700 pt-2"><span className="text-neutral-400">Tickets subtotal</span><b>{money(order.subtotal)}</b></div>
              {order.fees.buyerFee > 0 && <div className="flex justify-between"><span className="text-neutral-400">Booking fee (paid by buyer)</span><b>{money(order.fees.buyerFee)}</b></div>}
              {order.fees.organizerFee > 0 && <div className="flex justify-between"><span className="text-neutral-400">Platform fee {Number((order.fees.rate * 100).toFixed(2))}% (paid by you, estimated)</span><b>{money(order.fees.organizerFee)}</b></div>}
              <div className="flex justify-between border-t border-neutral-700 pt-2"><span className="text-neutral-400">Order total</span><b className="text-base">{order.totalAmount ? money(order.totalAmount) : 'Free'}</b></div>
            </div>

            {order.tickets.length > 0 && (
              <div className="bg-neutral-800 rounded-xl p-4 space-y-2 text-xs">
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Tickets ({order.tickets.length})</span>
                {order.tickets.map((t) => (
                  <div key={t.id} className="flex justify-between gap-3">
                    <span><b className="font-mono text-[#FFBF00]">{t.ticketCode}</b> <span className="text-neutral-400">• {t.tierName}</span></span>
                    <span className={(TICKET_STATE[t.status] || TICKET_STATE.VALID).cls}>
                      {t.pdfUrl && <a href={t.pdfUrl} target="_blank" rel="noreferrer" className="text-neutral-300 underline mr-2">PDF</a>}
                      {(TICKET_STATE[t.status] || TICKET_STATE.VALID).label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {order.status === 'PAID' && order.tickets.length === 0 && (
              <p className="text-xs bg-amber-950/40 border border-amber-800 rounded-lg p-3 text-amber-200">Tickets are still being generated. They will appear here shortly; “Resend tickets” also completes any missing ones.</p>
            )}

            {order.refund && (
              <p className="text-xs bg-neutral-800 rounded-lg p-3">
                <b>Refund request ({order.refund.status.toLowerCase()}):</b> {order.refund.reason}
              </p>
            )}

            {refund && (
              <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 space-y-3">
                <FormField label="Reason for refund" required error={reason.length > 0 && reason.trim().length < 10 ? 'At least 10 characters' : ''}>
                  <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} />
                </FormField>
                <label className="flex gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 accent-red-600" />
                  I confirm this refund is valid and the buyer’s tickets will be cancelled if it is approved.
                </label>
                <Btn disabled={reason.trim().length < 10 || !ok || busy === 'refund'} onClick={sendRefund}>{busy === 'refund' ? 'Sending…' : 'Submit Refund Request'}</Btn>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Btn variant="soft" onClick={resend} disabled={order.status !== 'PAID' || busy === 'resend' || !canAct}><FiMail /> {busy === 'resend' ? 'Sending…' : 'Resend Tickets'}</Btn>
              <Btn variant="soft" disabled={!canRefund || refund || !canAct} onClick={() => setRefund(true)}><FiRotateCcw /> Request Refund</Btn>
              <Btn variant="soft" onClick={() => { navigator.clipboard?.writeText(order.id); toast.success('Order ID copied'); }}><FiCopy /> Copy ID</Btn>
            </div>
            <p className="text-[10px] text-neutral-500">Refund requests are sent to Stonovah for review. No money moves until Stonovah approves and processes the refund.</p>
          </>
        )}
      </div>
    </Modal>
  );
}