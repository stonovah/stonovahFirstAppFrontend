// src/pages/admin/pages/Orders.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiDownload, FiSearch, FiCopy, FiAlertTriangle } from 'react-icons/fi';
import { Card, Pill, Btn, PageHeader, Modal, CountUp } from '../ui';
import { Pagination } from '../ui2';
import { adminApi } from '../../../api/admin';
import { apiErrorMessage } from '../../../api/apiClient';
import { useLoad, ErrorLine, ConfirmModal, KV } from '../adminBits';
import { ORDER_STATUS, moneyK, fmtDate, ago, shortId, useDebounced } from '../adminLive';

const sel = 'bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#FFBF00]';
const REFUND = { PENDING: { label: 'Waiting', tone: 'amber' }, APPROVED: { label: 'Approved', tone: 'green' }, REJECTED: { label: 'Declined', tone: 'grey' } };
const PAGE = 10;
const copy = (v) => { navigator.clipboard?.writeText(v); toast.success('Copied'); };

function OrderModal({ id, onClose }) {
  const d = useLoad(() => adminApi.orders.get(id), [id]);
  const o = d.data;
  return (
    <Modal open onClose={onClose} width="max-w-2xl">
      <div className="p-6 space-y-4">
        {!o && <p className="text-xs text-neutral-400 py-8 text-center">{d.error || 'Loading order…'}</p>}
        {o && (
          <>
            <div className="pr-10"><h2 className="text-2xl font-black font-sans">Order {shortId(o.id)}</h2>
              <div className="flex gap-2 mt-1 items-center"><Pill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Pill><span className="text-[11px] text-neutral-400">{fmtDate(o.createdAt)}</span></div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><KV k="BUYER" v={o.buyerName} /><KV k="EMAIL" v={o.buyerEmail} /><KV k="PHONE" v={o.buyerPhone} /><KV k="EVENT" v={o.event.title} /></div>
            <div className="bg-neutral-800 rounded-xl p-4 space-y-2 text-xs">
              {o.items.map((i) => <div key={i.id} className="flex justify-between"><span className="text-neutral-400">{i.tier.name}</span><b>{i.quantity} × {i.unitPrice ? moneyK(i.unitPrice) : 'Free'}</b></div>)}
              <div className="flex justify-between border-t border-neutral-700 pt-2"><span className="text-neutral-400">Order total (incl. any buyer fee)</span><b className="text-base">{o.totalAmount ? moneyK(o.totalAmount) : 'Free'}</b></div>
            </div>
            {o.paystackReference && (
              <div className="bg-neutral-900 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 text-xs"><span><span className="text-[9px] text-neutral-500 font-bold block">PAYSTACK REFERENCE</span><span className="font-mono break-all">{o.paystackReference}</span></span><button type="button" aria-label="Copy" onClick={() => copy(o.paystackReference)} className="cursor-pointer text-neutral-400 hover:text-white"><FiCopy /></button></div>
            )}
            {o.tickets.length > 0 && (
              <div className="bg-neutral-800 rounded-xl p-4 space-y-1.5 text-xs"><span className="text-[10px] text-neutral-400 font-bold uppercase block">Tickets ({o.tickets.length})</span>
                {o.tickets.map((t) => <div key={t.id} className="flex justify-between"><b className="font-mono text-[#FFBF00]">{t.ticketCode}</b><span className="text-neutral-400">{t.status === 'USED' ? 'Checked in' : t.status === 'VOID' ? 'Cancelled' : 'Valid'}</span></div>)}</div>
            )}
            {o.status === 'PAID' && o.tickets.length === 0 && <p className="text-xs text-amber-300 flex gap-2"><FiAlertTriangle className="mt-0.5 shrink-0" /> Paid, but no tickets have been issued yet. The background job retries every 5 minutes.</p>}
            {o.refundRequests.map((r) => (
              <div key={r.id} className="bg-neutral-800 rounded-xl p-3 text-xs space-y-1"><div className="flex justify-between"><b>Refund request</b><Pill tone={REFUND[r.status].tone}>{REFUND[r.status].label}</Pill></div><p className="text-neutral-300">{r.reason}</p>{r.resolutionNote && <p className="text-neutral-400">Decision note: {r.resolutionNote}</p>}</div>
            ))}
            <Link to={`/admin/events/${o.event.id}`} className="text-[10px] font-bold text-[#FFBF00] hover:text-white block">Open the event →</Link>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function Orders() {
  const [tab, setTab] = useState('refunds');
  const [rStatus, setRStatus] = useState('PENDING');
  const [rPage, setRPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const search = useDebounced(q.trim());
  const orders = useLoad(() => adminApi.orders.list({ search, status, page, limit: PAGE }), [search, status, page]);
  const refunds = useLoad(() => adminApi.orders.refunds({ status: rStatus, page: rPage, limit: PAGE }), [rStatus, rPage]);
  const [open, setOpen] = useState(null);
  const [dlg, setDlg] = useState(null);

  const reloadAll = () => { orders.reload(); refunds.reload(); };
  const close = () => setDlg(null);
  const run = (fn, msg) => async (n) => { try { await fn(n); toast.success(msg); close(); reloadAll(); } catch (e) { toast.error(apiErrorMessage(e)); } };

  const oc = orders.data?.counts || {};
  const oMeta = orders.data?.meta || { total: 0, pages: 1 };
  const rMeta = refunds.data?.meta || { total: 0, pages: 1 };
  const total = Object.values(oc).reduce((s, n) => s + n, 0);
  const pendingRefunds = orders.data?.pendingRefunds ?? 0;
  const r = dlg?.r;

  const stats = [
    { l: 'ALL ORDERS', v: total }, { l: 'PAID', v: oc.PAID || 0 }, { l: 'AWAITING PAYMENT', v: oc.PENDING || 0 },
    { l: 'REFUNDED', v: oc.REFUNDED || 0 }, { l: 'REFUND REQUESTS WAITING', v: pendingRefunds, hot: true },
  ];

  return (
    <>
      <PageHeader eyebrow="SALES OVERSIGHT" title="Orders & Refunds" desc="Every order on the platform, and the refund requests organizers send to Stonovah for review.">
        <Btn variant="dark" onClick={() => adminApi.orders.exportCsv({ search, status }).catch((e) => toast.error(apiErrorMessage(e)))}><FiDownload /> Export Orders (CSV)</Btn>
      </PageHeader>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => <Card key={s.l} index={i} hover className={`p-4 space-y-1 ${s.hot && s.v > 0 ? 'ring-2 ring-red-600' : ''}`}><span className="text-[9px] font-bold text-neutral-400 tracking-wider block">{s.l}</span><b className="text-3xl font-black font-sans block"><CountUp value={s.v} /></b></Card>)}
      </div>

      <Card className="p-3 flex gap-2">
        {[['refunds', `Refund Requests${pendingRefunds ? ` (${pendingRefunds})` : ''}`], ['orders', 'All Orders']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition ${tab === k ? 'bg-red-600' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300'}`}>{l}</button>
        ))}
      </Card>

      <ErrorLine>{tab === 'refunds' ? refunds.error : orders.error}</ErrorLine>

      {tab === 'refunds' && (
        <>
          <div className="flex gap-2">{[['PENDING', 'Waiting'], ['APPROVED', 'Approved'], ['REJECTED', 'Declined'], ['', 'All']].map(([k, l]) => <button key={l} type="button" onClick={() => { setRStatus(k); setRPage(1); }} className={`text-xs font-bold px-3 py-2 rounded-lg cursor-pointer ${rStatus === k ? 'bg-black text-white' : 'bg-black/10 hover:bg-black/20'}`}>{l}</button>)}</div>
          <div className="space-y-3">
            {(refunds.data?.data || []).map((x, i) => {
              const ord = x.order;
              return (
                <Card key={x.id} index={i} className="p-5 flex flex-col lg:flex-row gap-4 justify-between">
                  <div className="space-y-1.5 min-w-0 text-xs">
                    <div className="flex flex-wrap items-center gap-2"><b className="text-lg font-sans">{moneyK(ord.totalAmount)}</b><Pill tone={REFUND[x.status].tone}>{REFUND[x.status].label}</Pill><span className="text-neutral-500">requested {ago(x.createdAt)}</span></div>
                    <b className="block">{ord.buyerName} <span className="text-neutral-400 font-normal">• {ord.buyerEmail}</span></b>
                    <span className="text-neutral-400 block">{ord.event.title} • organizer {ord.event.organizer.organizerProfile?.organizationName || ord.event.organizer.email}</span>
                    <p className="bg-neutral-900 rounded-lg p-3 text-neutral-300 leading-relaxed">“{x.reason}”</p>
                    {ord.paystackReference && <button type="button" onClick={() => copy(ord.paystackReference)} className="text-[10px] text-[#FFBF00] hover:text-white flex items-center gap-1 cursor-pointer font-mono break-all"><FiCopy /> Paystack ref {ord.paystackReference}</button>}
                    {x.resolutionNote && <p className="text-neutral-400">Decision note: {x.resolutionNote}</p>}
                  </div>
                  <div className="flex lg:flex-col gap-2 shrink-0 lg:items-end">
                    <Btn variant="soft" onClick={() => setOpen(ord.id)}>View order</Btn>
                    {x.status === 'PENDING' && <><Btn disabled={ord.status !== 'PAID'} onClick={() => setDlg({ type: 'approve', r: x })}>Approve</Btn><Btn variant="soft" onClick={() => setDlg({ type: 'reject', r: x })}>Decline…</Btn></>}
                  </div>
                </Card>
              );
            })}
            {refunds.loading && !refunds.data && <p className="font-mono text-xs font-bold">LOADING…</p>}
            {refunds.data && !refunds.data.data.length && <Card className="p-10 text-center text-sm text-neutral-400">No refund requests here.</Card>}
          </div>
          {rMeta.pages > 1 && <div className="flex justify-end"><Pagination page={rPage} pages={rMeta.pages} onPage={setRPage} /></div>}
        </>
      )}

      {tab === 'orders' && (
        <Card index={1} className="overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" /><input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search order ID, buyer, email or Paystack reference…" className={`${sel} w-full pl-9`} /></div>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={sel}><option value="">Status: All</option>{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label} ({oc[k] || 0})</option>)}</select>
          </div>
          <div className="overflow-x-auto"><table className="w-full text-xs min-w-[860px]">
            <thead><tr className="text-[9px] text-neutral-500 text-left bg-neutral-950"><th className="p-4">ORDER & DATE</th><th>BUYER</th><th>EVENT & TICKETS</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
            <tbody>{(orders.data?.data || []).map((o, i) => (
              <motion.tr key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setOpen(o.id)} className="border-t border-neutral-800 hover:bg-neutral-900 transition cursor-pointer">
                <td className="p-4"><b className="font-sans text-sm block">{shortId(o.id)}</b><span className="text-[10px] text-neutral-400">{ago(o.createdAt)}</span></td>
                <td><b className="block">{o.buyerName}</b><span className="text-[10px] text-neutral-400">{o.buyerEmail}</span></td>
                <td className="max-w-[260px]"><b className="block truncate">{o.event.title}</b><span className="text-[10px] text-neutral-400 truncate block">{o.items.map((i) => `${i.quantity}× ${i.tier.name}`).join(', ')}</span></td>
                <td className="font-bold">{o.totalAmount ? moneyK(o.totalAmount) : 'Free'}</td>
                <td><Pill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Pill>{o.refundRequests.length > 0 && <span className="block mt-1"><Pill tone="amber">Refund requested</Pill></span>}</td>
              </motion.tr>))}</tbody></table>
            {orders.loading && !orders.data && <p className="text-center text-sm text-neutral-400 py-10">Loading…</p>}
            {orders.data && !orders.data.data.length && <p className="text-center text-sm text-neutral-400 py-10">No orders match.</p>}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 border-t border-neutral-800 text-xs">
            <span>Showing <b>{oMeta.total ? (page - 1) * PAGE + 1 : 0}–{Math.min(page * PAGE, oMeta.total)}</b> of <b>{oMeta.total}</b></span>
            <Pagination page={page} pages={oMeta.pages} onPage={setPage} />
          </div>
        </Card>
      )}

      {dlg?.type === 'approve' && (
        <ConfirmModal open title="Approve this refund?" confirmLabel="Approve refund" noteLabel="Note (optional)" onClose={close}
          checkLabel={`I have already refunded ${moneyK(r.order.totalAmount)} to ${r.order.buyerName} (Paystack reference ${r.order.paystackReference || 'none'}).`}
          onConfirm={run((n) => adminApi.orders.approveRefund(r.id, n || undefined), 'Refund approved')}>
          <p>Stonovah does not send the money. Refund the buyer from the Paystack dashboard first. Approving then marks the order <b>refunded</b>, cancels its tickets and returns the places to the ticket type. The organizer is notified.</p>
        </ConfirmModal>
      )}
      {dlg?.type === 'reject' && (
        <ConfirmModal open title="Decline this refund request?" confirmLabel="Decline" noteLabel="Reason (shown to the organizer)" noteMin={5} onClose={close} onConfirm={run((n) => adminApi.orders.rejectRefund(r.id, n), 'Refund declined')}>
          <p>The order stays paid and the tickets stay valid.</p>
        </ConfirmModal>
      )}
      {open && <OrderModal id={open} onClose={() => setOpen(null)} />}
    </>
  );
}