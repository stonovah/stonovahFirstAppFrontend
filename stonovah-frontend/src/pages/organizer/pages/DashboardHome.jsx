// src/pages/organizer/pages/DashboardHome.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { eventsApi } from '../../../api/events';
import { attendeesApi } from '../../../api/gate';
import { apiErrorMessage } from '../../../api/apiClient';
import { formatNaira, koboToNaira } from '../../steps/helpers';
import { useCan } from '../../../context/AuthContext';

const money = (kobo) => formatNaira(koboToNaira(kobo));
const PAGE = 8;

const STATUS_BADGE = {
  LIVE: 'bg-[#FFBF00] text-black',
  DRAFT: 'bg-neutral-700 text-white',
  PENDING: 'bg-red-600 text-white',
  UNPUBLISHED: 'bg-amber-600 text-white',
  ENDED: 'bg-neutral-800 text-neutral-300',
};

const countdown = (e) => {
  if (e.status === 'ENDED') return 'Ended';
  if (!e.startAt) return null;
  const ms = new Date(e.startAt).getTime() - Date.now();
  if (ms < 0) return 'Started';
  const days = Math.ceil(ms / 86_400_000);
  return days <= 1 ? 'Starts within 24 hours' : `Starts in ${days} days`;
};

const PASS = {
  VALID: ['Active pass', 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'],
  USED: ['Checked in', 'bg-sky-500/20 text-sky-300 border-sky-500/30'],
  VOID: ['Cancelled', 'bg-red-500/20 text-red-400 border-red-500/30'],
};

export default function DashboardHome({ onScan, onEdit, onCreate }) {
  const [events, setEvents] = useState(null);
  const [eventId, setEventId] = useState('');
  const [stats, setStats] = useState(null);
  const [att, setAtt] = useState({ data: [], meta: { total: 0, pages: 1 } });
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const can = useCan();

  useEffect(() => {
    eventsApi.list()
      .then((list) => {
        setEvents(list);
        const live = list.filter((e) => e.status === 'LIVE').sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0));
        setEventId((live[0] || list.find((e) => e.status !== 'DRAFT') || list[0])?.id || '');
      })
      .catch((e) => { setEvents([]); setError(apiErrorMessage(e, 'Could not load your events.')); });
  }, []);

  const event = (events || []).find((e) => e.id === eventId);

  useEffect(() => {
    if (!eventId) return;
    setStats(null);
    eventsApi.stats(eventId).then(setStats).catch((e) => setError(apiErrorMessage(e, 'Could not load the event numbers.')));
  }, [eventId]);

  useEffect(() => { const t = setTimeout(() => setSearch(q.trim()), 350); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); }, [search, eventId]);

  const loadAtt = useCallback(() => {
    if (!eventId) return undefined;
    let live = true;
    attendeesApi.list(eventId, { search: search || undefined, page, limit: PAGE })
      .then((r) => live && setAtt(r))
      .catch(() => live && setAtt({ data: [], meta: { total: 0, pages: 1 } }));
    return () => { live = false; };
  }, [eventId, search, page]);
  useEffect(() => loadAtt(), [loadAtt]);

  if (events === null) return <p className="font-mono text-xs font-bold">LOADING…</p>;

  if (events.length === 0) {
    return (
      <div className="bg-black text-white p-8 rounded-2xl font-mono text-center space-y-3">
        <h2 className="text-xl font-black font-sans">Welcome to your dashboard</h2>
        <p className="text-xs text-neutral-400">{error || 'Create your first production to see sales, check-ins and attendees here.'}</p>
        {onCreate && can('events.write') && <button type="button" onClick={onCreate} className="bg-red-600 hover:bg-red-700 font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider cursor-pointer inline-flex items-center gap-2"><FiPlus /> Create New Event</button>}
      </div>
    );
  }

  const capacity = stats ? stats.perTier.reduce((s, t) => s + t.allocated, 0) : 0;
  const pct = stats?.feeRate ? Number((stats.feeRate * 100).toFixed(2)) : 0;
  const inRate = stats?.ticketsSold ? ((stats.checkedInCount / stats.ticketsSold) * 100).toFixed(1) : '0.0';

  const hasMoney = stats && stats.grossRevenue !== undefined;
  const cards = stats && [
    ...(hasMoney ? [{ title: 'GROSS REVENUE', value: money(stats.grossRevenue), sub: stats.feeDeducted > 0 ? `Net after ${pct}% fee: ${money(stats.netOwed)}` : 'Face value of paid tickets', color: 'text-emerald-400' }] : []),
    { title: 'TICKETS SOLD', value: `${stats.ticketsSold.toLocaleString()} / ${capacity.toLocaleString()}`, sub: `${Math.max(0, capacity - stats.ticketsSold).toLocaleString()} remaining`, color: 'text-[#FFBF00]' },
    { title: 'CHECK-IN RATE', value: `${inRate}%`, sub: `${stats.checkedInCount.toLocaleString()} of ${stats.ticketsSold.toLocaleString()} scanned`, color: 'text-neutral-400' },
    ...(hasMoney ? [{ title: 'PAID OUT SO FAR', value: money(stats.advancePaid + stats.settlementPaid), sub: `${money(Math.max(0, stats.remaining + (stats.advancePending || 0) + (stats.settlementPending || 0)))} still to be paid out`, color: 'text-emerald-400' }] : []),
  ];

  const exportCsv = async () => {
    try { await attendeesApi.exportCsv(eventId); } catch (e) { toast.error(apiErrorMessage(e, 'Could not export.')); }
  };

  return (
    <>
      {/* HEADER */}
      <div className="bg-black text-white p-6 md:p-8 rounded-2xl border border-black shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFBF00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-mono font-bold">
          {event && <span className={`px-2.5 py-0.5 rounded uppercase ${STATUS_BADGE[event.status] || ''}`}>{event.status === 'LIVE' ? '● LIVE & SELLING' : event.status}</span>}
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2 py-1 max-w-xs">
            {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {event && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative">
            <div>
              <h1 className="text-2xl md:text-4xl font-black uppercase text-white tracking-tight leading-tight mb-3 break-words">{event.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-300">
                <span className="flex items-center gap-1.5"><FiMapPin className="text-[#FFBF00]" /> {[event.venue, event.venueAddress].filter(Boolean).join(', ') || 'Venue not set'}</span>
                <span className="flex items-center gap-1.5"><FiCalendar className="text-[#FFBF00]" /> {event.startAt ? new Date(event.startAt).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }) : 'Date not set'}</span>
                {countdown(event) && <span className="bg-neutral-800 text-[#FFBF00] px-2 py-0.5 rounded border border-neutral-700 font-bold">{countdown(event)}</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
                
              {event.status === 'LIVE' && onScan && can('checkin.write') && <button type="button" onClick={() => onScan(event.id)} className="bg-red-600 hover:bg-red-700 text-white font-mono text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer transition">Open Gate Scanner</button>}
              {event.status === 'DRAFT' && onEdit && onEdit && can('events.write') && <button type="button" onClick={() => onEdit(event.id, 1)} className="bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs px-4 py-2.5 rounded-xl border border-neutral-700 cursor-pointer transition">Continue editing</button>}
            </div>
          </div>
        )}
      </div>

      {error && <p className="font-mono text-xs font-bold text-red-400 bg-black rounded-xl p-3">{error}</p>}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(cards || Array.from({ length: 4 }, () => null)).map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-black text-white p-5 rounded-2xl border border-black shadow-xl">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-2">{c?.title || '…'}</span>
            <span className="text-2xl font-black text-[#FFBF00] font-mono block mb-2">{c?.value || '—'}</span>
            <span className={`text-[10px] font-mono block ${c?.color || 'text-neutral-500'}`}>{c?.sub || ''}</span>
          </motion.div>
        ))}
      </div>

      {/* ATTENDEES */}
      <div className="bg-black text-white p-6 rounded-2xl border border-black shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black uppercase text-white">Attendee Manifest</h3>
              <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">{att.meta.total.toLocaleString()} Records</span>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-1">Every ticket issued for this event, with its check-in status.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="relative w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ticket code, email..." className="w-full bg-neutral-900 border border-neutral-700 text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-[#FFBF00]" />
            </div>
            <button type="button" onClick={exportCsv} className="bg-neutral-800 hover:bg-neutral-700 text-[#FFBF00] border border-neutral-700 px-3 py-2 rounded-lg flex items-center gap-1.5 font-bold transition cursor-pointer"><FiDownload /> Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3">TICKET & ORDER</th><th className="py-3 px-3">ATTENDEE</th><th className="py-3 px-3">EMAIL</th><th className="py-3 px-3">TIER</th><th className="py-3 px-3">PRICE</th><th className="py-3 px-3">PURCHASED</th><th className="py-3 px-3 text-right">GATE PASS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
              {att.data.map((t) => {
                const [label, cls] = PASS[t.status] || PASS.VALID;
                return (
                  <tr key={t.id} className="hover:bg-neutral-900/50 transition">
                    <td className="py-3.5 px-3"><span className="font-bold text-white block">{t.ticketCode}</span><span className="text-[10px] text-neutral-500 block">{String(t.orderId).slice(-8).toUpperCase()}</span></td>
                    <td className="py-3.5 px-3 font-bold text-white">{t.order.buyerName}</td>
                    <td className="py-3.5 px-3 text-neutral-300">{t.order.buyerEmail}</td>
                    <td className="py-3.5 px-3"><span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-neutral-800 text-white border border-neutral-700">{t.tier.name}</span></td>
                    <td className="py-3.5 px-3 font-bold text-[#FFBF00]">{t.tier.price ? money(t.tier.price) : 'Free'}</td>
                    <td className="py-3.5 px-3 text-neutral-400 text-[11px]">{new Date(t.order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-3.5 px-3 text-right"><span className={`border text-[10px] font-bold px-2 py-1 rounded inline-block ${cls}`}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {att.data.length === 0 && <p className="text-center text-xs text-neutral-500 py-10">{search ? 'No attendee matches your search.' : 'No tickets have been issued for this event yet.'}</p>}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-800 text-xs font-mono text-neutral-400">
          <span className="text-[11px]">Showing {att.meta.total ? (page - 1) * PAGE + 1 : 0}–{Math.min(page * PAGE, att.meta.total)} of {att.meta.total.toLocaleString()}</span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 cursor-pointer"><FiChevronLeft /></button>
            <span className="px-3 py-1 rounded bg-[#FFBF00] text-black font-bold">{page}</span>
            <span className="px-1 text-neutral-500">/ {att.meta.pages}</span>
            <button type="button" disabled={page >= att.meta.pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40 cursor-pointer"><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </>
  );
}